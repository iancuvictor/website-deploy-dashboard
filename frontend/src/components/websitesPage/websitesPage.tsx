import { useState, useEffect } from "react";
import { WebsiteCard } from "../index.js";
import AddWebsite from "./addWebsite.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { io } from 'socket.io-client';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

const API_URL = import.meta.env.VITE_API_URL;

const socket = io(import.meta.env.VITE_API_URL);

export default function WebsitesPage() {
    const queryClient = useQueryClient();
    const [menu, setMenu] = useState({
        addWebsite: false,
    })

    const { data, isLoading, error } = useQuery({
        queryKey: ['websites'],
        queryFn: () => axios.get(`${API_URL}/api/websites`),
    });

    useEffect(() => {
        socket.on('websiteUpdate', () => {
            queryClient.invalidateQueries({ queryKey: ['websites'] });
        });

        return () => {
            socket.off('websiteUpdate');
        };
    }, [queryClient]);

    if (isLoading) {
        return <div className="absolute flex flex-col items-center justify-center h-full w-full text-white text-[40px]">
            <FontAwesomeIcon icon={faCircleNotch} spin={true}/>
        </div>
    } else {
        return <div className={`absolute flex flex-col items-center p-10 h-full w-full`}>
            {menu.addWebsite && <AddWebsite menu={menu} setMenu={setMenu} />}
            <button onClick={() => setMenu({ ...menu, addWebsite: true })} className="cursor-pointer text-white">Add website</button>
            <div className="flex flex-wrap items-center gap-10">
                {!isLoading && data.data.length !== 0 ? data.data.map((website) => {
                    return <WebsiteCard websiteData={website} key={website._id} />
                }) : <div className="text-white bg-neutral-950 ring-1 ring-neutral-700 p-10">
                    <h1>No websites are being tracked at the moment...</h1>
                    </div>}
            </div>
        </div>
    }
}
