"use client";

import React, { useEffect, useRef, useState } from "react";
import classes from "./ChartTypeBar.module.css";
import { getNiceMax, getYAxisTicks } from "@/lib/utils";
import {
  filterDataByDate,
  getMinusPlusByKeyword,
  timeInterval,
} from "@/lib/dateUtils";

// TODO: component refactoring
// FIX BUG: if (frame > chart) => chart sticks to the right side of the frame

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
  // date filter logic
  const [timeRangeKeyword, setTimeRangeKeyword] = useState(
    defaulTimeRangeKeyword
  );

  // logic to calculate max chart scroll
  const [minOffset, setMinOffset] = useState(0);
  const chartValuesRef = useRef();
  const chartFrameRef = useRef();
  const [chartFrameWidth, setChartFrameWidth] = useState(0);
  const [frameMinusChart, setframeMinusChart] = useState(0);

  // chart drag logic
  const [isDragging, setIsDragging] = useState(false);
  const [mouseStartPosition, setMouseStartPosition] = useState(0);
  const [offset, setOffset] = useState(0);

  const now = new Date();

  function handleTimeRange(keyword) {
    setTimeRangeKeyword(keyword);
    setOffset(0);
  }

  // console.log(unitsState);
  const unitsHandler = (unit) => {
    setUnitsState(unit);
  };

  // code to handle switch to % data from harvest capacity
  const [unitsState, setUnitsState] = useState(units[0]);
  const [chartDataset, setChartDataset] = useState(data);
  useEffect(() => {
    if (unitsState === "%") {
      // console.log(data);
      const relativeData = data.map((item) => ({
        start: item.start,
        end: item.end,
        value: (item.value / maxGenerationValue) * 100,
      }));
      setChartDataset(relativeData);
      // console.log(data[0]);
    } else {
      setChartDataset(data);
    }
  }, [unitsState]);

  // // time filter
  // // start of a day
  // const today = new Date();
  // today.setHours(0, 0, 0);
  // // end of a day
  // const end = new Date(today);
  // end.setDate(end.getDate() + 1);

  // yesterday
  // const {start, end} = timeInterval({now: now, fromZero: true, minus: -1*24*60, plus: 0});
  // today
  // const {start, end} = timeInterval({now: now, fromZero: true, minus: 0, plus: 1*24*60});
  // tomorrow
  // const {start, end} = timeInterval({now: now, fromZero: true, minus: 1*24*60, plus: 2*24*60});
  // after tomorrow

  const { minus, plus } = getMinusPlusByKeyword(timeRangeKeyword);
  const { start, end } = timeInterval({
    now: new Date(now),
    fromZero: true,
    minus: minus,
    plus: plus,
  });

  const filteredData = filterDataByDate({
    data: chartDataset,
    start: start,
    end: end,
  });

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
  // console.log(filteredData);

  useEffect(() => {
    if (!chartFrameRef.current || !chartValuesRef.current) return;

    const handleResize = () => {
      // console.log("upd");
      const frameW = chartFrameRef.current.offsetWidth;
      const valuesW = chartValuesRef.current.offsetWidth;
      const minOffSetOnReseize = frameW - valuesW;
      setframeMinusChart(minOffSetOnReseize);
      // console.log("frameW:" + frameW + " valuesW: " + valuesW);
      // console.log(minOffSetOnReseize)
      setChartFrameWidth(frameW);
      setMinOffset(frameW - valuesW);
      if (minOffSetOnReseize > 0) {
        setOffset(0);
      } else {
        setOffset((prevOffSet) =>
          prevOffSet < minOffSetOnReseize ? minOffSetOnReseize : prevOffSet
        );
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [data, timeRangeKeyword]);

  const dataUPD = filteredData.map((item) => ({
    ...item,
    barTitle: item.start.toString(),
    barTitleReadable: `${item.start.getDate()} ${
      months[item.start.getMonth()]
    } ${item.start.getHours()}:${item.start.getMinutes()} - ${item.end.getHours()}:${
      item.end.getMinutes()<10 ? '0' + item.end.getMinutes() : [14, 29, 44, 59].includes(item.end.getMinutes()) ? item.end.getMinutes() + 1 : item.end.getMinutes()
    }`,
  }));

  const valueList = dataUPD.map((item) => item.value);

  const roundedHighestValue = Math.ceil(Math.max(...valueList, 0));

  const maxYaxisVal = getNiceMax(roundedHighestValue);

  const ticks = getYAxisTicks(maxYaxisVal);
  // console.log(ticks);

  const getMouseDownPosition = (clientX, eventName, e) => {
    if (!isDragging) {
      setIsDragging(true);
      setMouseStartPosition(clientX);
      return;
    }
    return;
  };

  const getMouseMovePosition = (clientX) => {
    if (!isDragging) {
      return;
    }

    setOffset((prev) =>
      prev + clientX - mouseStartPosition > 0
        ? 0
        : prev + clientX - mouseStartPosition < minOffset
        ? minOffset
        : prev + clientX - mouseStartPosition
    );
    setMouseStartPosition(clientX);
  };

  const handleMouseUp = (e, eventName) => {
    if (
      !isDragging ||
      (isDragging &&
        eventName === "onMouseOut" &&
        e.target.tagName.toLowerCase() === "li")
    ) {
      return;
    }
    setIsDragging(false);
  };

  return (
    <div className={classes.chartTypeBarContainer}>
      <div className={classes.chart_header_module}>
        <h1>{title}</h1>
        <h2>{subtitle}</h2>
        {/* <p>chartFrameWidth = {chartFrameWidth} | frameMinusChart = {frameMinusChart}</p> */}
        <div>
          <ul className={classes.chart_view_options}>
            <p>units:</p>
            {units.map((unitItem, index) => (
              <li
                key={index}
                onClick={() => unitsHandler(unitItem)}
                className={unitItem === unitsState ? classes.selected : ""}
              >
                {unitItem}
              </li>
            ))}
          </ul>
        </div>
        <ul className={classes.chart_view_options}>
          <p>select time interval:</p>
          {timeRangeKeywords.map((keyword, index) => (
            <li
              key={index}
              onClick={() => handleTimeRange(keyword)}
              className={keyword === timeRangeKeyword ? classes.selected : ""}
            >
              {keyword}
            </li>
          ))}
        </ul>
      </div>
      <div className={classes.chart} style={{ height: "250px" }}>
        <div className={classes.yaxis_labels}>
          <ul>
            {ticks.map((tick, index) => (
              <li key={index}>
                <p>{tick}</p>
              </li>
            ))}
            <li style={{ border: 0 }}>
              <p>0</p>
            </li>
          </ul>
        </div>
        {dataUPD.length !== 0 ? (
          <div
            className={classes.chart_container}
            onMouseDown={(e) =>
              getMouseDownPosition(e.clientX, "onMouseDown", e)
            }
            onMouseMove={(e) => getMouseMovePosition(e.clientX, "onMouseMove")}
            onMouseUp={(e) => handleMouseUp(e, "onMouseUp")}
            onMouseOut={(e) => handleMouseUp(e, "onMouseOut")}
            onTouchStart={(e) =>
              getMouseDownPosition(e.touches[0].clientX, "onTouchStart", e)
            }
            onTouchMove={(e) =>
              getMouseMovePosition(e.touches[0].clientX, "onTouchMove")
            }
            onTouchEnd={(e) => handleMouseUp(e, "onTouchEnd")}
            onTouchCancel={(e) => handleMouseUp(e, "onTouchCancel")}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
            ref={chartFrameRef}
          >
            <div className={classes.chart_back_layer}></div>
            <ul
              className={classes.bars}
              style={{ left: offset }}
              ref={chartValuesRef}
            >
              {dataUPD.map((item, index) => (
                <li
                  key={index}
                  className={item.end < now ? classes.dimmed : ""}
                  style={{
                    pointerEvents: isDragging ? "none" : "auto",
                  }}
                  // title={
                  //   "price = " +
                  //   item.value +
                  //   " " +
                  //   unitsState +
                  //   decodeURI("%0A") +
                  //   item.barTitle
                  // }
                  title={`${chartValues} = ${
                    item.value
                  } ${unitsState} ${decodeURI("%0A")}${item.barTitleReadable}`}
                >
                  <div
                    className={classes.bar}
                    style={{ height: (200 / maxYaxisVal) * item.value }}
                  >
                    {index % 4 === 0 && (
                      <>
                        <div
                          className={classes.time_pointers}
                          style={{
                            borderColor:
                              item.start.getHours() === 0 ? "#ffffff" : "",
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
                          >{`${item.start.getDate()} ${
                            months[item.start.getMonth()]
                          }`}</p>
                        )}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <ul className={classes.lines}>
              {ticks.map((item, index) => (
                <li key={index}></li>
              ))}
            </ul>
          </div>
        ) : (
          <div className={classes.chart_container}>
            <div className={classes.chart_placeholder}>
              <p>No data available for {timeRangeKeyword}.</p>
              <p>Try to select another time interval.</p>
            </div>
            <ul className={classes.lines}>
              {ticks.map((item, index) => (
                <li key={index}></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
