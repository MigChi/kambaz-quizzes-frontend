/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Row,
  Col,
  Card,
  CardImg,
  CardBody,
  CardTitle,
  CardText,
  FormControl,
  Button,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setMyCourses } from "../Courses/reducer";
import * as coursesClient from "../Courses/client";
import * as enrollmentsClient from "../Enrollments/client";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const { myCourses } = useSelector((state: any) => state.coursesReducer);

  const isFaculty =
    currentUser?.role === "FACULTY" || currentUser?.role === "ADMIN";

  const [course, setCourse] = useState<any>({
    name: "",
    number: "",
    description: "",
    image: "/images/NU_RGB_Notched-N_motto_RB.png",
    startDate: "2023-09-10",
    endDate: "2023-12-15",
  });

  const fetchMyCourses = async () => {
    if (!currentUser?._id) {
      dispatch(setMyCourses([]));
      return;
    }

    try {
      // Try server-side "current user" endpoint first (uses session/cookies)
      const courses = await coursesClient.findMyCourses();
      if (Array.isArray(courses) && courses.length > 0) {
        dispatch(setMyCourses(courses));
        return;
      }
      // If it returns empty, fall through to manual derivation
    } catch (err) {
      console.error("findMyCourses failed, falling back:", err);
    }

    // Fallback: derive my courses from enrollments + all courses (no session needed)
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
      console.error("Fallback myCourses computation failed:", fallbackErr);
      dispatch(setMyCourses([]));
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchMyCourses();
    } else {
      // signed out
      dispatch(setMyCourses([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const onAddCourse = async () => {
    if (!currentUser) return;

    let newCourseId: string | undefined;

    try {
      // 1. Create the course
      const created = await coursesClient.createCourse(course);
      console.log("Created course response:", created);

      // 2. Try to grab an ID directly from the response (covers local dev / simple cases)
      if (created && typeof created === "object") {
        // common patterns: {_id}, {id}, {courseId}, or an array
        newCourseId =
          (created as any)._id ??
          (created as any).id ??
          (created as any).courseId ??
          (Array.isArray(created) && created[0]?._id);
      }
    } catch (e) {
      console.error("createCourse failed:", e);
    }

    // 3. Fallback – if we still don't know the courseId, infer it from /api/courses
    if (!newCourseId) {
      try {
        const allCourses = await coursesClient.fetchAllCourses();

        // Find courses that match what we just created (name + number is usually enough)
        const matches = (allCourses || []).filter(
          (c: any) => c.name === course.name && c.number === course.number
        );

        if (matches.length > 0) {
          // Take the last match, assuming it's the newest
          const newest = matches[matches.length - 1];
          newCourseId = newest._id;
        }
      } catch (e) {
        console.error("Unable to infer new course ID from /api/courses:", e);
      }
    }

    // 4. If we have an ID, explicitly enroll creator using the non-session endpoint
    if (newCourseId) {
      try {
        await coursesClient.enrollIntoCourse(currentUser._id, newCourseId);
      } catch (e) {
        console.error(
          "Auto-enroll creator failed (safe to ignore if duplicate or server already enrolled):",
          e
        );
      }
    } else {
      console.warn(
        "Could not determine new course ID; creator might not be auto-enrolled."
      );
    }

    // 5. Recompute myCourses from backend (using the robust fetchMyCourses you already have)
    await fetchMyCourses();
  };


  const onDeleteCourse = async (courseId: string) => {
    await coursesClient.deleteCourse(courseId);
    dispatch(
      setMyCourses(myCourses.filter((c: any) => c._id !== courseId))
    );
  };

  const onUpdateCourse = async () => {
    const updated = await coursesClient.updateCourse(course);
    dispatch(
      setMyCourses(
        myCourses.map((c: any) => (c._id === course._id ? updated : c))
      )
    );
  };

  return (
    <div id="wd-dashboard">
      <h1 id="wd-dashboard-title">Dashboard</h1>
      <hr />

      {!currentUser && (
        <div className="text-muted mb-3">Sign in to view your courses.</div>
      )}

      {currentUser && (
        <>
          <h2 id="wd-dashboard-published">
            My Courses ({myCourses.length})
          </h2>
          <hr />
        </>
      )}

      {isFaculty && (
        <>
          <h5>
            New Course
            <button
              className="btn btn-primary float-end"
              id="wd-add-new-course-click"
              onClick={onAddCourse}
            >
              Add
            </button>
            <button
              className="btn btn-secondary float-end me-2"
              id="wd-update-course-click"
              onClick={onUpdateCourse}
            >
              Update
            </button>
          </h5>

          <FormControl
            className="mb-2"
            placeholder="Course Name"
            value={course.name}
            onChange={(e) => setCourse({ ...course, name: e.target.value })}
          />

          <FormControl
            className="mb-2"
            placeholder="Course Number"
            value={course.number}
            onChange={(e) => setCourse({ ...course, number: e.target.value })}
          />

          <FormControl
            as="textarea"
            rows={3}
            className="mb-2"
            placeholder="Course Description"
            value={course.description}
            onChange={(e) =>
              setCourse({ ...course, description: e.target.value })
            }
          />

          <hr />
        </>
      )}

      <div id="wd-dashboard-courses">
        <Row xs={1} md={5} className="g-4">
          {myCourses.map((c: any) => (
            <Col
              key={c._id}
              className="wd-dashboard-course"
              style={{ width: "300px" }}
            >
              <Card>
                <Link
                  href={`/Courses/${c._id}/Home`}
                  className="wd-dashboard-course-link text-decoration-none text-dark"
                >
                  <CardImg
                    src={c.image}
                    variant="top"
                    width="100%"
                    height={160}
                  />

                  <CardBody>
                    <CardTitle className="wd-dashboard-course-title text-nowrap overflow-hidden">
                      {c.name}
                    </CardTitle>

                    <CardText
                      className="wd-dashboard-course-description overflow-hidden"
                      style={{ height: "100px" }}
                    >
                      {c.description}
                    </CardText>

                    <div className="d-flex align-items-center">
                      <button className="btn btn-primary">Go</button>

                      {isFaculty && (
                        <>
                          <Button
                            variant="warning"
                            className="ms-2"
                            id="wd-edit-course-click"
                            onClick={(event) => {
                              event.preventDefault();
                              setCourse(c);
                            }}
                          >
                            Edit
                          </Button>

                          <Button
                            variant="danger"
                            className="ms-2"
                            id="wd-delete-course-click"
                            onClick={(event) => {
                              event.preventDefault();
                              onDeleteCourse(c._id);
                            }}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </CardBody>
                </Link>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
