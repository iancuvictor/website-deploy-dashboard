import { useContext } from "react"
import { GlobalStatesContext } from "../../contexts/GlobalStatesContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircle } from "@fortawesome/free-solid-svg-icons"

type PingCardProps = {
    createdAt: string,
    updatedAt: string,
    responseTime: number,
    status: boolean,
    websiteId: string,
    _id: string,
}

type PingDataType = {
    pingData: PingCardProps
}

export default function PingCard({pingData} : PingDataType){
    const { darkMode } = useContext(GlobalStatesContext);

    return <div className={`${darkMode ? 'text-white' : 'text-black'} 
    flex flex-row gap-2 items-center justify-between ring-1 ring-neutral-700 w-full p-2 h-10`}>
        <span>{new Date(pingData.createdAt).toLocaleTimeString()}</span>
        <span>{pingData.responseTime} ms</span>
        <FontAwesomeIcon icon={faCircle} className={pingData.status ? `text-green-500` : `text-rose-500`} />
    </div>
}