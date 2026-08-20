def build_classification_prompt(title: str, description: str) -> str:
    return f"""You are an IT support triage assistant. Classify this ticket and respond with ONLY a JSON object, no other text.

Ticket title: {title}
Ticket description: {description}

Return JSON with exactly these fields:
- "category": one of ["Access", "Network", "Software Bug", "Hardware", "Outage", "Request"]
- "severity": one of ["P1", "P2", "P3", "P4"], where:
    P1 = Critical - complete outage or severe business impact, needs immediate attention
    P2 = High - major functionality broken or significant impact, urgent
    P3 = Medium - moderate impact, workaround may exist, normal priority
    P4 = Low - minor issue or general request, no urgency
- "assignedteam": one of ["Network Team", "Helpdesk", "App Support", "Infrastructure", "Security"]
- "summary": a one-sentence summary of the issue for a triage dashboard

Respond with ONLY the JSON object."""