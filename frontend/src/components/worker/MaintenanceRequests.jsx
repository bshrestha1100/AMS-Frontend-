import React, { useState, useEffect } from 'react'
import { FaTools, FaPlay, FaCheck, FaStickyNote, FaSync } from 'react-icons/fa'
import api from '../../services/api'

const MaintenanceRequests = () => {
    const [assignments, setAssignments] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [statusUpdate, setStatusUpdate] = useState({
        status: '',
        workNotes: '',
        estimatedCompletionTime: ''
    });

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            setIsLoading(true);
            setError('');
            const response = await api.getWorkerMaintenanceRequests();

            if (response.success) {
                setAssignments(response.data);
            } else {
                setError('Failed to load maintenance requests');
                setAssignments([]);
            }
        } catch (err) {
            console.error('Error fetching assignments:', err);
            setError('Failed to load maintenance requests. Please check your connection.');
            setAssignments([]);
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (requestId) => {
        try {
            setIsUpdating(true);
            setError('');

            const response = await api.updateMaintenanceStatus(requestId, statusUpdate);

            if (response.success) {
                setSuccess(`Request status updated to ${statusUpdate.status}!`);
                await fetchAssignments();
                setSelectedRequest(null);
                setStatusUpdate({ status: '', workNotes: '', estimatedCompletionTime: '' });
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            console.error('Error updating status:', err);
            setError(err.response?.data?.message || 'Failed to update status');
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Assigned': return { backgroundColor: '#dbeafe', color: '#1e40af' };
            case 'In Progress': return { backgroundColor: '#fef3c7', color: '#d97706' };
            case 'Completed': return { backgroundColor: '#d1fae5', color: '#065f46' };
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
                        My Assigned Tasks
                    </h1>
                    <p style={{ color: '#6b7280' }}>Maintenance requests assigned to you</p>
                </div>
                <button
                    onClick={fetchAssignments}
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

            {/* Assignments List */}
            <div style={{ display: 'grid', gap: '16px' }}>
                {assignments.map(request => (
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
                                    <span style={{
                                        marginLeft: '12px',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500',
                                        backgroundColor: getPriorityColor(request.priority) + '20',
                                        color: getPriorityColor(request.priority)
                                    }}>
                                        {request.priority}
                                    </span>
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
                                        <span style={{ color: '#6b7280' }}>Assigned:</span>
                                        <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                            {request.assignedDate ? new Date(request.assignedDate).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    {request.estimatedCompletionTime && (
                                        <div>
                                            <span style={{ color: '#6b7280' }}>Estimated Time:</span>
                                            <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                                {request.estimatedCompletionTime}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{
                                    ...getStatusColor(request.status),
                                    padding: '4px 12px',
                                    borderRadius: '9999px',
                                    fontSize: '0.875rem',
                                    fontWeight: '500'
                                }}>
                                    {request.status}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {request.status === 'Assigned' && (
                                <button
                                    onClick={() => {
                                        setSelectedRequest(request);
                                        setStatusUpdate({ status: 'In Progress', workNotes: 'Work started', estimatedCompletionTime: '' });
                                    }}
                                    disabled={isUpdating}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '8px 12px',
                                        backgroundColor: '#f59e0b',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: isUpdating ? 'not-allowed' : 'pointer',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    <FaPlay />
                                    Start Work
                                </button>
                            )}

                            {request.status === 'In Progress' && (
                                <button
                                    onClick={() => {
                                        setSelectedRequest(request);
                                        setStatusUpdate({ status: 'Completed', workNotes: 'Work completed successfully', estimatedCompletionTime: '' });
                                    }}
                                    disabled={isUpdating}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '8px 12px',
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: isUpdating ? 'not-allowed' : 'pointer',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    <FaCheck />
                                    Mark Complete
                                </button>
                            )}

                            {/* Update Status Button */}
                            {request.status !== 'Completed' && (
                                <button
                                    onClick={() => setSelectedRequest(request)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '8px 12px',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    <FaStickyNote />
                                    Update Status
                                </button>
                            )}
                        </div>

                        {/* Work Notes */}
                        {request.workNotes && (
                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                                    Work Notes:
                                </h4>
                                <p style={{
                                    backgroundColor: '#f8fafc',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    fontSize: '0.875rem',
                                    color: '#374151'
                                }}>
                                    {request.workNotes}
                                </p>
                            </div>
                        )}
                    </div>
                ))}

                {assignments.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '48px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                    }}>
                        <FaTools style={{ fontSize: '4rem', color: '#9ca3af', marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                            No Assignments
                        </h3>
                        <p style={{ color: '#6b7280' }}>
                            You don't have any maintenance assignments at the moment.
                        </p>
                    </div>
                )}
            </div>

            {/* Status Update Modal */}
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
                                    Update Status: {selectedRequest.title}
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
                                    Status
                                </label>
                                <select
                                    value={statusUpdate.status}
                                    onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px'
                                    }}
                                >
                                    <option value="">Select Status</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                    Work Notes
                                </label>
                                <textarea
                                    value={statusUpdate.workNotes}
                                    onChange={(e) => setStatusUpdate({ ...statusUpdate, workNotes: e.target.value })}
                                    rows="3"
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        resize: 'vertical'
                                    }}
                                    placeholder="Add notes about the work performed..."
                                />
                            </div>

                            {statusUpdate.status === 'In Progress' && (
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                        Estimated Completion Time
                                    </label>
                                    <input
                                        type="text"
                                        value={statusUpdate.estimatedCompletionTime}
                                        onChange={(e) => setStatusUpdate({ ...statusUpdate, estimatedCompletionTime: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px'
                                        }}
                                        placeholder="e.g., 2 hours, 1 day"
                                    />
                                </div>
                            )}

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
                                    onClick={() => updateStatus(selectedRequest._id)}
                                    disabled={!statusUpdate.status || isUpdating}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: (!statusUpdate.status || isUpdating) ? '#9ca3af' : '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: (!statusUpdate.status || isUpdating) ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {isUpdating ? 'Updating...' : 'Update Status'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaintenanceRequests;
