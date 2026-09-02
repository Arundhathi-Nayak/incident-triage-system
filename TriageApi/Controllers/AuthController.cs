using Microsoft.AspNetCore.Mvc;
using TriageApi.Dto;
using TriageApi.Services.Interfaces;

namespace TriageApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authServices;

    public AuthController(IAuthService authService)
    {
        _authServices = authService;
    }
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>>
    Register(RegisterDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.DisplayName))
                return BadRequest(
                    "Display name is required.");

            if (string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest(
                    "Email is required.");

            if (string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest(
                    "Password is required.");

            var result =
                await _authServices.RegisterAsync(dto);

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>>
          Login(LoginDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest(
                    "Email is required.");

            if (string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest(
                    "Password is required.");

            var result =
                await _authServices.LoginAsync(dto);

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(
                "Invalid email or password.");
        }
    }

}