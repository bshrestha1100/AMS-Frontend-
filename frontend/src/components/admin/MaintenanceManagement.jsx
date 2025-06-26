import React, { useState, useEffect } from 'react'
import { FaTools, FaUserPlus, FaEye, FaFilter, FaSync } from 'react-icons/fa'
import api from '../../services/api'

const MaintenanceManagement = () => {
    const [requests, setRequests] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        priority: 'all',
        category: 'all'
    });
    const [assignmentData, setAssignmentData] = useState({
        workerId: '',
        adminNotes: '',
        priority: ''
    });

    useEffect(() => {
        fetchRequests();
        fetchWorkers();
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [filters]);

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            const response = await api.getAllMaintenanceRequests(filters);

            if (response.success) {
                setRequests(response.data);
            }
        } catch (err) {
            console.error('Error fetching maintenance requests:', err);
            setError('Failed to load maintenance requests');
            // Set empty array for now
            setRequests([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchWorkers = async () => {
        try {
            const response = await api.getAvailableWorkers();
            if (response.success) {
                setWorkers(response.data);
            }
        } catch (err) {
            console.error('Error fetching workers:', err);
            // Set empty array for now
            setWorkers([]);
        }
    };

    const assignRequest = async () => {
        try {
            setError('');
            setSuccess('');

            const response = await api.assignMaintenanceRequest(selectedRequest._id, assignmentData);

            if (response.success) {
                setSuccess('Request assigned successfully!');
                await fetchRequests();
                setSelectedRequest(null);
                setAssignmentData({ workerId: '', adminNotes: '', priority: '' });
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            console.error('Error assigning request:', err);
            setError(err.response?.data?.message || 'Failed to assign request');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return { backgroundColor: '#fef3c7', color: '#92400e' };
            case 'Assigned': return { backgroundColor: '#dbeafe', color: '#1e40af' };
            case 'In Progress': return { backgroundColor: '#fef3c7', color: '#d97706' };
            case 'Completed': return { backgroundColor: '#d1fae5', color: '#065f46' };
            case 'Cancelled': return { backgroundColor: '#fee2e2', color: '#991b1b' };
            default: return { backgroundColor: '#f3f4f6', color: '#374151' };
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                        Maintenance Management
                    </h1>
                    <p style={{ color: '#6b7280' }}>Manage and assign maintenance requests</p>
                </div>
                <button
                    onClick={fetchRequests}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <FaSync />
                    Refresh
                </button>
            </div>

            {/* Messages */}
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

            {success && (
                <div style={{
                    backgroundColor: '#f0fdf4',
                    borderLeft: '4px solid #10b981',
                    color: '#059669',
                    padding: '16px',
                    marginBottom: '24px',
                    borderRadius: '4px'
                }}>
                    {success}
                </div>
            )}

            {/* Filters */}
            <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                marginBottom: '24px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaFilter style={{ color: '#6b7280' }} />
                        <span style={{ fontWeight: '500', color: '#374151' }}>Filters:</span>
                    </div>

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    >
                        <option value="all">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>

                    <select
                        value={filters.priority}
                        onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                        style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    >
                        <option value="all">All Priority</option>
                        <option value="Emergency">Emergency</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
            </div>

            {/* Requests List */}
            <div style={{ display: 'grid', gap: '16px' }}>
                {requests.map(request => (
                    <div key={request._id} style={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '20px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                    <FaTools style={{ color: '#3b82f6', marginRight: '8px' }} />
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                                        {request.title}
                                    </h3>
                                </div>

                                <p style={{ color: '#6b7280', marginBottom: '12px' }}>
                                    {request.description}
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.875rem' }}>
                                    <div>
                                        <span style={{ color: '#6b7280' }}>Tenant:</span>
                                        <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                            {request.tenantId?.name} (Room {request.tenantId?.tenantInfo?.roomNumber || 'N/A'})
                                        </p>
                                    </div>
                                    <div>
                                        <span style={{ color: '#6b7280' }}>Category:</span>
                                        <p style={{ color: '#1f2937', fontWeight: '500' }}>{request.category}</p>
                                    </div>
                                    <div>
                                        <span style={{ color: '#6b7280' }}>Created:</span>
                                        <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {request.assignedWorkerId && (
                                        <div>
                                            <span style={{ color: '#6b7280' }}>Assigned to:</span>
                                            <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                                {request.assignedWorkerId.name}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    backgroundColor: getPriorityColor(request.priority) + '20',
                                    color: getPriorityColor(request.priority)
                                }}>
                                    {request.priority}
                                </span>

                                <span style={{
                                    ...getStatusColor(request.status),
                                    padding: '4px 12px',
                                    borderRadius: '9999px',
                                    fontSize: '0.875rem',
                                    fontWeight: '500'
                                }}>
                                    {request.status}
                                </span>

                                {request.status === 'Pending' && (
                                    <button
                                        onClick={() => setSelectedRequest(request)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            padding: '6px 12px',
                                            backgroundColor: '#10b981',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        <FaUserPlus />
                                        Assign
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {requests.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '48px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                    }}>
                        <FaTools style={{ fontSize: '4rem', color: '#9ca3af', marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                            No Maintenance Requests
                        </h3>
                        <p style={{ color: '#6b7280' }}>
                            No maintenance requests match your current filters.
                        </p>
                    </div>
                )}
            </div>

            {/* Assignment Modal */}
            {selectedRequest && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)',
                        maxWidth: '500px',
                        width: '100%'
                    }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                                    Assign Request: {selectedRequest.title}
                                </h3>
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '1.5rem',
                                        color: '#6b7280',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                    Assign to Worker *
                                </label>
                                <select
                                    value={assignmentData.workerId}
                                    onChange={(e) => setAssignmentData({ ...assignmentData, workerId: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px'
                                    }}
                                >
                                    <option value="">Select Worker</option>
                                    {workers.map(worker => (
                                        <option key={worker._id} value={worker._id}>
                                            {worker.name} ({worker.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                    Update Priority (Optional)
                                </label>
                                <select
                                    value={assignmentData.priority}
                                    onChange={(e) => setAssignmentData({ ...assignmentData, priority: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px'
                                    }}
                                >
                                    <option value="">Keep Current Priority</option>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Emergency">Emergency</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                    Admin Notes (Optional)
                                </label>
                                <textarea
                                    value={assignmentData.adminNotes}
                                    onChange={(e) => setAssignmentData({ ...assignmentData, adminNotes: e.target.value })}
                                    rows="3"
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        resize: 'vertical'
                                    }}
                                    placeholder="Add any special instructions or notes..."
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#6b7280',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={assignRequest}
                                    disabled={!assignmentData.workerId}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: !assignmentData.workerId ? '#9ca3af' : '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: !assignmentData.workerId ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Assign Request
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaintenanceManagement;
