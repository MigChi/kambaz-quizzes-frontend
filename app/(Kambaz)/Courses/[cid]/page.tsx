import { redirect } from "next/navigation";

export default function CoursePage({ params }: { params: { cid: string } }) {
  redirect(`/Courses/${params.cid}/Home`);
}