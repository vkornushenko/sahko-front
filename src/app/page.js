// import Image from "next/image";
// import styles from "./page.module.css";

import { fetchLatestPriceData, filterPricesByDate } from './actions';

export default async function Home() {
  const { prices } = await fetchLatestPriceData();

  // from now till +1 day
  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + 1);

  const filteredPrices = await filterPricesByDate(start, end, prices);

  function formatDate(priceData) {
    const day = priceData.startDate.getDate();
    const month = priceData.startDate.getMonth() + 1;
    const hours = priceData.startDate.getHours().toString().padStart(2, '0');
    const minutes = priceData.startDate.getMinutes().toString().padStart(2, '0');
    const endMin = priceData.endDate.getMinutes().toString().padStart(2, '0');
    return `${day}.${month} ${hours}:${minutes}...${hours}:${endMin}`;
  }

  return (
    <main>
      <h1>Porssi Sähkö Hinta (today)</h1>
      <ul>
        {filteredPrices.reverse().map((price) => (
          <li key={price.startDate}>
            {price.price} - {formatDate(price)}
          </li>
        ))}
      </ul>
    </main>
  );
}
