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

    [HttpGet("{incidentId}")]
    public async Task<ActionResult<Ticket>> GetById(string incidentId)
    {
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.IncidentId == incidentId);
        return ticket is null ? NotFound() : ticket;
    }

    [HttpPost]
    public async Task<ActionResult<Ticket>> Create(CreateTicketDto dto)
    {
        var ticket = new Ticket
        {
            Title = dto.Title,
            Description = dto.Description,
            CreatedBy = dto.CreatedBy
        };

        _db.Tickets.Add(ticket);
        await _db.SaveChangesAsync();
        ticket.IncidentId = $"INC{10000 + ticket.Id}";
        await _db.SaveChangesAsync();
        var (success, errorMessage) = await TryClassifyAsync(ticket);
        if (!success)
        {
            // Ticket still exists and was created successfully; just log the classification failure
            Console.WriteLine($"Auto-classification failed for {ticket.IncidentId}: {errorMessage}");
        }

        return CreatedAtAction(nameof(GetById), new { incidentId = ticket.IncidentId }, ticket);
    }

    [HttpPut("{incidentId}")]
    public async Task<ActionResult> Update(string incidentId, Ticket updated)
    {
        var existing = await _db.Tickets.FirstOrDefaultAsync(t => t.IncidentId == incidentId);
        if (existing is null) return NotFound();

        existing.Title = updated.Title;
        existing.Description = updated.Description;
        existing.Category = updated.Category;
        existing.Severity = updated.Severity;
        existing.Status = updated.Status;
        existing.AssignedTeam = updated.AssignedTeam;
        existing.ResolvedAt = updated.ResolvedAt;
        existing.Resolution = updated.Resolution;
        existing.Summary = updated.Summary;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{incidentId}")]
    public async Task<IActionResult> Delete(string incidentId)
    {
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.IncidentId == incidentId);
        if (ticket is null) return NotFound();
        _db.Tickets.Remove(ticket);
        await _db.SaveChangesAsync();
        return NoContent();
    }
    // [HttpPost("{id}/classify")]
    // public async Task<ActionResult<Ticket>> Classify(int id)
    private async Task<(bool Success, string? ErrorMessage)> TryClassifyAsync(Ticket ticket)
    {
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
            return (false, "Classification service is unreachable. Is it running on port 8000?");
        }

        if (!response.IsSuccessStatusCode)
        {
            return (false, "Classification service returned an error.");
        }

        var responseJson = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ClassificationResponse>(
            responseJson,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (result is null) return (false, "Could not parse classification response.");

        ticket.Category = result.Category;
        ticket.Severity = result.Severity;
        ticket.AssignedTeam = result.AssignedTeam;
        ticket.Summary = result.Summary;

        await _db.SaveChangesAsync();

        return (true, null);
    }

}
