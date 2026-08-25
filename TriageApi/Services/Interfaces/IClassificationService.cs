using TriageApi.Models;

namespace TriageApi.Services.Interfaces;

public interface IClassificationService
{
    Task<bool> TryClassifyAsync(Ticket ticket);
}