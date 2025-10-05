import React, { createContext, useContext } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { firestore, version } from "@/firebase";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Loader } from "@/components/ui/loader.tsx";
import { settingsRef } from "@/firebase/collections";

interface Context {
  version: string;
}

const VersionContext = createContext<Context>({
  version: "",
});

interface Props {
  children: JSX.Element;
}

export const VersionProvider = ({ children }: Props) => {
  // @ts-ignore
  const [settingDefault, settingDefaultLoading, settingDefaultError] =
    useDocumentData<SettingDefault>(settingsRef.doc("default"));

  const onClickRefresh = () => document.location.reload();

  if (settingDefaultLoading) return <Loader />;

  if (settingDefaultError)
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <h1>Error 500</h1>
        <h2>Perdón, algo salió mal.</h2>
        <Button onClick={onClickRefresh}>Actualizar</Button>
      </div>
    );

  const isLastVersion = version === settingDefault?.version;

  return (
    <VersionContext.Provider
      value={{
        version,
      }}
    >
      {isLastVersion ? children : <Version />}
    </VersionContext.Provider>
  );
};

export const useVersion = () => useContext(VersionContext);

export const Version = () => (
  <div className="flex flex-col items-center justify-center gap-4">
    <div>
      <h2>
        Actualice para obtener la última versión de la aplicación.
        <br />
      </h2>
      <Button onClick={() => document.location.reload()}>Actualizar</Button>
    </div>
  </div>
);
