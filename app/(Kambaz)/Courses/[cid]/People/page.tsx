/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PeopleTable from "./Table/page";
import * as coursesClient from "../../client";

export default function CoursePeoplePage() {
  const { cid } = useParams() as { cid: string };
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    if (!cid) return;
    try {
      const enrolledUsers = await coursesClient.findUsersForCourse(cid);
      console.log("enrolledUsers for", cid, enrolledUsers); // 👈 TEMP
      setUsers(enrolledUsers ?? []);
    } catch (e) {
      console.error("Error fetching users for course", cid, e);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cid]);

  return (
    <div>
      <h3>People</h3>
      <PeopleTable users={users} fetchUsers={fetchUsers} />
    </div>
  );
}
