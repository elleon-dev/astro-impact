import React, { createContext, useContext, useEffect } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { firestore } from "@/firebase";
import { orderBy } from "lodash";
import { LoaderIcon } from "lucide-react";
import { spamsRef } from "@/firebase/collections";

interface Context {
  users: User[];
  spams: Spam[];
}

const GlobalDataContext = createContext<Context>({
  users: [],
  spams: [],
});

interface Props {
  children: JSX.Element;
}

export const GlobalDataProvider = ({ children }) => {
  const [users = [], usersLoading, usersError] = useCollectionData<User>(
    // @ts-ignore
    firestore.collection("users").where("isDeleted", "==", false) || null,
  );

  const [spams = [], spamsLoading, spamsError] = useCollectionData<Spam>(
    // @ts-ignore
    spamsRef.where("isDeleted", "==", false) || null,
  );

  const error = usersError || spamsError;
  const loading = usersLoading || spamsLoading;

  useEffect(() => {
    error && alert({ type: "error" });
  }, [error]);

  if (loading) return <LoaderIcon height="100vh" className="animate-spin" />;

  return (
    <GlobalDataContext.Provider
      value={{
        users: orderBy(users, (user) => [user.createAt], ["asc"]),
        spams: orderBy(spams, (spam) => [spam.createAt], ["asc"]),
      }}
    >
      {children}
    </GlobalDataContext.Provider>
  );
};

export const useGlobalData = () => useContext(GlobalDataContext);
