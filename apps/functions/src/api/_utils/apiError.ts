import { isObject } from "lodash";

export interface ApiError {
  readonly isApiError: boolean; // only true
  message: string;
  key: "unknown" | "user/email_exists" | "user/user_doesn't_exist";
}

export interface CreateApiError extends Error {
  isApiError: true;
  apiError: ApiError;
}

export const isCreateApiError = (data: unknown): data is CreateApiError =>
  isObject(data) && "isApiError" in data;

export const createApiError = ({
  message,
  key,
}: Omit<ApiError, "isApiError">): CreateApiError => {
  const error = new Error(message) as CreateApiError;

  error.isApiError = true;
  error.apiError = apiError({
    message: message,
    key: key,
  });

  return error;
};

export const apiError = ({
  message,
  key,
}: Omit<ApiError, "isApiError">): ApiError => ({
  isApiError: true,
  message: message,
  key: key,
});

export const apiErrorList = (keys: ApiError["key"][]): ApiError[] =>
  keys.map((key) => ({
    key: key,
    message: "...",
    isApiError: true,
  }));
