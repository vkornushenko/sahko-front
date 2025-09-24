'use server';

export async function fetchLatestPriceData() {
  const response = await fetch(
    'https://api.porssisahko.net/v2/latest-prices.json'
  );
  return response.json();
}
