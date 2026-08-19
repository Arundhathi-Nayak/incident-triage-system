from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv

from llm_provider.gemini_provider import GeminiProvider
from classification.service import ClassificationService

load_dotenv()

app = FastAPI()

# This is the one line you'd change to swap providers later,
# e.g. classifier = ClassificationService(GroqProvider())
classifier = ClassificationService(GeminiProvider())

class TicketInput(BaseModel):
    title: str
    description: str

class ClassificationResult(BaseModel):
    category: str
    severity: str
    assigned_team: str
    ai_summary: str

@app.post("/classify", response_model=ClassificationResult)
def classify_ticket(ticket: TicketInput):
    result = classifier.classify(ticket.title, ticket.description)
    return ClassificationResult(**result)