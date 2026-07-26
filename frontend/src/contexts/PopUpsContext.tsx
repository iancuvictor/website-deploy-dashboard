import { createContext } from "react";
import { useContext } from "react";

export type ConfirmRequest = {
  message: string;
  confirmText: string;
  denyText: string;
  onConfirm: () => void;
} | null;

type PopUpsType = {
  confirm: ConfirmRequest;
  requestConfirm: (request: ConfirmRequest) => void;
};

export const PopUpsContext = createContext<PopUpsType | undefined>(undefined);

export function usePopUps() {
  const context = useContext(PopUpsContext);
  if (!context) throw new Error("usePopUps must be used within PopUpsProvider");
  return context;
}