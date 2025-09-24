'use server';

export async function fetchLatestPriceData() {
  const response = await fetch(
    'https://api.porssisahko.net/v2/latest-prices.json'
  );
  return response.json();
}

export async function filterPricesByDate(start, end, prices) {
  // converting ISO 8601 strings to Date object
  prices = prices.map((price) => ({
    ...price,
    startDate: new Date(price.startDate),
    endDate: new Date(price.endDate),
  }));

  // filtering prices
  const matchingPrices = prices.filter(
    (price) => price.endDate >= start && price.endDate < end
  );
  return matchingPrices;
}
