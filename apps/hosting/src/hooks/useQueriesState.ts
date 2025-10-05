import { useState } from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import { useNavigate } from "react-router";

type UseQueriesStateReturn<T extends ObjectType> = [T, (object: T) => void];

export const useQueriesState = <T extends ObjectType>(
  initialObject: T
): UseQueriesStateReturn<T> => {
  const location = useLocation();
  const navigate = useNavigate();

  const queriesToState = (object: T): T => {
    const urlQuery = queryString.parse(location.search, {
      parseBooleans: true,
      parseNumbers: true,
    });

    const queryValues: ObjectType = {};

    Object.entries(object).forEach(([key, value]) => {
      const urlQueryValue = urlQuery[key];

      queryValues[key] = urlQueryValue || value;
    });

    return { ...object, ...queryValues };
  };

  const [object, setObject] = useState<T>(queriesToState(initialObject));

  const syncQueryWithState: UseQueriesStateReturn<T>[1] = (newObject) => {
    const newQuery = new URLSearchParams();

    Object.entries(newObject).forEach(([key, value]) => {
      value && newQuery.set(key, value.toString());
    });

    navigate({
      pathname: window.location.pathname,
      search: `?${newQuery}`,
    });

    setObject(newObject);
  };

  return [object, syncQueryWithState];
};
