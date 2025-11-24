public class CarbonCalculator
{
    private const double PHILIPPINES_EMISSION_FACTOR = 0.691; 

    public CarbonCalculationResponse Calculate(double energyConsumption)
    {
        if (energyConsumption < 0)
            throw new ArgumentException("Energy consumption cannot be negative.");

        var carbonEmissions = energyConsumption * PHILIPPINES_EMISSION_FACTOR;

        return new CarbonCalculationResponse
        {
            CarbonEmissions = Math.Round(carbonEmissions, 2),
            EmissionFactor = PHILIPPINES_EMISSION_FACTOR,
            Message = $"Carbon footprint calculated for {energyConsumption} kWh consumption"
        };
    }

    public double GetEmissionFactor()
    {
        return PHILIPPINES_EMISSION_FACTOR;
    }
}