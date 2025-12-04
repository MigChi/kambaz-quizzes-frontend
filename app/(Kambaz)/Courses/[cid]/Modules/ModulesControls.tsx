"use client";
import { Button, Dropdown } from "react-bootstrap";
import { FaPlus } from "react-icons/fa6";
import GreenCheckmark from "./GreenCheckmark";

type Props = {
  onAddModule?: () => void;
};

export default function ModulesControls({ onAddModule }: Props) {
  return (
    <div id="wd-modules-controls" className="d-flex align-items-center gap-2 flex-wrap">
      <Button variant="secondary" id="wd-collapse-all">Collapse All</Button>
      <Button variant="secondary" id="wd-view-progress">View Progress</Button>

      <Dropdown>
        <Dropdown.Toggle variant="secondary" id="wd-publish-all-btn">
          <GreenCheckmark /> Publish All
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item id="wd-publish-all">Publish all modules and items</Dropdown.Item>
          <Dropdown.Item id="wd-publish-modules-only">Publish modules only</Dropdown.Item>
          <Dropdown.Item id="wd-unpublish-all">Unpublish all modules and items</Dropdown.Item>
          <Dropdown.Item id="wd-unpublish-modules-only">Unpublish modules only</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <Button
        variant="danger"
        id="wd-add-module-btn"
        onClick={onAddModule}
        aria-label="Add module"
      >
        <FaPlus className="me-2" /> Module
      </Button>
    </div>
  );
}
