"use client";
import type React from "react";
import { useState } from "react";

type EventSnapshot = {
  type: string;
  timeStamp: number;
  targetOuterHTML: string;
  button: number;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
};

export default function EventObject() {
  const [eventSnap, setEventSnap] = useState<EventSnapshot | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const targetEl = e.target as HTMLElement;
    const snapshot: EventSnapshot = {
      type: e.type,
      timeStamp: e.timeStamp,
      targetOuterHTML: targetEl.outerHTML,
      button: e.button,
      altKey: e.altKey,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      metaKey: e.metaKey,
    };
    setEventSnap(snapshot);
  };

  return (
    <div>
      <h2>Event Object</h2>
      <button
        onClick={handleClick}
        className="btn btn-primary"
        id="wd-display-event-obj-click"
      >
        Display Event Object
      </button>
      <pre>{JSON.stringify(eventSnap, null, 2)}</pre>
      <hr />
    </div>
  );
}
