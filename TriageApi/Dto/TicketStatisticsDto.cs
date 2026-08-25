namespace TriageApi.Dto;

public class TicketStatisticsDto
{
    public int Total { get; set; }

    public int New { get; set; }

    public int Assigned { get; set; }

    public int UserPending { get; set; }

    public int Resolved { get; set; }

    public int P1 { get; set; }

    public int P2 { get; set; }

    public int P3 { get; set; }

    public int P4 { get; set; }

    public Dictionary<string, int> ByCategory { get; set; } = [];

    public Dictionary<string, int> ByTeam { get; set; } = [];
}