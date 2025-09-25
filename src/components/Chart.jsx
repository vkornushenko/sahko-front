"use client";

import { React, useRef, useState, useEffect } from "react";
import classes from "@/components/Chart.module.css";
import { filterPricesByDate, formatDate } from "@/lib/dateUtils";
import Candle from "./Candle";

export default function Chart({ fetchedPrices }) {
  const [tick, setTick] = useState(0); // just to force re-render

  const [filterMode, setFilterMode] = useState("nowRange12h");
  const modeHandler = function (mode) {
    setFilterMode(mode);
  };
  // filter mode options: 'today', 'nowRange12h', 'next24h'
  const filteredPrices = filterPricesByDate(fetchedPrices, filterMode);

  // responsive chart logic
  const divRef = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (divRef.current) {
      setWidth(divRef.current.offsetWidth); // get current width
      console.log('useEffect is running');
    }

    // update width on window resize
    const handleResize = () => {
      if (divRef.current) setWidth(divRef.current.offsetWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

    // efficient rerender at exact quarter-hour marks
  useEffect(() => {
    const scheduleNextQuarter = () => {
      const now = new Date();
      const minutes = now.getMinutes();
      const nextQuarter = Math.ceil(minutes / 15) * 15; // 15, 30, 45, 60
      const next = new Date(now);
      next.setMinutes(nextQuarter, 0, 0); // set to next quarter-hour

      const delay = next - now; // ms until next quarter
      const timer = setTimeout(() => {
        setTick((t) => t + 1); // trigger rerender
        scheduleNextQuarter(); // schedule the following one
      }, delay);

      return timer;
    };

    const timer = scheduleNextQuarter();
    return () => clearTimeout(timer);
  }, []);

  // getting highest price
  const pricesList = filteredPrices.map((priceList) => priceList.price);
  const roundedHighestPrice = Math.ceil(Math.max(...pricesList));

  const now = new Date();

  return (
    <>
      <h1>Pörssisähkö Hinta</h1>
      <div>
        <nav className={classes.nav}>
          <div
            onClick={() => modeHandler("today")}
            className={filterMode === "today" ? classes.active : ""}
          >
            today
          </div>
          <div
            onClick={() => modeHandler("nowRange12h")}
            className={filterMode === "nowRange12h" ? classes.active : ""}
            title={filterMode}
          >
            now±12h
          </div>
          <div
            onClick={() => modeHandler("next24h")}
            className={filterMode === "next24h" ? classes.active : ""}
          >
            next24h
          </div>
        </nav>
        <div className={classes.graph} ref={divRef}>
          {filteredPrices.length > 0 ? (
            <ul>
              {filteredPrices.map((price, index) => (
                <Candle
                  key={index}
                  index={index}
                  price={price}
                  highestPrice={roundedHighestPrice}
                  candleQty={filteredPrices.length}
                  chartWidth={width}
                  now={now}
                  candleStartDate={price.startDate}
                  candleEndDate={price.endDate}
                />
              ))}
            </ul>
          ) : (
            <p>No price data available for this time range.</p>
          )}
        </div>
      </div>

      <ul>
        {filteredPrices.map((price, index) => (
          <li key={index} style={{opacity: 0.7}}>
            {price.price} - {formatDate(price)}
          </li>
        ))}
      </ul>
    </>
  );
}
