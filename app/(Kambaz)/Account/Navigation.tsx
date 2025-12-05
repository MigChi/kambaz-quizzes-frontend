/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";

export default function AccountNavigation() {
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const pathname = usePathname();

  // Base links
  let links: string[];

  if (!currentUser) {
    // Not logged in
    links = ["Signin", "Signup"];
  } else {
    // Logged in
    links = ["Profile"];
    // Only admins get the Users link
    if (currentUser.role === "ADMIN") {
      links.push("Users");
    }
  }

  return (
    <div id="wd-account-navigation" className="wd list-group fs-5 rounded-0">
      {links.map((link) => {
        const active = pathname.toLowerCase().endsWith(link.toLowerCase());
        return (
          <Link
            key={link}
            href={link} // "Profile" -> /Account/Profile, "Users" -> /Account/Users
            id={`wd-${link.toLowerCase()}-link`}
            className={`list-group-item border-0 ${
              active ? "active" : "text-danger"
            }`}
          >
            {link}
          </Link>
        );
      })}
    </div>
  );
}
