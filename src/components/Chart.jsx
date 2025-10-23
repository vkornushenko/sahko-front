import React from "react";
import classes from "@/components/Chart.module.css";

export default function Chart({ chartData }) {
  const height = 200;
  const maxValue = 10;

  console.log(chartData);

  // const exampleData = {
  //   type: "bar",
  //   title: { display: true, text: "Example chart" },
  //   subTitle: { display: true, text: "Chart subtitle" },
  //   datasets: [
  //     {
  //       data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  //       units: "%",
  //     },
  //     {
  //       data: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  //       units: "%",
  //     },
  //   ],
  //   labels: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"],
  //   options: {
  //     scales: {
  //       y: {
  //         beginAtZero: true,
  //         maxValue: 100,
  //       },
  //     },
  //   },
  // };

  return (
    <div className={classes.chartContainer}>
      {chartData.title.display && <h2>{chartData.title.text}</h2>}
      {chartData.subTitle.display && <p>{chartData.subTitle.text}</p>}

      <ul>
        <li className={classes.yAxisLabelsContainer}>
          <div>1</div>
          <div>2</div>
          <div>3</div>
          <div>4</div>
          <div>5</div>
          <p>0</p>
        </li>
        {chartData.labels.map((label, index) => (
          <li key={index}>
            <div className={classes.candlesContainer}>
              {chartData.datasets.map((dataset, dsIndex) => (
                <div
                  key={dsIndex}
                  className={classes.candle}
                  style={{
                    height: (height * dataset.data[index]) / maxValue,
                    backgroundColor: dataset.color || "gray",
                  }}
                ></div>
              ))}
            </div>
            <p>{index % 3 === 0 && label}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
