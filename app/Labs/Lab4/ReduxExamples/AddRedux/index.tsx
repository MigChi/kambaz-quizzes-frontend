"use client";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/Labs/store";
import { useState } from "react";
import { Button, FormControl } from "react-bootstrap";
import { add } from "./addReducer";

export default function AddRedux() {
  const dispatch = useDispatch();
  const sum = useSelector((s: RootState) => s.add.sum);

  const [a, setA] = useState<number>(0);
  const [b, setB] = useState<number>(0);

  return (
    <div id="wd-add-redux">
      <h3>Add Redux</h3>
      <h4>
        {a} + {b} = {sum}
      </h4>

      <div className="d-flex gap-2 align-items-center">
        <FormControl
          type="number"
          defaultValue={a}
          onChange={(e) => setA(parseInt(e.target.value || "0", 10))}
          style={{ maxWidth: 120 }}
        />
        <FormControl
          type="number"
          defaultValue={b}
          onChange={(e) => setB(parseInt(e.target.value || "0", 10))}
          style={{ maxWidth: 120 }}
        />
        <Button
          id="wd-add-redux-click"
          onClick={() => dispatch(add({ a, b }))}
        >
          Add Redux
        </Button>
      </div>
      <hr />
    </div>
  );
}
