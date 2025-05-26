import React, { useState, useEffect } from "react";
import "material/textfield/outlined-text-field";

interface TextEntryProps {
  onTextChange: (newText: string) => void;
  value?: string;
  height?: string;
  width?: string;
  body?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  maximum?: number;
}

const TextEntry = ({
  onTextChange,
  value = "",
  height,
  width = "20vw",
  type,
  placeholder,
  disabled = false,
  maximum = 200,
}: TextEntryProps) => {
  const [text, setText] = useState("");

  useEffect(() => {
    setText(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= 200) {
      setText(e.target.value);
      onTextChange(e.target.value);
    }
  };

  return (
    <div style={{ marginBlock: "1vh" }}>
      <md-outlined-text-field
        label={placeholder}
        maxLength={maximum}
        style={{
          height,
          width,
        }}
        value={text}
        onInput={handleChange}
        type={type}
        disabled={disabled}
      ></md-outlined-text-field>
    </div>
  );
};

export default TextEntry;
