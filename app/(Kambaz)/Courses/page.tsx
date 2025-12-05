/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Row,
  Col,
  Card,
  CardImg,
  CardBody,
  CardTitle,
  CardText,
} from "react-bootstrap";
import Link from "next/link";
import * as coursesClient from "./client";
import { setCourses } from "./reducer";
import EnrollmentsButton from "./[cid]/EnrollmentsButton";

export default function CoursesPage() {
  const dispatch = useDispatch();
  const { courses } = useSelector((state: any) => state.coursesReducer);

  const fetchCourses = async () => {
    const allCourses = await coursesClient.fetchAllCourses();
    dispatch(setCourses(allCourses ?? []));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div id="wd-courses-list">
      <h1>Courses</h1>
      <hr />
      <Row xs={1} md={4} className="g-4">
        {courses.map((course: any) => (
          <Col key={course._id}>
            <Card>
              <Link
                href={`/Courses/${course._id}/Home`}
                className="text-decoration-none text-dark"
              >
                <CardImg
                  src={course.image}
                  variant="top"
                  width="100%"
                  height={160}
                />
              </Link>
              <CardBody>
                <CardTitle className="text-nowrap overflow-hidden">
                  {course.name}
                </CardTitle>
                <CardText
                  className="overflow-hidden"
                  style={{ height: "80px" }}
                >
                  {course.description}
                </CardText>
                <div className="d-flex justify-content-between align-items-center">
                  <Link
                    href={`/Courses/${course._id}/Home`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    View
                  </Link>
                  <EnrollmentsButton courseId={course._id} />
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}