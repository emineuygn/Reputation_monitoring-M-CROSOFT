import logging
from typing import Optional
from config import settings

logger = logging.getLogger(__name__)


class FoundryClient:
    def __init__(self):
        self._manager = None
        self._model_alias = settings.foundry_local_model

    async def _ensure_ready(self):
        if self._manager is not None:
            return
        try:
            from foundry_local import FoundryLocalManager
            self._manager = FoundryLocalManager(alias=self._model_alias)
            await self._manager.__aenter__()
            logger.info(f"Foundry Local model hazır: {self._model_alias}")
        except Exception as e:
            logger.error(f"Foundry Local başlatılamadı: {e}")
            self._manager = None
            raise

    async def chat(self, system_prompt: str, user_message: str) -> Optional[str]:
        await self._ensure_ready()
        try:
            from openai import OpenAI
            client = OpenAI(
                base_url=self._manager.endpoint,
                api_key=self._manager.api_key,
            )
            response = client.chat.completions.create(
                model=self._manager.get_model_info(self._model_alias).id,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                temperature=0.1,
                max_tokens=2048,
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Foundry chat hatası: {e}")
            return None
