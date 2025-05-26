import React from "react";
import styles from "../styles/HuntContent.module.css";
import AvailableHunts from "./AvailableHunts";
import CreateHunt from "./CreateHunt";
import ActiveHunts from "./ActiveHunts";
import CompletedHunts from "./CompletedHunts";

type NavOption = "available" | "create" | "active" | "completed";

interface HuntContentProps {
  activeOption: NavOption;
  onOptionChange: (option: NavOption) => void;
}

const HuntContent: React.FC<HuntContentProps> = ({
  activeOption,
  onOptionChange,
}) => {
  const handleAcceptHunt = (huntId: string) => {
    console.log("Accepted hunt ID:", huntId);
    onOptionChange("active");
  };

  const handleCreateHunt = () => {
    console.log("created hunt");
    onOptionChange("available");
  };

  const renderContent = () => {
    switch (activeOption) {
      case "available":
        return <AvailableHunts onAcceptHunt={handleAcceptHunt} />;
      case "create":
        return <CreateHunt onCreateHunt={handleCreateHunt} />;
      case "active":
        return <ActiveHunts onHuntCompleted={() => onOptionChange("completed")}/>;
      case "completed":
        return <CompletedHunts />;
      default:
        return null;
    }
  };

  return <div className={styles.huntContent}>{renderContent()}</div>;
};

export default HuntContent;