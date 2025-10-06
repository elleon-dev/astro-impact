import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface Props {
  children: JSX.Element;
}

export const ScrollTop = ({ children }: Props): JSX.Element => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return children;
};
