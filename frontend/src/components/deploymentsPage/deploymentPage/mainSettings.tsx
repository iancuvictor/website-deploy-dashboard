import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronRight, faCircle, faCircleNotch, faEye, faEyeSlash, faPlus, faX } from "@fortawesome/free-solid-svg-icons"
import { useState, useEffect, useMemo, useContext } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { usePopUps } from "../../../contexts/PopUpsContext"
import { type Dispatch, type SetStateAction } from "react"
import { GlobalStatesContext } from "../../../contexts/GlobalStatesContext"

type Step = {
    subPath: string,
    command: string,
    deploymentUrl: string,
    localUrl: string,
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
    backupLocation: string,
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
    data: DeploymentData,
    id: string,
    viewWebsite: number,
    setViewWebsite: Dispatch<SetStateAction<number>>;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function MainSettings({ data, id, viewWebsite, setViewWebsite }: MainSettingsProps) {
    const { darkMode } = useContext(GlobalStatesContext)
    const formInputStyle = `px-3 py-2.5 ring-1 ring-neutral-700 rounded-xs text-[14px] w-full no-underline`;

    const [form, setForm] = useState<DeploymentData>(data)
    const [uiEffects, setUiEffects] = useState({
        deploying: false,
    })

    let path = form?.targetType === 'local' ? form?.localPath : form?.remotePath
    let formPath = form?.targetType === 'local' ? 'localPath' : 'remotePath'

    const queryClient = useQueryClient()

    const { requestConfirm } = usePopUps();

    // let currentStatus;
    const updateDeploymentData = useMutation({
        mutationFn: (form: DeploymentData) => axios.put(`${API_URL}/api/deployments/deployment?id=${id}`, form),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deployment', id] })
            toast.success(`Data successfully updated`)
        }
    })

    const deployWebsite = useMutation({
        mutationFn: (id: string) => axios.post(`${API_URL}/api/deployments/deploy?id=${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deployment', id] })
            setUiEffects({...uiEffects, deploying: false})
            toast.success(`Website successfully deployed`);
        }
    })

    const stopDeployment = useMutation({
        mutationFn: (id: string) => axios.post(`${API_URL}/api/deployments/stopDeployment?id=${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deployment', id] })
            toast.success(`Website successfully closed`);
        }
    })

    const installDependencies = useMutation({
        mutationFn: (id: string) => axios.post(`${API_URL}/api/deployments/installDependencies?id=${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deployment', id] })
            toast.success(`Dependencies successfully downloaded`);
        }
    })

    const areDependenciesInstalled = useMemo(() => {
        return data.steps.filter((step) => step.dependenciesInstalled === false).length === 0
    }, [data])

    useEffect(() => {
        setForm(data)
    }, [data])

    let saveButtonActive = JSON.stringify(data) !== JSON.stringify(form)

    let stopDeploymentButton = form.steps.filter((step) => step.pid !== null).length > 0;

    return <div>
        <div className="flex flex-col gap-5 p-5 rounded-xs ring-1 ring-neutral-700 w-200 h-205">
            <div className="flex flex-col gap-3">
                <span className="text-[18px] text-neutral-500">Basic information</span>
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
                <div className="flex flex-row gap-3 items-center">
                    <span className="text-[16px] text-neutral-500">Routes and package management</span>
                    <button onClick={() => setForm({ ...form, steps: [...form.steps, { subPath: '', command: '' }] })}
                        className="cursor-pointer hover:bg-neutral-900 ring-1 ring-neutral-700 p-2 w-fit text-[14px]">Add sub-route {" "}
                        <FontAwesomeIcon icon={faPlus} /></button>
                </div>
                <div className="flex flex-col gap-3">
                    <div className={`${darkMode ? 'bg-neutral-950' : 'bg-white'} flex flex-col gap-3 overflow-y-scroll h-105 p-2`}>
                        {form.steps.map((step, i) => {
                            return <div key={i} className={`${darkMode ? 'bg-neutral-900' : 'bg-white'} flex flex-col gap-2 ring-1 ring-neutral-700 p-3`}>
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
                                    <button onClick={() => requestConfirm({
                                        message: 'Are you sure you want to delete this sub-route? You can undo this by reloading the page.',
                                        confirmText: 'Yes, delete sub-route',
                                        denyText: 'Cancel',
                                        onConfirm: () => setForm({ ...form, steps: form.steps.filter((step, index) => index !== i) })
                                    })}
                                        className="cursor-pointer bg-rose-500 hover:bg-rose-600 p-2 rounded-xs">
                                        <FontAwesomeIcon icon={faX} />
                                    </button>
                                </div>
                                <div className="flex flex-row items-center justify-center gap-3">
                                    <span className="whitespace-nowrap">Deployment URL</span>
                                    <input type="text"
                                        className={`${formInputStyle} text-blue-400`}
                                        value={step.deploymentUrl || ''}
                                        onChange={(e) => setForm({
                                            ...form, steps: form.steps.map((step, index) => {
                                                return index === i ? { ...step, deploymentUrl: e.target.value } : step
                                            })
                                        })}
                                        placeholder="eg. https://www.yoursite.com/" />
                                </div>

                                <div className="flex flex-row items-center justify-center gap-3">
                                    <span className="whitespace-nowrap">Local URL</span>
                                    <input type="text"
                                        className={`${formInputStyle} text-blue-400`}
                                        value={step.localUrl || ''}
                                        onChange={(e) => setForm({
                                            ...form, steps: form.steps.map((step, index) => {
                                                return index === i ? { ...step, localUrl: e.target.value } : step
                                            })
                                        })}
                                        placeholder="eg. https://www.yoursite.com/" />
                                </div>
                                <div className="flex flex-row justify-between gap-5">
                                    <div className="flex flex-row gap-5">
                                        <span>Process ID: {step.pid || 'No process'}</span>
                                        <span>Status: {step.pid ? 'Active' : 'Down'} {" "}
                                            <FontAwesomeIcon icon={faCircle} className={step.pid ? 'text-green-500' : 'text-neutral-700'} />
                                        </span>
                                    </div>
                                    <button onClick={() => setViewWebsite(i)}
                                        className={`${viewWebsite === i ? 'text-white' : 'text-neutral-500 hover:text-white'} 
                                    cursor-pointer text-center align-center duration-75 ease-out`}>
                                        {viewWebsite === i ? 'Viewing data' : 'View data'} {" "}
                                        <FontAwesomeIcon icon={faChevronRight} />
                                    </button>
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
                        updateDeploymentData.mutate(form)
                    }}
                        className={`${saveButtonActive ? 'cursor-pointer bg-green-500 shadow-md/40 shadow-green-500 hover:bg-green-600' 
                        : 'ring-1 ring-neutral-700 text-neutral-700'} 
                        p-2 w-fit duration-75 ease-out`}>Save changes</button>

                    <div className="flex flex-row gap-5">
                        {stopDeploymentButton ? <button onClick={() => requestConfirm({
                            message: 'Are you sure you want to stop the deployment?',
                            confirmText: 'Yes, close connection',
                            denyText: 'No',
                            onConfirm: () => stopDeployment.mutate(id)
                        })}
                            className="cursor-pointer w-fit bg-rose-500 hover:bg-rose-600 shadow-lg/40 
                    shadow-rose-500 hover:shadow-rose-600 ring-1 ring-neutral-700 p-2 rounded-xs">Stop deployment</button>
                            : <button onClick={() => {
                                setUiEffects({ ...uiEffects, deploying: true })
                                deployWebsite.mutate(id)
                            }}
                                className="cursor-pointer w-fit bg-green-500 hover:bg-green-600 shadow-lg/40 
                        shadow-green-500 hover:shadow-green-600 ring-1 ring-neutral-700 p-2 rounded-xs text-center align-center">
                                {uiEffects.deploying ? 'Deploying...' : 'Deploy website'} {" "}
                                {uiEffects.deploying && <FontAwesomeIcon icon={faCircleNotch} spin />}
                            </button>}
                    </div>
                </div>
            </div>
        </div>
    </div>
}