import React, { useState, useEffect } from 'react'
import { FaUser, FaEdit, FaSave, FaTimes, FaEnvelope, FaPhone } from 'react-icons/fa'
import api from '../../services/api'

const WorkerProfile = () => {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone: '',
        workerInfo: {
            employeeId: '',
            department: 'Maintenance',
            joinDate: '',
            address: ''
        }
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            setIsLoading(true);
            const response = await api.getCurrentUser();

            if (response.success && response.data) {
                setUserData(response.data);
            }
        } catch (err) {
            console.error('Error loading user data:', err);
            setError('Failed to load profile data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setError('');
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to update profile');
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
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                        Worker Profile
                    </h2>
                </div>

                <div style={{ padding: '24px' }}>
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

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                        <div>
                            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                                Personal Information
                            </h4>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Full Name</label>
                                <p style={{ color: '#1f2937', fontWeight: '500', marginTop: '4px' }}>{userData.name}</p>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Email</label>
                                <p style={{ color: '#1f2937', fontWeight: '500', marginTop: '4px' }}>{userData.email}</p>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Phone</label>
                                <p style={{ color: '#1f2937', fontWeight: '500', marginTop: '4px' }}>{userData.phone}</p>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                                Work Information
                            </h4>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Employee ID</label>
                                <p style={{ color: '#1f2937', fontWeight: '500', marginTop: '4px' }}>
                                    {userData.workerInfo?.employeeId || 'Not assigned'}
                                </p>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Department</label>
                                <p style={{ color: '#1f2937', fontWeight: '500', marginTop: '4px' }}>
                                    {userData.workerInfo?.department || 'Maintenance'}
                                </p>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Join Date</label>
                                <p style={{ color: '#1f2937', fontWeight: '500', marginTop: '4px' }}>
                                    {userData.workerInfo?.joinDate ?
                                        new Date(userData.workerInfo.joinDate).toLocaleDateString() :
                                        'Not available'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkerProfile;
