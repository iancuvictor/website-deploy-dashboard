import { useContext, useState } from "react"
import { GlobalStatesContext } from "../../contexts/GlobalStatesContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const urlRegex = /^https?:\/\/[\da-z\.-]+\.[a-z\.]{2,6}[\/\w \.-]*\/?$/

export default function AddWebsite({ menu, setMenu }) {
    const queryClient = useQueryClient();
    const { darkMode } = useContext(GlobalStatesContext);
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        pingFrequency: 0,
    })

    const inputClass = `outline-none w-full ring-1 ring-neutral-400 p-2`;

    type NewSitePayload = {
        name: string;
        url: string;
        pingFrequency: number;
    };

    const createNewSite = useMutation({
        mutationFn: (newSite: NewSitePayload) => axios.post(`${API_URL}/api/websites/addWebsite`, newSite),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sites'] })
        },
    });

    const addWebsite = () => {
        createNewSite.mutate(formData);
    }

    return <div className="fixed z-2 top-0 left-0 flex items-center justify-center h-full w-full bg-black/90">
        <div className={`${darkMode ? 'bg-neutral-900 text-white' : 'bg-white text-black'} 
        relative flex flex-col gap-5
        h-fit w-150 ring-1 ring-neutral-600 rounded-md p-10`}>
            <FontAwesomeIcon onClick={() => setMenu({ ...menu, addWebsite: false })} className={`absolute right-5 top-5`} icon={faX} />
            <h1 className="text-[20px] font-[700]">Add website</h1>
            <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                    <span>Enter page name</span>
                    {!formData.name && <span className='text-rose-500 text-[14px]'>Please enter a name</span>}
                    <input type="text" placeholder="Website name"
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={inputClass} />
                </div>
                <div className="flex flex-col gap-1">
                    <span>Enter page URL</span>
                    {formData.url !== '' &&
                        !urlRegex.test(formData.url) &&
                        <span className='text-rose-500 text-[14px]'>Please enter a valid url</span>}
                    <input type="text" placeholder="https://www.your_webpage.com/"
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        className={inputClass} />
                </div>
                <div className="flex flex-col gap-1">

                    <span>Enter ping frequency (ms)</span>
                    {!formData.pingFrequency && <span className="text-rose-500 text-[14px]">Please enter a valid frequency</span>}
                    <input type="number" placeholder="100ms"
                        onChange={(e) => setFormData({ ...formData, pingFrequency: +e.target.value })}
                        className={inputClass} />
                </div>
            </div>
            <div className='w-full flex justify-between'>
                <button onClick={() => addWebsite()}
                    className="cursor-pointer bg-black p-3 min-w-30 rounded-xs text-[16px] text-gray-500 hover:text-white">Add website</button>
                <button onClick={() => setMenu({ ...menu, addWebsite: false })}
                    className="cursor-pointer bg-rose-500 hover:bg-rose-600 p-3 min-w-30 rounded-xs text-[16px]">Cancel</button>
            </div>
        </div>
    </div>
};