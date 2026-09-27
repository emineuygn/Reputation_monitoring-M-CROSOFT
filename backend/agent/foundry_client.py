import asyncio
import logging
from typing import Optional

logger = logging.getLogger(__name__)

FOUNDRY_BASE_URL = "http://127.0.0.1:59242/v1"
FOUNDRY_MODEL = "Phi-3.5-mini-instruct-generic-gpu"


class FoundryClient:
    def __init__(self):
        self._client = None

    def _get_client(self):
        if self._client is None:
            from openai import OpenAI
            self._client = OpenAI(
                base_url=FOUNDRY_BASE_URL, api_key="foundry-local", timeout=6.0, max_retries=0
            )
        return self._client

    async def chat(self, system_prompt: str, user_message: str) -> Optional[str]:
        try:
            client = self._get_client()
            response = await asyncio.to_thread(
                lambda: client.chat.completions.create(
                    model=FOUNDRY_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message},
                    ],
                    temperature=0.1,
                    max_tokens=800,
                )
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Foundry chat hatası: {e}")
            return None
