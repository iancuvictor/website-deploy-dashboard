import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faX } from "@fortawesome/free-solid-svg-icons"
import { useState, useEffect, useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

type Step = {
    subPath: string,
    command: string,
    url: string,
    pid: number,
    status: string,
    dependenciesInstalled: boolean
}

type DeploymentData = {
    targetType: string,
    name: string,
    deploymentUrl: string,
    localPath: string,
    remotePath: string,
    host: string,
    lastRunAt: string,
    lastRunOutput: string,
    lastRunStatus: string,
    port: number,
    privateKeyPath: string,
    steps: Partial<Step>[],
    createdAt: string,
    updatedAt: string,
    username: string,
    _id: string,
}

type MainSettingsProps = {
    data: any,
    id: string
}

const API_URL = import.meta.env.VITE_API_URL;

export default function MainSettings({ data, id }: MainSettingsProps) {
    let deploymentData = data?.data;

    const formInputStyle = `px-3 py-2.5 ring-1 ring-neutral-700 rounded-xs text-[14px] w-full no-underline`;

    const [form, setForm] = useState<DeploymentData>(deploymentData)

    let path = form?.targetType === 'local' ? form?.localPath : form?.remotePath
    let formPath = form?.targetType === 'local' ? 'localPath' : 'remotePath'

    const queryClient = useQueryClient()


    const updateDeploymentData = useMutation({
        mutationFn: (form: DeploymentData) => axios.put(`${API_URL}/api/deployments/deployment?id=${id}`, form),
        onSuccess: () => {
            toast.success(`Data successfully updated`)
        }
    })

    let currentStatus;

    const deployWebsite = useMutation({
        mutationFn: (id: string) => axios.post(`${API_URL}/api/deployments/deploy?id=${id}`),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['deployment', id] })
            toast.success(`Website successfully deployed`);
            currentStatus = response.data.status;
        }
    })

    const stopDeployment = useMutation({
        mutationFn: (id: string) => axios.post(`${API_URL}/api/deployments/stopDeployment?id=${id}`),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['deployment', id] })
            toast.success(`Website successfully closed`);
            currentStatus = response.data.status;
        }
    })

    const installDependencies = useMutation({
        mutationFn: (id: string) => axios.post(`${API_URL}/api/deployments/installDependencies?id=${id}`),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['deployment', id] })
            toast.success(`Dependencies successfully downloaded`);
            currentStatus = response.data.status;
        }
    })

    const areDependenciesInstalled = useMemo(() => {
        return deploymentData.steps.filter((step) => step.dependenciesInstalled === false).length === 0
    }, [data])

    useEffect(() => {
        setForm(deploymentData)
    }, [data])

    let saveButtonActive = JSON.stringify(deploymentData) !== JSON.stringify(form)

    return <div>
        <div className="flex flex-col gap-5 p-5 rounded-xs ring-1 ring-neutral-700 w-200">
            <div className="flex flex-col gap-3">
                <span className="text-[14px] text-neutral-500">Basic information</span>
                <div className="flex flex-col gap-3">

                    <span>Deployment type: {form.targetType}</span>
                    <div className="flex flex-row gap-2 items-center">
                        <span className="whitespace-nowrap">Root path:</span>
                        <input type="text" value={path} onChange={(e) => setForm({ ...form, [formPath]: e.target.value })} className={formInputStyle} />
                    </div>
                    {/* <div className="flex flex-row gap-2 items-center">
                        <span className="whitespace-nowrap">Deployment URL:</span>
                        <input type='text' value={form.deploymentUrl} onChange={(e) => setForm({ ...form, deploymentUrl: e.target.value })}
                            className={`${formInputStyle} text-blue-400`} />
                    </div> */}
                </div>
            </div>
            <div className="flex flex-col gap-3">
                <span className="text-[14px] text-neutral-500">Routes and package management</span>
                <div className="flex flex-col gap-3">

                    <button onClick={() => setForm({ ...form, steps: [...form.steps, { subPath: '', command: '' }] })
                    }
                        className="cursor-pointer hover:bg-neutral-900 ring-1 ring-neutral-700 p-2 w-fit">Add sub-route {" "}
                        <FontAwesomeIcon icon={faPlus} /></button>
                    <div className="flex flex-col gap-3">
                        {form.steps.map((step, i) => {
                            return <div key={i} className="flex flex-col gap-3">
                                <div className="flex flex-row items-center justify-center gap-3">
                                    <span>Route</span>
                                    <input type="text"
                                        className={formInputStyle}
                                        value={step.subPath || ''}
                                        onChange={(e) => setForm({
                                            ...form, steps: form.steps.map((step, index) => {
                                                return index === i ? { ...step, subPath: e.target.value } : step
                                            })
                                        })}
                                        placeholder="eg. /frontend" />
                                    <span>command</span>
                                    <input type="text"
                                        className={formInputStyle}
                                        value={step.command || ''}
                                        onChange={(e) => setForm({
                                            ...form, steps: form.steps.map((step, index) => {
                                                return index === i ? { ...step, command: e.target.value } : step
                                            })
                                        })}
                                        placeholder="eg. npm run dev" />
                                    <button onClick={() => setForm({ ...form, steps: form.steps.filter((step, index) => index !== i) })}
                                        className="cursor-pointer bg-rose-500 hover:bg-rose-600 p-2 rounded-xs">
                                        <FontAwesomeIcon icon={faX} />
                                    </button>
                                </div>
                                <div className="flex flex-row items-center justify-center gap-3">
                                <span className="whitespace-nowrap">Deployment URL</span>
                                    <input type="text"
                                        className={`${formInputStyle} text-blue-400`}
                                        value={step.url || ''}
                                        onChange={(e) => setForm({
                                            ...form, steps: form.steps.map((step, index) => {
                                                return index === i ? { ...step, url: e.target.value } : step
                                            })
                                        })}
                                        placeholder="eg. https://www.yoursite.com/" />
                                            </div>
                            </div>
                        })}
                    </div>
                    {areDependenciesInstalled && <span className="text-green-500 text-[14px]">All dependencies have been installed</span>}
                    <button onClick={() => installDependencies.mutate(id)}
                        className={`${formInputStyle} cursor-pointer hover:bg-neutral-900 active:bg-black`}>
                        Install all dependencies</button>
                </div>
                <div className="w-full flex flex-row justify-between">
                    <button disabled={!saveButtonActive} onClick={() => {
                        console.log('hit');
                        updateDeploymentData.mutate(form)
                    }}
                        className={`${saveButtonActive ? 'cursor-pointer bg-green-500 hover:bg-green-600' : 'text-neutral-700'} 
                        ring-1 ring-neutral-700 p-2 w-fit duration-75 ease-out`}>Save changes</button>

                    <div className="flex flex-row gap-5">

                        <button onClick={() => stopDeployment.mutate(id)}
                            className="cursor-pointer w-fit bg-rose-500 hover:bg-rose-600 shadow-lg/40 
                    shadow-rose-500 hover:shadow-rose-600 ring-1 ring-neutral-700 p-2 rounded-xs">Stop deployment</button>
                        <button onClick={() => deployWebsite.mutate(id)}
                            className="cursor-pointer w-fit bg-green-500 hover:bg-green-600 shadow-lg/40 
                        shadow-green-500 hover:shadow-green-600 ring-1 ring-neutral-700 p-2 rounded-xs">Deploy website</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
}