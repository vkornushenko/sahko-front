export function filterPricesByDate(fetchedPrices, mode) {
  const now = new Date();
  let start, end;
  switch (mode) {
    case "today": {
      start = new Date(now);
      start.setHours(0, 0, 0, 0);

      end = new Date(start);
      end.setDate(end.getDate() + 1);
      break;
    }
    case "nowRange12h": {
      start = new Date(now);
      start.setHours(now.getHours() - 12, 0, 0, 0);

      end = new Date(now);
      end.setHours(now.getHours() + 12, 0, 0, 0);
      break;
    }
    case "next24h": {
      start = new Date(now);

      end = new Date(start);
      end.setDate(end.getDate() + 1);
      break;
    }
    default:
      throw new Error(`Unknown filter mode: ${mode}`);
  }

  // converting ISO 8601 strings to Date object
  fetchedPrices = fetchedPrices.map((price) => ({
    ...price,
    startDate: new Date(price.startDate),
    endDate: new Date(price.endDate),
  }));

  // filtering prices
  const matchingPrices = fetchedPrices.filter(
    (price) => price.endDate >= start && price.endDate < end
  );
  return matchingPrices;
}

// function sets a template to transforms Date object to string
export function formatDate(priceData) {
    const day = priceData.startDate.getDate();
    const month = priceData.startDate.getMonth() + 1;
    const hours = priceData.startDate.getHours().toString().padStart(2, "0");
    const minutes = priceData.startDate
      .getMinutes()
      .toString()
      .padStart(2, "0");
    const endMin = priceData.endDate.getMinutes().toString().padStart(2, "0");
    return `${day}.${month} ${hours}:${minutes}...${hours}:${endMin}`;
  }