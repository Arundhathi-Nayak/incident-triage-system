using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TriageApi.Dto;
using TriageApi.Services.Interfaces;

[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;

    public TicketsController(
        ITicketService ticketService)
    {
        _ticketService = ticketService;
    }

    // GET: /api/tickets
    [Authorize]
    [HttpGet]
    public async Task<ActionResult<PagedResultDto<TicketListItemDto>>>
        GetAll([FromQuery] TicketQueryDto query)
    {
        var result =
            await _ticketService.GetTicketsAsync(query);

        return Ok(result);
    }

    // GET: /api/tickets/statistics
    [HttpGet("statistics")]
    public async Task<ActionResult<TicketStatisticsDto>>
        GetStatistics()
    {
        var result =
            await _ticketService.GetStatisticsAsync();

        return Ok(result);
    }

    // GET: /api/tickets/INC10001
    [HttpGet("{incidentId}", Name = "GetTicketByIncidentId")]
    public async Task<ActionResult<TicketDetailsDto>>
        GetById(string incidentId)
    {
        var ticket =
            await _ticketService.GetByIdAsync(incidentId);

        if (ticket is null)
            return NotFound(
                $"Ticket {incidentId} not found.");

        return Ok(ticket);
    }

    // POST: /api/tickets
    [HttpPost]
    public async Task<ActionResult<TicketDetailsDto>>
        Create(CreateTicketDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest("Title is required.");

        if (string.IsNullOrWhiteSpace(dto.Description))
            return BadRequest("Description is required.");

        if (string.IsNullOrWhiteSpace(dto.CreatedBy))
            return BadRequest("CreatedBy is required.");

        var ticket =
            await _ticketService.CreateAsync(dto);

        return CreatedAtRoute(
            "GetTicketByIncidentId",
            new { incidentId = ticket.IncidentId },
            ticket);
    }
    // PUT: /api/tickets/INC10001
    [HttpPut("{incidentId}")]
    public async Task<IActionResult> Update(
        string incidentId,
        UpdateTicketDto dto)
    {
        try
        {
            var updated =
                await _ticketService.UpdateAsync(
                    incidentId,
                    dto);

            if (!updated)
                return NotFound(
                    $"Ticket {incidentId} not found.");

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // POST: /api/tickets/INC10001/resolve
    [HttpPost("{incidentId}/resolve")]
    public async Task<ActionResult<TicketDetailsDto>>
        Resolve(
            string incidentId,
            ResolveTicketDto dto)
    {
        try
        {
            var ticket =
                await _ticketService.ResolveAsync(
                    incidentId,
                    dto);

            if (ticket is null)
                return NotFound(
                    $"Ticket {incidentId} not found.");

            return Ok(ticket);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // PUT: /api/tickets/INC10001/resolution
    [HttpPut("{incidentId}/resolution")]
    public async Task<ActionResult<TicketDetailsDto>>
        UpdateResolution(
            string incidentId,
            UpdateResolutionDto dto)
    {
        try
        {
            var ticket =
                await _ticketService.UpdateResolutionAsync(
                    incidentId,
                    dto);

            if (ticket is null)
                return NotFound(
                    $"Ticket {incidentId} not found.");

            return Ok(ticket);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // DELETE: /api/tickets/INC10001
    [HttpDelete("{incidentId}")]
    public async Task<IActionResult> Delete(
        string incidentId)
    {
        var deleted =
            await _ticketService.DeleteAsync(
                incidentId);

        if (!deleted)
            return NotFound(
                $"Ticket {incidentId} not found.");

        return NoContent();
    }
}