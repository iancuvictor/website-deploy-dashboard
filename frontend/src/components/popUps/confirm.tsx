import { useContext } from "react";
import { GlobalStatesContext } from "../../contexts/GlobalStatesContext";

type ConfirmProps = {
  message: string;
  confirmText: string;
  denyText: string;
  confirmFn: () => void;
  denyFn: () => void;
};


export default function Confirm({message, confirmText, denyText, confirmFn, denyFn} : ConfirmProps){
    const {darkMode} = useContext(GlobalStatesContext);


    return <div className="fixed z-10 top-0 left-0 h-full w-full 
    flex items-center justify-center bg-black/80">
        <div className={`${darkMode ? 'bg-neutral-950 text-white' : 'bg-white text-black' } h-80 min-w-100 p-10 ring-1 ring-neutral-700 rounded-md
        flex flex-col gap-10 h-fit`}>
        <span>{message}</span>
        <div className="flex justify-between">
            <button onClick={() => confirmFn()}
                className="cursor-pointer bg-rose-500 hover:bg-rose-600 min-w-30 p-2 rounded-xs">{confirmText}</button>
            <button onClick={() => denyFn()}
                className={`cursor-pointer ring-1 ring-neutral-700 
                ${darkMode ? 'bg-neutral-950 hover:bg-neutral-900' : 'bg-white hover:bg-gray-100'} min-w-30 p-2 rounded-xs`}>{denyText}</button>
        </div>
        </div>
    </div>
}