namespace TriageApi.Models;

public static class TicketOptions
{
    public static readonly string[] Categories =
        ["Access", "Network", "Software Bug", "Hardware", "Outage", "Request"];

    public static readonly string[] Severities = ["P1", "P2", "P3", "P4"];

    public static readonly string[] Statuses = ["New", "Assigned", "User Pending", "Resolved"];

    public static readonly string[] AssignedTeams =
        ["Network Team", "Helpdesk", "App Support", "Infrastructure", "Security"];

    public static readonly string[] RootCauseCategories =
        ["Configuration Error", "Hardware Failure", "Human Error", "Third-party Outage", "Software Bug", "Capacity Issue", "Security Incident", "Other"];
}