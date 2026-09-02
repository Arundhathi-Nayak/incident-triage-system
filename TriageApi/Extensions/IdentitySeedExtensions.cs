using Microsoft.AspNetCore.Identity;

namespace TriageApi.Extensions;

public static class IdentitySeedExtensions
{
    public static async Task SeedRolesAsync(
        this IServiceProvider serviceProvider)
    {
        var roleManager =
            serviceProvider
                .GetRequiredService<RoleManager<IdentityRole>>();

        string[] roles =
        {
            "Requester",
            "Agent",
            "Admin"
        };

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                var result =
                    await roleManager.CreateAsync(
                        new IdentityRole(role));

                if (!result.Succeeded)
                {
                    var errors = string.Join(
                        "; ",
                        result.Errors.Select(
                            e => e.Description));

                    throw new InvalidOperationException(
                        $"Failed to create role '{role}': {errors}");
                }
            }
        }
    }
}