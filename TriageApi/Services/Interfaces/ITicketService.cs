using TriageApi.Dto;

namespace TriageApi.Services.Interfaces;

public interface ITicketService
{
    Task<PagedResultDto<TicketListItemDto>> GetTicketsAsync(
        TicketQueryDto query);

    Task<TicketDetailsDto?> GetByIdAsync(
        string incidentId);

    Task<TicketDetailsDto> CreateAsync(
        CreateTicketDto dto);

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

    Task<TicketStatisticsDto> GetStatisticsAsync();
}