import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { useParams } from "react-router";
import { GlobalStatesContext } from "../../../contexts/GlobalStatesContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { PingCard, ErrorPage } from "../../index.js";
import PingsData from "./pingsData.js";


const API_URL = import.meta.env.VITE_API_URL;

export default function WebsitePage() {
    const { darkMode } = useContext(GlobalStatesContext);
    const { id } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ['website', id],
        queryFn: () => axios.get(`${API_URL}/api/websites/website?id=${id}`),
    });

    const websiteData = data?.data?.website;
    const pingsData = data?.data?.pings;

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
                    <PingsData data={pingsData} websiteId={id}/>
                </div>
            </div>
        }
    }
};