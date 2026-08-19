import os
from google import genai
from .base import LLMProvider

class GeminiProvider(LLMProvider):
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set in the environment")
        self._client = genai.Client(api_key=api_key)
        self._model = "gemini-3.6-flash"

    def generate_json(self, prompt: str) -> str:
        response = self._client.models.generate_content(
            model=self._model,
            contents=prompt,
        )
        return response.text.strip()