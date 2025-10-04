import React from "react";
import { twMerge } from "tailwind-merge";
import { Checkbox } from "./Checkbox";

export const CheckboxGroup = ({
  name,
  label,
  options,
  values = [],
  onChange,
  error = false,
  helperText,
  required = false,
  hidden = false,
  className,
  direction = "vertical",
  columns = 1,
  disabled = false,
}) => {
  const handleCheckboxChange = (optionValue, checked) => {
    if (!onChange) return;

    if (checked) {
      // Add value if not already present
      if (!values.includes(optionValue)) {
        onChange([...values, optionValue]);
      }
    } else {
      // Remove value
      onChange(values.filter((value) => value !== optionValue));
    }
  };

  const getGridClasses = () => {
    if (direction === "horizontal") {
      return "flex flex-wrap gap-4";
    }

    if (columns > 1) {
      const colsClass =
        {
          2: "grid-cols-2",
          3: "grid-cols-3",
          4: "grid-cols-4",
        }[columns] || "grid-cols-2";

      return `grid ${colsClass} gap-2`;
    }

    return "space-y-2";
  };

  return (
    <div className={twMerge("", hidden && "hidden", className)}>
      {label && (
        <div className="mb-3">
          <label className="block text-sm/6 font-semibold text-secondary">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
      )}

      <div
        className={getGridClasses()}
        role="group"
        aria-labelledby={label ? `${name}-label` : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        aria-invalid={error}
      >
        {options.map((option, index) => (
          <Checkbox
            key={`${name}-${option.value}-${index}`}
            name={`${name}-${option.value}`}
            checked={values.includes(option.value)}
            onChange={(checked) => handleCheckboxChange(option.value, checked)}
            error={false} // Individual checkboxes don't show errors, only the group
            disabled={disabled || option.disabled}
          >
            {option.label}
          </Checkbox>
        ))}
      </div>

      {error && helperText && (
        <p
          id={`${name}-error`}
          className="mt-2 text-sm text-red-600 scroll-error-anchor"
          role="alert"
        >
          {helperText}
        </p>
      )}
    </div>
  );
};
