import { useState, type ReactNode } from "react";
import { GlobalStatesContext } from "./GlobalStatesContext";

export function GlobalStatesProvider({ children }: { children: ReactNode }) {

  const [darkMode, setDarkMode] = useState(true);

  return (
    <GlobalStatesContext.Provider value={{darkMode, setDarkMode}}>
      {children}
    </GlobalStatesContext.Provider>
  );
}