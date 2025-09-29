"use client";

import { React, useRef, useState, useEffect, use } from "react";
import classes from "@/components/Chart.module.css";
import { filterPricesByDate, formatDate } from "@/lib/dateUtils";
import Candle from "./Candle";

export default function Chart({ fetchedPrices }) {
  const [refresh, setRefresh] = useState(false);
  const [filterMode, setFilterMode] = useState("nowRange12h");
  const [width, setWidth] = useState(0);
  // ref for chart div
  const divRef = useRef(null);

  // filter mode handler
  const modeHandler = (mode) => setFilterMode(mode);

  // refresh effect
  useEffect(() => {
    const refreshInterval = 15; // in min
    const now = new Date();
    // calculate delay to next interval + 1 min
    let delay =
      (Math.ceil(now.getMinutes() / refreshInterval) * refreshInterval +
        1 -
        now.getMinutes()) *
      60 *
      1000;
    console.log("calculated delay: " + delay + " ms");
    delay === 0 ? (delay = refreshInterval * 60 * 1000) : delay;
    console.log("delay");
    console.log(delay / 60 / 1000 + " min (" + delay + " ms)");

    const timer = setTimeout(() => {
      setRefresh((prev) => !prev);
      console.log(`Delayed for ${delay / 60 / 1000} min.`);
      console.log("timeout function runned at:");
      const nownow = new Date();
      console.log(
        nownow.getMinutes() +
          ":" +
          nownow.getSeconds() +
          "." +
          nownow.getMilliseconds() +
          "mm:ss.ms"
      );
    }, delay);

    return () => clearTimeout(timer);
  }, [refresh]);

  // responsive chart effect
  useEffect(() => {
    const handleResize = () => {
      if (divRef.current) setWidth(divRef.current.offsetWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [width]);

  // calculate filtered prices and max
  const filteredPrices = filterPricesByDate(fetchedPrices, filterMode);
  const pricesList = filteredPrices.map((p) => p.price);
  const roundedHighestPrice = Math.ceil(Math.max(...pricesList, 0));

  // nice max for y-axis
  const getNiceMax = (value) => {
    if (value <= 0) return 1;
    const exp = Math.pow(10, Math.floor(Math.log10(value)));
    const fraction = value / exp;
    const niceSteps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
    const niceFraction = niceSteps.find((s) => fraction <= s) || 10;
    return niceFraction * exp;
  };

  const niceMax = getNiceMax(roundedHighestPrice);

  // y-axis ticks
  function getYAxisTicks(niceMax) {
    let stepQty;

    // decide step count based on divisibility
    if (niceMax % 3 === 0) stepQty = 3;
    else if (niceMax % 4 === 0) stepQty = 4;
    else stepQty = 5; // fallback

    const step = niceMax / stepQty;
    const ticks = [];

    for (let i = 1; i <= stepQty; i++) {
      ticks.push(Math.round(i * step * 100) / 100); // round to 2 decimals
    }

    return ticks;
  }

  const values = getYAxisTicks(niceMax);
  values.reverse();

  return (
    <>
      <h1>Pörssisähkö Hinta ({refresh ? "true" : "false"})</h1>
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
          <div className={classes.y_axis_and_candle_container}>
            <ul className={classes.y_axis} style={{ width: width, height: values[0]*150/roundedHighestPrice }}>
              {values.map((value, i) => (
                <li key={i}>
                  <p>{value}</p>
                </li>
              ))}
              <li><p>0</p></li>
            </ul>

            {filteredPrices.length > 0 ? (
              <ul className={classes.data_series}>
                {filteredPrices.map((price, index) => (
                  <Candle
                    key={index}
                    index={index}
                    price={price}
                    highestPrice={roundedHighestPrice}
                    candleQty={filteredPrices.length}
                    chartWidth={width}
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
      </div>

      <ul>
        {filteredPrices.map((price, index) => (
          <li key={index} style={{ opacity: 0.7 }}>
            {price.price} - {formatDate(price)}
          </li>
        ))}
      </ul>
    </>
  );
}
