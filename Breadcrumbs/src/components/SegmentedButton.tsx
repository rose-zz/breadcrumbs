import React, { useState } from "react";
import "material/segmentedbutton/outlined-segmented-button.js";

interface Props {
  options: string[];
  passedValues: string[];
  onClickButton: (selectedOption: string) => void;
  altColor?: boolean;
}

const SegmentedButton: React.FC<Props> = ({
  options,
  onClickButton,
  passedValues,
  altColor = false,
}) => {
  const [selected, setSelected] = useState(options[0]);

  return (
    <div>
      <md-outlined-segmented-button-set hasIcon={false}>
        {options.map((option, index) => {
          const isSelected = selected === option;

          return (
            <md-outlined-segmented-button
              key={option}
              label={option}
              selected={isSelected}
              hasIcon={false}
              onClick={() => {
                setSelected(option);
                onClickButton(passedValues[index]);
              }}
              style={
                {
                  ...(altColor && {
                    "--_selected-container-color":
                      "var(--md-sys-color-tertiary-container)",
                  }),
                } as React.CSSProperties
              }
            >
              {" "}
            </md-outlined-segmented-button>
          );
        })}
      </md-outlined-segmented-button-set>
    </div>
  );
};

export default SegmentedButton;
