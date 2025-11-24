
public class CarbonCalculationResult
{
    public double CarbonEmissions { get; set; }
    public double EnergyConsumed { get; set; }
    public double EmissionFactor { get; set; }
    public bool IsSuccess { get; set; }
    public string Message { get; set; }
}

public class BillCalculationResult
{
    public double TotalCost { get; set; }
    public double MeterReading { get; set; }
    public double TariffRate { get; set; }
    public bool IsSuccess { get; set; }
    public string Message { get; set; }
}

public class ScenarioCalculationResult
{
    public double DailyCost { get; set; }
    public double MonthlyCost { get; set; }
    public double DailyCarbon { get; set; }
    public double DailyConsumption { get; set; }
    public string ApplianceName { get; set; }
    public bool IsSuccess { get; set; }
    public string Message { get; set; }
}

public class Appliance
{
    public int Id { get; set; }
    public string Name { get; set; }
    public double Wattage { get; set; }
    public string Category { get; set; }
}