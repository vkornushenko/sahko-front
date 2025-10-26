"use server";


export async function fetchLatestPriceData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/porssisahko`, {
      cache: "no-cache",
    });
    if (!res.ok) {
      console.error(
        `Failed to fetch latest price data. Status: ${res.status} ${res.statusText}`
      );
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const data = await res.json();
    if (!data?.prices) {
      throw new Error("Invalid response format");
    }
    // if successful
    return data.prices;
  } catch (error) {
    console.error("Error fetching latest price data:", error);
    throw new Error("Failed to fetch latest price data");
  }
}

export async function fetchFingridData(
  datasetId,
  startTime,
  pageSize,
  sortOrder,
  revalidate
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const params = new URLSearchParams({
    datasetId: datasetId, // 245
    startTime: startTime, // "2025-10-25T00:00:00.000Z"
    pageSize: pageSize, // 288
    sortOrder: sortOrder, // "asc"
    revalidate: revalidate, // 300
  });

  // console.log('revalidate from actions.js = ');
  // console.log(revalidate);
  console.log('my API call from actions.js:')
  console.log(`${baseUrl}/api/fingrid?${params}`);

  try {
    const res = await fetch(`${baseUrl}/api/fingrid?${params}`, {
      cache: "no-store",
      // next: { revalidate: revalidate }, // revalidate every in seconds
      headers: {
        "x-api-key": process.env.FINGRID_PRIMARY_API_KEY,
      },
    });
    // if fetch failed
    if (!res.ok) {
      console.error(
        `Failed to fetch data from FinGrid API (app endpoint). Status: ${res.status} ${res.statusText}`
      );
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const { data } = await res.json();
    if (!data) {
      throw new Error(
        "Invalid response format from FinGrid API (app endpoint)"
      );
    }
    // if successful
    return data;
  } catch (error) {
    console.error(
      "Error fetching data from FinGrid API (app endpoint):",
      error
    );
    throw new Error("Failed to fetch data from FinGrid API (app endpoint)");
  }
}
