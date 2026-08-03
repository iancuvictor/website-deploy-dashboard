import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { type AxiosResponse, AxiosError } from "axios";
import { useContext } from "react";
import { GlobalStatesContext } from "../../../contexts/GlobalStatesContext";
import ErrorPage from "../../errorPages/errorPage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import MainSettings from "./mainSettings";

const API_URL = import.meta.env.VITE_API_URL;

export default function DeploymentPage() {
    const { darkMode } = useContext(GlobalStatesContext);
    const { id } = useParams()

    const { data, isLoading, error } = useQuery<AxiosResponse, AxiosError<{ message: string }>>({
        queryKey: ['deployment', id],
        queryFn: () => axios.get(`${API_URL}/api/deployments/deployment?id=${id}`),
    });

    if (error) {
        return <ErrorPage error={error} />
    } else {
        if (isLoading || data === undefined) {
            return <div className="absolute flex flex-col items-center justify-center h-full w-full text-white text-[40px]">
                <FontAwesomeIcon icon={faCircleNotch} spin />
            </div>
        } else {
            return <div className={`${darkMode ? 'text-white' : 'text-black'} absolute flex flex-col items-center gap-10 h-full w-full p-10`}>
                <div className="flex flex-col items-center justify-center">
                    <h1 className="text-[30px] font-[700]">{data.data.name}</h1>
                    <a href={data.data.deploymentUrl} target="_blank"
                        className="cursor-pointer text-[16px] text-blue-400 hover:underline underline-offset-1">{data.data.deploymentUrl}</a>
                </div>
                <MainSettings data={data} id={id} />
            </div>
        }
    }
}