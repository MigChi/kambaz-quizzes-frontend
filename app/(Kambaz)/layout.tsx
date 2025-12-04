import { ReactNode } from "react";
import "./styles.css";
import KambazNavigation from "./Navigation";
import Providers from "./Providers";
import Session from "./Account/Session";

export default function KambazLayout({ children }: { children: ReactNode }) {
  return (
    <div id="wd-kambaz">
      <div className="d-flex">
        <div>
          <KambazNavigation />
        </div>
        <div className="wd-main-content-offset p-3 flex-fill">
          <Providers>
            <Session>{children}</Session>
          </Providers>
        </div>
      </div>
    </div>
  );
}
