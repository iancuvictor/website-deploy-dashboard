import { useContext, useState } from "react"
import { GlobalStatesContext } from "../../contexts/GlobalStatesContext"
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from 'react-router';

type Form = {
    name: string,
    targetType: string,
    deploymentUrl: string,
    path: string
}

const API_URL = import.meta.env.VITE_API_URL;

export default function NewDeployment() {
    const { darkMode } = useContext(GlobalStatesContext);
    const [form, setForm] = useState<Form>({
        name: '',
        targetType: '',
        deploymentUrl: '',
        path: '',
    })

    const navigate = useNavigate();

    const createNewDeployment = useMutation({
        mutationFn: (form: Form) => axios.post(`${API_URL}/api/deployments/newDeployment`, form),
        onSuccess: (response) => {
            navigate(`/deployments/${response.data.id}`)
            toast.success(`Deployment successfully created`);
        }
    })

    const inputStyle = `bg-black pt-1 pb-1 pl-2 pr-2 font-mozilla ring-1 ring-neutral-500 rounded-xs w-200`

    return <div className={`${darkMode ? 'text-white' : 'text-black'} 
    absolute h-full w-full flex flex-col items-center p-10`}>
        <div className="flex flex-col gap-5">
            <h1 className="text-[20px] font-[600]">Create new deployment project</h1>
            <div className="flex flex-col gap-3">
                <div className="flex flex-row gap-1 items-center">
                    <label>Deploy: </label>
                    <select id="countries" onChange={(e) => setForm({...form, targetType: e.target.value})}
                        className="cursor-pointer block w-fit px-3 py-2.5 outline-none ring-1 ring-neutral-700 rounded-base">
                        <option value="local" className="cursor-pointer bg-black">local</option>
                        <option value="remote" className="cursor-pointer bg-black">remote</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <span>Project name:</span>
                    <input type="text" onChange={(e) => setForm({...form, name: e.target.value})} className={inputStyle} />
                </div>
                {/* <div className="flex flex-col gap-1">
                    <span>Deployment URL:</span>
                    <input type="text" onChange={(e) => setForm({...form, deploymentUrl: e.target.value})} className={inputStyle} />
                </div> */}
                <div className="flex flex-col gap-1">
                    <span>Folder path:</span>
                    <input type="text" onChange={(e) => setForm({...form, path: e.target.value})} className={inputStyle} />
                </div>
            </div>
            <div className="flex flex-row w-full justify-between">
                <button onClick={() => createNewDeployment.mutate(form)}
                className="cursor-pointer p-3 bg-rose-500 hover:bg-rose-600 duration-75 ease-out rounded-xs">Create project</button>
            </div>
        </div>
    </div>
}