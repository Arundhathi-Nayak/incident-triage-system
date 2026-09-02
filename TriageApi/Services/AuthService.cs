

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.IdentityModel.Tokens;
using Microsoft.VisualBasic;
using TriageApi.Dto;
using TriageApi.Models;
using TriageApi.Services.Interfaces;

namespace TriageApi.Services;

public class AuthService : IAuthService
{

    private readonly UserManager<ApplicationUser> _userManager;

    private readonly RoleManager<IdentityRole> _roleManager;

    private readonly IConfiguration _configuration;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user =
          await _userManager.FindByEmailAsync(dto.Email);

        if (user is null)
        {
            throw new UnauthorizedAccessException(
                "Invalid email or password.");
        }

        var validPassword =
            await _userManager.CheckPasswordAsync(
                user,
                dto.Password);

        if (!validPassword)
        {
            throw new UnauthorizedAccessException(
                "Invalid email or password.");
        }

        return await CreateAuthResponseAsync(user);
    }

    public async Task<AuthResponseDto> RegisterAsync(
        RegisterDto dto)
    {
        var existingUser =
            await _userManager.FindByEmailAsync(dto.Email);

        if (existingUser is not null)
        {
            throw new InvalidOperationException(
                "A user with this email already exists.");
        }

        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            DisplayName = dto.DisplayName
        };

        var result =
            await _userManager.CreateAsync(
                user,
                dto.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join(
                "; ",
                result.Errors.Select(
                    e => e.Description));

            throw new ArgumentException(errors);
        }

        // Every public registration becomes a Requester
        var roleResult =
            await _userManager.AddToRoleAsync(
                user,
                "Requester");

        if (!roleResult.Succeeded)
        {
            var errors = string.Join(
                "; ",
                roleResult.Errors.Select(
                    e => e.Description));

            throw new InvalidOperationException(errors);
        }

        return await CreateAuthResponseAsync(user);
    }
    private async Task<AuthResponseDto> CreateAuthResponseAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);

        var token = GenerateJwtToken(user, roles);

        return new AuthResponseDto
        {
            Token = token,
            UserId = user.Id,
            DisplayName = user.DisplayName,
            Email = user.Email!,
            Roles = roles
        };
    }

    private string GenerateJwtToken(ApplicationUser user, IList<string> roles)
    {
        var jwtKey =
            _configuration["Jwt:Key"];

        var issuer =
            _configuration["Jwt:Issuer"];

        var audience =
            _configuration["Jwt:Audience"];

        if (string.IsNullOrWhiteSpace(jwtKey))
        {
            throw new InvalidOperationException(
                "JWT key is not configured.");
        }

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub,user.Id),
            new Claim(JwtRegisteredClaimNames.Email,user.Email!),
            new Claim(ClaimTypes.NameIdentifier,user.Id),
            new Claim(ClaimTypes.Name,user.DisplayName),
            new Claim(ClaimTypes.Email,user.Email!)
        };


        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expiryMinutes = _configuration.GetValue<int>("Jwt:ExpiryMinutes");

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expiryMinutes),
            signingCredentials: credentials
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
