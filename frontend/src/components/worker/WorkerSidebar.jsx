import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
    FaBars,
    FaTimes,
    FaHome,
    FaUser,
    FaSignOutAlt,
    FaCalendarPlus,
    FaCalendarCheck,
    FaTools
} from 'react-icons/fa'
import api from '../../services/api'

const WorkerSidebar = () => {
    console.log("WorkerSidebar rendering");

    const [sidebar, setSidebar] = useState(false);
    const [userData, setUserData] = useState({ name: 'Loading...', role: 'worker' });
    const navigate = useNavigate();

    const showSidebar = () => setSidebar(!sidebar);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const response = await api.getCurrentUser();
            if (response.success && response.data) {
                setUserData(response.data);
                localStorage.setItem('user', JSON.stringify(response.data));
            }
        } catch (err) {
            console.error('Error loading user data:', err);
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            setUserData({
                name: storedUser.name || 'Worker',
                role: storedUser.role || 'worker',
                ...storedUser
            });
        }
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    return (
        <>
            <div className="navbar">
                <div className="menu-bars">
                    <FaBars onClick={showSidebar} />
                </div>
                <h2 style={{ color: 'white', marginLeft: '16px', fontSize: '1.5rem' }}>Worker Panel</h2>

                <div style={{
                    marginLeft: 'auto',
                    marginRight: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <span style={{ color: 'white', fontSize: '0.9rem' }}>
                        Welcome, {userData.name}
                    </span>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            padding: '8px',
                            borderRadius: '4px',
                            transition: 'background-color 0.3s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#1a83ff'}
                        onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        title="Logout"
                    >
                        <FaSignOutAlt />
                    </button>
                </div>
            </div>

            <nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
                <ul className="nav-menu-items" onClick={showSidebar}>
                    <li className="navbar-toggle">
                        <div className="menu-bars">
                            <FaTimes />
                        </div>
                    </li>

                    <li style={{
                        padding: '20px 16px',
                        borderBottom: '1px solid #1a83ff',
                        marginBottom: '10px'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            color: 'white'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: '#1a83ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '12px'
                            }}>
                                <FaUser style={{ fontSize: '1.2rem' }} />
                            </div>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                                    {userData.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#a0a0a0' }}>
                                    {userData.role?.charAt(0).toUpperCase() + userData.role?.slice(1) || 'Worker'}
                                </div>
                            </div>
                        </div>
                    </li>

                    <li className="nav-text">
                        <NavLink to="/worker/dashboard">
                            <FaHome />
                            <span>Dashboard</span>
                        </NavLink>
                    </li>

                    <li className="nav-text">
                        <NavLink to="/worker/profile">
                            <FaUser />
                            <span>My Profile</span>
                        </NavLink>
                    </li>

                    <li style={{
                        padding: '12px 16px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#a0a0a0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Maintenance
                    </li>

                    <li className="nav-text">
                        <NavLink to="/worker/maintenance-requests">
                            <FaTools />
                            <span>My Assigned Tasks</span>
                        </NavLink>
                    </li>

                    <li style={{
                        padding: '12px 16px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#a0a0a0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginTop: '10px'
                    }}>
                        Leave Management
                    </li>

                    <li className="nav-text">
                        <NavLink to="/worker/leave-request">
                            <FaCalendarPlus />
                            <span>Request Leave</span>
                        </NavLink>
                    </li>

                    <li className="nav-text">
                        <NavLink to="/worker/my-leaves">
                            <FaCalendarCheck />
                            <span>My Leave Requests</span>
                        </NavLink>
                    </li>

                    <li className="nav-text" style={{ marginTop: 'auto', borderTop: '1px solid #1a83ff' }}>
                        <button
                            onClick={handleLogout}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#f5f5f5',
                                fontSize: '18px',
                                width: '95%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 16px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            <FaSignOutAlt />
                            <span style={{ marginLeft: '16px' }}>Logout</span>
                        </button>
                    </li>
                </ul>
            </nav>
        </>
    );
};

export default WorkerSidebar;
