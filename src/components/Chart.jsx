'use client';

import { React, useRef, useState, useEffect } from 'react';
import classes from '@/components/Chart.module.css';

export default function Chart({ filteredPrices }) {
  //   console.log(filteredPrices);

  const divRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (divRef.current) {
      setWidth(divRef.current.offsetWidth); // get current width
    }

    // Optional: update width on window resize
    const handleResize = () => {
      if (divRef.current) setWidth(divRef.current.offsetWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function formatDate(priceData) {
    const day = priceData.startDate.getDate();
    const month = priceData.startDate.getMonth() + 1;
    const hours = priceData.startDate.getHours().toString().padStart(2, '0');
    const minutes = priceData.startDate
      .getMinutes()
      .toString()
      .padStart(2, '0');
    const endMin = priceData.endDate.getMinutes().toString().padStart(2, '0');
    return `${day}.${month} ${hours}:${minutes}...${hours}:${endMin}`;
  }

  // getting highest price
  const pricesList = filteredPrices.map((priceList) => priceList.price);
  const roundedHighestPrice = Math.ceil(Math.max(...pricesList));

  const k = 300 / roundedHighestPrice;

  return (
    <>
      <div className={classes.graph} ref={divRef}>
        <ul>
          {filteredPrices.map((price, index) => (
            <li
              key={index}
              style={{
                height: price.price * k,
                width:
                  (width - 40 - (filteredPrices.length - 1) * 3) /
                  filteredPrices.length,
              }}
              title={price.price}
            ></li>
          ))}
        </ul>
      </div>

      <ul>
        {filteredPrices.map((price, index) => (
          <li key={index}>
            {price.price} - {formatDate(price)}
          </li>
        ))}
      </ul>
    </>
  );
}
