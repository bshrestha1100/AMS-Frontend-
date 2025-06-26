import React, { useState, useEffect } from 'react'
import {
    FaTools,
    FaClock,
    FaCheckCircle,
    FaExclamationTriangle,
    FaCalendarAlt,
    FaSync,
    FaUser,
    FaClipboardList
} from 'react-icons/fa'
import api from '../../services/api'

const WorkerDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [userData, setUserData] = useState({ name: 'Worker' });

    useEffect(() => {
        fetchDashboardData();
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const response = await api.getCurrentUser();
            if (response.success && response.data) {
                setUserData(response.data);
            }
        } catch (err) {
            console.error('Error loading user data:', err);
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            setUserData(storedUser);
        }
    };

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            setError('');
            const response = await api.getWorkerDashboard();

            if (response.success) {
                setDashboardData(response.data);
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data');

            // Mock data for development
            setDashboardData({
                maintenanceStats: {
                    total: 15,
                    pending: 3,
                    inProgress: 2,
                    completed: 10
                },
                leaveStats: {
                    total: 8,
                    pending: 1,
                    approved: 6,
                    rejected: 1
                },
                recentMaintenance: [
                    {
                        _id: '1',
                        title: 'Fix leaking faucet',
                        status: 'In Progress',
                        priority: 'Medium',
                        tenantId: { name: 'John Doe', tenantInfo: { roomNumber: 'A101' } },
                        apartmentId: { unitNumber: 'A101', building: 'Building A' },
                        assignedDate: new Date().toISOString()
                    }
                ],
                recentLeaves: [
                    {
                        _id: '1',
                        leaveType: 'Sick Leave',
                        startDate: '2024-02-15',
                        endDate: '2024-02-16',
                        status: 'approved',
                        createdAt: new Date().toISOString()
                    }
                ]
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Assigned':
            case 'pending':
                return { backgroundColor: '#fef3c7', color: '#92400e' };
            case 'In Progress':
                return { backgroundColor: '#dbeafe', color: '#1e40af' };
            case 'Completed':
            case 'approved':
                return { backgroundColor: '#d1fae5', color: '#065f46' };
            case 'rejected':
                return { backgroundColor: '#fee2e2', color: '#991b1b' };
            default:
                return { backgroundColor: '#f3f4f6', color: '#374151' };
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Emergency': return '#dc2626';
            case 'High': return '#ef4444';
            case 'Medium': return '#f59e0b';
            case 'Low': return '#10b981';
            default: return '#6b7280';
        }
    };

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <style>
                    {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
                </style>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                        Welcome back, {userData.name}!
                    </h1>
                    <p style={{ color: '#6b7280' }}>Here's your work overview and recent activities</p>
                </div>
                <button
                    onClick={fetchDashboardData}
                    disabled={isLoading}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.7 : 1
                    }}
                >
                    <FaSync />
                    Refresh
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{
                    backgroundColor: '#fef2f2',
                    borderLeft: '4px solid #ef4444',
                    color: '#dc2626',
                    padding: '16px',
                    marginBottom: '24px',
                    borderRadius: '4px'
                }}>
                    {error}
                </div>
            )}

            {dashboardData && (
                <>
                    {/* Statistics Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                        {/* Maintenance Statistics */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #e5e7eb'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    backgroundColor: '#dbeafe',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '16px'
                                }}>
                                    <FaTools style={{ color: '#1e40af', fontSize: '1.5rem' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                                        Maintenance Tasks
                                    </h3>
                                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Your assigned work</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                                        {dashboardData.maintenanceStats.total}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e' }}>
                                        {dashboardData.maintenanceStats.pending}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#92400e' }}>Pending</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>
                                        {dashboardData.maintenanceStats.inProgress}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#1e40af' }}>In Progress</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#d1fae5', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#065f46' }}>
                                        {dashboardData.maintenanceStats.completed}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#065f46' }}>Completed</div>
                                </div>
                            </div>
                        </div>

                        {/* Leave Statistics */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #e5e7eb'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    backgroundColor: '#fef3c7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '16px'
                                }}>
                                    <FaCalendarAlt style={{ color: '#d97706', fontSize: '1.5rem' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                                        Leave Requests
                                    </h3>
                                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Your leave status</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                                        {dashboardData.leaveStats.total}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e' }}>
                                        {dashboardData.leaveStats.pending}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#92400e' }}>Pending</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#d1fae5', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#065f46' }}>
                                        {dashboardData.leaveStats.approved}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#065f46' }}>Approved</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#991b1b' }}>
                                        {dashboardData.leaveStats.rejected}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#991b1b' }}>Rejected</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                        {/* Recent Maintenance Tasks */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #e5e7eb'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                <FaClipboardList style={{ color: '#3b82f6', marginRight: '12px', fontSize: '1.25rem' }} />
                                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                                    Recent Maintenance Tasks
                                </h3>
                            </div>

                            <div style={{ display: 'grid', gap: '12px' }}>
                                {dashboardData.recentMaintenance.length > 0 ? (
                                    dashboardData.recentMaintenance.map(task => (
                                        <div key={task._id} style={{
                                            padding: '16px',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            backgroundColor: '#f8fafc'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
                                                    {task.title}
                                                </h4>
                                                <span style={{
                                                    ...getStatusColor(task.status),
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500'
                                                }}>
                                                    {task.status}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                {task.tenantId?.name} - Room {task.tenantId?.tenantInfo?.roomNumber || task.apartmentId?.unitNumber}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                                                Assigned: {new Date(task.assignedDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                                        <FaTools style={{ fontSize: '2rem', marginBottom: '8px' }} />
                                        <p>No recent maintenance tasks</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Leave Requests */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #e5e7eb'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                <FaCalendarAlt style={{ color: '#f59e0b', marginRight: '12px', fontSize: '1.25rem' }} />
                                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                                    Recent Leave Requests
                                </h3>
                            </div>

                            <div style={{ display: 'grid', gap: '12px' }}>
                                {dashboardData.recentLeaves.length > 0 ? (
                                    dashboardData.recentLeaves.map(leave => (
                                        <div key={leave._id} style={{
                                            padding: '16px',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            backgroundColor: '#f8fafc'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
                                                    {leave.leaveType}
                                                </h4>
                                                <span style={{
                                                    ...getStatusColor(leave.status),
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500'
                                                }}>
                                                    {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                                                Requested: {new Date(leave.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                                        <FaCalendarAlt style={{ fontSize: '2rem', marginBottom: '8px' }} />
                                        <p>No recent leave requests</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default WorkerDashboard;
