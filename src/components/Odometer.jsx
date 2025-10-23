"use client";

import React, { useEffect, useState } from "react";
import classes from "./Odometer.module.css";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";

export default function Odometer({currentValue}) {
  const [windGenerationValue, setWindGenerationValue] = useState(currentValue || 0);
  const [pointerDeg, setPointerDeg] = useState(-135);
  const defaultMotionValue = useMotionValue(0);
  const rounded = useTransform(defaultMotionValue, (latest) =>
    Math.floor(latest)
  );

  const testHandler = () => {
    const testValues = [0, 250, 1248, 2284, 3296, 4127, 5234, 6123, 7345, 8234, 9237];
    setWindGenerationValue((prev) => {
      let newValue;
      do {
        newValue = testValues[Math.floor(Math.random() * testValues.length)];
      } while (newValue === prev); // repeat if same as previous
      return newValue;
    }, [currentValue]);
  };

  // const windGenerationValue = 9237; // example value
  const maxWindGeneration = 9237; // example max value
  const windGenerationPercentage =
    (windGenerationValue / maxWindGeneration) * 100;
  // console.log(windGenerationPercentage);
  const deg = (270 * windGenerationPercentage) / 100;
  // console.log(deg)
  // const pointerDeg = -135 + deg;
  // console.log(pointerDeg);
  // setPointerDeg(-135 + deg);

  useEffect(() => {
    setPointerDeg(-135 + deg);
    const controls = animate(defaultMotionValue, windGenerationValue, {
      duration: 1.5,
      ease: "easeOut",
    });
    return controls.stop;
  }, [windGenerationValue]);

  const steps = [
    -45, -30, -15, 0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195,
    210, 225,
  ];
  // console.log(steps.length);
  return (
    <>
      <div className={classes.odometer}>
        <div className={classes.odometer_overlay}></div>
        <ul className={classes.steps}>
          {steps.map((step, index) => (
            <li
              key={index}
              className={classes.step}
              style={{ zIndex: index + 10, transform: `rotate(${step}deg)` }}
            >
              <div
                className={classes.point}
                style={{ width: index % 2 === 0 ? "6px" : "2px" }}
              >
                <p
                  className={classes.label}
                  style={{
                    visibility: index % 2 === 0 ? "visible" : "hidden",
                    transform: `rotate(${-step}deg)`,
                  }}
                >
                  {step}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <div className={classes.center}></div>

        {/* min -135 max 135 | ampl 270 */}
        <div
          className={classes.pointer}
          style={{ transform: `rotate(${pointerDeg}deg)` }}
        ></div>
        <div className={classes.value_container}>
          <motion.p className={classes.value}>{rounded}</motion.p>
          <p className={classes.units} onClick={() => testHandler()}>
            MW
          </p>
        </div>
      </div>
    </>
  );
}
