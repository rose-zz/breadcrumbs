import React from "react";
import styles from "../styles/HuntContent.module.css";

type NavOption = "friends" | "add" | "requests";

interface HuntContentProps {
  activeOption: NavOption;
  onOptionChange: (option: NavOption) => void;
}

const HuntContent: React.FC<HuntContentProps> = ({
  activeOption,
  onOptionChange,
}) => {

  const renderContent = () => {
    switch (activeOption) {
      case "friends":
        return <div>HEllo</div>;
      case "add":
        return <div>HEllo</div>;
      case "requests":
        return <div>HEllo</div>;
      default:
        return null;
    }
  };

  return <div className={styles.huntContent}>{renderContent()}</div>;
};

export default HuntContent;
