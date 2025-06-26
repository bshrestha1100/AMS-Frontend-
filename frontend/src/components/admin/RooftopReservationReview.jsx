import React, { useState, useEffect } from 'react'
import { FaCalendarAlt, FaCheck, FaTimes, FaEye, FaSync, FaUsers, FaClock } from 'react-icons/fa'
import api from '../../services/api'

const RooftopReservationReview = () => {
    const [reservations, setReservations] = useState([]);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filter, setFilter] = useState('all');
    const [adminNotes, setAdminNotes] = useState('');

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            setIsLoading(true);
            const response = await api.getAllRooftopReservations();

            if (response.success) {
                setReservations(response.data);
            }
        } catch (err) {
            console.error('Error fetching reservations:', err);
            setError('Failed to load reservations');

        } finally {
            setIsLoading(false);
        }
    };

    const reviewReservation = async (reservationId, status) => {
        try {
            setIsProcessing(true);
            setError('');

            const response = await api.reviewRooftopReservation(reservationId, status, adminNotes);

            if (response.success) {
                setSuccess(`Reservation ${status} successfully!`);
                await fetchReservations();
                setSelectedReservation(null);
                setAdminNotes('');
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            console.error('Error reviewing reservation:', err);
            setError(err.response?.data?.message || 'Failed to update reservation status');
        } finally {
            setIsProcessing(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return { backgroundColor: '#d1fae5', color: '#065f46' };
            case 'cancelled':
                return { backgroundColor: '#fee2e2', color: '#991b1b' };
            case 'completed':
                return { backgroundColor: '#e0e7ff', color: '#3730a3' };
            default:
                return { backgroundColor: '#fef3c7', color: '#92400e' };
        }
    };

    const getTimeSlotLabel = (timeSlot) => {
        const slots = {
            morning: 'Morning (6:00 AM - 12:00 PM)',
            afternoon: 'Afternoon (12:00 PM - 6:00 PM)',
            evening: 'Evening (6:00 PM - 10:00 PM)',
            night: 'Night (10:00 PM - 2:00 AM)',
            'full-day': 'Full Day (6:00 AM - 10:00 PM)'
        };
        return slots[timeSlot] || timeSlot;
    };

    const filteredReservations = filter === 'all'
        ? reservations
        : reservations.filter(r => r.status === filter);

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
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                        Rooftop Reservation Review
                    </h1>
                    <p style={{ color: '#6b7280' }}>Review and approve tenant rooftop reservations</p>
                </div>
                <button
                    onClick={fetchReservations}
                    disabled={isProcessing}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                        opacity: isProcessing ? 0.7 : 1
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

            {/* Filter */}
            <div style={{
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                marginBottom: '24px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Filter by status:</span>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    >
                        <option value="all">All Reservations</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* Reservations List */}
            <div style={{ display: 'grid', gap: '16px' }}>
                {filteredReservations.map(reservation => (
                    <div key={reservation._id} style={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '20px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                    <FaCalendarAlt style={{ color: '#3b82f6', marginRight: '8px' }} />
                                    <span style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                                        {new Date(reservation.reservationDate).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                                    <div>
                                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Tenant:</span>
                                        <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                            {reservation.tenantId?.name} (Room {reservation.tenantId?.tenantInfo?.roomNumber})
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <FaClock style={{ color: '#6b7280', marginRight: '8px' }} />
                                        <span style={{ color: '#374151' }}>
                                            {getTimeSlotLabel(reservation.timeSlot)}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <FaUsers style={{ color: '#6b7280', marginRight: '8px' }} />
                                        <span style={{ color: '#374151' }}>
                                            {reservation.numberOfGuests} guests
                                        </span>
                                    </div>
                                </div>

                                {reservation.purpose && (
                                    <div style={{ marginBottom: '8px' }}>
                                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Purpose: </span>
                                        <span style={{ color: '#374151' }}>{reservation.purpose}</span>
                                    </div>
                                )}

                                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                    Requested: {new Date(reservation.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{
                                    ...getStatusColor(reservation.status),
                                    padding: '4px 12px',
                                    borderRadius: '9999px',
                                    fontSize: '0.875rem',
                                    fontWeight: '500'
                                }}>
                                    {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                </span>

                                <button
                                    onClick={() => setSelectedReservation(reservation)}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    <FaEye />
                                </button>

                                {reservation.status === 'pending' && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => reviewReservation(reservation._id, 'confirmed')}
                                            disabled={isProcessing}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: '#10b981',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                                fontSize: '0.875rem',
                                                opacity: isProcessing ? 0.7 : 1
                                            }}
                                        >
                                            <FaCheck />
                                        </button>
                                        <button
                                            onClick={() => reviewReservation(reservation._id, 'cancelled')}
                                            disabled={isProcessing}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                                fontSize: '0.875rem',
                                                opacity: isProcessing ? 0.7 : 1
                                            }}
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredReservations.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '48px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                }}>
                    <FaCalendarAlt style={{ fontSize: '4rem', color: '#9ca3af', marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                        No Reservations Found
                    </h3>
                    <p style={{ color: '#6b7280' }}>
                        {reservations.length === 0 ? 'No reservations have been made yet.' : `No ${filter} reservations found.`}
                    </p>
                </div>
            )}

            {/* Reservation Details Modal */}
            {selectedReservation && (
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
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                                    Reservation Details
                                </h3>
                                <button
                                    onClick={() => setSelectedReservation(null)}
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
                                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                                    Reservation Information
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Date:</span>
                                        <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                            {new Date(selectedReservation.reservationDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Time Slot:</span>
                                        <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                            {getTimeSlotLabel(selectedReservation.timeSlot)}
                                        </p>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Guests:</span>
                                        <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                            {selectedReservation.numberOfGuests}
                                        </p>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Status:</span>
                                        <span style={{
                                            ...getStatusColor(selectedReservation.status),
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500'
                                        }}>
                                            {selectedReservation.status.charAt(0).toUpperCase() + selectedReservation.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                                    Tenant Information
                                </h4>
                                <div>
                                    <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                        {selectedReservation.tenantId?.name}
                                    </p>
                                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                        Room {selectedReservation.tenantId?.tenantInfo?.roomNumber} | {selectedReservation.tenantId?.email}
                                    </p>
                                </div>
                            </div>

                            {selectedReservation.purpose && (
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                                        Purpose
                                    </h4>
                                    <p style={{ color: '#374151', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                                        {selectedReservation.purpose}
                                    </p>
                                </div>
                            )}

                            {selectedReservation.specialRequests && (
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                                        Special Requests
                                    </h4>
                                    <p style={{ color: '#374151', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                                        {selectedReservation.specialRequests}
                                    </p>
                                </div>
                            )}

                            {selectedReservation.status === 'pending' && (
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                                        Admin Notes (Optional)
                                    </h4>
                                    <textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        rows="3"
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '1rem',
                                            resize: 'vertical'
                                        }}
                                        placeholder="Add any notes or comments about this reservation..."
                                    />
                                </div>
                            )}

                            {selectedReservation.status === 'pending' && (
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => reviewReservation(selectedReservation._id, 'cancelled')}
                                        disabled={isProcessing}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                                            opacity: isProcessing ? 0.7 : 1
                                        }}
                                    >
                                        <FaTimes style={{ marginRight: '4px' }} />
                                        Decline
                                    </button>
                                    <button
                                        onClick={() => reviewReservation(selectedReservation._id, 'confirmed')}
                                        disabled={isProcessing}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#10b981',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                                            opacity: isProcessing ? 0.7 : 1
                                        }}
                                    >
                                        <FaCheck style={{ marginRight: '4px' }} />
                                        Approve
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RooftopReservationReview;
