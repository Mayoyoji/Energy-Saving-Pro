
public class CarbonCalculator
{
    private const double PH_EMISSION_FACTOR = 0.691; 
    
    public CarbonCalculationResult CalculateCarbonEmissions(CarbonCalculationRequest request)
    {
        try
        {
            var emissions = request.EnergyConsumption * PH_EMISSION_FACTOR;
            
            return new CarbonCalculationResult
            {
                CarbonEmissions = Math.Round(emissions, 2),
                EnergyConsumed = request.EnergyConsumption,
                EmissionFactor = PH_EMISSION_FACTOR,
                IsSuccess = true,
                Message = "Carbon footprint calculated successfully"
            };
        }
        catch (Exception ex)
        {
            return new CarbonCalculationResult
            {
                IsSuccess = false,
                Message = $"Error calculating carbon emissions: {ex.Message}"
            };
        }
    }
}

public class BillCalculator
{
    public BillCalculationResult CalculateBill(BillCalculationRequest request)
    {
        try
        {
            var totalCost = request.MeterReading * request.TariffRate;
            
            return new BillCalculationResult
            {
                TotalCost = Math.Round(totalCost, 2),
                MeterReading = request.MeterReading,
                TariffRate = request.TariffRate,
                IsSuccess = true,
                Message = "Bill calculated successfully"
            };
        }
        catch (Exception ex)
        {
            return new BillCalculationResult
            {
                IsSuccess = false,
                Message = $"Error calculating bill: {ex.Message}"
            };
        }
    }
    
    public ScenarioCalculationResult CalculateScenario(ScenarioCalculationRequest request, Appliance appliance)
    {
        try
        {
            if (appliance == null)
            {
                return new ScenarioCalculationResult
                {
                    IsSuccess = false,
                    Message = "Appliance not found"
                };
            }
            
           
            var dailyConsumption = (appliance.Wattage * request.UsageHours) / 1000;
            var dailyCost = dailyConsumption * request.TariffRate;
            var monthlyCost = dailyCost * 30;
            var dailyCarbon = dailyConsumption * 0.691; 
            
            return new ScenarioCalculationResult
            {
                DailyCost = Math.Round(dailyCost, 2),
                MonthlyCost = Math.Round(monthlyCost, 2),
                DailyCarbon = Math.Round(dailyCarbon, 2),
                DailyConsumption = Math.Round(dailyConsumption, 2),
                ApplianceName = appliance.Name,
                IsSuccess = true,
                Message = "Scenario calculated successfully"
            };
        }
        catch (Exception ex)
        {
            return new ScenarioCalculationResult
            {
                IsSuccess = false,
                Message = $"Error calculating scenario: {ex.Message}"
            };
        }
    }
}