"use client";

import { useEffect, useState } from "react";
import type { User } from "../../../../Account/reducer";
import { useParams } from "next/navigation";
import * as peopleClient from "../client";

export default function PeopleTable() {
  const { cid } = useParams<{ cid: string }>();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!cid) return;
      const data = await peopleClient.fetchUsersForCourse(cid as string);
      setUsers(data);
    };

    void load();
  }, [cid]);

  return (
    <div id="wd-people-table" className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>NAME</th>
            <th>ROLE</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>
                {u.firstName ?? ""} {u.lastName ?? ""}
                <div className="text-muted small">{u.username}</div>
              </td>
              <td>{(u.role ?? "").toString().toUpperCase()}</td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={2} className="text-muted">
                No people enrolled.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
