"use client";
import { IoEllipsisVertical } from "react-icons/io5";
import { FaPlus, FaTrash, FaPen } from "react-icons/fa6";

type Props = {
  editing?: boolean;
  onEdit?: () => void;
  onUpdate?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
};

export default function ModuleControlButtons({
  editing,
  onEdit,
  onUpdate,
  onCancel,
  onDelete,
}: Props) {
  return (
    <div className="float-end d-flex align-items-center gap-2">
      <FaPlus className="me-2" />

      {editing ? (
        <>
          <button
            id="wd-update-module-click"
            className="btn btn-sm btn-warning"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onUpdate?.();
            }}
          >
            Update
          </button>
          <button
            id="wd-cancel-edit-module-click"
            className="btn btn-sm btn-secondary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCancel?.();
            }}
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <button
            id="wd-edit-module-click"
            className="btn btn-sm btn-warning d-flex align-items-center gap-1"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit?.();
            }}
          >
            <FaPen /> Edit
          </button>
          <button
            id="wd-delete-module-click"
            className="btn btn-sm btn-danger"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete?.();
            }}
            aria-label="Delete module"
          >
            <FaTrash />
          </button>
        </>
      )}

      <IoEllipsisVertical className="fs-4" />
    </div>
  );
}
