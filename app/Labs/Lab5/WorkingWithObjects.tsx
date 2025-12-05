"use client"
import React, { useState } from "react";
import { FormControl } from "react-bootstrap";
const HTTP_SERVER = process.env.NEXT_PUBLIC_HTTP_SERVER;
export default function WorkingWithObjects() {
  const [assignment, setAssignment] = useState({
    id: 1, title: "NodeJS Assignment",
    description: "Create a NodeJS server with ExpressJS",
    due: "2021-10-10", completed: false, score: 0,
  });
  const [moduleObj, setModuleObj] = useState({
    id: "m101",
    name: "Intro to Web Dev",
    description: "Basics of HTML/CSS/JS",
    course: "CS4550"
  });
  const ASSIGNMENT_API_URL = `${HTTP_SERVER}/lab5/assignment`
  const MODULE_API_URL = `${HTTP_SERVER}/lab5/module`;
  return (
    <div id="wd-working-with-objects">
      <h3>Working With Objects</h3>
      <h4>Modifying Properties</h4>
      <a id="wd-update-assignment-title"
         className="btn btn-primary float-end"
         href={`${ASSIGNMENT_API_URL}/title/${assignment.title}`}>
        Update Title </a>
      <FormControl className="w-75" id="wd-assignment-title"
        defaultValue={assignment.title} onChange={(e) =>
          setAssignment({ ...assignment, title: e.target.value })}/>
      <hr />
      <h4>Update Module Name</h4>

      <FormControl
       className="w-75"
       value={moduleObj.name}
       onChange={(e) =>
         setModuleObj({ ...moduleObj, name: e.target.value })
      }/>

      <a className="btn btn-primary mt-2"
        href={`${MODULE_API_URL}/name/${moduleObj.name}`}>
        Update Module Name
      </a>
      <hr />
      <h4>Update Module Description</h4>

     <FormControl
      className="w-75"
      value={moduleObj.description}
      onChange={(e) =>
        setModuleObj({ ...moduleObj, description: e.target.value })
      }/>

      <a className="btn btn-warning mt-2"
       href={`${MODULE_API_URL}/description/${moduleObj.description}`}>
       Update Description
      </a>
      <hr />
      <h4>Update Assignment Score</h4>

     <FormControl
       className="w-25"
       type="number"
       value={assignment.score}
       onChange={(e) =>
        setAssignment({ ...assignment, score: Number(e.target.value) })
      }/>

      <a className="btn btn-success mt-2"
        href={`${ASSIGNMENT_API_URL}/score/${assignment.score}`}>
        Update Score
      </a>
      <hr />
      <h4>Update Assignment Completed</h4>

      <input type="checkbox"
       checked={assignment.completed}
       onChange={(e) =>
         setAssignment({ ...assignment, completed: e.target.checked })
       }/>

      <a className="btn btn-info ms-2"
        href={`${ASSIGNMENT_API_URL}/completed/${assignment.completed}`}>
        Update Completed
      </a>

      <h4>Retrieving Objects</h4>
      <a id="wd-retrieve-assignments" className="btn btn-primary"
         href={`${HTTP_SERVER}/lab5/assignment`}>
        Get Assignment
      </a>
      <h4>Module</h4>
      <a id="wd-retrieve-module" className="btn btn-primary"
        href={`${MODULE_API_URL}`}>
        Get Module
      </a><hr/>
      <h4>Retrieving Properties</h4>
      <a id="wd-retrieve-assignment-title" className="btn btn-primary"
         href={`${HTTP_SERVER}/lab5/assignment/title`}>
        Get Title
      </a>
      <a id="wd-retrieve-module-name" className="btn btn-secondary ms-2"
        href={`${MODULE_API_URL}/name`}>
        Get Module Name
      </a><hr/>
    </div>
);}
