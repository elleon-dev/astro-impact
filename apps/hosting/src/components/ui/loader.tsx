import React from "react";
import { Commet } from "react-loading-indicators";

interface LoaderProps {
  size?: "small" | "medium" | "large";
  color?: string;
  text?: string;
  textColor?: string;
}

export const Loader = ({ size, color, text, textColor }: LoaderProps) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center gap-2 bg-[rgba(0,0,0,0.9)] text-primary">
      <Commet
        size={size || "medium"}
        color={color || "#f25c05"}
        textColor={textColor || "#f25c05"}
      />
      {text && <p className="font-venus text-xs">{text}</p>}
    </div>
  );
};
