import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect } from "react";
import { useParams } from "react-router";
import { GlobalStatesContext } from "../../../contexts/GlobalStatesContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch, faFloppyDisk, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { PingCard, ErrorPage } from "../../index.js";
import PingsData from "./pingsData.js";
import { usePopUps } from "../../../contexts/PopUpsContext.js";
import { useDeleteWebsite } from "../../../utils/deleteWebsite.js";
import Chart from "./chart.tsx";
import PingTable from "./pingTable.tsx";
import CertificateStatus from "./certificateStatus.tsx";
import { io } from 'socket.io-client';


const API_URL = import.meta.env.VITE_API_URL;

const socket = io(API_URL);

export default function WebsitePage() {
    const { requestConfirm } = usePopUps();
    const deleteWebsite = useDeleteWebsite();
    const { darkMode } = useContext(GlobalStatesContext);
    const { id } = useParams();
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ['website', id],
        queryFn: () => axios.get(`${API_URL}/api/websites/website?id=${id}`),
    });

    const websiteData = data?.data?.website;
    const pingsData = data?.data?.pings;
    const certData = data?.data?.certificate;

    useEffect(() => {
        
        const handleUpdate = () => {
            queryClient.invalidateQueries({ queryKey: ['website', id] });
        };
        socket.on('websiteUpdate', handleUpdate)
        socket.on('certificationUpdate', handleUpdate)

        return () => {
            socket.off('websiteUpdate', handleUpdate);
            socket.off('certificationUpdate', handleUpdate);
        };
    }, [queryClient]);


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
                        message: `Are you sure you want to remove this website from the tracking list? This action cannot be undone.`,
                        confirmText: 'Yes, remove the website',
                        denyText: 'Cancel',
                        onConfirm: () => {
                            deleteWebsite.mutate(websiteData._id)
                        }
                    })
                }}

                    className="cursor-pointer absolute top-10 right-10
                 p-2 bg-rose-500 hover:bg-rose-600 rounded-xs text-white">
                    <FontAwesomeIcon icon={faTrashCan} /> Remove website</button>
                <div className="flex flex-col items-center justify-center">
                    <h1 className="text-[30px] font-[700]">Viewing {websiteData.name}</h1>
                    <a href={websiteData.url} target="_blank"
                        className="cursor-pointer text-[16px] text-blue-400 hover:underline underline-offset-1">{websiteData.url}</a>
                </div>
                <div className={`relative flex flex-row flex-wrap gap-10 `}>
                    <div className="flex flex-col gap-2">
                        <span>Recorded pings</span>
                        <PingTable pingsData={pingsData} />
                    </div>
                    {/* <div className="flex flex-col gap-2">
                        <span>Errors and down-times</span>
                        <PingTable pingsData={pingsData} status={false} />
                    </div> */}
                    <div className="flex flex-col gap-2">
                        <span>Ping data:</span>
                        <PingsData data={pingsData} websiteData={websiteData} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <span>SSL Certificate:</span>
                        <CertificateStatus websiteData={websiteData} lastCert={certData.slice(-1)[0]} />
                    </div>
                </div>
                <div className="flex flex-row w-320 ring-1 ring-neutral-700 p-5">
                    <Chart data={pingsData} />
                </div>
            </div>
        }
    }
};