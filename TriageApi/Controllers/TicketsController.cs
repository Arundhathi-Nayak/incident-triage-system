using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TriageApi.Models;

[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly TriageDbContext _db;
    private readonly IHttpClientFactory _httpClientFactory;
    public TicketsController(TriageDbContext db, IHttpClientFactory httpClientFactory)
    {
        _db = db;
        _httpClientFactory = httpClientFactory;
    }

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
    public async Task<ActionResult<Ticket>> Create(CreateTicketDto dto)
    {
        var ticket = new Ticket
        {
            Title = dto.Title,
            Description = dto.Description,
            Submitter = dto.Submitter
        };

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

    [HttpPost("{id}/classify")]
    public async Task<ActionResult<Ticket>> Classify(int id)
    {
        var ticket = await _db.Tickets.FindAsync(id);
        if (ticket is null) return NotFound();

        var client = _httpClientFactory.CreateClient("ClassificationService");

        var requestBody = new ClassificationRequest
        {
            Title = ticket.Title,
            Description = ticket.Description
        };

        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var json = JsonSerializer.Serialize(requestBody, jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        HttpResponseMessage response;
        try
        {
            response = await client.PostAsync("classify", content);
        }
        catch (HttpRequestException)
        {
            return StatusCode(503, "Classification service is unreachable. Is it running on port 8000?");
        }

        if (!response.IsSuccessStatusCode)
        {
            return StatusCode(502, "Classification service returned an error.");
        }
        var responseJson = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ClassificationResponse>(
            responseJson,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
        );

        if (result is null) return StatusCode(502, "Could not parse classification response.");

        ticket.Category = result.Category;
        ticket.Severity = result.Severity;
        ticket.AssignedTeam = result.AssignedTeam;
        ticket.Summary = result.Summary;

        await _db.SaveChangesAsync();

        return Ok(ticket);
    }

}
