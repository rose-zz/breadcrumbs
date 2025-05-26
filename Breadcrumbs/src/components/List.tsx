import React from "react";
import ListItem from "./ListItem";
import "material/list/list";
import { useState } from "react";

interface ListProps {
  items: {
    text: string;
    onClickButton?: () => void;
    buttonText?: string;
  }[];
}

const List: React.FC<ListProps> = ({ items }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <div>
      <md-list>
        {items.map((item, index) => (
          <ListItem
            key={index}
            text={item.text}
            onClickButton={() => {
              setSelectedIndex(index);
              if (item.onClickButton) item.onClickButton();
            }}
            buttonText={item.buttonText}
            selected={selectedIndex === index}
          />
        ))}
      </md-list>
    </div>
  );
};

export default List;
