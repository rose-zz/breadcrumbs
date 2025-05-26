import React from "react";
import "material/fab/fab.js";
import "material/icon/icon.js";

interface FABProps {
  onClick?: () => void;
  disabled?: boolean;
  iconURL: string;
}

const FAB: React.FC<FABProps> = ({ onClick, disabled, iconURL }) => {
  return (
    <md-fab
      lowered
      aria-label="Edit"
      onClick={onClick}
      disabled={disabled}
      style={{
        "--md-fab-lowered-container-color":
          "var(--md-sys-color-secondary-container)",
      }}
    >
      <svg slot="icon" viewBox="-2 -3 25 25" width="48" height="48">
        <path d={iconURL} />
      </svg>
    </md-fab>
  );
};
export default FAB;
