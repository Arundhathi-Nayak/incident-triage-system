using Microsoft.AspNetCore.Mvc;
using TriageApi.Dto;
using TriageApi.Models;
using TriageApi.Services.Interfaces;

namespace TriageApi.Controllers;

[ApiController]
[Route("api/tickets/{incidentId}/comments")]
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
        var ticketExists =
            await _commentService
                .TicketExistsAsync(incidentId);


        if (!ticketExists)
        {
            return NotFound(
                $"Ticket {incidentId} not found.");
        }


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
            var comment =
                await _commentService
                    .CreateAsync(
                        incidentId,
                        dto);


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
                        dto);


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
    }


    // =====================================================
    // DELETE
    // =====================================================

    [HttpDelete("{commentId:int}")]
    public async Task<IActionResult> Delete(
        string incidentId,
        int commentId)
    {
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
                    commentId);


        if (!deleted)
        {
            return NotFound(
                $"Comment {commentId} not found.");
        }


        return NoContent();
    }
}