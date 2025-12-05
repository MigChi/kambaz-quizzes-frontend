import Modules from "../Modules/page";
import CourseStatus from "./Status";
import EnrollmentsButton from "../EnrollmentsButton";

export default function Home() {
  return (
    <div id="wd-home">
      <div className="d-flex justify-content-end mb-3">
        <EnrollmentsButton />
      </div>
      <div className="d-flex">
        <div className="flex-fill me-3">
          <Modules />
        </div>
        <div className="d-none d-lg-block">
          <CourseStatus />
        </div>
      </div>
    </div>
  );
}
