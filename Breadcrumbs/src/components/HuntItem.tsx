import React from "react";
import styles from "../styles/HuntContent.module.css";

interface HuntItemProps {
  huntName: string;
  huntId?: string;
  creator?: string;
  timeLeft?: number;
  onClick: () => void;
  isSelected: boolean;
}

const HuntItem: React.FC<HuntItemProps> = ({
  huntName,
  huntId,
  creator,
  timeLeft,
  onClick,
  isSelected,
}) => {
  const formatTimeLeft = (hours?: number) => {
    if (hours === undefined || hours === null) return "Time unknown";
    
    if (hours <= 0) {
      return "Expired";
    } else if (hours === 1) {
      return "1 hr left";
    } else if (hours < 24) {
      return `${hours} hrs left`;
    } else {
      const days = Math.floor(hours / 24);
      return days === 1 ? "1 day left" : `${days} days left`;
    }
  };

  return (
    <div
      className={`${styles.huntCard} ${
        isSelected ? styles.huntCardSelected : styles.huntCard
      }`}
      onClick={onClick}
    >
      <div className={styles.huntCardHeader}>
        <h4 className={styles.huntName}>{huntName}</h4>
        <span className={styles.timeLeft}>{formatTimeLeft(timeLeft)}</span>
      </div>
      <div className={styles.creatorName}>
        <span>Created by:</span>
        <span>{creator || "Unknown"}</span>
      </div>
    </div>
  );
};

export default HuntItem;