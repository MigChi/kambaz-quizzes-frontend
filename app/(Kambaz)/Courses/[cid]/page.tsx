import { redirect } from "next/navigation";

export default async function Page({ params }: PageProps<"/Courses/[cid]">) {
  const { cid } = await params;
  redirect(`/Courses/${cid}/Home`);
}