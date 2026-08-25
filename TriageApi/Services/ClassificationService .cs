using System.Text;
using System.Text.Json;
using TriageApi.Dto;
using TriageApi.Models;
using TriageApi.Services.Interfaces;

namespace TriageApi.Services;

public class ClassificationService : IClassificationService
{
    private readonly IHttpClientFactory _httpClientFactory;

    public ClassificationService(
        IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public async Task<bool> TryClassifyAsync(Ticket ticket)
    {
        var client =
            _httpClientFactory.CreateClient("ClassificationService");

        var request = new ClassificationRequest
        {
            Title = ticket.Title,
            Description = ticket.Description
        };

        var json = JsonSerializer.Serialize(
            request,
            new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

        using var content = new StringContent(
            json,
            Encoding.UTF8,
            "application/json");

        try
        {
            var response = await client.PostAsync(
                "classify",
                content);

            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine(
                    $"Classification failed: {response.StatusCode}");

                return false;
            }

            var responseJson =
                await response.Content.ReadAsStringAsync();

            var result =
                JsonSerializer.Deserialize<ClassificationResponse>(
                    responseJson,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

            if (result is null)
                return false;

            ticket.Category = result.Category;
            ticket.Severity = result.Severity;
            ticket.AssignedTeam = result.AssignedTeam;
            ticket.Summary = result.Summary;

            return true;
        }
        catch (HttpRequestException ex)
        {
            Console.WriteLine(
                $"Classification service unavailable: {ex.Message}");

            return false;
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                $"Classification error: {ex.Message}");

            return false;
        }
    }
}