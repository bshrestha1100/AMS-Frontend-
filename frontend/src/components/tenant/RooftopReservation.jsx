import React, { useState, useEffect } from 'react'
import { FaCalendarAlt, FaClock, FaUsers, FaPlus, FaTimes } from 'react-icons/fa'
import api from '../../services/api'

const RooftopReservation = () => {
    const [reservations, setReservations] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        reservationDate: '',
        timeSlot: 'morning',
        numberOfGuests: 1,
        purpose: '',
        specialRequests: ''
    });

    const timeSlots = [
        { value: 'morning', label: 'Morning (6:00 AM - 12:00 PM)', times: '6:00 AM - 12:00 PM' },
        { value: 'afternoon', label: 'Afternoon (12:00 PM - 6:00 PM)', times: '12:00 PM - 6:00 PM' },
        { value: 'evening', label: 'Evening (6:00 PM - 10:00 PM)', times: '6:00 PM - 10:00 PM' },
        { value: 'night', label: 'Night (10:00 PM - 2:00 AM)', times: '10:00 PM - 2:00 AM' },
        { value: 'full-day', label: 'Full Day (6:00 AM - 10:00 PM)', times: '6:00 AM - 10:00 PM' }
    ];

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            setIsLoading(true);
            const response = await api.getRooftopReservations();

            if (response.success) {
                setReservations(response.data);
            }
        } catch (err) {
            console.error('Error fetching reservations:', err);
            setError('Failed to load reservations');

            // Mock data for development
            setReservations([
                {
                    _id: '1',
                    reservationDate: '2024-01-15',
                    timeSlot: 'evening',
                    numberOfGuests: 8,
                    purpose: 'Birthday party',
                    status: 'confirmed',
                    createdAt: new Date()
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            setError('');
            setSuccess('');

            const response = await api.createRooftopReservation(formData);

            if (response.success) {
                setSuccess('Reservation submitted successfully! We will confirm it soon.');
                setFormData({
                    reservationDate: '',
                    timeSlot: 'morning',
                    numberOfGuests: 1,
                    purpose: '',
                    specialRequests: ''
                });
                setShowForm(false);
                await fetchReservations();
            }
        } catch (err) {
            console.error('Error creating reservation:', err);
            setError(err.response?.data?.message || 'Failed to create reservation');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = async (reservationId) => {
        if (window.confirm('Are you sure you want to cancel this reservation?')) {
            try {
                await api.cancelRooftopReservation(reservationId);
                setSuccess('Reservation cancelled successfully');
                await fetchReservations();
            } catch (err) {
                setError('Failed to cancel reservation');
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
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

    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
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
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                        Rooftop Reservations
                    </h2>
                    <p style={{ color: '#6b7280' }}>Book the rooftop for your special events</p>
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
                    New Reservation
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

            {/* Reservations List */}
            <div style={{ display: 'grid', gap: '16px' }}>
                {reservations.map(reservation => (
                    <div key={reservation._id} style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '20px'
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
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <FaClock style={{ color: '#6b7280', marginRight: '8px' }} />
                                        <span style={{ color: '#374151' }}>
                                            {timeSlots.find(slot => slot.value === reservation.timeSlot)?.times}
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
                                    <div style={{ marginBottom: '12px' }}>
                                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Purpose: </span>
                                        <span style={{ color: '#374151' }}>{reservation.purpose}</span>
                                    </div>
                                )}
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

                                {reservation.status === 'pending' && (
                                    <button
                                        onClick={() => handleCancel(reservation._id)}
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {reservations.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '48px',
                        color: '#6b7280'
                    }}>
                        <FaCalendarAlt style={{ fontSize: '3rem', marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>
                            No Reservations Yet
                        </h3>
                        <p>Make your first rooftop reservation to get started!</p>
                    </div>
                )}
            </div>

            {/* Reservation Form Modal */}
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
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                                    New Rooftop Reservation
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
                                    <FaTimes />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                    Reservation Date *
                                </label>
                                <input
                                    type="date"
                                    name="reservationDate"
                                    value={formData.reservationDate}
                                    onChange={handleInputChange}
                                    required
                                    min={getMinDate()}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                    Time Slot *
                                </label>
                                <select
                                    name="timeSlot"
                                    value={formData.timeSlot}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {timeSlots.map(slot => (
                                        <option key={slot.value} value={slot.value}>
                                            {slot.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                    Number of Guests *
                                </label>
                                <input
                                    type="number"
                                    name="numberOfGuests"
                                    value={formData.numberOfGuests}
                                    onChange={handleInputChange}
                                    required
                                    min="1"
                                    max="20"
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                    Purpose/Event Type
                                </label>
                                <input
                                    type="text"
                                    name="purpose"
                                    value={formData.purpose}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="e.g., Birthday party, Family gathering"
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                    Special Requests
                                </label>
                                <textarea
                                    name="specialRequests"
                                    value={formData.specialRequests}
                                    onChange={handleInputChange}
                                    rows="3"
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '1rem',
                                        resize: 'vertical'
                                    }}
                                    placeholder="Any special arrangements or requirements..."
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
                                    {isSubmitting ? 'Submitting...' : 'Submit Reservation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RooftopReservation;
