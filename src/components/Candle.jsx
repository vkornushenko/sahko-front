import React from "react";

import classes from "@/components/Candle.module.css";

export default function Candle({
  price,
  highestPrice,
  candleQty,
  chartWidth,
  chartHeight,
  candleStartDate,
  candleEndDate,
}) {
  const now = new Date();

  const isPast = candleEndDate < now;
  const isNow = candleStartDate <= now && candleEndDate > now;
  const k = chartHeight / highestPrice;
  const candleWidth = Math.round(
    (chartWidth - 40 - (candleQty - 1) * 3) / candleQty
  );

  return (
    <>
      <li
        style={{
          height: Math.ceil(price.price * k),
          minWidth: 1,
          opacity: isPast ? 0.5 : 0.9,
          width: candleWidth,
        }}
        className={`${classes.candle} ${isNow ? classes.currentCandle : ""}`}
        title={price.price + " snt/kWh" + decodeURI("%0A") + candleStartDate}
      >
        {candleStartDate.getMinutes() == 0 && (
          <p className={classes.candleHour}>{candleStartDate.getHours()}</p>
        )}
      </li>
    </>
  );
}
