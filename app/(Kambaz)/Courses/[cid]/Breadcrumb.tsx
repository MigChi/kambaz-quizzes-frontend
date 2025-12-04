"use client";
import React from "react";
import { usePathname } from "next/navigation";

export default function Breadcrumb({
  course,
}: { course: { name: string } | undefined }) {
  const pathname = usePathname();
  const parts = pathname?.split("/") ?? [];
  const section = parts[3] || "";
  const pretty = section ? section.charAt(0).toUpperCase() + section.slice(1) : "";

  return (
    <span className="text-danger">
      {course?.name ?? "Course"}{pretty ? ` > ${pretty}` : ""}
    </span>
  );
}
