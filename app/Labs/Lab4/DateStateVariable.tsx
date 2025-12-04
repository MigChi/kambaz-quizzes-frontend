"use client";

import { useEffect, useState } from "react";

const toHtmlDate = (d: Date) => d.toISOString().slice(0, 10);

export default function DateStateVariable() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const d = new Date();
    setStartDate(d);
    setDateStr(toHtmlDate(d));
  }, []);

  return (
    <div id="wd-date-state-variables">
      <h2>Date State Variables</h2>

      <h3 suppressHydrationWarning>
        {startDate ? JSON.stringify(startDate) : ""}
      </h3>

      <h3>{dateStr}</h3>

      <input
        type="date"
        value={dateStr}
        onChange={(e) => {
          const s = e.target.value;
          setDateStr(s);
          setStartDate(new Date(`${s}T00:00:00Z`));
        }}
      />
      <hr />
    </div>
  );
}
