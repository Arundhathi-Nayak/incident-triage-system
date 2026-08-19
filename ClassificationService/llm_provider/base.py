from abc import ABC, abstractmethod

class LLMProvider(ABC):
    """Any LLM backend (Gemini, Claude, Groq, ...) implements this contract."""

    @abstractmethod
    def generate_json(self, prompt: str) -> str:
        """Send a prompt, return the raw text response (expected to contain JSON)."""
        raise NotImplementedError