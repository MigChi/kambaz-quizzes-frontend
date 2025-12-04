"use client";
import { Nav, NavItem, NavLink } from "react-bootstrap";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function TOC() {
 const pathname = usePathname();
 return (
   <Nav variant="pills" className="flex-row">
     <NavItem>
       <NavLink href="/" as={Link}>Kambaz</NavLink>
     </NavItem>
     <NavItem>
       <NavLink href="https://github.com/V-O-I-D-E-D">Brian Mack (Section: ##) - GitHub Link</NavLink>
     </NavItem>
     <NavItem>
       <NavLink href="https://github.com/MigChi">Miguel Chica (Section: 01) - GitHub Link</NavLink>
     </NavItem>
   </Nav>
);}
