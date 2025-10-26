import { NextResponse } from "next/server";

export async function GET() {
  try {
    // prices for the next day available at 14:00 EET
    const res = await fetch(
      "https://api.porssisahko.net/v2/latest-prices.json",
      {
        next: { revalidate: 300 }, // revalidate every 5 minutes
      }
    );

    // if fetch failed
    if (!res.ok) {
      console.error("Failed to fetch prices from Pörssisähkö API");
      return NextResponse.json(
        { error: "Failed to fetch prices from Pörssisähkö API" },
        { status: res.status }
      );
    }
    // if fetch succeeded
    const data = await res.json();
    const prices = data?.prices ?? null;
    // if prices empty
    if (!prices) {
      console.warn("No prices data available from Pörssisähkö API");
      return NextResponse.json(
        { error: "No prices data available from Pörssisähkö API" },
        { status: 204 }
      );
    }
    // if everything fine, return prices with 200 status
    return NextResponse.json({ prices }, { status: 200 });
  } catch (error) {
    console.error("Error fetching prices from Pörssisähkö API:", error);
    return NextResponse.json(
      { error: "Error fetching prices from Pörssisähkö API" },
      { status: 500 }
    );
  }
}
