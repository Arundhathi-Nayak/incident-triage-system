using Microsoft.EntityFrameworkCore;
using TriageApi.Models;

public class TriageDbContext : DbContext
{
    public TriageDbContext(DbContextOptions<TriageDbContext> options) : base(options) { }

    public DbSet<Ticket> Tickets => Set<Ticket>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Ticket>().HasKey(t => t.Id);

        modelBuilder.Entity<Ticket>()
            .HasIndex(t => t.IncidentId)
            .IsUnique();
    }
}