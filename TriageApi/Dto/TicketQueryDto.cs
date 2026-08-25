namespace TriageApi.Dto;

public class TicketQueryDto
{
    public int Page { get; set; } = 1;

    public int PageSize { get; set; } = 10;

    public string? Search { get; set; }

    public string? Status { get; set; }

    public string? Severity { get; set; }

    public string? Category { get; set; }

    public string? AssignedTeam { get; set; }

    public string SortBy { get; set; } = "createdAt";

    public string SortDirection { get; set; } = "desc";
}