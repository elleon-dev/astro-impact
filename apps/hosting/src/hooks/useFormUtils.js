import { useEffect } from "react";
import * as yup from "yup";
import { get, isEmpty, isString } from "lodash";

export const useFormUtils = ({ errors, schema }) => {
  // DEBUG: Log hook initialization and parameters
  console.log('[useFormUtils] Hook initialized with:', {
    errorsType: typeof errors,
    hasErrors: !isEmpty(errors),
    schemaType: typeof schema,
    schemaFields: schema.describe?.()?.fields || 'No fields'
  });

  useEffect(() => {
    !isEmpty(errors) && scrollIntoError();
  }, [errors]);

  const scrollIntoError = () => {
    const formItemErrors = document.getElementsByClassName(
      "scroll-error-anchor",
    );

    formItemErrors.length &&
      formItemErrors[0].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  };

  const errorDetail = (name) =>
    errors && get(errors, name);

  const errorMessage = (name) => {
    const errorObj = errors && get(errors, name);
    const message = errorObj?.message;

    return isString(message) ? message : undefined;
  };

  const error = (name) =>
    !!(errors && get(errors, name));

  const required = (name) => {
    const describe = schema.describe();

    const describePath = [];
    name.split(".").forEach((fieldName) => {
      describePath.push("fields");
      describePath.push(fieldName);
    });

    const fieldInfo = get(describe, describePath);

    const testsPath = [...describePath, "tests"];
    let tests = get(describe, testsPath, []);

    if (tests.length === 0) {
      tests = fieldInfo?.tests || [];
    }

    const hasRequiredTest = tests.some((test) => test.name === "required");

    const isNotOptional = fieldInfo?.optional === false;

    return hasRequiredTest || isNotOptional;
  };

  return { required, error, errorMessage, errorDetail };
};