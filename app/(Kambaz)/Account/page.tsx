// app/(Kambaz)/Account/page.tsx
"use client";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import type { RootState } from "../Courses/[cid]/store";

export default function AccountPage() {
  const user = useSelector((s: RootState) => s.account.currentUser);
  const router = useRouter();

  useEffect(() => {
    router.replace(user ? "/Account/Profile" : "/Account/Signin");
  }, [user, router]);

  return null;
}
