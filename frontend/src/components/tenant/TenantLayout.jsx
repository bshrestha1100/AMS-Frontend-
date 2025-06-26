import React from 'react'
import { Outlet } from 'react-router-dom'
import TenantSidebar from './TenantSidebar.jsx'
import '../../styles/TenantSidebar.css'

const TenantLayout = () => {
    console.log("TenantLayout rendering");

    return (
        <div className="tenant-layout">
            <TenantSidebar />
            <div className="tenant-content">
                <Outlet />
            </div>
        </div>
    );
};

export default TenantLayout;
