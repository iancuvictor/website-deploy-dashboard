import { useContext } from "react"
import { GlobalStatesContext } from "../../contexts/GlobalStatesContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from 'axios';

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
    const queryClient = useQueryClient();
    const { darkMode } = useContext(GlobalStatesContext);


    const deleteWebsite = useMutation({
        mutationFn: (id: string) => axios.delete(`${API_URL}/api/websites/?id=${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['websites'] })
            toast.success(`Website successfuly removed`);
        },
    });

    const deleteWebsiteFunction = () => {
        deleteWebsite.mutate(websiteData._id);
    }

    if (websiteData.latestPing !== null) {
        return <div className={`${darkMode ? 'bg-neutral-900 text-white' : 'text-black'} flex justify-between w-120 p-5 ring-1 ring-neutral-700 rounded-xs gap-10`}>
            <div className="flex flex-col justify-start gap-1 text-[14px]">
                <h1 className="text-[20px] font-[600]">{websiteData.name} <FontAwesomeIcon icon={faCircle} className={websiteData.latestPing.status ? `text-green-500` : `text-rose-500`} /></h1>
                <a href={websiteData.url} target="_blank" className="text-blue-400">{websiteData.url}</a>
                <span>Ping frequency: {websiteData.pingFrequency}ms</span>
                <span className="text-gray-500">Last checked: {Math.round((new Date() - new Date(websiteData.latestPing.createdAt)) / 1000)} sec ago</span>
                <span className="text-gray-500">Response time: {websiteData.latestPing.responseTime}</span>
                <span className="text-gray-500">Uptime percentage: 100%</span>
                <div>
                    <button onClick={() => deleteWebsiteFunction()}
                        className="cursor-pointer text-[22px] text-rose-500" >
                        <FontAwesomeIcon icon={faTrashCan}/>
                    </button>
                    <button>
                        <FontAwesomeIcon icon={faPenToSquare} className="text-[22px] text-white" />
                    </button>
                </div>
            </div>
        </div>
    } else {
        return <div className={`${darkMode ? 'bg-neutral-900 text-white' : 'text-black'} flex justify-between w-150 p-5 ring-1 rounded-xs`}>
            <div className="flex flex-col justify-start gap-1 w-100">
                <h1 className="text-[20px] font-[600]">{websiteData.name} <FontAwesomeIcon icon={faCircle} className={`text-gray-500`} /></h1>
                <a href={websiteData.url} target="_blank" className="text-blue-400">{websiteData.url}</a>
                <span>Ping frequency: {websiteData.pingFrequency}ms</span>
                <span>Awaiting first ping...</span>
            </div>
        </div>
    }
}
