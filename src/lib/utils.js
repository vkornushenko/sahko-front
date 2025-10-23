// nice max for y-axis
export function getNiceMax(value) {
  if (value <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(value)));
  const fraction = value / exp;
  const niceSteps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  const niceFraction = niceSteps.find((s) => fraction <= s) || 10;
  return niceFraction * exp;
}

// y-axis ticks
export function getYAxisTicks(niceMax) {
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

  return ticks.reverse();
}
