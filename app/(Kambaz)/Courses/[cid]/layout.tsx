import { ReactNode } from "react";
import CourseNavigation from "./Navigation";
import { FaAlignJustify } from "react-icons/fa";
import { courses } from "../../Database/index";
import Breadcrumb from "./Breadcrumb";

export default async function CoursesLayout(
  { children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ cid: string }> }>
) {
  const { cid } = await params;
  const course = courses.find((c) => c._id === cid);

  return (
    <div id="wd-courses">
      <h2 className="text-danger d-flex align-items-center m-0">
        <FaAlignJustify className="me-4 fs-4 mb-1" />
        <Breadcrumb course={course} />
      </h2>
      <hr />

      <div className="d-flex">
        <div className="d-none d-md-block">
          <CourseNavigation />
        </div>
        <div className="flex-fill">{children}</div>
      </div>
    </div>
  );
}
