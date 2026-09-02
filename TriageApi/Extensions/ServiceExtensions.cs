using Microsoft.EntityFrameworkCore;
using TriageApi.Services;
using TriageApi.Services.Interfaces;

namespace TriageApi.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddApplicationServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // -----------------------------------------
        // Database
        // -----------------------------------------

        services.AddDbContext<TriageDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("Default")));

        // -----------------------------------------
        // Application Services
        // -----------------------------------------

        services.AddScoped<ITicketService, TicketService>();

        services.AddScoped<ICommentService, CommentService>();

        services.AddScoped<IClassificationService,
            ClassificationService>();

        services.AddScoped<IAuthService, AuthService>();
        // -----------------------------------------
        // Classification API
        // -----------------------------------------

        services.AddHttpClient(
            "ClassificationService",
            client =>
            {
                client.BaseAddress =
                    new Uri("http://localhost:8000/");
            });

        // -----------------------------------------
        // Controllers
        // -----------------------------------------

        services.AddControllers();

        return services;
    }
}