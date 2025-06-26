import React, { useState, useEffect } from 'react'
import { FaTools, FaPlus, FaEye, FaClock, FaCheckCircle } from 'react-icons/fa'
import api from '../../services/api'

const MaintenanceRequests = () => {
    const [requests, setRequests] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Other',
        priority: 'Medium'
    });

    const categories = [
        'Plumbing', 'Electrical', 'HVAC', 'Appliances', 'Cleaning', 'Painting', 'Carpentry', 'Other'
    ];

    const priorities = ['Low', 'Medium', 'High', 'Emergency'];

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            const response = await api.getTenantMaintenanceRequests();

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            setError('');

            const response = await api.submitMaintenanceRequest(formData);

            if (response.success) {
                setSuccess('Maintenance request submitted successfully!');
                setFormData({
                    title: '',
                    description: '',
                    category: 'Other',
                    priority: 'Medium'
                });
                setShowForm(false);
                await fetchRequests();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            console.error('Error creating maintenance request:', err);
            setError(err.response?.data?.message || 'Failed to submit request');
        } finally {
            setIsSubmitting(false);
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
                        Maintenance Requests
                    </h1>
                    <p style={{ color: '#6b7280' }}>Submit and track your maintenance requests</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '12px 20px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '500'
                    }}
                >
                    <FaPlus />
                    New Request
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

                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.875rem' }}>
                                    <span style={{ color: '#6b7280' }}>Category: <strong>{request.category}</strong></span>
                                    <span style={{ color: '#6b7280' }}>
                                        Created: {new Date(request.createdAt).toLocaleDateString()}
                                    </span>
                                    {request.assignedWorkerId && (
                                        <span style={{ color: '#6b7280' }}>
                                            Assigned to: <strong>{request.assignedWorkerId.name}</strong>
                                        </span>
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
                            You haven't submitted any maintenance requests yet.
                        </p>
                    </div>
                )}
            </div>

            {/* Create Request Modal */}
            {showForm && (
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
                        maxWidth: '600px',
                        width: '100%'
                    }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                                    New Maintenance Request
                                </h3>
                                <button
                                    onClick={() => setShowForm(false)}
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

                        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="Brief description of the issue"
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                    Category *
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                    Priority *
                                </label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {priorities.map(priority => (
                                        <option key={priority} value={priority}>{priority}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                    Description *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    rows="4"
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '1rem',
                                        resize: 'vertical'
                                    }}
                                    placeholder="Detailed description of the maintenance issue..."
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
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
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: isSubmitting ? '#9ca3af' : '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaintenanceRequests;
