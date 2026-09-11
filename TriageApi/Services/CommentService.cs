using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TriageApi.Dto;
using TriageApi.Models;
using TriageApi.Services.Interfaces;

namespace TriageApi.Services;

public class CommentService : ICommentService
{
    private readonly TriageDbContext _db;

    private readonly UserManager<ApplicationUser> _userManager;
    public CommentService(TriageDbContext db, UserManager<ApplicationUser> userManager)
    {
        _db = db;
        _userManager = userManager;
    }


    // =====================================================
    // TICKET EXISTS
    // =====================================================

    public async Task<bool> TicketExistsAsync(
        string incidentId)
    {
        return await _db.Tickets
            .AsNoTracking()
            .AnyAsync(t =>
                t.IncidentId == incidentId);
    }


    // =====================================================
    // GET COMMENTS
    // =====================================================

    public async Task<CommentPageResult> GetForTicketAsync(
        string incidentId,
        int skip,
        int take)
    {
        // Safety limits
        if (skip < 0)
            skip = 0;

        if (take <= 0)
            take = 5;

        if (take > 50)
            take = 50;


        // -------------------------------------------------
        // Total number of comments
        // -------------------------------------------------

        var totalCount =
            await _db.Comments
                .AsNoTracking()
                .CountAsync(c =>
                    c.IncidentId == incidentId);


        // -------------------------------------------------
        // Load only requested comments
        //
        // Newest first
        // -------------------------------------------------

        var comments =
            await _db.Comments
                .AsNoTracking()
                .Where(c =>
                    c.IncidentId == incidentId)
                .OrderByDescending(c =>
                    c.CreatedAt)
                .Skip(skip)
                .Take(take)
                .ToListAsync();


        // -------------------------------------------------
        // Determine whether more comments exist
        // -------------------------------------------------

        var hasMore =
            skip + comments.Count < totalCount;


        return new CommentPageResult
        {
            Comments = comments,

            TotalCount = totalCount,

            HasMore = hasMore
        };
    }


    // =====================================================
    // CREATE
    // =====================================================

    public async Task<Comment?> CreateAsync(
        string incidentId,
        CreateCommentDto dto, string userId)
    {
        if (string.IsNullOrWhiteSpace(dto.Text))
        {
            throw new ArgumentException(
                "Comment text is required.");
        }

        var ticketExists =
            await TicketExistsAsync(incidentId);


        if (!ticketExists)
            return null;

        var user = await _userManager.FindByIdAsync(userId);

        if (user is null)
        {
            throw new UnauthorizedAccessException("Authenticated user was not found.");
        }


        var comment = new Comment
        {
            IncidentId = incidentId,
            CreatedByUserId = user.Id,
            Author = user.DisplayName,

            Text = dto.Text.Trim(),

            CreatedAt = DateTime.UtcNow
        };


        _db.Comments.Add(comment);

        await _db.SaveChangesAsync();


        return comment;
    }


    // =====================================================
    // UPDATE
    // =====================================================

    public async Task<Comment?> UpdateAsync(
        string incidentId,
        int commentId,
        UpdateCommentDto dto, string userId)
    {
        if (string.IsNullOrWhiteSpace(dto.Text))
        {
            throw new ArgumentException(
                "Comment text is required.");
        }


        var comment =
            await _db.Comments
                .FirstOrDefaultAsync(c =>
                    c.Id == commentId &&
                    c.IncidentId == incidentId);


        if (comment is null)
            return null;

        if (comment.CreatedByUserId != userId)
        {
            throw new UnauthorizedAccessException(
                "You can only edit your own comments.");
        }
        comment.Text = dto.Text.Trim();

        comment.UpdatedAt = DateTime.UtcNow;


        await _db.SaveChangesAsync();


        return comment;
    }


    // =====================================================
    // DELETE
    // =====================================================

    public async Task<bool> DeleteAsync(
        string incidentId,
        int commentId, string userId)
    {
        var comment =
            await _db.Comments
                .FirstOrDefaultAsync(c =>
                    c.Id == commentId &&
                    c.IncidentId == incidentId);


        if (comment is null)
            return false;

        if (comment.CreatedByUserId != userId)
        {
            throw new UnauthorizedAccessException(
                "You can only delete your own comments.");
        }
        _db.Comments.Remove(comment);

        await _db.SaveChangesAsync();


        return true;
    }

    public async Task<bool> CanAccessTicketAsync(
    string incidentId,
    string userId,
    string role)
    {
        var ticket =
            await _db.Tickets
                .AsNoTracking()
                .Where(t =>
                    t.IncidentId == incidentId)
                .Select(t => new
                {
                    t.CreatedByUserId
                })
                .FirstOrDefaultAsync();

        if (ticket is null)
            return false;

        if (role == "Agent" ||
            role == "Admin")
        {
            return true;
        }

        return ticket.CreatedByUserId == userId;
    }
}