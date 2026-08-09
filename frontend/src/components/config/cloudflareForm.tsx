import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

type Form = {
    apiToken: string,
    zoneId: string,
    baseDomain: string
}

export default function CloudflareForm() {

    
    const formInputStyle = `px-3 py-2.5 ring-1 ring-neutral-700 rounded-xs text-[14px] w-full no-underline`;

    const { data, isLoading, error } = useQuery({
        queryFn: () => axios.get(`${API_URL}/api/config/cloudflareConfig`),
        queryKey: ['config']
    })
    const [form, setForm] = useState<Form>({
        apiToken: data?.data.apiToken,
        zoneId: data?.data.zoneId,
        baseDomain: data?.data.baseDomain
    })
    
    const saveConfig = useMutation({
        mutationFn: (form: Form) => axios.post(`${API_URL}/api/config/cloudflareConfig`, form),
        onSuccess: () => {
            toast.success(`Config successfully saved`);
        }
    })

    return <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
            <span>Api Token</span>
            <input onChange={(e) => setForm({...form, apiToken: e.target.value})}
            value={form.apiToken}
            type="text" className={formInputStyle} />
        </div>
        <div className="flex flex-col gap-1">
            <span>Zone ID</span>
            <input onChange={(e) => setForm({...form, zoneId: e.target.value})}
            value={form.zoneId}
            type="text" className={formInputStyle} />
        </div>
        <div className="flex flex-col gap-1">
            <span>Base domain</span>
            <input onChange={(e) => setForm({...form, baseDomain: e.target.value})}
            value={form.baseDomain}
            type="text" className={formInputStyle} />
        </div>
        <button onClick={() => saveConfig.mutate(form)}
        className="cursor-pointer ring-1 ring-neutral-700 p-2 w-fit hover:bg-green-500 duration-75 ease-out">
            Save config</button>
    </div>
}