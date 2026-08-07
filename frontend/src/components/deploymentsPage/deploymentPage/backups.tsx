import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { usePopUps } from "../../../contexts/PopUpsContext";
import { toast } from "sonner";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faFloppyDisk } from "@fortawesome/free-solid-svg-icons";

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

    const updateBackupData = useMutation({
        mutationFn: ({ id, form }: { id: string, form: Form }) => axios.put(`${API_URL}/api/deployments/deployment/${id}/backup`, form),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deployment', id] })
            toast.success(`Backup data successfully updated`);
        }
    })

    return <div className="ring-1 ring-neutral-700 p-5 w-100 h-100 flex flex-col gap-1">
        <span className="text-[16px]">Backups [from root folder]</span>
        <div className="flex flex-col gap-1">
            {!form.backupLocation && <span className='text-rose-500 text-[14px]'>Please enter a backup path</span>}
            <div className="flex flex-row gap-2">
                <input type="text" className={formInputStyle}
                    value={form.backupLocation}
                    onChange={(e) => setForm({ ...form, backupLocation: e.target.value })}
                    placeholder="Backups location path has not been specified" />
                {backupLocation !== form.backupLocation && <button onClick={() => updateBackupData.mutate({ id, form })}
                    className="cursor-pointer text-white ring-1 ring-neutral-700 p-2 hover:bg-green-500 duration-75 ease-out w-fit">
                    <FontAwesomeIcon icon={faFloppyDisk} /></button>}
            </div>
        </div>
        <div className="flex flex-col w-full h-full ring-1 ring-neutral-700 overflow-y-scroll">
            {backupData.length > 0 ? backupData.map((backup) => {
                return <div key={backup._id} className="w-full flex flex-row justify-between p-3">
                    <span>{backup.createdAt}</span>
                    <FontAwesomeIcon icon={faCircle} className={backup.active ? 'text-green-500' : 'text-neutral-700'} />
                </div>
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