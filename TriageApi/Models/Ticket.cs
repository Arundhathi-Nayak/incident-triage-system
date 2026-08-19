namespace TriageApi.Models;

public class Ticket
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Submitter { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? Severity { get; set; }
    public string? AssignedTeam { get; set; }
    public string? Summary { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}