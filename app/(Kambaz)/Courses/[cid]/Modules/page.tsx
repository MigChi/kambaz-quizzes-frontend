/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FormControl, ListGroup, ListGroupItem } from "react-bootstrap";
import ModulesControls from "./ModulesControls";
import LessonControlButtons from "./LessonControlButtons";
import ModuleControlButtons from "./ModuleControlButtons";
import { BsGripVertical } from "react-icons/bs";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { editModule, updateModule, setModules } from "./reducer";
import { useSelector, useDispatch } from "react-redux";
import * as client from "../../client";

export default function Modules() {
  const { cid } = useParams();
  const [moduleName, setModuleName] = useState("");
  const dispatch = useDispatch();

  const { modules } = useSelector((state: any) => state.modulesReducer);
  const { currentUser } = useSelector((state: any) => state.accountReducer);

  const isFaculty =
    currentUser?.role === "FACULTY" || currentUser?.role === "ADMIN";

  const onCreateModuleForCourse = async () => {
    if (!isFaculty) return;             
    if (!cid || !moduleName.trim()) return;

    const newModule = { name: moduleName };
    const serverModule = await client.createModuleForCourse(
      cid as string,
      newModule
    );
    dispatch(setModules([...modules, serverModule]));
    setModuleName("");
  };

  const onRemoveModule = async (moduleId: string) => {
    if (!isFaculty) return;              
    if (!cid) return;

    await client.deleteModule(cid as string, moduleId);
    dispatch(setModules(modules.filter((m: any) => m._id !== moduleId)));
  };

  const onUpdateModule = async (module: any) => {
    if (!isFaculty) return;              
    if (!cid) return;

    const updated = await client.updateModule(cid as string, module);
    const newModules = modules.map((m: any) =>
      m._id === updated._id ? updated : m
    );
    dispatch(setModules(newModules));
  };

  const fetchModules = async () => {
    if (!cid) return;
    const serverModules = await client.findModulesForCourse(cid as string);
    dispatch(setModules(serverModules));
  };

  useEffect(() => {
    fetchModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cid]);

  return (
    <div>
      {/* 🔒 Only faculty/admin see the "New Module" controls */}
      {isFaculty && (
        <>
          <ModulesControls
            setModuleName={setModuleName}
            moduleName={moduleName}
            addModule={onCreateModuleForCourse}
          />

          <br />
          <br />
          <br />
          <br />
        </>
      )}

      <ListGroup id="wd-modules" className="rounded-0">
        {modules.map((module: any) => (
          <ListGroupItem
            className="wd-module p-0 mb-5 fs-5 border-gray"
            key={module._id}
          >
            <div className="wd-title p-3 ps-2 bg-secondary">
              <BsGripVertical className="me-2 fs-3" />

              {/* Students just see the name; faculty can toggle editing */}
              {!module.editing && module.name}

              {module.editing && isFaculty && (
                <FormControl
                  className="w-50 d-inline-block"
                  value={module.name}
                  onChange={(e) =>
                    dispatch(
                      updateModule({ ...module, name: e.target.value })
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onUpdateModule({ ...module, editing: false });
                    }
                  }}
                />
              )}

              {/* 🔒 Only faculty/admin get edit/delete controls */}
              {isFaculty && (
                <ModuleControlButtons
                  moduleId={module._id}
                  deleteModule={(moduleId) => onRemoveModule(moduleId)}
                  editModule={(moduleId) => dispatch(editModule(moduleId))}
                />
              )}
            </div>

            {module.lessons && module.lessons.length > 0 && (
              <ListGroup className="wd-lessons rounded-0">
                {module.lessons.map((lesson: any) => (
                  <ListGroupItem
                    className="wd-lesson p-3 ps-1"
                    key={lesson._id}
                  >
                    <BsGripVertical className="me-2 fs-3" /> {lesson.name}
                    {/* 🔒 Only faculty/admin get lesson control buttons */}
                    {isFaculty && <LessonControlButtons />}
                  </ListGroupItem>
                ))}
              </ListGroup>
            )}
          </ListGroupItem>
        ))}
      </ListGroup>

      {modules.length === 0 && (
        <div className="text-muted">No modules for this course yet.</div>
      )}
    </div>
  );
}
