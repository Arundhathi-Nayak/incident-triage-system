namespace TriageApi.Models;

public class Comment
{
    public int Id { get; set; }

    public string IncidentId { get; set; } = string.Empty;

    public string CreatedByUserId { get; set; } = string.Empty;

    public string Author { get; set; } = string.Empty;

    public string Text { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation property
    public Ticket? Ticket { get; set; }
}