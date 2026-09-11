using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TriageApi.Dto;
using TriageApi.Models;
using TriageApi.Services.Interfaces;

namespace TriageApi.Services;

public class TicketService : ITicketService
{
    private readonly TriageDbContext _db;
    private readonly IClassificationService _classificationService;

    private readonly UserManager<ApplicationUser> _userManager;

    public TicketService(
        TriageDbContext db,
        IClassificationService classificationService, UserManager<ApplicationUser> userManager)
    {
        _db = db;
        _classificationService = classificationService;
        _userManager = userManager;
    }

    public async Task<PagedResultDto<TicketListItemDto>> GetTicketsAsync(
        TicketQueryDto query, string userId, string role)
    {
        if (query.Page < 1)
            query.Page = 1;

        if (query.PageSize < 1)
            query.PageSize = 10;

        if (query.PageSize > 100)
            query.PageSize = 100;

        var tickets = _db.Tickets
            .AsNoTracking()
            .AsQueryable();

        if (role == "Requester")
        {
            tickets = tickets.Where(t =>
                t.CreatedByUserId == userId);
        }
        // SEARCH
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();

            tickets = tickets.Where(t =>
                t.IncidentId.Contains(search) ||
                t.Title.Contains(search) ||
                t.Description.Contains(search) ||
                t.CreatedBy.Contains(search) ||
                t.AssignedTeam.Contains(search) ||
                (t.Summary != null &&
                 t.Summary.Contains(search)));
        }

        // STATUS FILTER
        if (!string.IsNullOrWhiteSpace(query.Status))
        {
            tickets = tickets.Where(t =>
                t.Status == query.Status);
        }

        // SEVERITY FILTER
        if (!string.IsNullOrWhiteSpace(query.Severity))
        {
            tickets = tickets.Where(t =>
                t.Severity == query.Severity);
        }

        // CATEGORY FILTER
        if (!string.IsNullOrWhiteSpace(query.Category))
        {
            tickets = tickets.Where(t =>
                t.Category == query.Category);
        }

        // TEAM FILTER
        if (!string.IsNullOrWhiteSpace(query.AssignedTeam))
        {
            tickets = tickets.Where(t =>
                t.AssignedTeam == query.AssignedTeam);
        }

        var totalCount = await tickets.CountAsync();

        // SORTING
        tickets = ApplySorting(
            tickets,
            query.SortBy,
            query.SortDirection);

        // PAGINATION
        var items = await tickets
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(t => new TicketListItemDto
            {
                IncidentId = t.IncidentId,
                Title = t.Title,
                Category = t.Category,
                Severity = t.Severity,
                Status = t.Status,
                AssignedTeam = t.AssignedTeam,
                CreatedBy = t.CreatedBy,
                CreatedAt = t.CreatedAt,
                ResolvedAt = t.ResolvedAt
            })
            .ToListAsync();

        var totalPages =
            (int)Math.Ceiling(
                totalCount / (double)query.PageSize);

        return new PagedResultDto<TicketListItemDto>
        {
            Items = items,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }

    private static IQueryable<Ticket> ApplySorting(
        IQueryable<Ticket> query,
        string? sortBy,
        string? sortDirection)
    {
        var descending =
            string.Equals(
                sortDirection,
                "desc",
                StringComparison.OrdinalIgnoreCase);

        return sortBy?.ToLowerInvariant() switch
        {
            "incidentid" =>
                descending
                    ? query.OrderByDescending(t => t.IncidentId)
                    : query.OrderBy(t => t.IncidentId),

            "title" =>
                descending
                    ? query.OrderByDescending(t => t.Title)
                    : query.OrderBy(t => t.Title),

            "severity" =>
                descending
                    ? query.OrderByDescending(t => t.Severity)
                    : query.OrderBy(t => t.Severity),

            "status" =>
                descending
                    ? query.OrderByDescending(t => t.Status)
                    : query.OrderBy(t => t.Status),

            "category" =>
                descending
                    ? query.OrderByDescending(t => t.Category)
                    : query.OrderBy(t => t.Category),

            "assignedteam" =>
                descending
                    ? query.OrderByDescending(t => t.AssignedTeam)
                    : query.OrderBy(t => t.AssignedTeam),

            "createdby" =>
                descending
                    ? query.OrderByDescending(t => t.CreatedBy)
                    : query.OrderBy(t => t.CreatedBy),

            "createdat" =>
                descending
                    ? query.OrderByDescending(t => t.CreatedAt)
                    : query.OrderBy(t => t.CreatedAt),

            _ =>
                query.OrderByDescending(t => t.CreatedAt)
        };
    }
    public async Task<TicketDetailsDto?> GetByIdAsync(
           string incidentId, String userId, String role)
    {
        var query = _db.Tickets.AsNoTracking().Where(t => t.IncidentId == incidentId);

        if (role == "Requester")
        {
            query = query.Where(t =>
                t.CreatedByUserId == userId);
        }

        return await query
            .Select(t => new TicketDetailsDto
            {
                Id = t.Id,
                IncidentId = t.IncidentId,
                Title = t.Title,
                Description = t.Description,
                Category = t.Category,
                Severity = t.Severity,
                Status = t.Status,
                AssignedTeam = t.AssignedTeam,
                CreatedBy = t.CreatedBy,
                CreatedAt = t.CreatedAt,
                ResolvedAt = t.ResolvedAt,
                Resolution = t.Resolution,
                RootCauseCategory = t.RootCauseCategory,
                RootCause = t.RootCause,
                Summary = t.Summary
            })
            .FirstOrDefaultAsync();
    }
    public async Task<TicketDetailsDto> CreateAsync(
    CreateTicketDto dto, string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user is null)
            throw new UnauthorizedAccessException(
                "Authenticated user was not found.");

