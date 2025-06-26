import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar.jsx'

const AdminLayout = () => {
    console.log("AdminLayout rendering");

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <AdminSidebar />
            <div style={{
                flex: 1,
                backgroundColor: '#f8fafc',
                minHeight: '100vh',
                marginLeft: '250px'
            }}>
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
