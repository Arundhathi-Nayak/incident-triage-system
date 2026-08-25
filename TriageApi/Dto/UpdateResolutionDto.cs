namespace TriageApi.Dto;

public class UpdateResolutionDto
{
    public string RootCauseCategory { get; set; } = string.Empty;
    public string RootCause { get; set; } = string.Empty;
    public string Resolution { get; set; } = string.Empty;
}