        var ticket = new Ticket
        {
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            CreatedByUserId = user.Id,
            CreatedBy = user.DisplayName,
            Status = "New",
            CreatedAt = DateTime.UtcNow,
        };

        _db.Tickets.Add(ticket);

        await _db.SaveChangesAsync();

        // Auto-classification
        await _classificationService
            .TryClassifyAsync(ticket);

        await _db.SaveChangesAsync();

        return MapToDetails(ticket);
    }
    public async Task<bool> UpdateAsync(
        string incidentId,
        UpdateTicketDto dto)
    {
        var ticket = await _db.Tickets
            .FirstOrDefaultAsync(
                t => t.IncidentId == incidentId);

        if (ticket is null)
            return false;

        if (!TicketOptions.Categories.Contains(dto.Category))
            throw new ArgumentException(
                $"Invalid category. Must be one of: " +
                $"{string.Join(", ", TicketOptions.Categories)}");

        if (!TicketOptions.Severities.Contains(dto.Severity))
            throw new ArgumentException(
                $"Invalid severity. Must be one of: " +
                $"{string.Join(", ", TicketOptions.Severities)}");

        if (!TicketOptions.Statuses.Contains(dto.Status))
            throw new ArgumentException(
                $"Invalid status. Must be one of: " +
                $"{string.Join(", ", TicketOptions.Statuses)}");

        if (!TicketOptions.AssignedTeams.Contains(dto.AssignedTeam))
            throw new ArgumentException(
                $"Invalid team. Must be one of: " +
                $"{string.Join(", ", TicketOptions.AssignedTeams)}");

        ticket.Title = dto.Title.Trim();
        ticket.Description = dto.Description.Trim();
        ticket.Category = dto.Category;
        ticket.Severity = dto.Severity;
        ticket.Status = dto.Status;
        ticket.AssignedTeam = dto.AssignedTeam;

        await _db.SaveChangesAsync();

        return true;
    }

    public async Task<TicketDetailsDto?> ResolveAsync(
        string incidentId,
        ResolveTicketDto dto)
    {
        var ticket = await _db.Tickets
            .FirstOrDefaultAsync(
                t => t.IncidentId == incidentId);

        if (ticket is null)
            return null;

        if (ticket.Status == "Resolved")
            throw new InvalidOperationException(
                "This ticket is already resolved.");

        if (!TicketOptions.RootCauseCategories
            .Contains(dto.RootCauseCategory))
        {
            throw new ArgumentException(
                "Invalid root cause category.");
        }

        ticket.Status = "Resolved";
        ticket.ResolvedAt = DateTime.UtcNow;
        ticket.RootCauseCategory =
            dto.RootCauseCategory.Trim();
        ticket.RootCause =
            dto.RootCause.Trim();
        ticket.Resolution =
            dto.Resolution.Trim();

        await _db.SaveChangesAsync();

        return MapToDetails(ticket);
    }

    public async Task<TicketDetailsDto?> UpdateResolutionAsync(
        string incidentId,
        UpdateResolutionDto dto)
    {
        var ticket = await _db.Tickets
            .FirstOrDefaultAsync(
                t => t.IncidentId == incidentId);

        if (ticket is null)
            return null;

        if (ticket.Status != "Resolved")
            throw new InvalidOperationException(
                "Only resolved tickets can have their resolution edited.");

        if (!TicketOptions.RootCauseCategories
            .Contains(dto.RootCauseCategory))
        {
            throw new ArgumentException(
                "Invalid root cause category.");
        }

        ticket.RootCauseCategory =
            dto.RootCauseCategory.Trim();

        ticket.RootCause =
            dto.RootCause.Trim();

        ticket.Resolution =
            dto.Resolution.Trim();

        await _db.SaveChangesAsync();

        return MapToDetails(ticket);
    }

    public async Task<bool> DeleteAsync(string incidentId)
    {
        var ticket = await _db.Tickets
            .FirstOrDefaultAsync(t => t.IncidentId == incidentId);

        if (ticket is null)
            return false;

        _db.Tickets.Remove(ticket);

        await _db.SaveChangesAsync();

        return true;
    }


    public async Task<TicketStatisticsDto> GetStatisticsAsync(string userId, string role)
    {
        var tickets = _db.Tickets
            .AsNoTracking()
            .AsNoTracking();
        if (role == "Requester")
        {
            tickets = tickets.Where(t => t.CreatedByUserId == userId);
        }

        var total = await tickets.CountAsync();

        var statusCounts = await tickets
            .GroupBy(t => t.Status)
            .Select(g => new
            {
                Status = g.Key,
                Count = g.Count()
            })
            .ToListAsync();

        var severityCounts = await tickets
            .GroupBy(t => t.Severity)
            .Select(g => new
            {
                Severity = g.Key,
                Count = g.Count()
            })
            .ToListAsync();

        var categoryCounts = await tickets
            .GroupBy(t => t.Category)
            .Select(g => new
            {
                Category = g.Key,
                Count = g.Count()
            })
            .ToListAsync();

        var teamCounts = await tickets
            .GroupBy(t => t.AssignedTeam)
            .Select(g => new
            {
                Team = g.Key,
                Count = g.Count()
            })
            .ToListAsync();

        return new TicketStatisticsDto
        {
            Total = total,

            New = GetCount(
                statusCounts,
                "New",
                x => x.Status,
                x => x.Count),

            Assigned = GetCount(
                statusCounts,
                "Assigned",
                x => x.Status,
                x => x.Count),

            UserPending = GetCount(
                statusCounts,
                "User Pending",
                x => x.Status,
                x => x.Count),

            Resolved = GetCount(
                statusCounts,
                "Resolved",
                x => x.Status,
                x => x.Count),

            P1 = GetCount(
                severityCounts,
                "P1",
                x => x.Severity,
                x => x.Count),

            P2 = GetCount(
                severityCounts,
                "P2",
                x => x.Severity,
                x => x.Count),

            P3 = GetCount(
                severityCounts,
                "P3",
                x => x.Severity,
                x => x.Count),

            P4 = GetCount(
                severityCounts,
                "P4",
                x => x.Severity,
                x => x.Count),

            ByCategory = categoryCounts
                .ToDictionary(
                    x => x.Category,
                    x => x.Count),

            ByTeam = teamCounts
                .ToDictionary(
                    x => x.Team,
                    x => x.Count)
        };
    }

    private static int GetCount<T>(
        IEnumerable<T> items,
        string key,
        Func<T, string> keySelector,
        Func<T, int> countSelector)
    {
        var item = items.FirstOrDefault(
            x => keySelector(x) == key);

        return item is null
            ? 0
            : countSelector(item);
    }

    private static TicketDetailsDto MapToDetails(
        Ticket ticket)
    {
        return new TicketDetailsDto
        {
            Id = ticket.Id,
            IncidentId = ticket.IncidentId,
            Title = ticket.Title,
            Description = ticket.Description,
            Category = ticket.Category,
            Severity = ticket.Severity,
            Status = ticket.Status,
            AssignedTeam = ticket.AssignedTeam,
            CreatedBy = ticket.CreatedBy,
            CreatedAt = ticket.CreatedAt,
            ResolvedAt = ticket.ResolvedAt,
            Resolution = ticket.Resolution,
            RootCauseCategory = ticket.RootCauseCategory,
            RootCause = ticket.RootCause,
            Summary = ticket.Summary
        };
    }
}