"use client";

import React, { useEffect, useRef, useState } from "react";
import classes from "./ChartTypeBar.module.css";
import { getNiceMax, getYAxisTicks } from "@/lib/utils";
import { filterDataByDate } from "@/lib/dateUtils";

// TODO: component refactoring
// FIX BUG: if (frame > chart) => chart sticks to the right side of the frame

export default function ChartTypeBar({ data, units, title, subtitle, maxGenerationValue }) {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0);

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
    }
    else {
      setChartDataset(data);
    }
  }, [unitsState]);


  // console.log(data)
  const filteredData = filterDataByDate(chartDataset, today);

  // logic to calculate max chart scroll
  const [minOffset, setMinOffset] = useState(0);
  const chartValuesRef = useRef();
  const chartFrameRef = useRef();
  const [chartFrameWidth, setChartFrameWidth] = useState(0);

  useEffect(() => {
    if (!chartFrameRef.current || !chartValuesRef.current) return;

    const handleResize = () => {
      // console.log("upd");
      const frameW = chartFrameRef.current.offsetWidth;
      const valuesW = chartValuesRef.current.offsetWidth;
      const minOffSetOnReseize = frameW - valuesW;
      // console.log(minOffSetOnReseize)
      setChartFrameWidth(frameW);
      setMinOffset(frameW - valuesW);
      setOffset((prevOffSet) =>
        prevOffSet < minOffSetOnReseize ? minOffSetOnReseize : prevOffSet
      );
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [data]);

  const dataUPD = filteredData.map((item) => ({
    ...item,
    barTitle: item.start.toUTCString(),
  }));

  // console.log(dataUPD)
  const valueList = dataUPD.map((item) => item.value);
  // console.log(valueList)
  const roundedHighestValue = Math.ceil(Math.max(...valueList, 0));

  const maxYaxisVlaue = getNiceMax(roundedHighestValue);
  const ticks = getYAxisTicks(maxYaxisVlaue);

  // chart drag logic
  const [isDragging, setIsDragging] = useState(false);
  const [mouseStartPosition, setMouseStartPosition] = useState(0);
  const [offset, setOffset] = useState(0);

  const getMouseDownPosition = (clientX, eventName, e) => {
    if (!isDragging) {
      // console.log("getMouseDownPosition triggered, eventName = " + eventName);
      // console.log(e.nativeEvent);
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
    // console.log("getMouseMovePosition triggered");
    // offset should be in a range (minOffset(frameWidth-chartWidth), 0)

    setOffset((prev) =>
      prev + clientX - mouseStartPosition > 0
        ? 0
        : prev + clientX - mouseStartPosition < minOffset
        ? minOffset
        : prev + clientX - mouseStartPosition
    );
    setMouseStartPosition(clientX);
  };

  // const handleTouchEnd = () => {
  //   console.log('handleTouchEnd triggered')
  //   setIsDragging(false);
  // }
  const handleMouseUp = (e, eventName) => {
    // console.log('handleMouseUp (before if) ' + eventName + e.target.tagName.toLowerCase())
    if (
      !isDragging ||
      (isDragging &&
        eventName === "onMouseOut" &&
        e.target.tagName.toLowerCase() === "li")
      // (isDragging &&
      //   eventName === "onTouchEnd" &&
      //   e.target.tagName.toLowerCase() === "li")
    ) {
      return;
    }
    // console.log(
    //   "handleMouseUp, eventName=" +
    //     eventName +
    //     " target=" +
    //     e.target.tagName.toLowerCase()
    // );
    setIsDragging(false);
  };

  return (
    <div className={classes.chartTypeBarContainer}>
      <div className={classes.chart_header_module}>
        <h1>
          {title}, {unitsState}
        </h1>
        <h2>{subtitle}</h2>
        {/* {units.length > 1 && ( */}
        <div>
          <ul>
            {units.map((unitItem, index) => (
              <li key={index} onClick={() => unitsHandler(unitItem)}>
                {unitItem}
              </li>
            ))}
          </ul>
        </div>
        {/* )} */}
        {/* <p>
          offset = {offset}px | frameW= {chartFrameWidth}
        </p> */}
      </div>
      <div className={classes.chart}>
        <div className={classes.yaxis_labels}>
          <ul>
            {ticks.map((tick, index) => (
              <li key={index}>{tick}</li>
            ))}
            <li style={{ border: 0 }}>0</li>
          </ul>
        </div>
        <div
          className={classes.chart_container}
          onMouseDown={(e) => getMouseDownPosition(e.clientX, "onMouseDown", e)}
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
          <ul
            className={classes.bars}
            style={{ left: offset }}
            ref={chartValuesRef}
          >
            {dataUPD.map((item, index) => (
              <li
                key={index}
                // onMouseDown={(e) => getMouseDownPosition(e.clientX)}
                // onMouseMove={(e) => getMouseMovePosition(e.clientX)}
                // onMouseUp={handleMouseUp}
                // onMouseOut={(e) => {
                //   handleMouseUp(e);
                // }}
                className={item.end < now ? classes.dimmed : ""}
                style={{
                  height: (190 / maxYaxisVlaue) * item.value,
                  pointerEvents: isDragging ? "none" : "auto",
                }}
                title={
                  "price = " +
                  Math.round(item.value) +
                  " " +
                  unitsState +
                  decodeURI("%0A") +
                  item.barTitle
                }
              ></li>
            ))}
          </ul>
          <ul className={classes.lines}>
            {ticks.map((item, index) => (
              <li key={index}></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
