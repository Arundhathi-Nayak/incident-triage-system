using Microsoft.EntityFrameworkCore;
using TriageApi.Services;
using TriageApi.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// OpenAPI / Swagger
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<TriageDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("Default")));

// Application Services
builder.Services.AddScoped<ITicketService, TicketService>();
builder.Services.AddScoped<ICommentService, CommentService>();
builder.Services.AddScoped<IClassificationService, ClassificationService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Classification API
builder.Services.AddHttpClient(
    "ClassificationService",
    client =>
    {
        client.BaseAddress =
            new Uri("http://localhost:8000/");
    });

var app = builder.Build();

// HTTP pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngular");

// Keep disabled for your current local setup.
// app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();