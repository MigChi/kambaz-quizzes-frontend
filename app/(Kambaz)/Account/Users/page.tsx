"use client";

import { useEffect, useState } from "react";
import * as client from "../client";
import type { User } from "../reducer";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const list = await client.findAllUsers();
      setUsers(list);
    };
    fetchUsers();
  }, []);

  return (
    <div id="wd-users-screen">
      <h1>Users</h1>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Username</th>
            <th>Full name</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.username}</td>
              <td>{u.firstName} {u.lastName}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}