import { useContext } from "react"
import { GlobalStatesContext } from "../../contexts/GlobalStatesContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { type AxiosResponse, AxiosError } from "axios";
import DeploymentCard from "./deploymentPage/deploymentCard";
import ErrorPage from "../errorPages/errorPage";

const API_URL = import.meta.env.VITE_API_URL;

export default function DeploymentsPage() {
    const { darkMode } = useContext(GlobalStatesContext);

    const { data, isLoading, error } = useQuery<AxiosResponse, AxiosError<{ message: string }>>({
        queryKey: ['deployments'],
        queryFn: () => axios.get(`${API_URL}/api/deployments`)
    })

    let deployments = data?.data;

    if (error) {
        return <ErrorPage error={error} />
    } else {
        if (isLoading) {
            return <div className="absolute flex flex-col items-center justify-center h-full w-full text-white text-[40px]">
                <FontAwesomeIcon icon={faCircleNotch} spin />
            </div>
        } else {

            return <div className={`${darkMode ? 'text-white' : 'text-black'} 
    flex flex-col gap-5 items-center w-full p-10`}>
                <h1 className="font-[700] text-[30px]">DEPLOYMENTS</h1>
                <div className="flex flex-row gap-10">
                    {deployments.length > 0 ? deployments.map((deployment) => {
                        return <DeploymentCard data={deployment} />
                    }) : <div className="p-10 ring-1 ring-neutral-700">No deployments yet</div>}
                </div>
            </div>
        }
    }
}