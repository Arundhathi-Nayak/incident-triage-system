using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TriageApi.Dto;
using TriageApi.Services.Interfaces;

[ApiController]
[Route("api/[controller]")]
[Authorize]
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
        var currentUser = GetCurrentUser();

        if (currentUser is null)
            return Unauthorized();

        var result =
            await _ticketService.GetTicketsAsync(query, currentUser.Value.UserId, currentUser.Value.Role);

        return Ok(result);
    }

    // GET: /api/tickets/statistics
    [HttpGet("statistics")]
    public async Task<ActionResult<TicketStatisticsDto>>
        GetStatistics()
    {
        var currentUser = GetCurrentUser();

        if (currentUser is null)
            return Unauthorized();
        var result =
            await _ticketService.GetStatisticsAsync(currentUser.Value.UserId, currentUser.Value.Role);

        return Ok(result);
    }

    // GET: /api/tickets/INC10001
    [HttpGet("{incidentId}", Name = "GetTicketByIncidentId")]
    public async Task<ActionResult<TicketDetailsDto>>
        GetById(string incidentId)
    {
        var currentUser = GetCurrentUser();

        if (currentUser is null)
            return Unauthorized();
        var ticket =
            await _ticketService.GetByIdAsync(incidentId, currentUser.Value.UserId, currentUser.Value.Role);

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

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var ticket = await _ticketService.CreateAsync(dto, userId);

        return CreatedAtRoute(
            "GetTicketByIncidentId",
            new { incidentId = ticket.IncidentId },
            ticket);
    }

    // PUT: /api/tickets/INC10001
    [HttpPut("{incidentId}")]
    [Authorize(Roles = "Agent,Admin")]
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
    [Authorize(Roles = "Agent,Admin")]
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
    [Authorize(Roles = "Agent,Admin")]
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
    [Authorize(Roles = "Agent,Admin")]
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
    private (string UserId, string Role)? GetCurrentUser()
    {
        var userId =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        var role =
            User.FindFirstValue(ClaimTypes.Role);

        if (string.IsNullOrWhiteSpace(userId) ||
            string.IsNullOrWhiteSpace(role))
        {
            return null;
        }

        return (userId, role);
    }
}