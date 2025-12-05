/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Row, Col, Button, InputGroup, Form, ButtonGroup } from "react-bootstrap";
import { FaPlus, FaSearch } from "react-icons/fa";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";

export default function AssignmentControls() {
  const router = useRouter();
  const { cid } = useParams<{ cid: string }>();
  const { currentUser } = useSelector((s: any) => s.accountReducer);
  const isFaculty = currentUser?.role === "FACULTY" || currentUser?.role === "ADMIN";

  if (!isFaculty) return null;

  return (
    <div id="wd-assignment-controls" className="mb-2">
      <Row className="align-items-center g-2">
        <Col xs={12} md={5}>
          <InputGroup>
            <InputGroup.Text className="bg-white">
              <FaSearch />
            </InputGroup.Text>
            <Form.Control placeholder="Search for Assignment" />
          </InputGroup>
        </Col>

        <Col xs={12} md className="d-flex justify-content-md-end gap-2">
          <ButtonGroup>
            <Button variant="secondary" id="wd-group" size="lg">
              <span className="d-inline-flex align-items-center text-nowrap">
                <FaPlus className="me-2" /> Group
              </span>
            </Button>
          </ButtonGroup>

          <ButtonGroup>
            <Button
              variant="danger"
              id="wd-assignment"
              size="lg"
              onClick={() => router.push(`/Courses/${cid}/Assignments/new`)}
            >
              <span className="d-inline-flex align-items-center text-nowrap">
                <FaPlus className="me-2" /> Assignment
              </span>
            </Button>
          </ButtonGroup>
        </Col>
      </Row>
    </div>
  );
}
