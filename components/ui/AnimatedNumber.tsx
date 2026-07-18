"use client";

import { useEffect, useState } from "react";

type Props = {
  value: number;
};

export default function AnimatedNumber({ value }: Props) {
  const [number, setNumber] = useState(0);

  useEffect(() => {
    setNumber(0);

    if (value === 0) return;

    let current = 0;

    const step = Math.max(1, Math.ceil(value / 60));

    const interval = setInterval(() => {
      current += step;

      if (current >= value) {
        current = value;
        clearInterval(interval);
      }

      setNumber(current);
    }, 20);

    return () => clearInterval(interval);
  }, [value]);

  return <>{number}</>;
}