"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  "Home",
  "Modules",
  "Piazza",
  "Zoom",
  "Assignments",
  "Quizzes",
  "Grades",
  "People",
] as const;

const ROUTE_OVERRIDES: Record<string, string> = {
};

export default function CourseNavigation({ cid }: { cid: string }) {
  const pathname = usePathname();

  return (
    <div id="wd-courses-navigation" className="wd list-group fs-5 rounded-0">
      {links.map((label) => {
        // For People, subpath will just be "People"
        const subpath = ROUTE_OVERRIDES[label] ?? label;
        const href = `/Courses/${cid}/${subpath}`;
        const isActive = pathname?.startsWith(href);

        return (
          <Link
            key={label}
            href={href}
            id={`wd-course-${label.toLowerCase()}-link`}
            className={`list-group-item border-0 ${
              isActive ? "active" : "text-danger"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

