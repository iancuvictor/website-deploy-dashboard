import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useContext, useMemo } from "react";
import { useParams } from "react-router";
import { GlobalStatesContext } from "../../../contexts/GlobalStatesContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { PingCard, Confirm } from "../../index.js";
import { usePopUps } from "../../../contexts/PopUpsContext.js";
import { toast } from "sonner";


const API_URL = import.meta.env.VITE_API_URL;

export default function WebsitePage() {
    const queryClient = useQueryClient();
    const { darkMode } = useContext(GlobalStatesContext);
    const { requestConfirm } = usePopUps();

    const { id } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ['website', id],
        queryFn: () => axios.get(`${API_URL}/api/websites/website?id=${id}`),
    });

    const deletePings = useMutation({
        mutationFn: (id: string) => axios.delete(`${API_URL}/api/websites/pings?id=${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['website', id] });
            toast.success(`All pings have successfuly been deleted`);
        }
    })

    const pingsData = data?.data?.pings;

    let responseTimeArray = useMemo(() => {
        return pingsData.map((ping) => ping.responseTime)
    }, [pingsData]);

    let averageUpTime = useMemo(() => {
        return (pingsData.filter((ping) => ping.status === true).length / pingsData.length * 100).toFixed(2);
    }, [pingsData]);

    console.log(averageUpTime);

    if (isLoading) {
        return <div className="absolute flex flex-col items-center justify-center h-full w-full text-white text-[40px]">
            <FontAwesomeIcon icon={faCircleNotch} spin />
        </div>
    } else {
        return <div className={`${darkMode ? 'text-white' : 'text-black'} flex flex-col gap-10 items-center justify-center p-10`}>
                <h1 className="text-[30px] font-[700]">Viewing {data.data.website.name}</h1>
            <div className={`relative flex flex-row gap-10`}>
                <div className={`flex flex-col h-100 w-150 ring-1 ring-neutral-700 overflow-hidden overflow-y-scroll`}>
                    {data.data.pings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((ping) => {
                        return <PingCard pingData={ping} key={ping._id} />
                    })}
                </div>
                <div className="flex flex-col gap-5 w-full">
                    <span>Ping history:</span>
                    <span>Nr. of pings: {data.data.pings.length}</span>
                    <span>Uptime percentage: {averageUpTime}%</span>
                    {/* <span>Average response time: {Math.}</span> */}
                    <span>Max. response time: {Math.max(...responseTimeArray)}</span>
                    <span>Min. response time: {Math.min(...responseTimeArray)}</span>
                    <button onClick={() => requestConfirm({
                        message: `Are you sure you want to delete every recorded ping?`,
                        confirmText: 'Yes, delete every ping.',
                        denyText: 'Cancel',
                        onConfirm: () => {
                            deletePings.mutate(id)
                        },
                    })} className="cursor-pointer bg-rose-500 hover:bg-rose-600 text-white w-28 p-2">delete logs</button>
                </div>
            </div>
        </div>
    }
};