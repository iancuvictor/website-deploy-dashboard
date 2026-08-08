import { faCircleNotch, faFileArrowDown, faFloppyDisk, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import { toast } from "sonner";
import ErrorPage from "../../errorPages/errorPage";

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

type LogProps = {
    stepId: string
    logsPath: string
}

export default function Logs({ stepId, logsPath }: LogProps) {

    // const [logs, setLogs] = useState([]);
    const [form, setForm] = useState(logsPath);
    const formInputStyle = `px-3 py-2.5 ring-1 ring-neutral-700 rounded-xs text-[14px] w-full no-underline`;
    const queryClient = useQueryClient()

    const updateLogsPath = useMutation({
        mutationFn: (path: string) => axios.post(`${API_URL}/api/deployments/deployment`, {path}),
        onSuccess: () => {
            toast.success(`Logs path successfully updated`);
        }
    })

    const openLogsFolder = useMutation({
        mutationFn: (path: string) => axios.post(`${API_URL}/api/deployments/openFolder`, {path}),
        onError: () => {
            toast.error(`Cannot find logs folder`)
        }
    })

    const { data, isLoading, error } = useQuery({
        queryKey: ['logs', stepId],
        queryFn: () => axios.get(`${API_URL}/api/deployments/logs/${stepId}`)
    })

    const logs = data?.data
    

    useEffect(() => {
        const handleLog = (stepId: string) => {
            queryClient.invalidateQueries({ queryKey: ['logs', stepId] })
        };

        socket.on('deployLog', handleLog);
        return () => {
            socket.off('deployLog', handleLog);
        };
    }, [data])

    console.log(data);
    if (error) {
        return <ErrorPage error={error} />
    } else {
        if (isLoading) {
            return <div className="absolute flex flex-col items-center justify-center h-full w-full text-white text-[40px]">
                <FontAwesomeIcon icon={faCircleNotch} spin />
            </div>
        } else {
            return <div className="flex flex-col gap-3 w-205 h-100 ring-1 ring-neutral-700 p-5">
                <div className="w-full flex items-center gap-5">
                    <span className="whitespace-nowrap">Deployment logs</span>
                    <div className="w-full flex flex-row gap-2">
                        <input type="text" className={formInputStyle} placeholder=":/enter logs folder"
                            value={form} onChange={(e) => setForm(e.target.value)} />
                        <button onClick={() => updateLogsPath.mutate(form)}
                            className="cursor-pointer text-white ring-1 ring-neutral-700 p-2 hover:bg-green-500 duration-75 ease-out w-fit">
                            <FontAwesomeIcon icon={faFloppyDisk} /></button>
                        <button onClick={() => openLogsFolder.mutate(logsPath)}
                        className="cursor-pointer ring-1 ring-neutral-700 p-2 hover:bg-neutral-900 whitespace-nowrap">
                            <FontAwesomeIcon icon={faFolderOpen} /> Open logs folder</button>
                    </div>
                </div>
                <div className="p-2 ring-1 ring-neutral-700 h-full whitespace-pre-wrap overflow-y-scroll">
                    {logs.map((log, i) => {
                        return <p key={i}>{log.message}</p>
                    })}
                </div>
            </div>
        }
    }
}