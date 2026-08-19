namespace TriageApi.Models;

public class CreateTicketDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Submitter { get; set; } = string.Empty;
}