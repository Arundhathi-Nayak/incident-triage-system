namespace TriageApi.Dto;

public class ResolveTicketDto
{
    public string RootCause { get; set; } = string.Empty;
    public string Resolution { get; set; } = string.Empty;
}