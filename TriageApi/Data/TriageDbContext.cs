using Microsoft.EntityFrameworkCore;
using TriageApi.Models;

public class TriageDbContext : DbContext
{
    public TriageDbContext(
        DbContextOptions<TriageDbContext> options)
        : base(options)
    {
    }

    public DbSet<Ticket> Tickets => Set<Ticket>();

    public DbSet<Comment> Comments => Set<Comment>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ==========================================
        // TICKET
        // ==========================================

        modelBuilder.Entity<Ticket>()
            .HasKey(t => t.IncidentId);

        modelBuilder.Entity<Ticket>()
            .Property(t => t.IncidentId)
            .IsRequired();

        // Id remains SQL Server identity,
        // but is NOT the primary key.
        modelBuilder.Entity<Ticket>()
            .Property(t => t.Id)
            .ValueGeneratedOnAdd();

        // ==========================================
        // COMMENT
        // ==========================================

        modelBuilder.Entity<Comment>()
            .HasKey(c => c.Id);

        modelBuilder.Entity<Comment>()
            .Property(c => c.Id)
            .ValueGeneratedOnAdd();

        // ==========================================
        // TICKET → COMMENTS
        // ==========================================

        modelBuilder.Entity<Ticket>()
            .HasMany(t => t.Comments)
            .WithOne(c => c.Ticket)
            .HasForeignKey(c => c.IncidentId)
            .HasPrincipalKey(t => t.IncidentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Useful for comment lookup
        modelBuilder.Entity<Comment>()
            .HasIndex(c => c.IncidentId);
    }
}