import json
import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import List, Optional

from api.schemas import AnalyzeResponse, RedFlag, SourceResult, RiskSeverity
from agent.foundry_client import FoundryClient
from agent.prompts import get_system_prompt, build_user_prompt

logger = logging.getLogger(__name__)

CRITICAL_KEYWORDS: list[tuple[list[str], int]] = [
    (["saadet zinciri", "ponzi", "vurguncu"],                        85),
    (["mahkûm", "mahkumiyet", "hapis cezası"],                       80),
    (["kaçtı", "firari", "aranan kişi"],                             80),
    (["zimmet"],                                                      78),
    (["dolandırıcı", "dolandırıcılık", "dolandırdı", "dolandırma"],  75),
    (["hırsız", "hırsızlık", "çaldı"],                               73),
    (["sahte", "sahtekâr", "sahtecilik"],                            70),
    (["rüşvet", "yolsuzluk", "suistimal"],                           70),
    (["tutuklandı", "tutuklu", "gözaltına alındı"],                  65),
    (["tehdit", "şantaj", "gasp"],                                   65),
    (["mağdur etti", "mağdurlar", "mağduriyeti"],                    60),
    (["iflas", "konkordato", "tasfiye"],                             60),
    (["gözaltı", "sorgulandı"],                                      55),
    (["icra", "borçlu", "haciz"],                                    45),
    (["mağdur", "şikayet"],                                          30),
]


@dataclass
class KeywordHit:
    keyword: str
    score: int
    baslik: str
    url: Optional[str]
    kaynak_adi: str


def scan_keywords(kaynaklar: List[SourceResult]) -> tuple[int, list[str], list[KeywordHit]]:
    """
    Her haberi teker teker tarar.
    Döner: (min_score, bulunan_kelimeler, her_kelime_icin_haber_bilgisi)
    """
    hits: list[KeywordHit] = []
    seen_keywords: set[str] = set()
    min_score = 0

    for kaynak in kaynaklar:
        candidates = []
        if kaynak.haberler:
            for h in kaynak.haberler:
                candidates.append((h.baslik, h.url, kaynak.kaynak_adi))
        if kaynak.bulunan_icerik_ozeti:
            candidates.append((kaynak.bulunan_icerik_ozeti, kaynak.url, kaynak.kaynak_adi))

        for baslik, url, kaynak_adi in candidates:
            text_lower = baslik.lower()
            for keywords, score in CRITICAL_KEYWORDS:
                for kw in keywords:
                    if kw in text_lower and kw not in seen_keywords:
                        seen_keywords.add(kw)
                        hits.append(KeywordHit(
                            keyword=kw,
                            score=score,
                            baslik=baslik,
                            url=url,
                            kaynak_adi=kaynak_adi,
                        ))
                        if score > min_score:
                            min_score = score

    return min_score, list(seen_keywords), hits


def hits_to_flags(hits: list[KeywordHit], ai_score: int, final_score: int) -> list[RedFlag]:
    """Her keyword hit'i ayrı bir kırmızı bayrak olarak döner."""
    flags = []
    for hit in hits:
        severity = (
            RiskSeverity.yuksek if hit.score >= 60
            else RiskSeverity.orta if hit.score >= 30
            else RiskSeverity.dusuk
        )
        ozet = f'"{hit.keyword}" ifadesi bu içerikte tespit edildi.'
        flags.append(RedFlag(
            kaynak=hit.kaynak_adi,
            baslik=hit.baslik[:120],
            ozet=ozet,
            ciddiyet=severity,
            url=hit.url,
        ))
    return flags


