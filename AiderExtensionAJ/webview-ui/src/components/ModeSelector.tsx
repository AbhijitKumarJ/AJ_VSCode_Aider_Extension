import React from "react";

interface ModeSelectorProps {
  mode: "edit" | "chat";
  setMode: (mode: "edit" | "chat") => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  mode,
  setMode,
}) => {
  return (
    <div className="mode-selector">
      <label>
        <input
          type="radio"
          value="edit"
          checked={mode === "edit"}
          onChange={() => setMode("edit")}
        />
        Edit Mode
      </label>
      <label>
        <input
          type="radio"
          value="chat"
          checked={mode === "chat"}
          onChange={() => setMode("chat")}
        />
        Chat Mode
      </label>
    </div>
  );
};
