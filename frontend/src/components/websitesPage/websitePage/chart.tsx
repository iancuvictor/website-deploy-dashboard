import { useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import negativeCheck from '../../../utils/negativeCheck';





// Bug to fix
// when changing the view length, data does not update accordingly, giving weird timestamps. also, it narrows down to the past instead of to the most recent.

const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: true, position: 'top' as const },
        tooltip: { enabled: true },
    },
    scales: {
        y: {
            beginAtZero: true,
            title: { display: true, text: 'ms' },
        },
        x: {
            title: { display: true, text: 'Time' },
        },
    },
};

type Ping = {
    _id: string,
    createdAt: string,
    updatedAt: string,
    websiteId: string,
    responseTime: number,
    status: boolean,
}

type DataProps = {
    data: Ping[]
};

export default function Chart({ data }: DataProps) {
    const [viewLast, setViewLast] = useState(6);
    let timeData = data.map((item) => new Date(item.createdAt).toLocaleTimeString());
    let responseData = data.map((item) => item.responseTime);

    const yAxis = {
        labels: timeData.slice(-viewLast),
        datasets: [
            {
                label: 'Response time (ms)',
                data: responseData,      
                borderColor: 'rgb(255, 32, 86)',
                backgroundColor: 'rgba(255, 32, 86, 0.6)',
                tension: 0.15,                  
            },
        ],
    };

    return <div className='flex flex-col gap-3 h-full w-full'>
        <span>View last: {" "}
            <input type="number" value={viewLast} 
                onChange={(e) => setViewLast(+e.target.value)}
                onBlur={(e) => {
                    negativeCheck(e, 2)
                    setViewLast(+e.target.value)
                }}
                className='outline-none ring-1 ring-neutral-700 pl-1 pr-1 w-20' />
            {" "} pings
        </span>
        <div className='h-100 w-200 ring-1 ring-neutral-700'>
            <Line data={yAxis} options={options} />
        </div>
    </div>
}