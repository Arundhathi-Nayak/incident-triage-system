using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TriageApi.Dto;
using TriageApi.Models;
using TriageApi.Services.Interfaces;

namespace TriageApi.Controllers;

[ApiController]
[Route("api/tickets/{incidentId}/comments")]
[Authorize]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _commentService;

    public CommentsController(
        ICommentService commentService)
    {
        _commentService = commentService;
    }


    // =====================================================
    // GET COMMENTS
    // =====================================================
    //
    // GET
    // /api/tickets/INC10001/comments
    //
    // GET first 5:
    // /api/tickets/INC10001/comments?skip=0&take=5
    //
    // GET next 5:
    // /api/tickets/INC10001/comments?skip=5&take=5
    //
    // =====================================================

    [HttpGet]
    public async Task<ActionResult<CommentPageResult>>
        GetForTicket(
            string incidentId,
            [FromQuery] int skip = 0,
            [FromQuery] int take = 5)
    {
        var userId =
       User.FindFirstValue(
           ClaimTypes.NameIdentifier);

        var role =
            User.FindFirstValue(
                ClaimTypes.Role);

        if (string.IsNullOrWhiteSpace(userId) ||
            string.IsNullOrWhiteSpace(role))
        {
            return Unauthorized();
        }

        var ticketExists =
            await _commentService
                .TicketExistsAsync(incidentId);


        if (!ticketExists)
        {
            return NotFound(
                $"Ticket {incidentId} not found.");
        }

        var canAccess =
        await _commentService
            .CanAccessTicketAsync(
                incidentId,
                userId,
                role);

        if (!canAccess)
            return Forbid();

        var result =
            await _commentService
                .GetForTicketAsync(
                    incidentId,
                    skip,
                    take);


        return Ok(result);
    }


    // =====================================================
    // CREATE
    // =====================================================

    [HttpPost]
    public async Task<ActionResult<Comment>>
        Create(
            string incidentId,
            CreateCommentDto dto)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized();
            }

            var comment =
                await _commentService
                    .CreateAsync(
                        incidentId,
                        dto, userId);


            if (comment is null)
            {
                return NotFound(
                    $"Ticket {incidentId} not found.");
            }


            return CreatedAtAction(
                nameof(GetForTicket),
                new
                {
                    incidentId
                },
                comment);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
    }


    // =====================================================
    // UPDATE
    // =====================================================

    [HttpPut("{commentId:int}")]
    public async Task<ActionResult<Comment>>
        Update(
            string incidentId,
            int commentId,
            UpdateCommentDto dto)
    {
        try
        {
            var userId =
           User.FindFirstValue(
               ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();

            var ticketExists =
                await _commentService
                    .TicketExistsAsync(
                        incidentId);


            if (!ticketExists)
            {
                return NotFound(
                    $"Ticket {incidentId} not found.");
            }


            var comment =
                await _commentService
                    .UpdateAsync(
                        incidentId,
                        commentId,
                        dto, userId);


            if (comment is null)
            {
                return NotFound(
                    $"Comment {commentId} not found.");
            }


            return Ok(comment);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
    }


    // =====================================================
    // DELETE
    // =====================================================

    [HttpDelete("{commentId:int}")]
    public async Task<IActionResult> Delete(
        string incidentId,
        int commentId)
    {
        var userId =
        User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var ticketExists =
            await _commentService
                .TicketExistsAsync(
                    incidentId);


        if (!ticketExists)
        {
            return NotFound(
                $"Ticket {incidentId} not found.");
        }


        var deleted =
            await _commentService
                .DeleteAsync(
                    incidentId,
                    commentId, userId);


        if (!deleted)
        {
            return NotFound(
                $"Comment {commentId} not found.");
        }


        return NoContent();
    }
}