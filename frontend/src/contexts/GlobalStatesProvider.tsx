import { useState, type ReactNode } from "react";
import { GlobalStatesContext } from "./GlobalStatesContext";

export function GlobalStatesProvider({ children }: { children: ReactNode }) {

  const darkModeValue = JSON.parse(localStorage.getItem('darkMode'))

  const [darkMode, setDarkMode] = useState(darkModeValue);

  return (
    <GlobalStatesContext.Provider value={{darkMode, setDarkMode}}>
      {children}
    </GlobalStatesContext.Provider>
  );
}