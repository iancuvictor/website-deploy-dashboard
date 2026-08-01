import { useContext, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePopUps } from "../../../contexts/PopUpsContext.js";
import { toast } from "sonner";
import axios from "axios";
import { GlobalStatesContext } from "../../../contexts/GlobalStatesContext.js";
import usePauseResumePinging from "../../../utils/pauseResumePinging.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import useUpdateWebsite from "../../../utils/updateWebsite.js";

const API_URL = import.meta.env.VITE_API_URL;

type Ping = {
    _id: string,
    createdAt: string,
    updatedAt: string,
    websiteId: string,
    responseTime: number,
    status: boolean,
}

type PingsDataType = {
    data: Ping[],
    websiteId: string,
    websiteData: {
        _id: string,
        name: string,
        url: string,
        pingFrequency: number,
        pinging: boolean,
    }
};

type Form = {
    id: string,
    name: string,
    pingFrequency: number
}

export default function PingsData({ data, websiteId, websiteData }: PingsDataType) {
    const { darkMode } = useContext(GlobalStatesContext);
    const pauseResumePinging = usePauseResumePinging(websiteId, 'ping');
    const updateWebsite = useUpdateWebsite();
    const queryClient = useQueryClient();
    const { requestConfirm } = usePopUps();

    let defaultData = {
        id: websiteData._id,
        name: websiteData.name,
        pingFrequency: websiteData.pingFrequency
    }

    const [form, setForm] = useState<Form>(defaultData);

    const deletePings = useMutation({
        mutationFn: (websiteId: string) => axios.delete(`${API_URL}/api/websites/pings?id=${websiteId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['website', websiteId] });
            toast.success(`All pings have successfuly been deleted`);
        }
    })

    const responseTimeArray = useMemo(() => {
        if (data !== undefined) {
            if (data.length > 0) {
                return data.map((ping) => ping.responseTime)
            } else {
                return [0, 0];
            }
        }
    }, [data]);

    const averageResponseTime = useMemo(() => {
        if (data !== undefined && data.length > 0) {
            return (data.map((ping) => ping.responseTime).reduce((acc, curr) => acc += curr) / data.length).toFixed(0);
        }
    }, [data]);

    const upTimePercentage = useMemo(() => {
        if (data !== undefined && data.length > 0) {
            return (data.filter((ping) => ping.status === true).length / data.length * 100).toFixed(2);
        }
    }, [data]);

    return <div className="flex flex-col justify-between ring-1 ring-neutral-700 p-5 rounded-xs w-100 h-100">
        <div className="flex flex-col gap-1">

        <div className="w-full">
            <button onClick={() => pauseResumePinging.mutate(!websiteData.pinging, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['website', websiteId] })
                }
            })}
            className="cursor-pointer">
                    <FontAwesomeIcon icon={websiteData.pinging ? faPause : faPlay} /> {" "}
                {websiteData.pinging
                    ? <span className="text-green-500">Currently pinging</span>
                    : <span className="text-rose-500">Pinging is paused</span>}
            </button>
        </div>
        <div className="flex flex-row gap-4 items-center">
            <span>
                Pinging frequency: every <input type='text' onChange={(e) => setForm({ ...form, pingFrequency: +e.target.value })}
                    value={form.pingFrequency}
                    className="w-15 outline-none ring-1 ring-neutral-700 pr-2 pl-2" /> min
            </span>
            {JSON.stringify(defaultData) !== JSON.stringify(form) &&
                <button onClick={() => updateWebsite.mutate(form, {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['website', websiteId] })
                    }
                })}
                    className="cursor-pointer text-white ring-1 ring-neutral-700 p-2 hover:bg-green-500 duration-75 ease-out">
                    <FontAwesomeIcon icon={faFloppyDisk} /></button>}
        </div>
        <span className="text-gray-500">Nr. of pings: <span className={`${darkMode ? 'text-white' : 'text-black'}`}>{data.length}</span></span>
        <span className="text-gray-500">Uptime percentage: <span className={`${darkMode ? 'text-white' : 'text-black'}`}>{isNaN(+upTimePercentage) ? '0' : upTimePercentage}%</span></span>
        <span className="text-gray-500">Average response time: <span className={`${darkMode ? 'text-white' : 'text-black'}`}>{averageResponseTime} ms</span></span>
        <span className="text-gray-500">Max. response time: <span className={`${darkMode ? 'text-white' : 'text-black'}`}>{Math.max(...responseTimeArray)}</span></span>
        <span className="text-gray-500">Min. response time: <span className={`${darkMode ? 'text-white' : 'text-black'}`}>{Math.min(...responseTimeArray)}</span></span>
        </div>
        <button onClick={() => requestConfirm({
            message: `Are you sure you want to delete every recorded ping? This action is permanent.`,
            confirmText: 'Yes, delete every ping.',
            denyText: 'Cancel',
            onConfirm: () => {
                deletePings.mutate(websiteId)
            },
        })} className="cursor-pointer bg-rose-500 hover:bg-rose-600 text-white w-30 p-2">delete pings</button>
    </div>
}