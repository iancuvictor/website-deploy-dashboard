import { useContext, useState } from "react"
import { GlobalStatesContext } from "../../contexts/GlobalStatesContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router";
import { usePopUps } from "../../contexts/PopUpsContext";
import { UseDeleteWebsite } from "../../utils/deleteWebsite";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

type Website = {
    _id: string;
    name: string;
    url: string;
    pingFrequency: number;
    latestPing: {
        createdAt: string,
        responseTime: number,
        status: boolean,
        updatedAt: string,
        websiteId: string
    }
};

type WebsiteCardProps = {
    websiteData: Website;
};

type Form = {
    id: string,
    name: string,
    pingFrequency: number
}

const API_URL = import.meta.env.VITE_API_URL;

export default function WebsiteCard({ websiteData }: WebsiteCardProps) {
    const deleteWebsite = UseDeleteWebsite();
    const [editing, setEditing] = useState(false);
    const queryClient = useQueryClient();

    let defaultData = {
        id: websiteData._id,
        name: websiteData.name,
        pingFrequency: websiteData.pingFrequency
    }

    const [form, setForm] = useState<Form>(defaultData)

    const isDisabled = JSON.stringify(form) === JSON.stringify(defaultData)

    const { requestConfirm } = usePopUps();
    const { darkMode } = useContext(GlobalStatesContext);

    const updateWebsite = useMutation({
        mutationFn: (form: Form) => axios.put(`${API_URL}/api/websites`, form),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['websites'] })
            setForm(defaultData);
            setEditing(false);
            toast.success(`Website successfully updated`);
        }
    })

    if (websiteData.latestPing !== null) {
        return <div className={`${darkMode ? 'bg-neutral-950 text-white' : 'text-black'} 
        relative flex justify-between w-120 h-50 p-5 ring-1 ring-neutral-700 rounded-xs gap-10`}>

            {/* editing specific screen */}
            {!editing && <NavLink to={`${websiteData._id}`} className="absolute top-0 left-0 z-0 h-full w-full" />}
            {editing ?
                <div className="flex flex-col justify-between gap-3 text-[14px]">
                    <div className="flex flex-col gap-3">
                        <input onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="text-[20px] font-[600] ring-1 ring-neutral-700 outline-none p-1" value={form.name} />
                        <span>Ping frequency: {' '}
                            <input type='number' onChange={(e) => setForm({ ...form, pingFrequency: +e.target.value })}
                                value={form.pingFrequency}
                                className="field-sizing-content pl-1 pr-1 ring-1 ring-neutral-700 outline-none pl-1 pr-1" /> min</span>
                    </div>
                    <div className="flex flex-row gap-2">
                        <button onClick={() => {
                            updateWebsite.mutate(form);
                        }} disabled={isDisabled}
                            className={`${isDisabled ? 'text-gray-500' : 'text-white cursor-pointer bg-green-600 hover:bg-green-700'} 
            p-2 ring-1 ring-neutral-700 rounded-xs duration-75 ease-out`}>Save changes</button>
                        <button onClick={() => setEditing(false)}
                            className="cursor-pointer p-2 ring-1 ring-neutral-700 rounded-xs hover:bg-rose-500 duration-75 ease-out">Cancel</button>
                    </div>
                </div>


                // not editing view 
                : <div className="flex flex-col justify-start gap-1 text-[14px]">
                    <h1 className="text-[20px] font-[600]">{websiteData.name} <FontAwesomeIcon icon={faCircle} className={websiteData.latestPing.status ? `text-green-500` : `text-rose-500`} /></h1>
                    <a href={websiteData.url} target="_blank"
                        className="z-1 text-blue-400 hover:underline underline-offset-1">{websiteData.url}</a>
                    <span>Ping frequency: {websiteData.pingFrequency} min</span>
                    <span className="text-gray-500">Last checked: {Math.round((new Date().getTime() - new Date(websiteData.latestPing.createdAt).getTime()) / 1000)} sec ago</span>
                    <span className="text-gray-500">Response time: {websiteData.latestPing.responseTime}</span>
                    <span className="text-gray-500">Uptime percentage: 100%</span>
                </div>}


            {!editing && <div className="absolute top-0 right-0 p-3 flex flex-row gap-2 text-[22px]">
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
                <button onClick={() => setEditing(true)}
                    className="cursor-pointer hover:text-gray-400">
                    <FontAwesomeIcon icon={faPenToSquare} />
                </button>
            </div>}
        </div>
    } else {
        return <div className={`${darkMode ? 'bg-neutral-950 text-white' : 'text-black'} 
        relative flex justify-between w-120 h-50 p-5 ring-1 ring-neutral-700 rounded-xs gap-10`}>
            <NavLink to={`${websiteData._id}`} className="absolute top-0 left-0 z-0 h-full w-full" />
            <div
                className="flex flex-col justify-start gap-1 text-[14px]">
                <h1 className="text-[20px] font-[600]">{websiteData.name} <FontAwesomeIcon icon={faCircle} className={'text-gray-500'} /></h1>
                <a href={websiteData.url} target="_blank"
                    className="z-1 text-blue-400 hover:underline underline-offset-1">{websiteData.url}</a>
                <span className="text-gray-500">Awaiting first ping</span>
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
                </div>
            </div>
        </div>
    }
}
