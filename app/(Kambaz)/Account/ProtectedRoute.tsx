"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import type { RootState } from "../Courses/[cid]/store";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useSelector((s: RootState) => s.account.currentUser);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/Account/Signin");
  }, [user, router]);

  if (!user) return null; // while redirecting
  return <>{children}</>;
}
