using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TriageApi.Models;

public class TriageDbContext : IdentityDbContext<ApplicationUser>
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
        // INCIDENT NUMBER SEQUENCE
        // ==========================================

        modelBuilder.HasSequence<int>("IncidentNumberSequence")
            .StartsAt(10001)
            .IncrementsBy(1);

        // ==========================================
        // TICKET
        // ==========================================

        modelBuilder.Entity<Ticket>(entity =>
        {
            // Technical primary key
            entity.HasKey(t => t.Id);

            entity.Property(t => t.Id)
                .ValueGeneratedOnAdd();

            // Business identifier
            entity.Property(t => t.IncidentId)
                .IsRequired()
                .HasMaxLength(20)
                .HasDefaultValueSql(
                    "'INC' + CONVERT(varchar(20), NEXT VALUE FOR IncidentNumberSequence)"
                );

            // IncidentId must be unique
            entity.HasAlternateKey(t => t.IncidentId);
        });

        // ==========================================
        // COMMENT
        // ==========================================

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(c => c.Id);

            entity.Property(c => c.Id)
                .ValueGeneratedOnAdd();

            entity.Property(c => c.IncidentId)
                .IsRequired()
                .HasMaxLength(20);

            entity.HasIndex(c => c.IncidentId);
        });

        // ==========================================
        // TICKET → COMMENTS
        // ==========================================

        modelBuilder.Entity<Ticket>()
            .HasMany(t => t.Comments)
            .WithOne(c => c.Ticket)
            .HasForeignKey(c => c.IncidentId)
            .HasPrincipalKey(t => t.IncidentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}