namespace TriageApi.Models;

public class ClassificationRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class ClassificationResponse
{
    public string Category { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string AssignedTeam { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
}