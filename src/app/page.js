import Chart from '@/components/Chart';
import { fetchLatestPriceData } from '@/lib/actions';

export default async function Home() {
  const { prices } = await fetchLatestPriceData();
  // hardcoded approach (later should add ASC/DESC filter)
  prices.reverse();
  
  // prices[164].price = 9; // temp hack to see current candle
  // prices[165].price = 89;
  // prices[166].price = 9;
  // prices[167].price = 9;
  // console.log(prices)

  return (
    <main>
      <Chart fetchedPrices={prices} />
    </main>
  );
}
