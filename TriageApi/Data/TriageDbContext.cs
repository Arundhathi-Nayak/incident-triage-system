using Microsoft.EntityFrameworkCore;
using TriageApi.Models;

public class TriageDbContext : DbContext
{
    public TriageDbContext(DbContextOptions<TriageDbContext> options) : base(options) { }

    public DbSet<Ticket> Tickets => Set<Ticket>();
}