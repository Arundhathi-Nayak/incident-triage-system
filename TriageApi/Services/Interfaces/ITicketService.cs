using TriageApi.Dto;

namespace TriageApi.Services.Interfaces;

public interface ITicketService
{
    Task<PagedResultDto<TicketListItemDto>> GetTicketsAsync(
        TicketQueryDto query, string userId, string role);

    Task<TicketDetailsDto?> GetByIdAsync(
        string incidentId, string userId, string role);

    Task<TicketDetailsDto> CreateAsync(
        CreateTicketDto dto, string userId);

    Task<bool> UpdateAsync(
        string incidentId,
        UpdateTicketDto dto);

    Task<TicketDetailsDto?> ResolveAsync(
        string incidentId,
        ResolveTicketDto dto);

    Task<TicketDetailsDto?> UpdateResolutionAsync(
        string incidentId,
        UpdateResolutionDto dto);

    Task<bool> DeleteAsync(
        string incidentId);

    Task<TicketStatisticsDto> GetStatisticsAsync(string userId, string role);
}