// app/(Kambaz)/Courses/[cid]/Home/Status.tsx
"use client";
import { Button, ButtonGroup, ListGroup } from "react-bootstrap";
import {
  FaBan, FaCheck, FaUpload, FaLayerGroup,
  FaHome, FaEye, FaBullhorn, FaChartBar, FaBell
} from "react-icons/fa";

export default function CourseStatus() {
  return (
    <section id="wd-course-status">
      <h4 className="mb-3">Course Status</h4>

      {/* publish/unpublish row */}
      <ButtonGroup className="w-100 mb-3">
        <Button
          id="wd-unpublish-btn"
          variant="secondary"
          className="d-flex align-items-center justify-content-center"
        >
          <FaBan className="me-2" /> Unpublish
        </Button>
        <Button
          id="wd-publish-btn"
          variant="success"
          className="d-flex align-items-center justify-content-center"
        >
          <FaCheck className="me-2" /> Publish
        </Button>
      </ButtonGroup>

      {/* actions list */}
      <ListGroup className="rounded-0">
        <ListGroup.Item action id="wd-import-existing-content"  className="d-flex align-items-center">
          <FaUpload className="me-2" /> Import Existing Content
        </ListGroup.Item>
        <ListGroup.Item action id="wd-import-from-commons"      className="d-flex align-items-center">
          <FaLayerGroup className="me-2" /> Import from Commons
        </ListGroup.Item>
        <ListGroup.Item action id="wd-choose-home-page"         className="d-flex align-items-center">
          <FaHome className="me-2" /> Choose Home Page
        </ListGroup.Item>
        <ListGroup.Item action id="wd-view-course-screen"       className="d-flex align-items-center">
          <FaEye className="me-2" /> View Course Screen
        </ListGroup.Item>
        <ListGroup.Item action id="wd-new-announcement"         className="d-flex align-items-center">
          <FaBullhorn className="me-2" /> New Announcement
        </ListGroup.Item>
        <ListGroup.Item action id="wd-new-analytics"            className="d-flex align-items-center">
          <FaChartBar className="me-2" /> New Analytics
        </ListGroup.Item>
        <ListGroup.Item action id="wd-view-course-notifications" className="d-flex align-items-center">
          <FaBell className="me-2" /> View Course Notifications
        </ListGroup.Item>
      </ListGroup>
    </section>
  );
}
