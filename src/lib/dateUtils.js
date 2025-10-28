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
  const minutes = priceData.startDate.getMinutes().toString().padStart(2, "0");
  const endMin = priceData.endDate.getMinutes().toString().padStart(2, "0");
  return `${day}.${month} ${hours}:${minutes}...${hours}:${endMin}`;
}

export function getMinusPlusByKeyword(keyword) {
  switch (keyword?.toLowerCase()) {
    case "yesterday":
      return { minus: -1 * 24 * 60, plus: 0 };
    case "today":
      return { minus: 0, plus: 1 * 24 * 60 };
    case "tomorrow":
      return { minus: 1 * 24 * 60, plus: 2 * 24 * 60 };
    case "3 days ahead":
      return { minus: 0, plus: 3 * 24 * 60 };
    default:
      return { minus: -3 * 24 * 60, plus: 3 * 24 * 60 };
  }
}

export function timeInterval({ now, fromZero, minus, plus }) {
  // now - current Date obj from client
  // fromZero - should day start from 0 hours? (true/false)
  // minus - start time before now (in min)
  // plus - end time after now (in min)

  if (fromZero === true) {
    now.setHours(0, 0, 0);
  }

  const start = new Date(now);
  start.setMinutes(minus);

  const end = new Date(now);
  end.setMinutes(plus);

  return { start, end };
}

export function filterDataByDate({ data = [], start, end }) {
  console.log(start);
  console.log(end);
  // TODO if !end => end=now+5days
  // console.log(data[0].end);

  // filters data starting from "start"
  // const filteredData = data.filter((item) => item.end >= start);
  let filteredData;
  if (start && !end) {
    filteredData = data.filter((item) => item.end > start);
  }
  if (start && end) {
    filteredData = data.filter((item) => item.end > start && item.end < end);
  }

  // const filteredData = data.filter((item) => item.start >= start && item.end <= end);

  return filteredData;
}
