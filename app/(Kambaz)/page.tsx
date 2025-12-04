"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import type { RootState } from "./Courses/[cid]/store";

export default function Kambaz() {
  const user = useSelector((s: RootState) => s.account.currentUser);
  const router = useRouter();

  useEffect(() => {
    router.replace(user ? "/Dashboard" : "/Account/Signin");
  }, [user, router]);

  return null;
}
