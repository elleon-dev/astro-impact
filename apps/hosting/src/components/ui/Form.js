import React from "react";

export const Form = ({ children, ...props }) => {
  return (
    <form noValidate autoComplete="off" {...props} className="space-y-6">
      {children}
    </form>
  );
};