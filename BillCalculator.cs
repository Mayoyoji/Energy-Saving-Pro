public class BillCalculator
{
    public BillCalculationResponse Calculate(double meterReading, double tariffRate)
    {
        if (meterReading < 0)
            throw new ArgumentException("Meter reading cannot be negative.");
        
        if (tariffRate < 0)
            throw new ArgumentException("Tariff rate cannot be negative.");

        var totalBill = meterReading * tariffRate;

        return new BillCalculationResponse
        {
            TotalBill = Math.Round(totalBill, 2),
            EnergyUsed = meterReading,
            Message = $"Bill calculated for {meterReading} kWh at ₱{tariffRate}/kWh"
        };
    }

    public BillCalculationResponse CalculateWithPreviousReading(double currentReading, double previousReading, double tariffRate)
    {
        if (currentReading < previousReading)
            throw new ArgumentException("Current reading cannot be less than previous reading.");

        var energyUsed = currentReading - previousReading;
        return Calculate(energyUsed, tariffRate);
    }
}