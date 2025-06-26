import React, { useState, useEffect } from 'react'
import { FaEye, FaSync } from 'react-icons/fa'
import api from '../../services/api'

const MySubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            setIsLoading(true);
            const response = await api.getMySubmissions();

            if (response.success) {
                setSubmissions(response.data);
            }
        } catch (err) {
            console.error('Error fetching submissions:', err);
            setError('Failed to load submissions');

            // Mock data for development
            setSubmissions([
                {
                    _id: '1',
                    apartmentId: { unitNumber: 'A101' },
                    createdAt: new Date().toISOString(),
                    electricity: { previousReading: 100, currentReading: 150 },
                    heatingCooling: { previousReading: 50, currentReading: 75 },
                    status: 'pending',
                    notes: 'Regular monthly reading'
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
                        My Submissions
                    </h2>
                    <p style={{ color: '#6b7280' }}>Track the status of your utility reading submissions</p>
                </div>
                <button
                    onClick={fetchSubmissions}
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

            {submissions.length === 0 ? (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    padding: '48px',
                    textAlign: 'center'
                }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                        No Submissions Found
                    </h3>
                    <p style={{ color: '#6b7280' }}>You haven't submitted any utility readings yet.</p>
                </div>
            ) : (
                <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f9fafb' }}>
                            <tr>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Apartment</th>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Date Submitted</th>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody style={{ backgroundColor: 'white' }}>
                            {submissions.map((submission, index) => (
                                <tr key={submission._id} style={{ borderTop: index > 0 ? '1px solid #e5e7eb' : 'none' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                                            {submission.apartmentId?.unitNumber || 'N/A'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                                            {new Date(submission.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            ...getStatusColor(submission.status),
                                            padding: '4px 8px',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500'
                                        }}>
                                            {submission.status?.charAt(0).toUpperCase() + submission.status?.slice(1)}
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

export default MySubmissions;
