"use client";

import { useEffect, useState } from "react";
import * as client from "./client";
import { FormControl } from "react-bootstrap";

type Assignment = {
  id: number;
  title: string;
  description: string;
  due: string;
  completed: boolean;
  score: number;
};

export default function WorkingWithObjectsAsynchronously() {
  const [assignment, setAssignment] = useState<Assignment>({
    id: 0,
    title: "",
    description: "",
    due: "",
    completed: false,
    score: 0,
  });

  const fetchAssignment = async () => {
    const remoteAssignment = await client.fetchAssignment();
    setAssignment(remoteAssignment as Assignment);
  };

  const updateTitle = async () => {
    const updated = await client.updateTitle(assignment.title);
    setAssignment(updated as Assignment);
  };

  useEffect(() => {
    fetchAssignment();
  }, []);

  return (
    <div id="wd-asynchronous-objects">
      <h3>Working with Objects Asynchronously</h3>
      <h4>Assignment</h4>

      <FormControl
        defaultValue={assignment.title}
        className="mb-2"
        onChange={(e) =>
          setAssignment({ ...assignment, title: e.target.value })
        }
      />

      <FormControl
        as="textarea"
        rows={3}
        defaultValue={assignment.description}
        className="mb-2"
        onChange={(e) =>
          setAssignment({ ...assignment, description: e.target.value })
        }
      />

      <FormControl
        type="date"
        className="mb-2"
        defaultValue={assignment.due}
        onChange={(e) =>
          setAssignment({ ...assignment, due: e.target.value })
        }
      />

      <div className="form-check form-switch mb-2">
        <input
          className="form-check-input"
          type="checkbox"
          id="wd-completed"
          defaultChecked={assignment.completed}
          onChange={(e) =>
            setAssignment({ ...assignment, completed: e.target.checked })
          }
        />
        <label className="form-check-label" htmlFor="wd-completed">
          Completed
        </label>
      </div>

      <button className="btn btn-primary mb-2" onClick={updateTitle}>
        Update Title
      </button>

      <pre>{JSON.stringify(assignment, null, 2)}</pre>
      <hr />
    </div>
  );
}
