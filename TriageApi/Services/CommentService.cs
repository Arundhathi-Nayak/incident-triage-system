using Microsoft.EntityFrameworkCore;
using TriageApi.Dto;
using TriageApi.Models;
using TriageApi.Services.Interfaces;

namespace TriageApi.Services;

public class CommentService : ICommentService
{
    private readonly TriageDbContext _db;

    public CommentService(TriageDbContext db)
    {
        _db = db;
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
        CreateCommentDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Author))
        {
            throw new ArgumentException(
                "Author is required.");
        }

        if (string.IsNullOrWhiteSpace(dto.Text))
        {
            throw new ArgumentException(
                "Comment text is required.");
        }


        var ticketExists =
            await TicketExistsAsync(incidentId);


        if (!ticketExists)
            return null;


        var comment = new Comment
        {
            IncidentId = incidentId,

            Author = dto.Author.Trim(),

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
        UpdateCommentDto dto)
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
        int commentId)
    {
        var comment =
            await _db.Comments
                .FirstOrDefaultAsync(c =>
                    c.Id == commentId &&
                    c.IncidentId == incidentId);


        if (comment is null)
            return false;


        _db.Comments.Remove(comment);

        await _db.SaveChangesAsync();


        return true;
    }
}