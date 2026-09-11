using Microsoft.AspNetCore.Identity;
using TriageApi.Models;

namespace TriageApi.Extensions;

public static class AdminSeedExtenstions
{
    public static async Task SeedAdminAsync(this IServiceProvider serviceProvider, IConfiguration configuration)
    {
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

        var email = configuration["AdminSeed:Email"];

        var password = configuration["AdminSeed:Password"];

        var displayName = configuration["AdminSeed:DisplayName"];

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(displayName))
        {
            throw new InvalidOperationException("Admin seed configuration is missing.");
        }

        const string adminRole = "Admin";

        if (!await roleManager.RoleExistsAsync(adminRole))
        {
            throw new InvalidOperationException("Admin role does not exist.");
        }

        var admin = await userManager.FindByEmailAsync(email);

        if (admin == null)
        {
            admin = new ApplicationUser
            {
                UserName = email,
                Email = email,
                DisplayName = displayName,
                EmailConfirmed = true
            };

            var createResult = await userManager.CreateAsync(admin, password);

            if (!createResult.Succeeded)
            {
                var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));

                throw new InvalidOperationException($"Failed to create admin user: {errors}");
            }
        }

        if (!await userManager.IsInRoleAsync(admin, adminRole))
        {
            var roleResult = await userManager.AddToRoleAsync(admin, adminRole);

            if (!roleResult.Succeeded)
            {
                var errors = string.Join("; ", roleResult.Errors.Select(e => e.Description));

                throw new InvalidOperationException($"Failed to assign Admin role: {errors}");
            }
        }
    }
}