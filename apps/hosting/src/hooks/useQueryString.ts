import qs from "query-string";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";

const getQueryStringValue = (
  key: string,
  queryString = window.location.search
): string[] | string | null => {
  const values = qs.parse(queryString);
  return values[key];
};

type Return<T> = [T | string[] | string, (newValue: T) => void];

export const useQueryString = <T>(key: string, initialValue: T): Return<T> => {
  const navigate = useNavigate();

  const [value, setValue] = useState<T | string[] | string>(
    getQueryStringValue(key) || initialValue
  );

  const onSetValue = useCallback(
    (newValue: T) => {
      setValue(newValue);
      setQueryStringValue(key, newValue);
    },
    [key]
  );

  const setQueryStringValue = (
    key: string,
    value: unknown,
    queryString = window.location.search
  ) => {
    const values = qs.parse(queryString);
    const newQsValue = qs.stringify({ ...values, [key]: value });
    setQueryStringWithoutPageReload(`?${newQsValue}`);
  };

  const setQueryStringWithoutPageReload = (qsValue: string): void => {
    navigate({
      pathname: window.location.pathname,
      search: `${qsValue}`,
    });
  };

  return [value, onSetValue];
};
