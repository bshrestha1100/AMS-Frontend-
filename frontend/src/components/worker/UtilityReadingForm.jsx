import React, { useState, useEffect } from 'react'
import { FaHome } from 'react-icons/fa'
import api from '../../services/api'

const UtilityReadingForm = () => {
    const [formData, setFormData] = useState({
        apartmentId: '',
        electricity: {
            previousReading: '',
            currentReading: ''
        },
        heatingCooling: {
            previousReading: '',
            currentReading: ''
        },
        notes: ''
    });
    const [apartments, setApartments] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchApartments();
    }, []);

    const fetchApartments = async () => {
        try {
            const response = await api.getApartments();
            if (response.success) {
                setApartments(response.data);
            }
        } catch (err) {
            console.error('Error fetching apartments:', err);
            // Mock data for development
            setApartments([
                { _id: '1', unitNumber: 'A101' },
                { _id: '2', unitNumber: 'A102' },
                { _id: '3', unitNumber: 'B101' },
                { _id: '4', unitNumber: 'B102' }
            ]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleUtilityChange = (utility, field, value) => {
        setFormData({
            ...formData,
            [utility]: {
                ...formData[utility],
                [field]: value
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            setError('');
            setSuccess('');

            const response = await api.submitUtilityReading(formData);

            if (response.success) {
                setSuccess('Utility reading submitted successfully!');

                // Reset form
                setFormData({
                    apartmentId: '',
                    electricity: { previousReading: '', currentReading: '' },
                    heatingCooling: { previousReading: '', currentReading: '' },
                    notes: ''
                });
            }
        } catch (err) {
            console.error('Error submitting reading:', err);
            setError('Failed to submit utility reading. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                        Submit Utility Reading
                    </h2>
                    <p style={{ color: '#6b7280' }}>Record meter readings for apartment utility consumption</p>
                </div>

                <div style={{ padding: '24px' }}>
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

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                Select Apartment *
                            </label>
                            <select
                                name="apartmentId"
                                value={formData.apartmentId}
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
                                <option value="">-- Select Apartment --</option>
                                {apartments.map(apt => (
                                    <option key={apt._id} value={apt._id}>
                                        {apt.unitNumber}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#1e40af', marginBottom: '16px' }}>
                                Electricity Readings
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                        Previous Reading *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.electricity.previousReading}
                                        onChange={(e) => handleUtilityChange('electricity', 'previousReading', e.target.value)}
                                        required
                                        min="0"
                                        step="0.01"
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '1rem'
                                        }}
                                        placeholder="Enter previous reading"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                        Current Reading *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.electricity.currentReading}
                                        onChange={(e) => handleUtilityChange('electricity', 'currentReading', e.target.value)}
                                        required
                                        min="0"
                                        step="0.01"
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '1rem'
                                        }}
                                        placeholder="Enter current reading"
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ backgroundColor: '#fff7ed', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#c2410c', marginBottom: '16px' }}>
                                Heating/Cooling Readings
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                        Previous Reading *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.heatingCooling.previousReading}
                                        onChange={(e) => handleUtilityChange('heatingCooling', 'previousReading', e.target.value)}
                                        required
                                        min="0"
                                        step="0.01"
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '1rem'
                                        }}
                                        placeholder="Enter previous reading"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                        Current Reading *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.heatingCooling.currentReading}
                                        onChange={(e) => handleUtilityChange('heatingCooling', 'currentReading', e.target.value)}
                                        required
                                        min="0"
                                        step="0.01"
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '1rem'
                                        }}
                                        placeholder="Enter current reading"
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                Notes (Optional)
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows="4"
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '1rem',
                                    resize: 'vertical'
                                }}
                                placeholder="Add any additional notes or observations about the readings"
                            ></textarea>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: isSubmitting ? '#9ca3af' : '#3b82f6',
                                    color: 'white',
                                    borderRadius: '6px',
                                    border: 'none',
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Readings'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UtilityReadingForm;
