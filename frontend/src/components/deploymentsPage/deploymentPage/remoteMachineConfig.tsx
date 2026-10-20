import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

export default function RemoteMachineConfig() {

    const formInputStyle = `px-3 py-2.5 ring-1 ring-neutral-700 rounded-xs text-[14px] w-full no-underline`;

    const [serverForm, setServerForm] = useState({
        serverName: ''
    });

    const connectToServer = useMutation({
        mutationFn: (serverName: string) => axios.post(`${API_URL}/api/deployments/connectToRemoteServer`),
        onSuccess: () => {
            toast.success(`Successfully connected to server`);
        }
    })

    return <div className="flex flex-col gap-3">
        <div className="flex flex-row gap-3 items-center">
            <span className="text-[16px] text-neutral-500">Remote machine config</span>
        </div>
        <div className="flex flex-row items-center justify-center gap-3">
            <span className="whitespace-nowrap">Server name</span>
            <input type="text"
                className={`${formInputStyle} text-blue-400`}
                defaultValue={''}
                onChange={(e) => setServerForm({ ...serverForm, serverName: e.target.value })}
                placeholder="user@ip_address" />
        </div>
        <button onClick={() => connectToServer.mutate(serverForm.serverName)}
            className="cursor-pointer w-fit bg-green-500 hover:bg-green-600 shadow-lg/40 
                        shadow-green-500 hover:shadow-green-600 ring-1 ring-neutral-700 p-2 rounded-xs text-center align-center">
            Connect to server</button>
    </div>
}