import Modules from "../Modules/page";
import CourseStatus from "./Status";
export default function Home() {
 return (
   <div id="wd-home" className="row">
     {/* Main (Modules) */}
     <main className="col-12 col-md-9 col-xl-7">
       <Modules />
     </main>
     {/* Course Status (visible from md and up) */}
     <aside className="col-12 col-md-3 col-xl-3 d-none d-md-block">
       <CourseStatus />
     </aside>
   </div>
);}