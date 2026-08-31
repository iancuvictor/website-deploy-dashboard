import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { usePopUps } from "../../../contexts/PopUpsContext";
import { toast } from "sonner";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp, faCircle, faFloppyDisk, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import BackupCard from "./backupCard";

const API_URL = import.meta.env.VITE_API_URL;

type Backup = {
    _id: string,
    deploymentId: string,
    active: boolean,
    createdAt: string,
}

type BackupsProps = {
    id: string,
    path: string,
    backupLocation: string | null,
    backupData: Backup[]
}

type Form = {
    backupLocation: string
}


export default function Backups({ id, path, backupLocation, backupData }: BackupsProps) {

    const { requestConfirm } = usePopUps();
    const queryClient = useQueryClient()
    const [view, setView] = useState(false);

    const formInputStyle = `px-3 py-2.5 ring-1 ring-neutral-700 rounded-xs text-[14px] w-full no-underline`;

    const [form, setForm] = useState<Form>({
        backupLocation: backupLocation,
    })

    const createBackup = useMutation({
        mutationFn: (id: string) => axios.post(`${API_URL}/api/deployments/deployment/${id}/backup?path=${path}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deployment', id] })
            toast.success(`Backup created successfully`);
        }
    })

    const openBackupsFolder = useMutation({
        mutationFn: (path: string) => axios.post(`${API_URL}/api/deployments/openFolder`, { path }),
        onError: () => {
            toast.error(`Cannot find logs folder`)
        }
    })

    const updateBackupData = useMutation({
        mutationFn: ({ id, form }: { id: string, form: Form }) => axios.put(`${API_URL}/api/deployments/deployment/${id}/backup`, form),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deployment', id] })
            toast.success(`Backup data successfully updated`);
        }
    })

    return <div className={`${view ? 'h-100' : 'h-40'} ring-1 ring-neutral-700 p-5 w-full flex flex-col gap-3 duration-150`}>
        <div className="flex flex-row items-center justify-between gap-2">
            <span className="text-[16px] whitespace-nowrap">Backups [from root folder]</span>
            <div className="flex flex-row items-center gap-2 w-full">
                <div className="flex flex-col gap-1 w-full">
                    {/* {!form.backupLocation && <span className='text-rose-500 text-[14px]'>Please enter a backup path</span>} */}
                    <div className="flex flex-row gap-2">
                        <input type="text" className={formInputStyle}
                            value={form.backupLocation}
                            onChange={(e) => setForm({ ...form, backupLocation: e.target.value })}
                            placeholder="Backups location path has not been specified" />
                        {backupLocation !== form.backupLocation && <button onClick={() => {
                            if (form.backupLocation === '') {
                                setForm({ ...form, backupLocation: backupLocation })
                                toast.error(`Backup path cannot be empty`)
                            } else {
                                updateBackupData.mutate({ id, form })
                            }
                        }}
                            className="cursor-pointer text-white ring-1 ring-neutral-700 p-2 hover:bg-green-500 duration-75 ease-out w-fit">
                            <FontAwesomeIcon icon={faFloppyDisk} /></button>}
                    </div>
                </div>
                <button onClick={() => openBackupsFolder.mutate(backupLocation)}
                    className="cursor-pointer ring-1 ring-neutral-700 p-2 hover:bg-neutral-900 whitespace-nowrap">
                    <FontAwesomeIcon icon={faFolderOpen} /> Open location</button>
                <button onClick={() => setView(!view)} className="cursor-pointer p-2 ring-1 ring-neutral-700 hover:bg-neutral-900">
                    <FontAwesomeIcon icon={view ? faCaretDown : faCaretUp} /></button>
            </div>
        </div>
        <div className={`${view ? 'h-full p-2 ring-1 ring-neutral-700 overflow-y-scroll opacity-100'
            : 'p-0 h-0 overflow-hidden opacity-0'} 
                duration-150 ease-out whitespace-pre-wrap`}>
            {backupData.length > 0 ? backupData.map((backup) => {
                return <BackupCard data={backup} key={backup._id} />
            }) : <span className="w-full text-center p-3">No backups have been created yet</span>}
        </div>
        <button onClick={() => requestConfirm({
            message: 'Are you sure you want to create a backup?',
            confirmText: 'Yes',
            denyText: 'No',
            onConfirm: () => createBackup.mutate(id)
        })}
            className="cursor-pointer bg-green-500 hover:bg-green-600 p-2">Create Back-up
        </button>
    </div>
}