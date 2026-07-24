import { useContext } from "react"
import { GlobalStatesContext } from "../../contexts/GlobalStatesContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

type Website = {
    _id: string;
    name: string;
    url: string;
    pingFrequency: number;
};

type WebsiteCardProps = {
    websiteData: Website;
};

export default function WebsiteCard({ websiteData }: WebsiteCardProps) {
    const { darkMode } = useContext(GlobalStatesContext);

    console.log(websiteData);

    return <div className={`${darkMode ? 'bg-neutral-900 text-white' : 'text-black'} flex justify-between w-150 p-5 ring-1 rounded-xs`}>
        <div className="flex flex-col justify-evenly gap-1 w-100">
            <h1 className="text-[20px] font-[600]">{websiteData.name} <FontAwesomeIcon icon={faCircle} className='text-green-500' /></h1>
            <a href={websiteData.url} target="_blank" className="text-blue-400">{websiteData.url}</a>
            <span>Ping frequency: {websiteData.pingFrequency}ms</span>
            <span className="text-gray-400">Last checked: 30 sec ago</span>
            <span className="text-gray-400">Response time: 500ms</span>
            <span className="text-gray-400">Uptime percentage: 100%</span>
        </div>

        <div className="flex flex-col gap-2 w-50">
            <div className="relative w-50 h-50">
                <img src="https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png" alt="Website snapshot"
                    className="h-full w-full object-cover object-center" />
            </div>
        </div>
    </div>
}
