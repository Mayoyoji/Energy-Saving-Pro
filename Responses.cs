
namespace EnergySavingPro.API.Models.Responses
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class CarbonCalculationResponse
    {
        public double CarbonEmissions { get; set; }
        public double EnergyConsumed { get; set; }
        public double EmissionFactor { get; set; }
        public string EquivalentDescription { get; set; } = string.Empty;
    }

    public class BillCalculationResponse
    {
        public double TotalCost { get; set; }
        public double MeterReading { get; set; }
        public double TariffRate { get; set; }
        public double DailyCost { get; set; }
        public double MonthlyCost { get; set; }
    }

    public class ScenarioCalculationResponse
    {
        public double DailyCost { get; set; }
        public double MonthlyCost { get; set; }
        public double DailyCarbon { get; set; }
        public double MonthlyCarbon { get; set; }
        public double DailyConsumption { get; set; }
        public double MonthlyConsumption { get; set; }
        public string ApplianceName { get; set; } = string.Empty;
        public double ApplianceWattage { get; set; }
    }

    public class ApplianceResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public double Wattage { get; set; }
        public string Category { get; set; } = string.Empty;
        public double? TypicalUsageHours { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class NotificationResponse
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}