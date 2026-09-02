using Microsoft.AspNetCore.Identity;

namespace TriageApi.Models;

public class ApplicationUser : IdentityUser
{
    public string DisplayName { get; set; } = string.Empty;
}