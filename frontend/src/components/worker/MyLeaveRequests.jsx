import React, { useState, useEffect } from 'react'
import { FaEye, FaSync } from 'react-icons/fa'
import api from '../../services/api'

const MyLeaveRequests = () => {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchLeaveRequests();
    }, []);

    const fetchLeaveRequests = async () => {
        try {
            setIsLoading(true);
            const response = await api.getMyLeaveRequests();

            if (response.success) {
                setLeaveRequests(response.data);
            }
        } catch (err) {
            console.error('Error fetching leave requests:', err);
            setError('Failed to load leave requests');

            // Mock data for development
            setLeaveRequests([
                {
                    _id: '1',
                    leaveType: 'sick',
                    startDate: '2024-01-15',
                    endDate: '2024-01-16',
                    totalDays: 2,
                    reason: 'Feeling unwell',
                    status: 'pending',
                    createdAt: new Date()
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return { backgroundColor: '#d1fae5', color: '#065f46' };
            case 'rejected':
                return { backgroundColor: '#fee2e2', color: '#991b1b' };
            default:
                return { backgroundColor: '#fef3c7', color: '#92400e' };
        }
    };

    const getLeaveTypeLabel = (type) => {
        const types = {
            sick: 'Sick Leave',
            personal: 'Personal Leave',
            vacation: 'Vacation',
            emergency: 'Emergency Leave',
            other: 'Other'
        };
        return types[type] || type;
    };

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px'
            }}>
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                        My Leave Requests
                    </h2>
                    <p style={{ color: '#6b7280' }}>Track the status of your leave applications</p>
                </div>
                <button
                    onClick={fetchLeaveRequests}
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

            {leaveRequests.length === 0 ? (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    padding: '48px',
                    textAlign: 'center'
                }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                        No Leave Requests
                    </h3>
                    <p style={{ color: '#6b7280' }}>You haven't submitted any leave requests yet.</p>
                </div>
            ) : (
                <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f9fafb' }}>
                            <tr>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Leave Type</th>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Dates</th>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Days</th>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaveRequests.map((request, index) => (
                                <tr key={request._id} style={{ borderTop: index > 0 ? '1px solid #e5e7eb' : 'none' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                                            {getLeaveTypeLabel(request.leaveType)}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                                            {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                                            {request.totalDays} day(s)
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            ...getStatusColor(request.status),
                                            padding: '4px 8px',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500'
                                        }}>
                                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyLeaveRequests;
