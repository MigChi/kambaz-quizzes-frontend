"use client";

import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../Courses/[cid]/store";
import Link from "next/link";
import {
  Button,
  Card,
  CardBody,
  CardImg,
  CardText,
  CardTitle,
  Col,
  Row,
  Form,
} from "react-bootstrap";
import { useMemo, useState, useEffect } from "react";
import {
  addCourse,
  deleteCourse,
  setCourses,
  type Course,
} from "../Courses/[cid]/store/coursesSlice";
import {
  enroll,
  unenroll,
  setEnrollments,
} from "../Courses/[cid]/store/enrollmentsSlice";
import * as accountClient from "../Account/client";
import * as courseClient from "../Courses/client";

type CourseWithFallback = Course & { fallbackImage: string };

const FALLBACK_IMAGES = [
  "/images/cat7.jpg",
  "/images/cat1.jpg",
  "/images/cat2.jpg",
  "/images/cat3.jpg",
  "/images/cat4.jpg",
  "/images/cat5.jpg",
  "/images/cat6.jpg",
];

const pickFallbackImage = (courseId: string, index: number) => {
  const hash = courseId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  if (Number.isFinite(hash)) {
    return FALLBACK_IMAGES[hash % FALLBACK_IMAGES.length];
  }
  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
};

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();

  const currentUser = useSelector((s: RootState) => s.account.currentUser);
  const isFaculty = (currentUser?.role ?? "").toUpperCase() === "FACULTY";

  const courses = useSelector((s: RootState) => s.courses.courses);
  const enrollments = useSelector((s: RootState) => s.enrollments.enrollments);
  const coursesWithImage: CourseWithFallback[] = useMemo(
    () =>
      courses.map((course, index) => ({
        ...course,
        fallbackImage: pickFallbackImage(course._id, index),
      })),
    [courses]
  );

  // Form draft
  const [draft, setDraft] = useState({
    number: "CS0000",
    name: "New Course",
    description: "Describe this course…",
    image: "",
  });

  // Which course (if any) are we editing?
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const allCourses = await courseClient.fetchAllCourses();
        dispatch(setCourses(allCourses));
      } catch (e) {
        console.error("Failed to load courses", e);
      }
    };
    void loadCourses();
  }, [dispatch]);

  useEffect(() => {
    const loadMyEnrollments = async () => {
      if (!currentUser) {
        dispatch(setEnrollments([]));
        return;
      }
      try {
        const myCourses = await accountClient.findMyCourses();
        const enrollments = myCourses.map((course) => ({
          _id: `${currentUser._id}-${course._id}`,
          user: currentUser._id,
          course: course._id,
        }));
        dispatch(setEnrollments(enrollments));
      } catch (e) {
        console.error("Failed to load enrollments", e);
      }
    };

    void loadMyEnrollments();
  }, [currentUser, dispatch]);

  const resetDraft = () =>
    setDraft({
      number: "CS0000",
      name: "New Course",
      description: "Describe this course…",
      image: "",
    });

  const handleAdd = async () => {
    if (!currentUser || editingCourseId) return;

    const draftCourse = {
      number: draft.number || "CS0000",
      name: draft.name || "New Course",
      description: draft.description || "Describe this course…",
      image: draft.image || undefined,
    };

    try {
      const newCourse = await accountClient.createCourse(draftCourse);
      dispatch(addCourse(newCourse));
      dispatch(enroll({ userId: currentUser._id, courseId: newCourse._id }));
      resetDraft();
    } catch (e) {
      console.error("Failed to create course", e);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourseId(course._id);
    setDraft({
      number: course.number ?? "",
      name: course.name ?? "",
      description: course.description ?? "",
      image: course.image ?? "",
    });
  };

  const handleCancelEdit = () => {
    setEditingCourseId(null);
    resetDraft();
  };

  const handleUpdate = async () => {
    if (!currentUser || !editingCourseId) return;

    const updates = {
      number: draft.number || "CS0000",
      name: draft.name || "New Course",
      description: draft.description || "Describe this course…",
      image: draft.image || undefined,
    };

    try {
      await courseClient.updateCourse(editingCourseId, updates);
      // Reload courses from server so UI reflects updated description
      const allCourses = await courseClient.fetchAllCourses();
      dispatch(setCourses(allCourses));
      setEditingCourseId(null);
      resetDraft();
    } catch (e) {
      console.error("Failed to update course", e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await courseClient.deleteCourse(id);
      dispatch(deleteCourse(id));
    } catch (e) {
      console.error("Failed to delete course", e);
    }
  };

  const enrolledCourseIds = useMemo(() => {
    if (!currentUser) return new Set<string>();
    return new Set(
      enrollments
        .filter((e) => e.user === currentUser._id)
        .map((e) => e.course)
    );
  }, [enrollments, currentUser]);

  const myCourses: CourseWithFallback[] = coursesWithImage.filter((c) =>
    enrolledCourseIds.has(c._id)
  );

  const onEnroll = async (courseId: string) => {
    if (!currentUser) return;
    try {
      await courseClient.enrollIntoCourse(currentUser._id, courseId);
      dispatch(enroll({ userId: currentUser._id, courseId }));
    } catch (e) {
      console.error("Failed to enroll", e);
    }
  };

  const onUnenroll = async (courseId: string) => {
    if (!currentUser) return;
    try {
      await courseClient.unenrollFromCourse(currentUser._id, courseId);
      dispatch(unenroll({ userId: currentUser._id, courseId }));
    } catch (e) {
      console.error("Failed to unenroll", e);
    }
  };

  return (
    <div id="wd-dashboard">
      <h1 id="wd-dashboard-title">Dashboard</h1>
      <hr />

      {isFaculty && (
        <div className="d-flex flex-wrap gap-2 align-items-start mb-3">
          <Form.Control
            id="wd-new-course-number"
            placeholder="Course number"
            style={{ maxWidth: 180 }}
            value={draft.number}
            onChange={(e) =>
              setDraft((d) => ({ ...d, number: e.target.value }))
            }
          />
          <Form.Control
            id="wd-new-course-name"
            placeholder="Course name"
            style={{ maxWidth: 260 }}
            value={draft.name}
            onChange={(e) =>
              setDraft((d) => ({ ...d, name: e.target.value }))
            }
          />
          <Form.Control
            id="wd-new-course-description"
            as="textarea"
            rows={2}
            placeholder="Course description"
            style={{ maxWidth: 360 }}
            value={draft.description}
            onChange={(e) =>
              setDraft((d) => ({ ...d, description: e.target.value }))
            }
          />
          {editingCourseId ? (
            <>
              <Button
                id="wd-update-course-click"
                variant="primary"
                onClick={handleUpdate}
              >
                Update
              </Button>
              <Button
                variant="outline-secondary"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              id="wd-add-course-click"
              variant="success"
              onClick={handleAdd}
            >
              Add
            </Button>
          )}
        </div>
      )}

      <h2 id="wd-dashboard-published">
        Published Courses ({myCourses.length})
      </h2>
      <hr />
      <Row xs={1} md={5} className="g-4 mb-4">
        {myCourses.map((course) => {
          const fallback =
            course.image ?? course.fallbackImage ?? FALLBACK_IMAGES[0];

          return (
            <Col
              key={course._id}
              className="wd-dashboard-course"
              style={{ width: "300px" }}
            >
              <Card>
                <Link
                  href={`/Courses/${course._id}`}
                  className="wd-dashboard-course-link text-decoration-none text-dark"
                >
                  <CardImg
                    variant="top"
                    src={fallback}
                    width={200}
                    height={150}
                    alt="Course"
                  />
                <CardBody>
                  <CardTitle className="wd-dashboard-course-title text-nowrap overflow-hidden">
                    {course.number} {course.name}
                  </CardTitle>
                  <CardText
                    className="wd-dashboard-course-description overflow-hidden"
                    style={{ height: "100px" }}
                  >
                    {course.description}
                  </CardText>
                  <div className="d-flex gap-2">
                    <Button variant="primary">Go</Button>
                    {isFaculty && (
                      <Button
                        variant="outline-secondary"
                        onClick={(e) => {
                          e.preventDefault();
                          handleEdit(course);
                        }}
                      >
                        Edit
                      </Button>
                    )}
                    <Button
                      id="wd-delete-course-click"
                      variant="outline-danger"
                      onClick={(e) => {
                        e.preventDefault();
                        void handleDelete(course._id);
                      }}
                    >
                      Delete
                    </Button>
                    {currentUser && (
                      <Button
                        id="wd-unenroll-course"
                        variant="outline-secondary"
                        onClick={(e) => {
                          e.preventDefault();
                          onUnenroll(course._id);
                        }}
                      >
                        Unenroll
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Link>
            </Card>
          </Col>
        );
      })}
      </Row>

      {currentUser && (
        <>
          <h3 className="mt-4">Browse All Courses</h3>
          <hr />
          <Row xs={1} md={5} className="g-4">
            {coursesWithImage.map((course) => {
              const isEnrolled = enrolledCourseIds.has(course._id);
              const fallback =
                course.image ?? course.fallbackImage ?? FALLBACK_IMAGES[0];
              return (
                <Col key={course._id} style={{ width: "300px" }}>
                  <Card>
                    <CardImg
                      variant="top"
                      src={fallback}
                      width={200}
                      height={150}
                      alt="Course"
                    />
                    <CardBody>
                      <CardTitle className="text-nowrap overflow-hidden">
                        {course.number} {course.name}
                      </CardTitle>
                      <CardText
                        className="overflow-hidden"
                        style={{ height: "80px" }}
                      >
                        {course.description}
                      </CardText>
                      <div className="d-flex gap-2">
                        <Link
                          href={`/Courses/${course._id}`}
                          className="btn btn-primary"
                        >
                          Go
                        </Link>
                        {isFaculty && (
                          <Button
                            variant="outline-secondary"
                            onClick={() => handleEdit(course)}
                          >
                            Edit
                          </Button>
                        )}
                        <Button
                          id="wd-delete-course-click"
                          variant="outline-danger"
                          onClick={() => void handleDelete(course._id)}
                        >
                          Delete
                        </Button>
                        {isEnrolled ? (
                          <Button
                            id="wd-unenroll-course"
                            variant="outline-secondary"
                            onClick={() => onUnenroll(course._id)}
                          >
                            Unenroll
                          </Button>
                        ) : (
                          <Button
                            id="wd-enroll-course"
                            variant="outline-success"
                            onClick={() => onEnroll(course._id)}
                          >
                            Enroll
                          </Button>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </>
      )}
    </div>
  );
}
