{/* Miguel Chica */}

import Link from "next/link";
export default function Labs() {
 return (
   <div id="wd-labs">
     <h1>Labs</h1>
     <ul>
       <li>
         <Link href="/Labs/Lab1" id="wd-lab1-link">
           Lab 1: HTML Examples </Link>
       </li>
       <li>
         <Link href="/Labs/Lab2" id="wd-lab2-link">
           Lab 2: CSS Basics </Link>
       </li>
       <li>
         <Link href="/Labs/Lab3" id="wd-lab3-link">
           Lab 3: JavaScript Fundamentals </Link>
       </li>
       <li>
         <Link href="/Labs/Lab4" id="wd-lab4 -link">
           Lab 4: Maintaining State in React Apps </Link>
       </li>
       <li>
         <Link href="/Labs/Lab5" id="wd-lab5 -link">
           Lab 5 </Link>
       </li>
       <li>
         <Link href="/" id="wd-kambaz-link">
           Kambaz </Link>
       </li>
     </ul>
   </div>
);}
