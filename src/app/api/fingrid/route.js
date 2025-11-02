import { NextResponse } from "next/server";

let cache = {};

export async function GET(request) {
  const now = Date.now();

  const { searchParams } = new URL(request.url);
  const datasetId = +searchParams.get("datasetId"); // Wind power generation forecast 72h
  const startTime = searchParams.get("startTime"); // "2025-10-25T00:00:00.000Z"
  const pageSize = +searchParams.get("pageSize"); // 15min intervals for 72h
  const sortOrder = searchParams.get("sortOrder") || "asc";
  const revalidate = +searchParams.get("revalidate") || 60; // default 60 seconds

  // console.log("revalidate value from route.js");
  // console.log(revalidate);

  if (!datasetId) {
    return NextResponse.json(
      { error: "Missing datasetId parameter" },
      { status: 400 }
    );
  }

  const cached = cache[datasetId];

  const params = new URLSearchParams({ sortOrder });
  startTime && params.set("startTime", startTime); // optional
  pageSize && params.set("pageSize", pageSize); // optional

  // Check if cached data is still valid
  if (cached && now - cached.timestamp < revalidate * 1000) {
    console.log(
      "!!! HUOM !!! cache data length: ",
      cache[datasetId].data.length
    );
    console.log("✅ Using cached Fingrid data (datasetId:", datasetId + ")");
    return NextResponse.json(cached, { status: 200 });
  }

  // console.log("params from route.js:");
  // console.log(params);
  // console.log("url to fetch FinGrid:");
  // console.log(
  //   `https://data.fingrid.fi/api/datasets/${datasetId}/data?${params}`
  // );

  console.log(
    `🌐 Fetching new data from Fingrid API (datasetId=${datasetId})...`
  );

  try {
    const timerStart = new Date();
    // prices for the next day available at 14:00 EET
    const res = await fetch(
      // url,
      `https://data.fingrid.fi/api/datasets/${datasetId}/data?${params}`,
      {
        // cache: "no-store",
        next: { revalidate: revalidate }, // revalidate every in seconds
        headers: {
          "x-api-key": process.env.FINGRID_PRIMARY_API_KEY,
        },
      }
    );

    // if fetch failed
    if (!res.ok) {
      console.error(
        "Failed to fetch wind power generation forecast 72h from FinGrid API (!res.ok)"
      );
      return NextResponse.json(
        {
          error:
            "Failed to fetch wind power generation forecast 72h from FinGrid API (!res.ok)",
        },
        { status: res.status }
      );
    }

    // if fetch succeeded
    const { data } = await res.json();
    // if prices empty
    if (!data) {
      console.warn(
        "No data available from FinGrid API (wind power generation forecast 72h)"
      );
      return NextResponse.json(
        {
          error:
            "No data available from FinGrid API (wind power generation forecast 72h)",
        },
        { status: 204 }
      );
    }
    // Save to cache
    cache[datasetId] = {
      data,
      timestamp: now,
    };
    // const timerStop = new Date();
    // const duration = timerStop - timerStart;
    // console.log("!!! duration was = " + duration + "ms");

    // wait 2+ sec to avoid 429 error
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // if everything fine, return data with 200 status
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error(
      "Error fetching prices from FinGrid API (wind power generation forecast 72h):",
      error
    );
    return NextResponse.json(
      {
        error:
          "Error fetching prices from FinGrid API (wind power generation forecast 72h)",
      },
      { status: 500 }
    );
  }
}
