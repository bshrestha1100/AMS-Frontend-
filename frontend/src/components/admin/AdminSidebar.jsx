import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
    FaHome,
    FaWineBottle,
    FaFileInvoiceDollar,
    FaUsers,
    FaClipboardCheck,
    FaSignOutAlt,
    FaUserCog,
    FaBuilding,
    FaUmbrellaBeach,
    FaTools,
    FaCalendarAlt,
    FaChartBar
} from 'react-icons/fa'

const AdminSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    return (
        <div style={{
            width: '250px',
            backgroundColor: '#1f2937',
            color: 'white',
            position: 'fixed',
            height: '100vh',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #374151' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Admin Panel</h2>
            </div>

            <nav style={{ flex: 1, padding: '20px 0' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ marginBottom: '8px' }}>
                        <NavLink
                            to="/admin/dashboard"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 20px',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                margin: '0 10px',
                                transition: 'background-color 0.3s'
                            }}
                            className={({ isActive }) => isActive ? 'bg-blue-600' : ''}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            <FaHome style={{ marginRight: '12px' }} />
                            Dashboard
                        </NavLink>
                    </li>

                    <li style={{ marginBottom: '8px' }}>
                        <NavLink
                            to="/admin/users"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 20px',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                margin: '0 10px',
                                transition: 'background-color 0.3s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            <FaUserCog style={{ marginRight: '12px' }} />
                            User Management
                        </NavLink>
                    </li>

                    <li style={{ marginBottom: '8px' }}>
                        <NavLink
                            to="/admin/apartments"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 20px',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                margin: '0 10px',
                                transition: 'background-color 0.3s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            <FaBuilding style={{ marginRight: '12px' }} />
                            Apartments
                        </NavLink>
                    </li>

                    <li style={{ marginBottom: '8px' }}>
                        <NavLink
                            to="/admin/maintenance"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 20px',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                margin: '0 10px',
                                transition: 'background-color 0.3s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            <FaTools style={{ marginRight: '12px' }} />
                            Maintenance
                        </NavLink>
                    </li>

                    <li style={{ marginBottom: '8px' }}>
                        <NavLink
                            to="/admin/leave-management"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 20px',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                margin: '0 10px',
                                transition: 'background-color 0.3s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            <FaCalendarAlt style={{ marginRight: '12px' }} />
                            Leave Management
                        </NavLink>
                    </li>

                    <li style={{ marginBottom: '8px' }}>
                        <NavLink
                            to="/admin/beverages"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 20px',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                margin: '0 10px',
                                transition: 'background-color 0.3s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            <FaWineBottle style={{ marginRight: '12px' }} />
                            Beverages
                        </NavLink>
                    </li>

                    <li style={{ marginBottom: '8px' }}>
                        <NavLink
                            to="/admin/beverage-consumption"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 20px',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                margin: '0 10px',
                                transition: 'background-color 0.3s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            <FaChartBar style={{ marginRight: '12px' }} />
                            Beverage Analytics
                        </NavLink>
                    </li>

                    <li style={{ marginBottom: '8px' }}>
                        <NavLink
                            to="/admin/utility-bills"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 20px',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                margin: '0 10px',
                                transition: 'background-color 0.3s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            <FaFileInvoiceDollar style={{ marginRight: '12px' }} />
                            Utility Bills
                        </NavLink>
                    </li>


                    <li style={{ marginBottom: '8px' }}>
                        <NavLink
                            to="/admin/rooftop-reservations"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 20px',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                margin: '0 10px',
                                transition: 'background-color 0.3s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            <FaUmbrellaBeach style={{ marginRight: '12px' }} />
                            Rooftop Reservations
                        </NavLink>
                    </li>

                    <li style={{ marginBottom: '8px' }}>
                        <NavLink
                            to="/admin/tenants"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 20px',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                margin: '0 10px',
                                transition: 'background-color 0.3s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            <FaUsers style={{ marginRight: '12px' }} />
                            Tenants
                        </NavLink>
                    </li>
                </ul>
            </nav>

            <div style={{ padding: '20px', borderTop: '1px solid #374151' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
                >
                    <FaSignOutAlt style={{ marginRight: '12px' }} />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
