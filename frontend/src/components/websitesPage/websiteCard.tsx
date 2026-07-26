import { useContext, useState } from "react"
import { GlobalStatesContext } from "../../contexts/GlobalStatesContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from 'axios';

import { Confirm } from '../index';
import { NavLink } from "react-router";
import { usePopUps } from "../../contexts/PopUpsContext";

type Website = {
    _id: string;
    name: string;
    url: string;
    pingFrequency: number;
    latestPing: {
        createdAt: Date,
        responseTime: number,
        status: boolean,
        updatedAt: Date,
        websiteId: string
    }
};

type WebsiteCardProps = {
    websiteData: Website;
};

const API_URL = import.meta.env.VITE_API_URL;

export default function WebsiteCard({ websiteData }: WebsiteCardProps) {
    const { requestConfirm } = usePopUps();
    const queryClient = useQueryClient();
    const { darkMode } = useContext(GlobalStatesContext);
    const [confirm, setConfirm] = useState(false);


    const deleteWebsite = useMutation({
        mutationFn: (id: string) => axios.delete(`${API_URL}/api/websites/?id=${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['websites'] })
            toast.success(`Website successfuly removed`);
        },
    });

    if (websiteData.latestPing !== null) {
        return <div className={`${darkMode ? 'bg-neutral-950 text-white' : 'text-black'} 
        relative flex justify-between w-120 p-5 ring-1 ring-neutral-700 rounded-xs gap-10`}>
            <NavLink to={`${websiteData._id}`} className="absolute top-0 left-0 z-0 h-full w-full"/>
            <div
                className="flex flex-col justify-start gap-1 text-[14px]">
                <h1 className="text-[20px] font-[600]">{websiteData.name} <FontAwesomeIcon icon={faCircle} className={websiteData.latestPing.status ? `text-green-500` : `text-rose-500`} /></h1>
                <a href={websiteData.url} target="_blank"
                    className="z-1 text-blue-400 hover:underline underline-offset-1">{websiteData.url}</a>
                <span>Ping frequency: {websiteData.pingFrequency}ms</span>
                <span className="text-gray-500">Last checked: {Math.round((new Date().getTime() - new Date(websiteData.latestPing.createdAt).getTime()) / 1000)} sec ago</span>
                <span className="text-gray-500">Response time: {websiteData.latestPing.responseTime}</span>
                <span className="text-gray-500">Uptime percentage: 100%</span>
                <div className="absolute top-0 right-0 p-3 flex flex-row gap-2 text-[22px]">
                    <button onClick={() => {
                        requestConfirm({
                            message: `Are you sure you want to remove this website from the tracking list?`,
                            confirmText: 'Yes, remove the website',
                            denyText: 'Cancel',
                            onConfirm: () => {
                                deleteWebsite.mutate(websiteData._id)
                            }
                        })
                    }}
                        className="cursor-pointer text-rose-500 hover:text-rose-600" >
                        <FontAwesomeIcon icon={faTrashCan} />
                    </button>
                    <button className="cursor-pointer hover:text-gray-400">
                        <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                </div>
            </div>
        </div>
    } else {
        return <div className={`${darkMode ? 'bg-neutral-950 text-white' : 'text-black'} 
        relative flex justify-between w-150 p-5 ring-1 rounded-xs`}>
            <div className="flex flex-col justify-start gap-1 w-100">
                <h1 className="text-[20px] font-[600]">{websiteData.name} <FontAwesomeIcon icon={faCircle} className={`text-gray-500`} /></h1>
                <a href={websiteData.url} target="_blank" className="text-blue-400">{websiteData.url}</a>
                <span>Ping frequency: {websiteData.pingFrequency}ms</span>
                <span>Awaiting first ping...</span>
                <div className="absolute top-0 right-0 p-3 flex flex-row gap-2 text-[22px]">
                    <button onClick={() => setConfirm(true)}
                        className="cursor-pointer text-rose-500" >
                        <FontAwesomeIcon icon={faTrashCan} />
                    </button>
                    <button className="cursor-pointer">
                        <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                </div>
            </div>
            {confirm && <Confirm message={'Are you sure you want to remove this website from the tracking list?'}
                confirmText={'Yes'} confirmFn={deleteWebsiteFunction}
                denyText={'No'} denyFn={() => setConfirm(false)} />}
        </div>
    }
}
