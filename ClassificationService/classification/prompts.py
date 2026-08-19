def build_classification_prompt(title: str, description: str) -> str:
    return f"""You are an IT support triage assistant. Classify this ticket and respond with ONLY a JSON object, no other text.

Ticket title: {title}
Ticket description: {description}

Return JSON with exactly these fields:
- "category": one of ["Access", "Network", "Software Bug", "Hardware", "Outage", "Request"]
- "severity": one of ["Low", "Medium", "High", "Critical"]
- "assigned_team": one of ["Network Team", "Helpdesk", "App Support", "Infrastructure", "Security"]
- "ai_summary": a one-sentence summary of the issue for a triage dashboard

Respond with ONLY the JSON object."""