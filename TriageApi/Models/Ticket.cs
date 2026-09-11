namespace TriageApi.Models;

public class Ticket
{
    public int Id { get; set; }

    public string IncidentId { get; set; } = null!;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string Severity { get; set; } = string.Empty;

    public string Status { get; set; } = "New";

    public string AssignedTeam { get; set; } = string.Empty;
    public string CreatedByUserId { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ResolvedAt { get; set; }

    public string? Resolution { get; set; }

    public string? RootCauseCategory { get; set; }

    public string? RootCause { get; set; }

    public string? Summary { get; set; }

    // Navigation property
    public ICollection<Comment> Comments { get; set; }
        = new List<Comment>();
}