"use client";

import React, { useEffect, useRef, useState } from "react";
import classes from "./ChartTypeBar.module.css";
import { getNiceMax, getYAxisTicks } from "@/lib/utils";
import {
  filterDataByDate,
  getMinusPlusByKeyword,
  timeInterval,
} from "@/lib/dateUtils";

// FIXED: drag "stick" issue (looping at edges)
// FIXED: frame > chart logic (centers/locks properly)
// KEPT: all your logic, units toggle, time filters, tooltips, etc.

export default function ChartTypeBar({
  data,
  units,
  title,
  subtitle,
  maxGenerationValue,
  defaulTimeRangeKeyword,
  timeRangeKeywords,
  chartValues,
}) {
  const now = new Date();

  // --- States ---
  const [timeRangeKeyword, setTimeRangeKeyword] = useState(
    defaulTimeRangeKeyword
  );
  const [unitsState, setUnitsState] = useState(units[0]);
  const [chartDataset, setChartDataset] = useState(data);

  const chartFrameRef = useRef();
  const chartValuesRef = useRef();
  const [minOffset, setMinOffset] = useState(0);
  const [offset, setOffset] = useState(0);

  const [isDragging, setIsDragging] = useState(false);
  const [mouseStartPosition, setMouseStartPosition] = useState(0);

  // --- Handlers ---
  const handleTimeRange = (keyword) => {
    setTimeRangeKeyword(keyword);
    setOffset(0);
  };

  const handleUnitsChange = (unit) => {
    setUnitsState(unit);
  };

  // Convert data to % if unit is %
  useEffect(() => {
    if (unitsState === "%") {
      const relativeData = data.map((item) => ({
        start: item.start,
        end: item.end,
        value: (item.value / maxGenerationValue) * 100,
      }));
      setChartDataset(relativeData);
    } else {
      setChartDataset(data);
    }
  }, [unitsState, data, maxGenerationValue]);

  // --- Time Filtering ---
  const { minus, plus } = getMinusPlusByKeyword(timeRangeKeyword);
  const { start, end } = timeInterval({
    now: new Date(now),
    fromZero: true,
    minus,
    plus,
  });

  const filteredData = filterDataByDate({ data: chartDataset, start, end });

  // --- Resize + Layout ---
  useEffect(() => {
    const updateOffsets = () => {
      if (!chartFrameRef.current || !chartValuesRef.current) return;
      const frameW = chartFrameRef.current.offsetWidth;
      const valuesW = chartValuesRef.current.offsetWidth;
      const minOff = frameW - valuesW;

      setMinOffset(minOff);

      // Handle case when frame > chart (no dragging needed)
      if (minOff >= 0) {
        setOffset(0);
      } else {
        // Clamp offset if it's outside new bounds
        setOffset((prev) => (prev < minOff ? minOff : prev > 0 ? 0 : prev));
      }
    };

    updateOffsets();
    window.addEventListener("resize", updateOffsets);
    return () => window.removeEventListener("resize", updateOffsets);
  }, [filteredData, timeRangeKeyword]);

  // --- Drag Logic (fixed version) ---
  const startDrag = (clientX) => {
    setIsDragging(true);
    setMouseStartPosition(clientX);
  };

  const handleDrag = (clientX) => {
    if (!isDragging) return;

    const delta = clientX - mouseStartPosition;
    const nextOffset = offset + delta;

    // Clamp inside chart limits
    if (nextOffset <= 0 && nextOffset >= minOffset) {
      setOffset(nextOffset);
      setMouseStartPosition(clientX); // only update when valid move
    }
  };

  const endDrag = () => {
    setIsDragging(false);
  };

  // --- Prepare Data ---
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dataUPD = filteredData.map((item) => {
    const readable = `${item.start.getDate()} ${
      months[item.start.getMonth()]
    } ${item.start.getHours()}:${item.start
      .getMinutes()
      .toString()
      .padStart(2, "0")} - ${item.end.getHours()}:${item.end
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    return { ...item, barTitleReadable: readable };
  });

  const valueList = dataUPD.map((item) => item.value);
  const roundedHighestValue = Math.ceil(Math.max(...valueList, 0));
  const maxYaxisVal = getNiceMax(roundedHighestValue);
  const ticks = getYAxisTicks(maxYaxisVal);

  // --- Render ---
  return (
    <div className={classes.chartTypeBarContainer}>
      <div className={classes.chart_header_module}>
        <h1>{title}</h1>
        <h2>{subtitle}</h2>

        {/* Units */}
        <ul className={classes.chart_view_options}>
          <p>units:</p>
          {units.map((unitItem, index) => (
            <li
              key={index}
              onClick={() => handleUnitsChange(unitItem)}
              className={unitItem === unitsState ? classes.selected : ""}
            >
              {unitItem}
            </li>
          ))}
        </ul>

        {/* Time range */}
        <ul className={classes.chart_view_options}>
          <p>select time interval:</p>
          {timeRangeKeywords.map((keyword, index) => (
            <li
              key={index}
              onClick={() => handleTimeRange(keyword)}
              className={keyword === timeRangeKeyword ? classes.selected : ""}
            >
              <p>{keyword}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Chart */}
      <div className={classes.chart} style={{ height: "250px" }}>
        <div className={classes.yaxis_labels}>
          <ul>
            {ticks.map((tick, i) => (
              <li key={i}>
                <p>{tick}</p>
              </li>
            ))}
            <li style={{ border: 0 }}>
              <p>0</p>
            </li>
          </ul>
        </div>

        {dataUPD.length ? (
          <div
            className={classes.chart_container}
            ref={chartFrameRef}
            onMouseDown={(e) => startDrag(e.clientX)}
            onMouseMove={(e) => handleDrag(e.clientX)}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
            onTouchStart={(e) => startDrag(e.touches[0].clientX)}
            onTouchMove={(e) => handleDrag(e.touches[0].clientX)}
            onTouchEnd={endDrag}
            onTouchCancel={endDrag}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
          >
            <div className={classes.chart_back_layer}></div>
            <ul
              className={classes.bars}
              ref={chartValuesRef}
              style={{ left: `${offset}px` }}
            >
              {dataUPD.map((item, index) => (
                <li
                  key={index}
                  className={item.end < now ? classes.dimmed : ""}
                  style={{ pointerEvents: isDragging ? "none" : "auto" }}
                  title={`${chartValues} = ${item.value} ${unitsState}\n${item.barTitleReadable}`}
                >
                  <div
                    className={classes.info}
                    style={{ left: `${-offset + 10}px` }}
                  >
                    {item.value} {units}<br />
                    {item.barTitleReadable}
                  </div>
                  <div
                    className={classes.bar}
                    style={{ height: item.value < 0 ? 0 : (200 / maxYaxisVal) * item.value }}
                  >
                    {index % 4 === 0 && (
                      <>
                        <div
                          className={classes.time_pointers}
                          style={{
                            borderColor:
                              item.start.getHours() === 0 ? "#fff" : "",
                          }}
                        ></div>
                        <p className={classes.time}>{item.start.getHours()}</p>
                        {item.start.getHours() === 0 && (
                          <p
                            className={classes.day}
                            style={{
                              borderColor:
                                item.start.getDay() % 2 === 0
                                  ? "salmon"
                                  : "violet",
                            }}
                          >
                            {item.start.getDate()}{" "}
                            {months[item.start.getMonth()]}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <ul className={classes.lines}>
              {ticks.map((_, index) => (
                <li key={index}></li>
              ))}
            </ul>
          </div>
        ) : (
          <div className={classes.chart_container}>
            <div className={classes.chart_placeholder}>
              <p>
                No data available for {timeRangeKeyword}. Try to select another
                time interval.
              </p>
            </div>
            <ul className={classes.lines}>
              {ticks.map((_, index) => (
                <li key={index}></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
