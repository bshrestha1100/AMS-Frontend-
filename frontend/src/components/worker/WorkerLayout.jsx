import React from 'react'
import { Outlet } from 'react-router-dom'
import WorkerSidebar from './WorkerSidebar.jsx'
import '../../styles/WorkerSidebar.css'

const WorkerLayout = () => {
    console.log("WorkerLayout rendering");

    return (
        <div className="worker-layout">
            <WorkerSidebar />
            <div className="worker-content">
                <Outlet />
            </div>
        </div>
    );
};

export default WorkerLayout;
