'use client';

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

type CourseNavLink = {
  id: string;
  label: string;
  href: (cid: string) => string;
};

const LINKS: CourseNavLink[] = [
  { id: "wd-course-home-link",        label: "Home",        href: (cid) => `/Courses/${cid}/Home` },
  { id: "wd-course-modules-link",     label: "Modules",     href: (cid) => `/Courses/${cid}/Modules` },
  { id: "wd-course-piazza-link",      label: "Piazza",      href: (cid) => `/Courses/${cid}/Piazza` },
  { id: "wd-course-zoom-link",        label: "Zoom",        href: (cid) => `/Courses/${cid}/Zoom` },
  { id: "wd-course-assignments-link", label: "Assignments", href: (cid) => `/Courses/${cid}/Assignments` },
  { id: "wd-course-quizzes-link",     label: "Quizzes",     href: (cid) => `/Courses/${cid}/Quizzes` },
  { id: "wd-course-people-link",      label: "People",      href: (cid) => `/Courses/${cid}/People/Table` },
  { id: "wd-course-labs-link",        label: "Labs",        href: () => `/Labs` },
];

export default function CourseNavigation(props: { cid?: string }) {
  const pathname = usePathname() ?? "";
  const params = useParams() as { cid?: string };
  const cid = props.cid ?? params?.cid ?? "1234";

  return (
    <div id="wd-courses-navigation" className="wd list-group fs-5 rounded-0">
      {LINKS.map((link) => {
        const href = link.href(cid);
        const isActive = pathname.startsWith(href);
        const classes = `list-group-item border-0 ${isActive ? "active" : "text-danger"}`;
        return (
          <div key={link.id}>
            <Link href={href} id={link.id} className={classes}>
              {link.label}
            </Link>
            <br />
          </div>
        );
      })}
    </div>
  );
}
