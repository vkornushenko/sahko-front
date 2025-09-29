import Chart from "@/components/Chart";
import { fetchLatestPriceData } from "@/lib/actions";

export default async function Home() {
  const { prices } = await fetchLatestPriceData();
  // hardcoded approach (later should add ASC/DESC filter)
  prices.reverse();
  console.log(prices)

  // prices[164].price = 9; // temp hack to see current candle
  // prices[165].price = 89;
  // prices[166].price = 9;
  // prices[167].price = 9;
  // console.log(prices)

  // console.log(prices[0].startDate)
  async function fetchFingridData() {
    const datasetId = 245;
    const startTime = '2025-09-27T22:00:00.000Z';
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

  return (
    <main>
      <Chart fetchedPrices={prices} />
    </main>
  );
}
