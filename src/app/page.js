// import Image from "next/image";
// import styles from "./page.module.css";

import Chart from '@/components/Chart';
import { fetchLatestPriceData, filterPricesByDate } from './actions';

export default async function Home() {
  const { prices } = await fetchLatestPriceData();

  // from now till +1 day
  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + 1);

  // filter prices by start/end date
  const filteredPrices = await filterPricesByDate(start, end, prices);
  // hardcoded ASC (need to be improved in case of the order from the API endpoint changed)
  filteredPrices.reverse();

  // console.log(filteredPrices)

  

  return (
    <main>
      <h1>Porssi Sähkö Hinta (today)</h1>
      <Chart filteredPrices={filteredPrices} />
    </main>
  );
}
