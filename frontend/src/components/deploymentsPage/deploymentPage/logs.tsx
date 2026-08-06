import { useEffect, useState } from "react"
import { io } from "socket.io-client"

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

type LogProps = {
    stepId: string
}

export default function Logs({stepId} : LogProps) {

    const [logs, setLogs] = useState('');

    useEffect(() => {


        const handleLog = (data: { stepId: string; chunk: string }) => {
            if (data.stepId === stepId) {
                setLogs((prev) => prev + data.chunk + '\n');
            }
        };

        socket.on('deployLog', handleLog)
        return () => {
            socket.off('deployLog', handleLog);
        };
    }, [stepId])

    console.log(logs);


    return <div className="flex flex-col gap-3 w-200 h-100 ring-1 ring-neutral-700 p-5">
        <span>Deployment logs</span>
        <div className="p-2 ring-1 ring-neutral-700 h-full whitespace-pre-wrap overflow-y-scroll">
        {logs}
        </div>
    </div>
}