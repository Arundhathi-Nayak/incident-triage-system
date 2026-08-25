namespace TriageApi.Dto;

public class TicketListItemDto
{
    public string IncidentId { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string Severity { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string AssignedTeam { get; set; } = string.Empty;

    public string CreatedBy { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? ResolvedAt { get; set; }
}