import json
from llm_provider.base import LLMProvider
from .prompts import build_classification_prompt

class ClassificationService:
    def __init__(self, provider: LLMProvider):
        self._provider = provider  # depends on the abstraction, not GeminiProvider directly

    def classify(self, title: str, description: str) -> dict:
        prompt = build_classification_prompt(title, description)
        raw_text = self._provider.generate_json(prompt)

        # Defensive strip in case the model wraps output in markdown fences
        raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        return json.loads(raw_text)