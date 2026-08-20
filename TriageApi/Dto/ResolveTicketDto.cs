namespace TriageApi.Dto;

public class ResolveTicketDto
{
    public string RootCauseCategory { get; set; } = string.Empty;
    public string RootCause { get; set; } = string.Empty;
    public string Resolution { get; set; } = string.Empty;
}