import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useContext, useMemo } from "react";
import { useParams } from "react-router";
import { GlobalStatesContext } from "../../../contexts/GlobalStatesContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { PingCard, ErrorPage } from "../../index.js";
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

    const websiteData = data?.data?.website;
    const pingsData = data?.data?.pings;

    const responseTimeArray = useMemo(() => {
        if (pingsData !== undefined) {
            if (pingsData.length > 0) {
                return pingsData.map((ping) => ping.responseTime)
            } else {
                return [0, 0];
            }
        }
    }, [pingsData]);

    const averageResponseTime = useMemo(() => {
        if (pingsData !== undefined && pingsData.length > 0) {
            return (pingsData.map((ping) => ping.responseTime).reduce((acc, curr) => acc += curr) / pingsData.length).toFixed(0);
        }
    }, [pingsData]);

    const averageUpTime = useMemo(() => {
        if (pingsData !== undefined && pingsData.length > 0) {
            return (pingsData.filter((ping) => ping.status === true).length / pingsData.length * 100).toFixed(2);
        }
    }, [pingsData]);

    if (error) {
        return <ErrorPage error={error}/>
    } else {
        if (isLoading) {
            return <div className="absolute flex flex-col items-center justify-center h-full w-full text-white text-[40px]">
                <FontAwesomeIcon icon={faCircleNotch} spin />
            </div>
        } else {
            return <div className={`${darkMode ? 'text-white' : 'text-black'} flex flex-col gap-10 items-center justify-center p-10`}>
                <div className="flex flex-col items-center justify-center">
                    <h1 className="text-[30px] font-[700]">Viewing {websiteData.name}</h1>
                    <a href={websiteData.url} target="_blank"
                        className="cursor-pointer text-[16px] text-blue-400 hover:underline underline-offset-1">{websiteData.url}</a>
                </div>
                <div className={`relative flex flex-row gap-10`}>
                    <div className={`flex flex-col h-100 w-150 ring-1 ring-neutral-700 overflow-hidden overflow-y-scroll`}>
                        {[...pingsData].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((ping) => {
                            return <PingCard pingData={ping} key={ping._id} />
                        })}
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                        <span>Ping history:</span>
                        <span className="text-gray-400">Nr. of pings: <span className="text-white">{pingsData.length}</span></span>
                        <span className="text-gray-400">Uptime percentage: <span className="text-white">{isNaN(+averageUpTime) ? '0' : averageUpTime}%</span></span>
                        <span className="text-gray-400">Average response time: <span className="text-white">{averageResponseTime} ms</span></span>
                        <span className="text-gray-400">Max. response time: <span className="text-white">{Math.max(...responseTimeArray)}</span></span>
                        <span className="text-gray-400">Min. response time: <span className="text-white">{Math.min(...responseTimeArray)}</span></span>
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
    }
};