import React from "react";

import classes from "@/components/Candle.module.css";

export default function Candle({
  price,
  highestPrice,
  candleQty,
  chartWidth,
  now,
  candleStartDate,
  candleEndDate,
}) {
  const isPast = candleEndDate < now;
  const isNow = candleStartDate < now && candleEndDate > now;
  const k = 200 / highestPrice;
  const candleWidth = Math.round(
    (chartWidth - 40 - (candleQty - 1) * 3) / candleQty
  );

  return (
    <li
      style={{
        height: Math.ceil(price.price * k),
        minWidth: 1,
        opacity: isPast ? 0.5 : 0.9,
        width: candleWidth,
      }}
      className={`${classes.candle} ${isNow ? classes.currentCandle : ""}`}
      title={price.price}
    ></li>
  );
}
