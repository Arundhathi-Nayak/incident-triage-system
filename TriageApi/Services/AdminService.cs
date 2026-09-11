using Microsoft.AspNetCore.Identity;
using TriageApi.Dto.Admin;
using TriageApi.Models;
using TriageApi.Services.Interfaces;

public class AdminService : IAdminService
{

    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public AdminService(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }
    public async Task ChangeRoleAsync(string userId, string role, string currentAdminUserId)
    {
        if (string.IsNullOrWhiteSpace(role))
            throw new ArgumentException("Role is required.");

        var allowedRoles = new[]
        {
            "Requester",
            "Agent",
            "Admin"
        };

        if (!allowedRoles.Contains(role, StringComparer.OrdinalIgnoreCase))
            throw new ArgumentException("Invalid role.");

        if (userId == currentAdminUserId)
        {
            throw new InvalidOperationException(
                "You cannot change your own role.");
        }


        var user = await _userManager.FindByIdAsync(userId) ?? throw new KeyNotFoundException("User not found.");

        var normalizedRole = allowedRoles.First(r => r.Equals(role, StringComparison.OrdinalIgnoreCase));

        if (!await _roleManager.RoleExistsAsync(normalizedRole))
            throw new InvalidOperationException($"Role '{normalizedRole}' does not exist.");

        var currentRoles = await _userManager.GetRolesAsync(user);

        if (currentRoles.Contains("Admin") &&
            !role.Equals("Admin", StringComparison.OrdinalIgnoreCase))
        {
            var adminUsers =
                await _userManager.GetUsersInRoleAsync("Admin");

            if (adminUsers.Count <= 1)
            {
                throw new InvalidOperationException(
                    "The last Admin cannot be removed.");
            }
        }
        if (currentRoles.Count > 0)
        {
            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);

            if (!removeResult.Succeeded)
            {
                throw new InvalidOperationException("Failed to remove existing roles.");
            }
        }

        var addResult = await _userManager.AddToRoleAsync(user, normalizedRole);
        if (!addResult.Succeeded)
        {
            throw new InvalidOperationException("Failed to assign new role.");
        }

    }

    public async Task<UserSummaryDto> GetUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
        {
            throw new KeyNotFoundException("User not found.");
        }

        var roles = await _userManager.GetRolesAsync(user);

        return new UserSummaryDto
        {
            Id = user.Id,
            DisplayName = user.DisplayName,
            Email = user.Email ?? string.Empty,
            Roles = roles
        };
    }

    public async Task<IList<UserSummaryDto>> GetUsersAsync()
    {
        var users = _userManager.Users.ToList();

        var result = new List<UserSummaryDto>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);

            result.Add(new UserSummaryDto
            {
                Id = user.Id,
                DisplayName = user.DisplayName,
                Email = user.Email ?? string.Empty,
                Roles = roles
            });
        }

        return result;
    }
}