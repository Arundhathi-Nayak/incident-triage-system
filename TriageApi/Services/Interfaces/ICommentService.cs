using TriageApi.Dto;
using TriageApi.Models;

namespace TriageApi.Services.Interfaces;

public interface ICommentService
{
    Task<bool> TicketExistsAsync(
        string incidentId);

    Task<CommentPageResult> GetForTicketAsync(
        string incidentId,
        int skip,
        int take);

    Task<Comment?> CreateAsync(
        string incidentId,
        CreateCommentDto dto);

    Task<Comment?> UpdateAsync(
        string incidentId,
        int commentId,
        UpdateCommentDto dto);

    Task<bool> DeleteAsync(
        string incidentId,
        int commentId);
}