import { useQueryClient } from "@tanstack/react-query"
import useUpdateWebsite from "../../../utils/updateWebsite"
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFloppyDisk, faPause, faPlay } from "@fortawesome/free-solid-svg-icons"
import usePauseResumePinging from "../../../utils/pauseResumePinging"
import { usePopUps } from "../../../contexts/PopUpsContext"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

type LastCertProps = {
    websiteData: {
        _id: string,
        certPinging: boolean,
        certFrequency: number,
    },
    lastCert: {
        authError: string | null,
        hostname: string,
        createdAt: string,
        updatedAt: string,
        issuer: {
            O: string,
            CN: string
        },
        valid: boolean,
        validFrom: string,
        validTo: string,
        websiteId: string,
        _id: string
    }
    deploymentId: string,
}

type Form = {
    id: string,
    certFrequency: number,
}

const API_URL = import.meta.env.VITE_API_URL

export default function CertificateStatus({ websiteData, lastCert, deploymentId }: LastCertProps) {
    const queryClient = useQueryClient();
    const updateWebsite = useUpdateWebsite();
    const pauseResumePinging = usePauseResumePinging(websiteData._id, 'certificate', deploymentId);
    const { requestConfirm } = usePopUps();

    let defaultData = {
        id: websiteData._id,
        certFrequency: websiteData.certFrequency
    }

    const [form, setForm] = useState<Form>(defaultData)

    const deleteCertPings = useMutation({
        mutationFn: (websiteId: string) => axios.delete(`${API_URL}/api/websites/certificates?id=${websiteId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['website', websiteData._id] });
            if (deploymentId !== undefined) {
                queryClient.invalidateQueries({ queryKey: ['deployment', deploymentId] });
            }
            toast.success(`All pings have successfuly been deleted`);
        }
    })

    let daysRemaining = Math.round((new Date(lastCert?.validTo).getTime() - Date.now()) / 1000 / 60 / 60 / 24);

    useEffect(() => {
        setForm(defaultData);
    }, [websiteData])

    if (lastCert) {
        return <div className={`flex flex-col justify-between h-100 w-100 ring-1 ring-neutral-700 p-5`}>
            <div className="flex flex-col gap-1">

                <div className="w-full">
                    <button onClick={() => pauseResumePinging.mutate(!websiteData.certPinging, {
                        onSuccess: () => {
                            queryClient.invalidateQueries({ queryKey: ['website', websiteData._id] })
                        }
                    })}
                        className="cursor-pointer">
                        <FontAwesomeIcon icon={websiteData.certPinging ? faPause : faPlay} /> {" "}
                        {websiteData.certPinging
                            ? <span className="text-green-500">Currently checking certificate</span>
                            : <span className="text-rose-500">Paused checking certificate</span>}
                    </button>
                </div>
                <div className="flex flex-row gap-4 items-center">
                    <span>Check frequency: {" "}
                        <input type="number" value={form.certFrequency} onChange={(e) => setForm({ ...form, certFrequency: +e.target.value })}
                            className="w-15 outline-none ring-1 ring-neutral-700 pr-2 pl-2" /> days
                    </span>
                    {JSON.stringify(defaultData) !== JSON.stringify(form) &&
                        <button onClick={() => updateWebsite.mutate(form, {
                            onSuccess: () => {
                                queryClient.invalidateQueries({ queryKey: ['website', websiteData._id] })
                            }
                        })}
                            className="absolute right-5 cursor-pointer text-white ring-1 ring-neutral-700 p-2 hover:bg-green-500 duration-75 ease-out">
                            <FontAwesomeIcon icon={faFloppyDisk} /></button>}
                </div>
                <span><span className="text-gray-400">Organization:</span> {lastCert.issuer.O}</span>
                <span><span className="text-gray-400">Common name:</span> {lastCert.issuer.CN}</span>
                <span><span className="text-gray-400">Issue type:</span> {lastCert.authError || 'proper certification'}</span>
                <span><span className="text-gray-400">Host name:</span> {lastCert.hostname}</span>
                <span><span className="text-gray-400">Days remaining:</span> {daysRemaining > 0 && daysRemaining} {" "}
                    {daysRemaining < 0 ? <span className="text-rose-500">EXPIRED</span>
                        : daysRemaining > 1 ? 'days' : 'day'}</span>
                <span><span className="text-gray-400">Validity: </span>{new Date(lastCert.validFrom).toLocaleDateString()} - {new Date(lastCert.validTo).toLocaleDateString()}</span>
                <span><span className="text-gray-400">Valid:</span> <span className={lastCert.valid ? 'text-green-500' : 'text-rose-500'}>{String(lastCert.valid)}</span></span>
            </div>
            <button onClick={() => requestConfirm({
                message: `Are you sure you want to delete every recorded SSL certification check? This action is permanent.`,
                confirmText: 'Yes, delete every check.',
                denyText: 'Cancel',
                onConfirm: () => {
                    deleteCertPings.mutate(websiteData._id)
                },
            })} className="cursor-pointer bg-rose-500 hover:bg-rose-600 text-white w-40 p-2">delete checks</button>
        </div>
    } else {
        return <div className={`relative flex flex-col gap-1 h-100 w-100 ring-1 ring-neutral-700 p-5`}>
            <div className="w-full">
                <button onClick={() => pauseResumePinging.mutate(!websiteData.certPinging, {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['website', websiteData._id] })
                    }
                })}
                    className="cursor-pointer">
                    <FontAwesomeIcon icon={websiteData.certPinging ? faPause : faPlay} /> {" "}
                    {websiteData.certPinging
                        ? <span className="text-green-500">Currently checking certificate</span>
                        : <span className="text-rose-500">Paused checking certificate</span>}
                </button>
            </div>
            <div className="flex flex-row gap-4 items-center">
                <span>Check frequency: {" "}
                    <input type="number" value={form.certFrequency} onChange={(e) => setForm({ ...form, certFrequency: +e.target.value })}
                        className="w-15 outline-none ring-1 ring-neutral-700 pr-2 pl-2" /> days
                </span>
                {JSON.stringify(defaultData) !== JSON.stringify(form) &&
                    <button onClick={() => updateWebsite.mutate(form, {
                        onSuccess: () => {
                            queryClient.invalidateQueries({ queryKey: ['website', websiteData._id] })
                        }
                    })}
                        className="absolute right-5 cursor-pointer text-white ring-1 ring-neutral-700 p-2 hover:bg-green-500 duration-75 ease-out">
                        <FontAwesomeIcon icon={faFloppyDisk} /></button>}
            </div>
            <span>No check has been made</span>
        </div>
    }
}