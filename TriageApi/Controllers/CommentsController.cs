using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TriageApi.Dto;
using TriageApi.Models;

namespace TriageApi.Controllers;

[ApiController]
[Route("api/tickets/{incidentId}/comments")]
public class CommentsController : ControllerBase
{
    private readonly TriageDbContext _db;
    public CommentsController(TriageDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<Comment>>> GetForTicket(string incidentId)
    {
        var ticketExists = await _db.Tickets.AnyAsync(t => t.IncidentId == incidentId);
        if (!ticketExists) return NotFound($"Ticket {incidentId} not found.");

        var comments = await _db.Comments
            .Where(c => c.IncidentId == incidentId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return comments;
    }

    [HttpPost]
    public async Task<ActionResult<Comment>> Create(string incidentId, CreateCommentDto dto)
    {
        var ticketExists = await _db.Tickets.AnyAsync(t => t.IncidentId == incidentId);
        if (!ticketExists) return NotFound($"Ticket {incidentId} not found.");

        var comment = new Comment
        {
            IncidentId = incidentId,
            Author = dto.Author,
            Text = dto.Text
        };

        _db.Comments.Add(comment);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetForTicket), new { incidentId }, comment);
    }
}