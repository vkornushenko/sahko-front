export const dynamic = "force-dynamic";

import ChartTypeBar from "@/components/ChartTypeBar";
import { fetchLatestPriceData, fetchFingridData } from "@/lib/actions";

/**
 * Fetch a single 15-minute price entry from API
 */
async function fetchPriceByStartDate(startDateIso) {
  try {
    const res = await fetch(
      `https://api.porssisahko.net/v2/price.json?date=${startDateIso}`
    );
    if (!res.ok) {
      console.error("Error fetching price for:", startDateIso);
      return null;
    }

    const { price } = await res.json();
    const endDate = new Date(startDateIso);
    endDate.setMinutes(endDate.getMinutes() + 15);
    endDate.setMilliseconds(endDate.getMilliseconds() - 1);

    return {
      price,
      startDate: startDateIso,
      endDate: endDate.toISOString(),
    };
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

/**
 * Generate an array of ISO strings representing the previous N × 15-minute intervals
 */
function getPreviousIntervals(startDateIso, intervals = 4) {
  const result = [];
  let current = new Date(startDateIso);

  for (let i = 0; i < intervals; i++) {
    current = new Date(current.getTime() - 15 * 60 * 1000);
    result.push(current.toISOString());
  }

  return result;
}

/**
 * Fetch missing 15-minute interval prices
 */
async function fetchMissingPrices(latestPrice) {
  const startDates = getPreviousIntervals(latestPrice.startDate);
  const results = await Promise.all(startDates.map(fetchPriceByStartDate));
  return results.filter(Boolean); // remove nulls
}

/**
 * Merge fetched missing data into existing prices
 */
function mergePrices(prices, missingData) {
  const merged = [...prices, ...missingData];
  return merged.reverse(); // ASC order
}

/**
 * Transform price array into chart data format
 */
function mapToChartData(prices) {
  return prices.map((item) => ({
    value: item.price,
    start: new Date(item.startDate),
    end: new Date(item.endDate),
  }));
}

/**
 * Transform Fingrid API data to chart format
 */
function mapFingridDataToChart(data) {
  return data.map((item) => ({
    value: item.value,
    start: new Date(item.startTime),
    end: new Date(item.endTime),
  }));
}

export default async function Home() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  now.setDate(now.getDate() - 1);

  // Step 1. Fetch latest known prices
  const prices = await fetchLatestPriceData();

  // Step 2. Fill missing hour
  const missingData = await fetchMissingPrices(prices[prices.length - 1]);
  const fullPriceData = mergePrices(prices, missingData);

  // Step 3. Fetch Fingrid data
  const fingridDataWind = await fetchFingridData(
    245,
    now.toISOString(),
    (60 / 15) * 24 * 4, // 4 days
    "asc",
    15 * 60 // 15 minutes in seconds
  );

  // Step 4. Prepare chart data
  const marketElectricityPricesChart = mapToChartData(fullPriceData);
  const windPowerGenForecastChart = mapFingridDataToChart(fingridDataWind);

  return (
    <main>
      {marketElectricityPricesChart.length > 0 && (
        <ChartTypeBar
          data={marketElectricityPricesChart}
          units={["cnt/kWh"]}
          chartValues={"Price"}
          title="Finnish exchange-traded electricity prices, 15min step"
          subtitle="Prices for the next day published after 14:00"
          defaulTimeRangeKeyword="today"
          timeRangeKeywords={["yesterday", "today", "tomorrow"]}
        />
      )}

      {windPowerGenForecastChart.length > 0 && (
        <ChartTypeBar
          data={windPowerGenForecastChart}
          units={["MW", "%"]}
          chartValues={"Power generation"}
          title="Wind power generation forecast, 15min step"
          subtitle="Forecast for up to 3 days ahead"
          maxGenerationValue="9237" // datasetId 268
          defaulTimeRangeKeyword="3 days ahead"
          timeRangeKeywords={["yesterday", "today", "tomorrow", "3 days ahead"]}
        />
      )}
    </main>
  );
}
