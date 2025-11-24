
namespace EnergySavingPro.API.Models.Requests
{
    public class CarbonCalculationRequest
    {
        public double EnergyConsumption { get; set; }
        public string? Unit { get; set; } = "kWh";
    }
}

namespace EnergySavingPro.API.Models.Requests
{
    public class BillCalculationRequest
    {
        public double MeterReading { get; set; }
        public double TariffRate { get; set; }
        public int DaysInPeriod { get; set; } = 30;
    }
}


namespace EnergySavingPro.API.Models.Requests
{
    public class ScenarioCalculationRequest
    {
        public int ApplianceId { get; set; }
        public double UsageHours { get; set; }
        public double TariffRate { get; set; }
        public int Days { get; set; } = 30;
    }
}


namespace EnergySavingPro.API.Models.Requests
{
    public class ApplianceRequest
    {
        public string Name { get; set; } = string.Empty;
        public double Wattage { get; set; }
        public string Category { get; set; } = string.Empty;
        public double? UsageHours { get; set; }
        public string? Description { get; set; }
    }
}