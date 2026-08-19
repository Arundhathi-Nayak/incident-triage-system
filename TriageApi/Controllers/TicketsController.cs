using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TriageApi.Models;

[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly TriageDbContext _db;

    public TicketsController(TriageDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<Ticket>>> GetAll() =>
     await _db.Tickets.OrderByDescending(t => t.CreatedAt).ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Ticket>> GetById(int id)
    {
        var ticket = await _db.Tickets.FindAsync(id);
        return ticket is null ? NotFound() : ticket;
    }

    [HttpPost]
    public async Task<ActionResult<Ticket>> Create(Ticket ticket)
    {
        _db.Tickets.Add(ticket);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = ticket.Id }, ticket);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, Ticket updated)
    {
        if (id != updated.Id) return BadRequest();
        _db.Entry(updated).State = EntityState.Modified;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ticket = await _db.Tickets.FindAsync(id);
        if (ticket is null) return NotFound();
        _db.Tickets.Remove(ticket);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
