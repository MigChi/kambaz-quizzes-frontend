"use client";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/Labs/store";
import { increment, decrement } from "./counterReducer";

export default function CounterRedux() {
  const dispatch = useDispatch();
  const count = useSelector((s: RootState) => s.counter.count);

  return (
    <div id="wd-counter-redux">
      <h3>Counter Redux</h3>
      <h4>Count: {count}</h4>
      <div className="d-flex gap-2">
        <button className="btn btn-secondary" onClick={() => dispatch(decrement())}>-</button>
        <button className="btn btn-secondary" onClick={() => dispatch(increment())}>+</button>
      </div>
      <hr />
    </div>
  );
}
