import { useState } from "react";
import { WebsiteCard } from "../index.js";
import AddWebsite from "./addWebsite.js";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function WebsitesPage() {
    const [menu, setMenu] = useState({
        addWebsite: false,
    })

    const { data, isLoading, error } = useQuery({
        queryKey: ['sites'],
        queryFn: () => axios.get(`${API_URL}/api/websites`),
    });

    return <div className={`absolute flex flex-col items-center p-10 h-full w-full`}>
        {menu.addWebsite && <AddWebsite menu={menu} setMenu={setMenu} />}
        <button onClick={() => setMenu({ ...menu, addWebsite: true })} className="text-white">Add website</button>
        {!isLoading && data.data.map((website) => {
            return <WebsiteCard websiteData={website} index={website._id}/>
        })}
    </div>
}
