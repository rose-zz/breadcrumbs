import React from "react";
import "material/button/outlined-button.js";
import "material/button/filled-button.js";

interface Props {
  children?: string;
  type?: string;
  buttonType?: "outlined" | "filled";
  color?: "primary" | "secondary" | "tertiary" | "custom" | "error";
  onClick?: () => void;
  disabled?: boolean;
  hasIcon?: boolean;
  iconURL?: string;
}

const Button = ({
  children,
  onClick,
  type = "submit",
  buttonType = "filled",
  color = "primary",
  disabled,
  hasIcon = false,
  iconURL,
}: Props) => {
  const tagName = `md-${buttonType}-button`;

  let buttonStyle: React.CSSProperties = {};

  if (buttonType === "filled") {
    switch (color) {
      case "primary":
        buttonStyle = {
          "--md-filled-button-container-color": "var(--md-sys-color-primary)",
          backgroundColor: "var(--md-sys-color-primary)",
        };
        break;
      case "secondary":
        buttonStyle = {
          "--md-filled-button-container-color":
            "var(--md-sys-color-secondary-container)",
          backgroundColor: "var(--md-sys-color-secondary-container)",
        };
        break;
      case "tertiary":
        buttonStyle = {
          "--md-filled-button-container-color": "var(--md-sys-color-tertiary)",
          backgroundColor: "var(--md-sys-color-tertiary)",
        };
        break;
      case "custom":
        buttonStyle = {
          "--md-filled-button-container-color": "rgba(56, 102, 101, 1)",
          backgroundColor: "rgba(56, 102, 101, 1)",
        };
        break;
      case "error":
        buttonStyle = {
          "--md-filled-button-container-color": "var(--md-sys-color-error)",
          backgroundColor: "var(--md-sys-color-error)",
        };
        break;
      default:
        buttonStyle = {
          "--md-filled-button-container-color": "var(--md-sys-color-primary)",
          backgroundColor: "var(--md-sys-color-primary)",
        };
    }
  } else if (buttonType === "outlined") {
    switch (color) {
      case "primary":
        buttonStyle = {
          "--md-outlined-button-container-color": "var(--md-sys-color-primary)",
          "--md-outlined-button-text-color": "var(--md-sys-color-primary)",
        };
        break;
      case "secondary":
        buttonStyle = {
          "--md-outlined-button-container-color":
            "var(--md-sys-color-secondary-container)",
          "--md-outlined-button-text-color":
            "var(--md-sys-color-secondary-container)",
        };
        break;
      case "tertiary":
        buttonStyle = {
          "--md-outlined-button-container-color":
            "var(--md-sys-color-tertiary)",
          "--md-outlined-button-text-color": "var(--md-sys-color-tertiary)",
        };
        break;
      case "custom":
        buttonStyle = {
          "--md-outlined-button-container-color": "rgba(56, 102, 101, 1)",
          "--md-outlined-button-text-color": "rgba(56, 102, 101, 1)",
        };
        break;
      case "error":
        buttonStyle = {
          "--md-outlined-button-container-color": "var(--md-sys-color-error)",
          "--md-outlined-button-text-color": "var(--md-sys-color-error)",
        };
        break;
      default:
        buttonStyle = {
          "--md-outlined-button-container-color": "var(--md-sys-color-primary)",
          "--md-outlined-button-text-color": "var(--md-sys-color-primary)",
        };
    }
  }

  return React.createElement(
    tagName,
    {
      type: type,
      onClick,
      disabled,
      style: buttonStyle,
      hasIcon: hasIcon,
    },
    // Icon only appears if hasIco is true
    hasIcon && iconURL ? (
      <svg slot="icon" viewBox="0 -3 16 16" width="48" height="48">
        <path d={iconURL} />
      </svg>
    ) : null,
    children
  );
};

export default Button;
