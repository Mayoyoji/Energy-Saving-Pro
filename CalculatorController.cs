using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://127.0.0.1:5500")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddScoped<CarbonCalculator>();
builder.Services.AddScoped<BillCalculator>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run();

[ApiController]
[Route("api/[controller]")]
public class CalculatorController : ControllerBase
{
    private readonly CarbonCalculator _carbonCalculator;
    private readonly BillCalculator _billCalculator;

    public CalculatorController(CarbonCalculator carbonCalculator, BillCalculator billCalculator)
    {
        _carbonCalculator = carbonCalculator;
        _billCalculator = billCalculator;
    }

    [HttpPost("carbon")]
    public ActionResult<CarbonCalculationResponse> CalculateCarbon([FromBody] CarbonCalculationRequest request)
    {
        try
        {
            if (request.EnergyConsumption < 0)
            {
                return BadRequest("Energy consumption cannot be negative.");
            }

            var result = _carbonCalculator.Calculate(request.EnergyConsumption);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error calculating carbon footprint: {ex.Message}");
        }
    }

    [HttpPost("bill")]
    public ActionResult<BillCalculationResponse> CalculateBill([FromBody] BillCalculationRequest request)
    {
        try
        {
            if (request.MeterReading < 0 || request.TariffRate < 0)
            {
                return BadRequest("Meter reading and tariff rate cannot be negative.");
            }

            var result = _billCalculator.Calculate(request.MeterReading, request.TariffRate);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error calculating bill: {ex.Message}");
        }
    }

    [HttpGet("health")]
    public ActionResult HealthCheck()
    {
        return Ok(new { status = "API is running", timestamp = DateTime.UtcNow });
    }
}