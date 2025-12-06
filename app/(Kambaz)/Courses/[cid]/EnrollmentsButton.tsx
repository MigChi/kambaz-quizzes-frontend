/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "next/navigation";
import { setMyCourses } from "../reducer";
import * as coursesClient from "../client";
import * as enrollmentsClient from "../../Enrollments/client";

type Props = {
  courseId?: string;
};

export default function EnrollmentsButton({ courseId }: Props) {
  const params = useParams() as { cid?: string };
  const cid = courseId ?? params.cid;
  const dispatch = useDispatch();

  const { currentUser } = useSelector((s: any) => s.accountReducer);
  const { myCourses } = useSelector((s: any) => s.coursesReducer);

  if (!currentUser || !cid) return null;

  const userId = currentUser._id;
  const isEnrolled = myCourses.some((c: any) => c._id === cid);

  const refreshMyCourses = async () => {
    if (!currentUser?._id) {
      dispatch(setMyCourses([]));
      return;
    }

    // Try session-based endpoint first
    try {
      const courses = await coursesClient.findMyCourses(currentUser._id);
      if (Array.isArray(courses) && courses.length > 0) {
        dispatch(setMyCourses(courses));
        return;
      }
    } catch (err) {
      console.error(
        "findMyCourses in EnrollmentsButton failed, falling back:",
        err
      );
    }

    // Fallback based on enrollments + all courses
    try {
      const [allCourses, enrollments] = await Promise.all([
        coursesClient.fetchAllCourses(),
        enrollmentsClient.findAllEnrollments(),
      ]);

      const myCourseIds = new Set(
        (enrollments || [])
          .filter((e: any) => e.user === currentUser._id)
          .map((e: any) => e.course)
      );

      const mine = (allCourses || []).filter((c: any) =>
        myCourseIds.has(c._id)
      );

      dispatch(setMyCourses(mine));
    } catch (fallbackErr) {
      console.error(
        "Fallback myCourses computation in EnrollmentsButton failed:",
        fallbackErr
      );
    }
  };

  const handleEnroll = async () => {
    await coursesClient.enrollIntoCourse(userId, cid as string);
    await refreshMyCourses();
  };

  const handleUnenroll = async () => {
    await coursesClient.unenrollFromCourse(userId, cid as string);
    await refreshMyCourses();
  };

  return isEnrolled ? (
    <Button variant="danger" onClick={handleUnenroll}>
      Unenroll
    </Button>
  ) : (
    <Button variant="primary" onClick={handleEnroll}>
      Enroll
    </Button>
  );
}
