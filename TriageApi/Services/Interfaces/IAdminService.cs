using TriageApi.Dto.Admin;

namespace TriageApi.Services.Interfaces;

public interface IAdminService
{
    Task<IList<UserSummaryDto>> GetUsersAsync();

    Task<UserSummaryDto> GetUserAsync(string userId);

    Task ChangeRoleAsync(string userId, string role, string currentAdminUserId);
}