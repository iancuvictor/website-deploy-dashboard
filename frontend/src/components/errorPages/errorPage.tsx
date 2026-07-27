import { useContext } from "react"
import { GlobalStatesContext } from "../../contexts/GlobalStatesContext";
import type { AxiosError } from 'axios';
import { NavLink } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

type ErrorPageProps = {
    error: AxiosError<{ message: string }>;
}

export default function ErrorPage({ error }: ErrorPageProps) {
    const { darkMode } = useContext(GlobalStatesContext);

    return <div className={`${darkMode ? 'text-white' : 'text-black'} 
    fixed top-0 flex flex-col gap-5 items-center justify-center h-full w-full p-10`}>
        <span className="text-[60px] font-[700]">ERROR {error.status}</span>
        <div className="flex flex-col items-center justify-center">
        <h1 className='text-[20px] font-[700] text-gray-400'>Something's definitely wrong... here's a clue:</h1>
        <p>{error.response?.data?.message ?? error.message}</p>
        </div>
        <NavLink to='/' className={`cursor-pointer p-2 ring-1 ring-neutral-700 hover:bg-neutral-900 rounded-xs`}><FontAwesomeIcon icon={faChevronLeft}/> Head back to the main page</NavLink>
    </div>
}