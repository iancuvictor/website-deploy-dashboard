import { useNavigate, useParams } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { type AxiosResponse, AxiosError } from "axios";
import { useContext } from "react";
import { GlobalStatesContext } from "../../../contexts/GlobalStatesContext";
import ErrorPage from "../../errorPages/errorPage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import MainSettings from "./mainSettings";
import Backups from "./backups";
// import PingsData from "../../websitesPage/websitePage/pingsData";
// import PingTable from "../../websitesPage/websitePage/pingTable";
// import CertificateStatus from "../../websitesPage/websitePage/certificateStatus";
// import Chart from "../../websitesPage/websitePage/chart";
import { usePopUps } from "../../../contexts/PopUpsContext";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

export default function DeploymentPage() {
    const { darkMode } = useContext(GlobalStatesContext);
    const { id } = useParams()
    const navigate = useNavigate();

    const { requestConfirm } = usePopUps();

    const { data, isLoading, error } = useQuery<AxiosResponse, AxiosError<{ message: string }>>({
        queryKey: ['deployment', id],
        queryFn: () => axios.get(`${API_URL}/api/deployments/deployment?id=${id}`),
    });

    const deploymentData = data?.data
    const path = deploymentData?.targetType === 'local' ? deploymentData?.localPath : deploymentData?.remotePath

    const deleteDeployment = useMutation({
        mutationFn: (id: string) => axios.delete(`${API_URL}/api/deployments/deployment?id=${id}`),
        onSuccess: () => {
            navigate(`/deployments`)
            toast.success(`Deployment successfully deleted`);
        }
    })

    if (error) {
        return <ErrorPage error={error} />
    } else {
        if (isLoading || data === undefined) {
            return <div className="absolute flex flex-col items-center justify-center h-full w-full text-white text-[40px]">
                <FontAwesomeIcon icon={faCircleNotch} spin />
            </div>
        } else {
            return <div className={`${darkMode ? 'text-white' : 'text-black'} flex flex-col items-center gap-10 h-full w-full p-10`}>
                <div className="flex flex-col items-center justify-center">
                    <h1 className="text-[30px] font-[700]">Viewing: {deploymentData.name}</h1>
                </div>
                <div className="w-full flex flex-row gap-10">
                <MainSettings data={data} id={id} />
                <Backups id={deploymentData._id} path={path} backupLocation={deploymentData.backupLocation}/>
                {/* <PingsData/>
                <PingTable/>
                <CertificateStatus/>
                <Chart/> */}
                </div>
                <button onClick={() => requestConfirm({
                    message: `Are you SURE you want to delete this deployment? All the data that's been recorded with it will be PERMANENTLY deleted! This acction cannot be undone!`,
                    confirmText: `Yes, permanently delete deployment`,
                    denyText: `No, cancel`,
                    onConfirm: () => deleteDeployment.mutate(id)
                })}
                className="cursor-pointer absolute right-10 bg-rose-500 hover:bg-rose-600 p-2">Delete deployment</button>
            </div>
        }
    }
}