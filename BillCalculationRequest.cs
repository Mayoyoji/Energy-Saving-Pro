public class CarbonCalculationRequest
{
    public double EnergyConsumption { get; set; }
}

public class CarbonCalculationResponse
{
    public double CarbonEmissions { get; set; }
    public string Unit { get; set; } = "kg CO₂";
    public double EmissionFactor { get; set; }
    public string Message { get; set; }
}

public class BillCalculationRequest
{
    public double MeterReading { get; set; }
    public double TariffRate { get; set; }
}

public class BillCalculationResponse
{
    public double TotalBill { get; set; }
    public string Currency { get; set; } = "₱";
    public double EnergyUsed { get; set; }
    public string Message { get; set; }
}