"use server";

export async function fetchLatestPriceData() {
  const response = await fetch(
    "https://api.porssisahko.net/v2/latest-prices.json"
  );
  return response.json();
}

export async function fetchFingridData(datasetId, startTime) {
  // const datasetId = 245;
  const pageSize = 288;
  const sortOrder = "asc";
  try {
    const response = await fetch(
      `https://data.fingrid.fi/api/datasets/${datasetId}/data?startTime=${startTime}&pageSize=${pageSize}&sortOrder=${sortOrder}`,
      {
        // method: 'GET',
        headers: {
          "x-api-key": process.env.FINGRID_PRIMARY_API_KEY,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const { data } = await response.json();
    // console.log(data);
    return data;
  } 
  catch (error) {
    console.error("Error fetching Fingrid data:", error);
  }
}
