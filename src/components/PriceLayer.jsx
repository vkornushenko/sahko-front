import Chart from "./Chart";

export default function PriceLayer({ rawData }) {
  // console.log(rawData);

  // here we changing the rawData to fit Chart component requirements
  // and doing all the filtering/sorting/mapping etc.

  const chartData = rawData.slice(0, 10);

  const exampleData = {
    type: "bar",
    title: { display: true, text: "Example chart" },
    subTitle: { display: true, text: "Chart subtitle" },
    datasets: [
      {
        data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        units: "%",
        color: "red",
      },
      {
        data: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
        units: "%",
        // color: "blue",
      },{
        data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        units: "%",
        color: "blue",
      },{
        data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        units: "%",
        color: "green",
      },
    ],
    labels: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"],
    options: {
      scales: {
        y: {
          beginAtZero: true,
          maxValue: 100,
        },
      },
    },
  };

  return <Chart chartData={exampleData} />;
}
