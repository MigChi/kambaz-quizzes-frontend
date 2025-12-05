"use client";

import { ReactNode } from "react";
import { Provider } from "react-redux";
import store from "@/app/Labs/Lab4/store"; 
import TOC from "./TOC";

export default function LabsLayout({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <table>
        <tbody>
          <tr>
            <td valign="top" width="100px"><TOC /></td>
            <td valign="top">{children}</td>
          </tr>
        </tbody>
      </table>
    </Provider>
  );
}