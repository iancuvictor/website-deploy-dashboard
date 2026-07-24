import { createContext } from "react";

type GlobalStatesType = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
};

export const GlobalStatesContext = createContext<GlobalStatesType | undefined>(undefined);