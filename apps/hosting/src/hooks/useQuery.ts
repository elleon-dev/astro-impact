import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";

export const useQuery = <T>(): T => {
  const location = useLocation();

  return useMemo(() => (queryString.parse(location.search) as unknown) as T, [
    location,
  ]);
};
