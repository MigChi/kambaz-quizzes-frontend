"use client";
import { Nav, NavItem, NavLink } from "react-bootstrap";
import Link from "next/link";
export default function TOC() {
 return (
   <Nav variant="pills">
     <NavItem>
       <NavLink href="/" as={Link}>
         Kambaz </NavLink> </NavItem>
     <NavItem>
       <NavLink id="wd-github-frontend" href="https://github.com/MigChi/kambaz-quizzes-frontend">Frontend Repo</NavLink>
     </NavItem>
     <NavItem>
       <NavLink id="wd-github-backend" href="https://github.com/MigChi/kambaz-quizzes-backend">Backend Repo</NavLink>
     </NavItem>
   </Nav>
);}
