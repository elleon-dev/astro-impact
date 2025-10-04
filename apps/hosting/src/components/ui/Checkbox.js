import React from "react";
import { twMerge } from "tailwind-merge";
import { Check } from "lucide-react";

export const Checkbox = ({
  name,
  checked = false,
  onChange,
  error = false,
  helperText,
  required = false,
  hidden = false,
  disabled = false,
  children,
}) => {
  const handleChange = (e) => {
    if (!disabled) {
      onChange?.(e.target.checked);
    }
  };

  return (
    <div className={twMerge("", hidden && "hidden")}>
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <input
            id={name}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className={twMerge(
              "peer h-5 w-5 transition-all appearance-none rounded border-2 shadow-sm",
              "focus:ring-2 focus:ring-secondary/20 focus:ring-offset-2",
              disabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:shadow-md",
              error
                ? "border-red-500 focus:border-red-500"
                : "border-slate-300 hover:border-slate-400 checked:bg-secondary checked:border-secondary",
            )}
            aria-describedby={error ? `${name}-error` : undefined}
            aria-invalid={error}
          />
          <Check
            className={twMerge(
              "absolute inset-0 m-0.5 h-4 w-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity",
              disabled && "opacity-50",
            )}
            strokeWidth={3}
          />
        </div>

        <label
          htmlFor={name}
          className={twMerge(
            "text-sm text-slate-600 leading-5 flex-1",
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          )}
        >
          <span className="flex gap-1 items-start">
            {children}
            {required && <span className="text-red-500 text-base">*</span>}
          </span>
        </label>
      </div>

      {error && helperText && (
        <p
          id={`${name}-error`}
          className="text-sm text-red-600 scroll-error-anchor"
          role="alert"
        >
          {helperText}
        </p>
      )}
    </div>
  );
};
