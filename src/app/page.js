import Chart from '@/components/Chart';
import { fetchLatestPriceData } from '@/lib/actions';

export default async function Home() {
  const { prices } = await fetchLatestPriceData();
  // hardcoded approach (later should add ASC/DESC filter)
  prices.reverse();

  return (
    <main>
      <Chart fetchedPrices={prices} />
    </main>
  );
}
