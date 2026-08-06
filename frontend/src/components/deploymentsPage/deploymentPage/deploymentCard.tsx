import { NavLink } from "react-router"

type DeploymentCardProps = {
    data: {
        _id: string,
        name: string
        deploymentUrl: string,
        targetType: string,
    }
}


export default function DeploymentCard({data} : DeploymentCardProps){
    return <div className="relative flex flex-col items-center gap-2 w-100 h-fit p-5 ring-1 ring-neutral-700 rounded-xs">
        <NavLink to={`${data._id}`} className='absolute top-0 left-0 h-full w-full'></NavLink>
        <span className="text-[18px] font-[700]">{data.name}</span>
        <span>Deployment type: {data.targetType}</span>
    </div>
}