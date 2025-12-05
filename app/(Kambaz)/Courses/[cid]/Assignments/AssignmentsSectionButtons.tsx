import { IoEllipsisVertical } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";

export default function AssignmentsSectionButtons() {
  return (
    <div className="float-end d-flex align-items-center gap-2">
      <span className="badge rounded-pill border border-black text-black bg-transparent px-3 py-2">
        40% of Total
      </span>
      <FaPlus className="fs-5" />
      <IoEllipsisVertical className="fs-4" />
    </div>
  );
}