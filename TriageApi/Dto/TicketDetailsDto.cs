namespace TriageApi.Dto;

public class TicketDetailsDto
{
    public int Id { get; set; }

    public string IncidentId { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string Severity { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string AssignedTeam { get; set; } = string.Empty;

    public string CreatedBy { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? ResolvedAt { get; set; }

    public string? Resolution { get; set; }

    public string? RootCauseCategory { get; set; }

    public string? RootCause { get; set; }

    public string? Summary { get; set; }
}