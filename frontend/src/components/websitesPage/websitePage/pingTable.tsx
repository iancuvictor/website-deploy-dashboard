import { useContext } from "react"
import { GlobalStatesContext } from "../../../contexts/GlobalStatesContext"
import PingCard from "../../pingCard/pingCard"

type Ping = {
    createdAt: string,
    responseTime: 0,
    status: boolean,
    updatedAt: string,
    websiteId: string,
    _id: string,
}

type PingTableProps = {
    pingsData: Ping[]
    status: boolean
}


export default function PingTable({pingsData, status} : PingTableProps) {
    const { darkMode } = useContext(GlobalStatesContext);

    return <div className={`flex flex-col h-100 w-100 ring-1 ring-neutral-700 overflow-hidden overflow-y-scroll`}>
        {pingsData.length > 0 ? [...pingsData].filter((ping) => ping.status === status)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((ping) => {
                return <PingCard pingData={ping} key={ping._id} />
            }) : <div className={`${darkMode ? 'text-white' : 'text-black'} w-full text-center p-5`}>No pings have been recorded yet</div>}
    </div>
}