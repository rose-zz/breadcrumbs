import React from "react";
import HuntItem from "./HuntItem";
import "material/list/list";

interface HuntData {
  huntName: string;
  huntId: string;
  creator: string;
  timeLeft: number;
  currentNote?: number;
  totalNotes?: number;
}

interface HuntListProps {
  items: HuntData[];
  onItemClick: (hunt: HuntData) => void;
  selectedHuntID: string;
  emptyMessage?: string;
}

const HuntList: React.FC<HuntListProps> = ({
  items,
  onItemClick,
  selectedHuntID,
  emptyMessage = "No hunts available",
}) => {
  if (items.length === 0) {
    return (
      <div className="emptyList">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="list-container">
      {items.map((item) => (
        <HuntItem
          key={item.huntId}
          huntName={item.huntName}
          huntId={item.huntId}
          creator={item.creator}
          timeLeft={item.timeLeft}
          onClick={() => onItemClick(item)}
          isSelected={item.huntId === selectedHuntID}
        />
      ))}
    </div>
  );
};

export default HuntList;
