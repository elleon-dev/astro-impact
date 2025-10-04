import React from "react";
import { twMerge } from "tailwind-merge";

export const TextArea = ({
  name,
  label,
  value,
  onChange,
  error = false,
  helperText,
  required = false,
  hidden = false,
  className,
  placeholder,
  rows = 4,
  resize = "vertical",
  autoComplete,
}) => {
  const handleChange = (e) => {
    onChange?.(e.target.value);
  };

  const resizeClasses = {
    none: "resize-none",
    both: "resize",
    horizontal: "resize-x",
    vertical: "resize-y",
  };

  return (
    <div className={twMerge("", hidden && "hidden")}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm/6 font-semibold text-secondary mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        id={name}
        name={name}
        value={value ?? ""}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        autoComplete={autoComplete}
        className={twMerge(
          "block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-600 placeholder:text-gray-500 transition-colors duration-200",
          "outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2",
          "min-h-[2.5rem]", // Minimum height to match input height
          resizeClasses[resize],
          error
            ? "outline-red-500 border-red-500 focus:outline-red-500"
            : "focus:outline-secondary/70 hover:outline-gray-400",
          className
        )}
        aria-describedby={error ? `${name}-error` : undefined}
        aria-invalid={error}
      />
      
      {error && helperText && (
        <p
          id={`${name}-error`}
          className="mt-1 text-sm text-red-600 scroll-error-anchor"
          role="alert"
        >
          {helperText}
        </p>
      )}
    </div>
  );
};