class RiskAnalyzer:
    def __init__(self):
        self.client = FoundryClient()

    async def analyze(
        self, hedef_adi: str, kaynaklar: List[SourceResult], analiz_turu: str = "sirket"
    ) -> AnalyzeResponse:
        keyword_floor, found_keywords, hits = scan_keywords(kaynaklar)

        aday_bayraklar = [
            {"kaynak": h.kaynak_adi, "baslik": h.baslik, "keyword": h.keyword, "url": h.url}
            for h in hits
        ]

        kaynak_metni = self._format_sources(kaynaklar)
        system_prompt = get_system_prompt(analiz_turu)
        user_prompt = build_user_prompt(
            hedef_adi, kaynak_metni, analiz_turu, aday_bayraklar or None
        )

        raw_response = None
        try:
            raw_response = await self.client.chat(system_prompt, user_prompt)
        except Exception as e:
            logger.error(f"Agent hatası: {e}")

        if raw_response:
            parsed = self._parse_response(raw_response)
            if parsed:
                ai_score = parsed.get("risk_skoru", 0)
                flags = [RedFlag(**f) for f in parsed.get("kirmizi_bayraklar", [])]
                return AnalyzeResponse(
                    hedef_adi=hedef_adi,
                    analiz_turu=analiz_turu,
                    risk_skoru=ai_score,
                    risk_seviyesi=self._score_to_severity(ai_score),
                    kirmizi_bayraklar=flags,
                    kaynaklar=kaynaklar,
                    genel_ozet=parsed.get("genel_ozet", ""),
                    kisa_yorum=parsed.get("kisa_yorum", ""),
                    tarih=datetime.now(timezone.utc),
                )

        return self._fallback_response(hedef_adi, kaynaklar, analiz_turu, keyword_floor, hits)

    def _score_to_severity(self, score: int) -> RiskSeverity:
        if score > 60:
            return RiskSeverity.yuksek
        if score > 30:
            return RiskSeverity.orta
        return RiskSeverity.dusuk

    def _format_sources(self, kaynaklar: List[SourceResult]) -> str:
        lines = []
        for k in kaynaklar:
            if k.sonuc_sayisi == 0:
                continue
            lines.append(f"[{k.kaynak_adi}] ({k.sonuc_sayisi} sonuç)")
            if k.haberler:
                for h in k.haberler[:8]:
                    lines.append(f"  - {h.baslik}")
            elif k.bulunan_icerik_ozeti:
                lines.append(f"  İçerik: {k.bulunan_icerik_ozeti}")
            lines.append("")
        return "\n".join(lines) if lines else "Hiçbir kaynakta veri bulunamadı."

    def _parse_response(self, raw: str) -> dict:
        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        try:
            data = json.loads(raw)
            data["risk_skoru"] = max(0, min(100, int(data.get("risk_skoru", 0))))
            if data.get("risk_seviyesi") not in ("düşük", "orta", "yüksek"):
                data["risk_seviyesi"] = self._score_to_severity(data["risk_skoru"]).value
            return data
        except Exception as e:
            logger.warning(f"JSON parse hatası: {e}\nHam: {raw[:200]}")
            return {}

    def _fallback_response(
        self,
        hedef_adi: str,
        kaynaklar: List[SourceResult],
        analiz_turu: str,
        keyword_floor: int = 0,
        hits: list[KeywordHit] = None,
    ) -> AnalyzeResponse:
        total_results = sum(k.sonuc_sayisi for k in kaynaklar)
        score = max(keyword_floor, min(30, total_results // 5))
        tur_label = "kişisi" if analiz_turu == "kisi" else "firması"

        flags = hits_to_flags(hits or [], 0, score)

        return AnalyzeResponse(
            hedef_adi=hedef_adi,
            analiz_turu=analiz_turu,
            risk_skoru=score,
            risk_seviyesi=self._score_to_severity(score),
            kirmizi_bayraklar=flags,
            kaynaklar=kaynaklar,
            genel_ozet=(
                f"'{hedef_adi}' {tur_label} için otomatik analiz tamamlanamadı. "
                + ("Kritik kelimeler tespit edildi. " if hits else "")
                + "Manuel inceleme önerilir."
            ),
            kisa_yorum=self._fallback_kisa_yorum(hedef_adi, analiz_turu, score),
            tarih=datetime.now(timezone.utc),
        )

    def _fallback_kisa_yorum(self, hedef_adi: str, analiz_turu: str, score: int) -> str:
        ilgi_eki = "şirketiyle" if analiz_turu != "kisi" else "kişisiyle"
        if score > 60:
            return f"{hedef_adi} {ilgi_eki} ilgili tespit edilen bulgular ciddi risk taşıyor, manuel inceleme şart."
        if score > 30:
            return f"{hedef_adi} {ilgi_eki} ilgili bazı olumsuz bulgular var, dikkatli inceleme önerilir."
        return f"{hedef_adi} {ilgi_eki} ilgili ciddi bir olumsuz bulguya rastlanmadı."
