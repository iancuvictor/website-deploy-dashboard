import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { useParams } from "react-router";
import { GlobalStatesContext } from "../../../contexts/GlobalStatesContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { PingCard, ErrorPage } from "../../index.js";
import PingsData from "./pingsData.js";
import { usePopUps } from "../../../contexts/PopUpsContext.js";
import { UseDeleteWebsite } from "../../../utils/deleteWebsite.js";


const API_URL = import.meta.env.VITE_API_URL;

export default function WebsitePage() {
    const { requestConfirm } = usePopUps();
    const deleteWebsite = UseDeleteWebsite();
    const { darkMode } = useContext(GlobalStatesContext);
    const { id } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ['website', id],
        queryFn: () => axios.get(`${API_URL}/api/websites/website?id=${id}`),
    });

    const websiteData = data?.data?.website;
    const pingsData = data?.data?.pings;

    if (error) {
        return <ErrorPage error={error} />
    } else {
        if (isLoading) {
            return <div className="absolute flex flex-col items-center justify-center h-full w-full text-white text-[40px]">
                <FontAwesomeIcon icon={faCircleNotch} spin />
            </div>
        } else {
            return <div className={`${darkMode ? 'text-white' : 'text-black'} flex flex-col gap-10 items-center justify-center p-10`}>
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
                    className="cursor-pointer absolute top-10 right-10
                 p-2 bg-rose-500 hover:bg-rose-600 rounded-xs text-white">Remove website</button>
                <div className="flex flex-col items-center justify-center">
                    <h1 className="text-[30px] font-[700]">Viewing {websiteData.name}</h1>
                    <a href={websiteData.url} target="_blank"
                        className="cursor-pointer text-[16px] text-blue-400 hover:underline underline-offset-1">{websiteData.url}</a>
                </div>
                <div className={`relative flex flex-row gap-10`}>
                    <div className="flex flex-col gap-2">
                        <span>Up-time</span>
                        <div className={`flex flex-col h-100 w-100 ring-1 ring-neutral-700 overflow-hidden overflow-y-scroll`}>
                            {pingsData.length > 0 ? [...pingsData].filter((ping) => ping.status === true)
                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((ping) => {
                                    return <PingCard pingData={ping} key={ping._id} />
                                }) : <div className={`${darkMode ? 'text-white' : 'text-black'} w-full text-center p-5`}>No pings have been recorded yet</div>}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span>Errors and down-times</span>
                        <div className={`flex flex-col h-100 w-100 ring-1 ring-neutral-700 overflow-hidden overflow-y-scroll`}>
                            {pingsData.length > 0 ? [...pingsData].filter((ping) => ping.status === false).
                                sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((ping) => {
                                    return <PingCard pingData={ping} key={ping._id} />
                                }) : <div className={`${darkMode ? 'text-white' : 'text-black'} w-full text-center p-5`}>No pings have been recorded yet</div>}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span>Ping history:</span>
                        <PingsData data={pingsData} websiteId={id} />
                    </div>
                </div>
            </div>
        }
    }
};