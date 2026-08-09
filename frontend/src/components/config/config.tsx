import { useContext, useState } from "react"
import { GlobalStatesContext } from "../../contexts/GlobalStatesContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch, faDownload, faGear } from "@fortawesome/free-solid-svg-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {type AxiosResponse, AxiosError} from "axios";
import axios from 'axios';
import ErrorPage from "../errorPages/errorPage";
import { toast } from "sonner";
import CloudflareForm from "./cloudflareForm";

const API_URL = import.meta.env.VITE_API_URL;

export default function Config() {
    const { darkMode } = useContext(GlobalStatesContext)
    const [loading, setLoading] = useState({
        installNginx: false,
        activateNginx: false,
        installCertbot: false,
        installUfw: false,
        activateUfw: false
    })

    const queryClient = useQueryClient()

    const { data, isLoading, error } = useQuery<AxiosResponse, AxiosError<{ message: string }>>({
        queryFn: () => axios.get(`${API_URL}/api/config/status`),
        queryKey: ['config']
    })


    const configData = data?.data

    const installNginx = useMutation({
        mutationFn: () => axios.post(`${API_URL}/api/config/installNginx`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['config'] })
            setLoading({ ...loading, installNginx: false })
            toast.success(`Nginx installed successfully`)
        }
    })

    const activateNginx = useMutation({
        mutationFn: () => axios.post(`${API_URL}/api/config/activateNginx`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['config'] })
            setLoading({ ...loading, activateNginx: false })
            toast.success(`Nginx activated successfully`)
        }
    })

    const installCertbot = useMutation({
        mutationFn: () => axios.post(`${API_URL}/api/config/installCertbot`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['config'] })
            setLoading({ ...loading, installCertbot: false })
            toast.success(`Certbot installed successfully`)
        }
    })

    const installUfw = useMutation({
        mutationFn: () => axios.post(`${API_URL}/api/config/installUfw`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['config'] })
            setLoading({ ...loading, installUfw: false })
            toast.success(`Ufw installed successfully`)
        }
    })

    const activateUfw = useMutation({
        mutationFn: () => axios.post(`${API_URL}/api/config/activateUfw`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['config'] })
            setLoading({ ...loading, activateUfw: false })
            toast.success(`Ufw activated successfully`)
        }
    })


    if (error) {
        return <ErrorPage error={error} />
    } else {
        if (isLoading) {
            return <div className="absolute flex flex-col items-center justify-center h-full w-full text-white text-[40px]">
                <FontAwesomeIcon icon={faCircleNotch} spin />
            </div>
        } else {
            return <div className={`${darkMode ? 'text-white' : 'text-black'} h-full w-full flex flex-col items-center p-10`}>
                <div className="w-200 h-fit flex flex-col gap-5">
                    <div className="flex flex-row gap-3 items-center">
                        <h1>Global config</h1>
                        <span className="text-neutral-500 text-[14px]">[This will be applied for all deployments]</span>
                    </div>
                    <div className="flex flex-col gap-2 p-5 ring-1 ring-neutral-700 rounded-md">
                        <span className="text-neutral-500">OS settings:</span>
                        <div className="flex flex-row gap-2 items-center justify-between">
                            <div className="flex flex-row gap-2">
                                <span>Nginx installed:</span>
                                <span className={`${configData.nginxInstalled ? 'text-green-500' : 'text-rose-500'}`}>
                                    {configData.nginxInstalled ? 'installed' : 'not installed'}</span>
                            </div>
                            {!configData.nginxInstalled && <button onClick={() => {
                                installNginx.mutate()
                                setLoading({ ...loading, installNginx: true })
                            }}
                                className="cursor-pointer p-1 ring-1 ring-neutral-700 hover:bg-green-500 duration-75 ease-out">
                                <FontAwesomeIcon icon={loading.installNginx ? faCircleNotch : faDownload} spin={loading.installNginx} /> {" "}
                                Download Nginx
                            </button>}
                        </div>
                        {configData.nginxInstalled && <div className="flex flex-row gap-2 items-center justify-between">
                            <div className="flex flex-row gap-2">
                                <span>Nginx running:</span>
                                <span className={`${configData.nginxRunning ? 'text-green-500' : 'text-rose-500'}`}>
                                    {String(configData.nginxRunning)}</span>
                            </div>
                            {!configData.nginxRunning && <button onClick={() => {
                                activateNginx.mutate()
                                setLoading({ ...loading, activateNginx: true })
                            }}
                                className="cursor-pointer p-1 ring-1 ring-neutral-700 hover:bg-green-500 duration-75 ease-out">
                                <FontAwesomeIcon icon={loading.activateNginx ? faCircleNotch : faGear} spin={loading.activateNginx} /> {" "}
                                Activate Nginx
                            </button>}
                        </div>}
                        <div className="flex flex-row gap-2 items-center justify-between">
                            <div className="flex flex-row gap-2">
                                <span>Certbot:</span>
                                <span className={`${configData.certbotInstalled ? 'text-green-500' : 'text-rose-500'}`}>
                                    {configData.certbotInstalled ? 'installed' : 'not installed'}</span>
                            </div>
                            {!configData.certbotInstalled && <button onClick={() => {
                                installCertbot.mutate()
                                setLoading({ ...loading, installCertbot: true })
                            }}
                                className="cursor-pointer p-1 ring-1 ring-neutral-700 hover:bg-green-500 duration-75 ease-out">
                                <FontAwesomeIcon icon={loading.installCertbot ? faCircleNotch : faDownload} spin={loading.installCertbot} /> {" "}
                                Download Certbot
                            </button>}
                        </div>
                        <div className="flex flex-row gap-2 items-center justify-between">
                            <div className="flex flex-row gap-2">
                                <span>Ufw installed:</span>
                                <span className={`${configData.ufwInstalled ? 'text-green-500' : 'text-rose-500'}`}>
                                    {configData.ufwInstalled ? 'installed' : 'not installed'}</span>
                            </div>
                            {!configData.ufwInstalled && <button onClick={() => {
                                installUfw.mutate()
                                setLoading({ ...loading, installUfw: true })
                            }}
                                className="cursor-pointer p-1 ring-1 ring-neutral-700 hover:bg-green-500 duration-75 ease-out">
                                <FontAwesomeIcon icon={loading.installUfw ? faCircleNotch : faDownload} spin={loading.installUfw} /> {" "}
                                Download Ufw
                            </button>}
                        </div>
                        {configData.ufwInstalled && <div className="flex flex-row gap-2 items-center justify-between">
                            <div className="flex flex-row gap-2">
                                <span>Ufw active:</span>
                                <span className={`${configData.ufwActive ? 'text-green-500' : 'text-rose-500'}`}>
                                    {String(configData.ufwActive)}
                                </span>
                            </div>
                            {!configData.false && <button onClick={() => {
                                activateUfw.mutate()
                                setLoading({ ...loading, activateUfw: true })
                            }}
                                className="cursor-pointer p-1 ring-1 ring-neutral-700 hover:bg-green-500 duration-75 ease-out">
                                <FontAwesomeIcon icon={loading.activateUfw ? faCircleNotch : faGear} spin={loading.activateUfw} /> {" "}
                                Activate Ufw
                            </button>}
                        </div>}
                        <div className="flex flex-row gap-2 items-center justify-between">
                            <div className="flex flex-row gap-2">
                                <span>DDNS configured:</span>
                                <span className="text-rose-500">false</span>
                            </div>
                            <button className="cursor-pointer p-1 ring-1 ring-neutral-700 hover:bg-green-500 duration-75 ease-out">
                                <FontAwesomeIcon icon={loading.installNginx ? faCircleNotch : faGear} spin={loading.installNginx} /> {" "}
                                Configure DDNS
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 p-5 ring-1 ring-neutral-700 rounded-md">
                        <span className="text-neutral-500">Provider settings:</span>
                        <div className="flex flex-row gap-1">
                            <span>Provider:</span>
                            <select name="" id="">
                                <option value="cloudflare">Cloudflare</option>
                            </select>
                        </div>
                        <CloudflareForm/>
                    </div>
                </div>
            </div>
        }
    }
}