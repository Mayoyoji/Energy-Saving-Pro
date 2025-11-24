
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "Energy Saving Pro API", 
        Version = "v1",
        Description = "API for energy consumption calculations and management"
    });
});


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000", 
            "http://127.0.0.1:5500", 
            "http://localhost:5500",
            "https://localhost:3000",
            "https://127.0.0.1:5500",
            "https://localhost:5500")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddScoped<CarbonCalculator>();
builder.Services.AddScoped<BillCalculator>();
builder.Services.AddScoped<ApplianceService>();
builder.Services.AddScoped<NotificationService>();


builder.Services.AddLogging();

var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Energy Saving Pro API v1");
        c.RoutePrefix = "api-docs";
    });
}

app.UseCors("AllowFrontend");
app.UseRouting();
app.UseAuthorization();
app.MapControllers();


app.MapGet("/api/health", () => new { status = "Healthy", timestamp = DateTime.UtcNow });

app.Run();