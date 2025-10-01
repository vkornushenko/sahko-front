import Chart from "@/components/Chart";
import { fetchLatestPriceData } from "@/lib/actions";

export default async function Home() {
  const { prices } = await fetchLatestPriceData();
  // hardcoded approach (later should add ASC/DESC filter)
  prices.reverse();
  // console.log(prices)

  // prices[164].price = 9; // temp hack to see current candle
  // prices[165].price = 89;
  // prices[166].price = 9;
  // prices[167].price = 9;
  // console.log(prices)

  // console.log(prices[0].startDate)
  async function fetchFingridData(prices) {
    prices.reverse();
    console.log(prices[0].startDate);
    const datasetId = 245;
    const startTime = prices[0].startDate;
    const pageSize = 192;
    const sortOrder = 'asc';
    try {
      const response = await fetch(
        `https://data.fingrid.fi/api/datasets/${datasetId}/data?startTime=${startTime}&pageSize=${pageSize}&sortOrder=${sortOrder}`,
        {
          // method: 'GET',
          headers: {
            'x-api-key': process.env.FINGRID_PRIMARY_API_KEY,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      // console.log(data);
      return data;
    } catch (error) {
      console.error("Error fetching Fingrid data:", error);
    }
  }

  // const fingridData = await fetchFingridData();

  const pricesFromOpenAPI = await fetchLatestPriceData();
  const dataFromFinGrid = await fetchFingridData(pricesFromOpenAPI.prices);

  const mappedFinGridData = await dataFromFinGrid.data.map((item) => ({
    price: item.value/9026, // harvested wind in % from total production
    startDate: item.startTime,
    endDate: item.endTime,
  }));
  // console.log(dataFromFinGrid)


  console.log(prices[0])
  console.log(mappedFinGridData[0])

  return (
    <main>
      <Chart fetchedPrices={prices} chartHeight={200}/>
      <Chart fetchedPrices={mappedFinGridData} chartHeight={200}/>
    </main>
  );
}
