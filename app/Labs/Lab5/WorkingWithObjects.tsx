"use client";

import { useState } from "react";
import { FormControl } from "react-bootstrap";

const HTTP_SERVER = process.env.NEXT_PUBLIC_HTTP_SERVER;

export default function WorkingWithObjects() {
  const [assignment, setAssignment] = useState({
    id: 1,
    title: "NodeJS Assignment",
    description: "Create a NodeJS server with ExpressJS",
    due: "2021-10-10",
    completed: false,
    score: 0,
  });

  const [moduleObj, setModuleObj] = useState({
    id: "M101",
    name: "Server-side Development",
    description: "Learn Node.js and Express.js",
    course: "CS4550",
  });

  const ASSIGNMENT_API_URL = `${HTTP_SERVER}/lab5/assignment`;
  const MODULE_API_URL = `${HTTP_SERVER}/lab5/module`;

  return (
    <div id="wd-working-with-objects">
      <h3>Working With Objects</h3>

      <h4>Retrieving Objects</h4>
      <a
        id="wd-retrieve-assignments"
        className="btn btn-primary me-2"
        href={ASSIGNMENT_API_URL}
      >
        Get Assignment
      </a>
      <a
        id="wd-retrieve-module"
        className="btn btn-secondary"
        href={MODULE_API_URL}
      >
        Get Module
      </a>
      <hr />

      <h4>Retrieving Properties</h4>
      <a
        id="wd-retrieve-assignment-title"
        className="btn btn-primary me-2"
        href={`${ASSIGNMENT_API_URL}/title`}
      >
        Get Assignment Title
      </a>
      <a
        id="wd-retrieve-module-name"
        className="btn btn-secondary"
        href={`${MODULE_API_URL}/name`}
      >
        Get Module Name
      </a>
      <hr />

      <h4>Modifying Properties</h4>
      <a
        id="wd-update-assignment-title"
        className="btn btn-primary float-end"
        href={`${ASSIGNMENT_API_URL}/title/${encodeURIComponent(
          assignment.title
        )}`}
      >
        Update Title
      </a>
      <FormControl
        className="w-75 mb-3"
        id="wd-assignment-title"
        defaultValue={assignment.title}
        onChange={(e) =>
          setAssignment({
            ...assignment,
            title: e.target.value,
          })
        }
      />

      <h5>Assignment Score & Completed</h5>
      <div className="mb-2">
        <a
          id="wd-update-assignment-score"
          className="btn btn-primary me-2"
          href={`${ASSIGNMENT_API_URL}/score/${assignment.score}`}
        >
          Update Score
        </a>
        <a
          id="wd-update-assignment-completed"
          className="btn btn-secondary"
          href={`${ASSIGNMENT_API_URL}/completed/${assignment.completed}`}
        >
          Update Completed
        </a>
      </div>
      <div className="mb-2">
        <FormControl
          type="number"
          className="w-25 d-inline me-2"
          id="wd-assignment-score"
          defaultValue={assignment.score}
          onChange={(e) =>
            setAssignment({
              ...assignment,
              score: parseInt(e.target.value || "0", 10),
            })
          }
        />
        <div className="form-check d-inline-block">
          <input
            id="wd-assignment-completed"
            className="form-check-input"
            type="checkbox"
            checked={assignment.completed}
            onChange={(e) =>
              setAssignment({
                ...assignment,
                completed: e.target.checked,
              })
            }
          />
          <label
            className="form-check-label ms-1"
            htmlFor="wd-assignment-completed"
          >
            Completed
          </label>
        </div>
      </div>
      <hr />

      <h4>Module</h4>

      <h5>Module Name</h5>
      <a
        id="wd-update-module-name"
        className="btn btn-primary float-end"
        href={`${MODULE_API_URL}/name/${encodeURIComponent(
          moduleObj.name
        )}`}
      >
        Update Module Name
      </a>
      <FormControl
        className="w-75 mb-3"
        id="wd-module-name"
        defaultValue={moduleObj.name}
        onChange={(e) =>
          setModuleObj({
            ...moduleObj,
            name: e.target.value,
          })
        }
      />

      <h5>Module Description</h5>
      <a
        id="wd-update-module-description"
        className="btn btn-secondary float-end"
        href={`${MODULE_API_URL}/description/${encodeURIComponent(
          moduleObj.description
        )}`}
      >
        Update Module Description
      </a>
      <FormControl
        as="textarea"
        rows={3}
        className="w-75 mb-3"
        id="wd-module-description"
        defaultValue={moduleObj.description}
        onChange={(e) =>
          setModuleObj({
            ...moduleObj,
            description: e.target.value,
          })
        }
      />

      <hr />
    </div>
  );
}
