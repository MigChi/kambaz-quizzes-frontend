/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { FaPencil } from "react-icons/fa6";
import { FaCheck, FaUserCircle } from "react-icons/fa";
import { FormControl } from "react-bootstrap";
import * as client from "../../../Account/client";

export default function PeopleDetails({
  uid,
  onClose,
}: {
  uid: string | null;
  onClose: () => void;
}) {
  const [user, setUser] = useState<any>({});
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);

  const fetchUser = async () => {
    if (!uid) return;
    const u = await client.findUserById(uid);
    setUser(u);
    const fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
    setName(fullName);
  };

  useEffect(() => {
    if (uid) {
      fetchUser();
      setEditing(false);
    }
  }, [uid]);

  const deleteUser = async (userId: string) => {
    await client.deleteUser(userId);
    onClose();
  };

  const saveUser = async () => {
    // split "First Last ..." into first + rest-as-last
    const parts = (name || "").trim().split(" ");
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ") || "";

    const updatedUser = { ...user, firstName, lastName };

    // send updated user (including email + role from user state)
    const saved = await client.updateUser(updatedUser);
    setUser(saved ?? updatedUser);
    setEditing(false);
    onClose(); // navigate back to PeopleTable
  };

  if (!uid) return null;

  return (
    <div className="wd-people-details position-fixed top-0 end-0 bottom-0 bg-white p-4 shadow w-25">
      <button
        onClick={onClose}
        className="btn position-fixed end-0 top-0 wd-close-details"
      >
        <IoCloseSharp className="fs-1" />
      </button>

      <div className="text-center mt-2">
        <FaUserCircle className="text-secondary me-2 fs-1" />
      </div>
      <hr />

      {/* NAME + EDIT TOGGLE */}
      <div className="text-danger fs-4">
        {!editing && (
          <FaPencil
            onClick={() => setEditing(true)}
            className="float-end fs-5 mt-2 wd-edit"
          />
        )}
        {editing && (
          <FaCheck
            onClick={saveUser}
            className="float-end fs-5 mt-2 me-2 wd-save"
          />
        )}

        {!editing && (
          <div
            className="wd-name"
            onClick={() => setEditing(true)}
          >
            {user.firstName} {user.lastName}
          </div>
        )}

        {user && editing && (
          <FormControl
            className="w-50 wd-edit-name"
            defaultValue={`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                saveUser();
              }
            }}
          />
        )}
      </div>

      {/* EMAIL */}
      <b>Email:</b>{" "}
      {editing ? (
        <FormControl
          type="email"
          className="d-inline-block w-75 ms-1 wd-email"
          value={user.email ?? ""}
          onChange={(e) =>
            setUser({ ...user, email: e.target.value })
          }
        />
      ) : (
        <span className="wd-email ms-1">{user.email}</span>
      )}
      <br />

      {/* ROLE (dropdown similar to role filter) */}
      <b>Roles:</b>{" "}
      {editing ? (
        <select
          className="form-select d-inline-block w-50 ms-1 wd-role-select"
          value={user.role ?? "USER"}
          onChange={(e) =>
            setUser({ ...user, role: e.target.value })
          }
        >
          <option value="STUDENT">STUDENT</option>
          <option value="FACULTY">FACULTY</option>
          <option value="ADMIN">ADMIN</option>
          <option value="USER">USER</option>
        </select>
      ) : (
        <span className="wd-roles ms-1">{user.role}</span>
      )}
      <br />

      <b>Login ID:</b>{" "}
      <span className="wd-login-id">{user.loginId}</span> <br />
      <b>Section:</b>{" "}
      <span className="wd-section">{user.section}</span> <br />
      <b>Total Activity:</b>{" "}
      <span className="wd-total-activity">
        {user.totalActivity}
      </span>
      <hr />

      <button
        onClick={() => deleteUser(uid)}
        className="btn btn-danger float-end wd-delete"
      >
        Delete
      </button>
      <button
        onClick={onClose}
        className="btn btn-secondary float-end me-2 wd-cancel"
      >
        Cancel
      </button>
    </div>
  );
}
