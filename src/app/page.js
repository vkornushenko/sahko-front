// import BarChart from "@/components/BarChart";
// import ChartSketch from "@/components/ChartSketch";
import ChartTypeBar from "@/components/ChartTypeBar";
import Odometer from "@/components/Odometer";
// import PriceLayer from "@/components/PriceLayer";
import { fetchLatestPriceData, fetchFingridData } from "@/lib/actions";

export default async function Home() {
  // const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const { prices } = await fetchLatestPriceData();
  // hardcoded ASC logic
  prices.reverse();
  // console.log(prices);

  // TODO: fix 429 and other responces
  // 429 - 1 request in 2 sec limit
  // 403 - 10k requests in 1 day
  // https://data.fingrid.fi/en/faq

  const fingridDataWind = await fetchFingridData(
    245,
    "2025-10-20T00:00:00.000Z"
  );

  // // await delay(2100);

  // const fingridDataSolar = await fetchFingridData(
  //   248,
  //   "2025-10-15T00:00:00.000Z"
  // );

  // console.log(fingridDataSolar);

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

  // const solarPowerGenForecastChart = fingridDataSolar
  //   ? fingridDataSolar.map((item) => ({
  //       value: item.value,
  //       start: new Date(item.startTime),
  //       end: new Date(item.endTime),
  //     }))
  //   : [];

  // hardcoded approach (later should add ASC/DESC filter)
  // prices.reverse();
  // console.log(prices);

  // prices[164].price = 9; // temp hack to see current candle
  // prices[165].price = 89;
  // prices[166].price = 9;
  // prices[167].price = 9;
  // console.log(prices)

  // console.log(prices[0].startDate)

  // const fingridData = await fetchFingridData();

  // const pricesFromOpenAPI = await fetchLatestPriceData();
  // const dataFromFinGrid = await fetchFingridData(pricesFromOpenAPI.prices);

  // const mappedFinGridData = await dataFromFinGrid.data.map((item) => ({
  //   price: item.value/9026, // harvested wind in % from total production
  //   startDate: item.startTime,
  //   endDate: item.endTime,
  // }));
  // console.log(dataFromFinGrid)

  // console.log(prices[0])
  // console.log(mappedFinGridData[0])
  // console.log(marketElectricityPricesChart)
  // console.log(windPowerGenForecastChart)
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

      {windPowerGenForecastChart.length != 0 && (
        <ChartTypeBar
          data={windPowerGenForecastChart}
          units={["MW", '%']}
          title="Wind power generation forecast"
          subtitle="forecast for next 72h, with 15min step"
        />
      )}

      {/* {solarPowerGenForecastChart.length != 0 && (
        <ChartTypeBar
          data={solarPowerGenForecastChart}
          units={"MWh/h"}
          title="Solar power generation forecast"
          subtitle="forecast for next 72h, with 15min step"
        />
      )} */}

      {/* <BarChart /> */}
      {/* <ChartSketch fetchedPrices={prices} chartHeight={200}/> */}
      {/* <ChartSketch fetchedPrices={mappedFinGridData} chartHeight={200}/> */}
      {/* <PriceLayer rawData={prices}/> */}
    <Odometer currentValue={6131}/>
    </main>
  );
}
