import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircle } from "@fortawesome/free-solid-svg-icons"
import { useContext } from "react"
import { GlobalStatesContext } from "../../../contexts/GlobalStatesContext"

export default function BackupCard({data}) {
    const {darkMode} = useContext(GlobalStatesContext);


    return <div key={data._id} className={`${darkMode ? 'text-white' : 'text-black' } w-full flex flex-row justify-between p-3`}>
        <span>{data.createdAt}</span>
        <span>300 mb</span>
        <FontAwesomeIcon icon={faCircle} className={data.active ? 'text-green-500' : 'text-neutral-700'} />
    </div>
}