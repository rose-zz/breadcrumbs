import React, { } from "react";
import styles from "../styles/HuntNavBar.module.css";

type NavOption = "friends" | "requests" | "add";

interface HuntNavBarProps {
  activeOption: NavOption;
  onOptionChange: (option: NavOption) => void;
}

const Tabs: React.FC<HuntNavBarProps> = ({ activeOption, onOptionChange }) => {
  return (
    <div className={styles.huntNavBar}>
      <div
        className={`${styles.navOption} ${
          activeOption === "friends" ? styles.active : ""
        }`}
        onClick={() => onOptionChange("friends")}
      >
        <span>friends</span>
      </div>

      <div
        className={`${styles.navOption} ${
          activeOption === "add" ? styles.active : ""
        }`}
        onClick={() => onOptionChange("add")}
      >
        <span>add</span>
      </div>

      <div
        className={`${styles.navOption} ${
          activeOption === "requests" ? styles.active : ""
        }`}
        onClick={() => onOptionChange("requests")}
      >
        <span>requests</span>
      </div>
    </div>
  );
};

export default Tabs;
