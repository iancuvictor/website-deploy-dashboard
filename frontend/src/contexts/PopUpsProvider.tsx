import { useState, type ReactNode } from "react";
import { PopUpsContext, type ConfirmRequest } from "./PopUpsContext";
import { Confirm } from "../components/index.js";

export function PopUpsProvider({ children }: { children: ReactNode }) {

    const [confirm, setConfirm] = useState<ConfirmRequest>(null);
    const requestConfirm = (request: ConfirmRequest) => {
        setConfirm(request);
    };

    return (
        <PopUpsContext.Provider value={{ confirm, requestConfirm }}>
            {children}
            {confirm && (
                <Confirm
                    message={confirm.message}
                    confirmText={confirm.confirmText}
                    denyText={confirm.denyText}
                    confirmFn={() => {
                        confirm.onConfirm();
                        setConfirm(null);
                    }}
                    denyFn={() => setConfirm(null)}
                />
            )}
        </PopUpsContext.Provider>
    );
}