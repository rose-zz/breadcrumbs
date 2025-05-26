import React from "react";
import "material/list/list-item";
import "material/divider/divider";
import "material/ripple/ripple";

interface Props {
  text: string;
  onClickButton?: () => void;
  onSecondClick?: () => void;
  buttonText?: string;
  selected: boolean;
}

const ListItem: React.FC<Props> = ({
  text,
  onClickButton,
  selected,
  // onClickItem,
}) => {
  const handleClick = () => {
    if (onClickButton) onClickButton();
  };
  return (
    <div>
      <md-list-item
        onClick={handleClick}
        className={selected ? "listitem-selected" : ""}
      >
        <strong>{text}</strong>
      </md-list-item>
      <md-divider></md-divider>
    </div>
  );
};

export default ListItem;
