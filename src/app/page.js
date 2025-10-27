// export const dynamic = "force-dynamic";

import ChartTypeBar from "@/components/ChartTypeBar";
import Odometer from "@/components/Odometer";
import { fetchLatestPriceData, fetchFingridData } from "@/lib/actions";
import classes from "./page.module.css";

// forces page to be dynamic
export const dynamic = 'force-dynamic';

export default async function Home() {
  const prices = await fetchLatestPriceData();
  // hardcoded ASC logic
  prices.reverse();
  // console.log(prices);

  const fingridDataWind = await fetchFingridData(
    245,
    "2025-10-27T00:00:00.000Z",
    288,
    "asc",
    15*60*100 // 15 minutes in seconds
  );
  const fingridDataSolar = await fetchFingridData(
    248,
    "2025-10-27T00:00:00.000Z",
    288,
    "asc",
    15*60*100 // 15 minutes in seconds
  );

  const fingridDataCurrentWindProduction = await fetchFingridData(
    181,
    "",
    1,
    "desc",
    3*60*100 // 3 minutes in seconds
  );
  // console.log(fingridDataCurrentWindProduction[0].value);
  // console.log(fingridDataCurrentWindProduction[0].endTime);

  const fingridDataCurrentHydroProduction = await fetchFingridData(
    191,
    "",
    1,
    "desc",
    3*60*100 // 3 minutes in seconds
  );

  const fingridDataCurrentNuclearProduction = await fetchFingridData(
    188,
    "",
    1,
    "desc",
    3*60*100 // 3 minutes in seconds
  );

  // TODO: fix 429 and other responces
  // 429 - 1 request in 2 sec limit
  // 403 - 10k requests in 1 day
  // https://data.fingrid.fi/en/faq

  const marketElectricityPricesChart = prices
    ? prices.map((item) => ({
        value: item.price,
        start: new Date(item.startDate),
        end: new Date(item.endDate),
      }))
    : [];

  const windPowerGenForecastChart = fingridDataWind
    ? fingridDataWind.map((item) => ({
        value: item.value,
        start: new Date(item.startTime),
        end: new Date(item.endTime),
      }))
    : [];

  const solarPowerGenForecastChart = fingridDataSolar
    ? fingridDataSolar.map((item) => ({
        value: item.value,
        start: new Date(item.startTime),
        end: new Date(item.endTime),
      }))
    : [];

  return (
    <main>
      {marketElectricityPricesChart.length != 0 && (
        <ChartTypeBar
          data={marketElectricityPricesChart}
          units={["cnt/kWh"]}
          title="Finnish exchange-traded electricity prices"
          subtitle="prices in cnt/kWh, with 15min step"
        />
      )}

      <div className={classes.odometer_container}>
        <Odometer
          currentValue={fingridDataCurrentWindProduction[0].value}
          stratTime={fingridDataCurrentWindProduction[0].startTime}
          maxGenerationValue="9237"
          units={"MW"}
          name="Wind Power Generation"
        />
        <Odometer
          currentValue={fingridDataCurrentHydroProduction[0].value}
          stratTime={fingridDataCurrentHydroProduction[0].startTime}
          maxGenerationValue="3200"
          units={"MW"}
          name="Hydro Power Generation"
        />
        <Odometer
          currentValue={fingridDataCurrentNuclearProduction[0].value}
          stratTime={fingridDataCurrentNuclearProduction[0].startTime}
          maxGenerationValue="4400" // google: Finland nuclear power capacity
          units={"MW"}
          name="Nuclear Power Generation"
        />
      </div>

      {windPowerGenForecastChart.length != 0 && (
        <ChartTypeBar
          data={windPowerGenForecastChart}
          units={["MW", "%"]}
          title="Wind power generation forecast"
          subtitle="forecast for next 72h, with 15min step"
          maxGenerationValue="9237" // datasetId 268
        />
      )}

      {solarPowerGenForecastChart.length != 0 && (
        <ChartTypeBar
          data={solarPowerGenForecastChart}
          units={["MW", "%"]}
          title="Solar power generation forecast"
          subtitle="forecast for next 72h, with 15min step"
          maxGenerationValue="1512" // datasetId 267
        />
      )}
    </main>
  );
}
