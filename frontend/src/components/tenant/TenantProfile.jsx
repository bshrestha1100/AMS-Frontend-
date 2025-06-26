import React, { useState, useEffect } from 'react'
import { FaUser, FaEdit, FaSave, FaTimes, FaEnvelope, FaPhone, FaHome, FaCalendarAlt, FaLock, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa'
import api from '../../services/api'

const TenantProfile = () => {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone: '',
        tenantInfo: {
            roomNumber: '',
            leaseStartDate: '',
            leaseEndDate: '',
            monthlyRent: 0,
            securityDeposit: 0,
            apartmentId: null,
            emergencyContact: {
                name: '',
                phone: '',
                relationship: '',
                email: ''
            }
        }
    });
    const [editData, setEditData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            setIsLoading(true);
            setError('');

            const response = await api.getTenantProfile();

            if (response.success && response.data) {
                setUserData(response.data);
                setEditData({
                    name: response.data.name,
                    phone: response.data.phone,
                    emergencyContact: response.data.tenantInfo?.emergencyContact || {
                        name: '',
                        phone: '',
                        relationship: '',
                        email: ''
                    }
                });
            } else {
                setError('Failed to load profile data');
            }
        } catch (err) {
            console.error('Error loading tenant profile:', err);
            setError('Failed to load profile from server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setError('');
        setSuccess('');
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData({
            name: userData.name,
            phone: userData.phone,
            emergencyContact: userData.tenantInfo?.emergencyContact || {}
        });
        setError('');
        setSuccess('');
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setError('');
            setSuccess('');

            const response = await api.updateTenantProfile(editData);

            if (response.success) {
                setUserData(response.data);
                setIsEditing(false);
                setSuccess('Profile updated successfully!');

                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(response.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('emergencyContact.')) {
            const field = name.split('.')[1];
            setEditData({
                ...editData,
                emergencyContact: {
                    ...editData.emergencyContact,
                    [field]: value
                }
            });
        } else {
            setEditData({
                ...editData,
                [name]: value
            });
        }
    };

    // Password change functions
    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
        setPasswordError('');
        setPasswordMessage('');
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordMessage('');

        // Validate passwords match
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        // Validate password strength
        if (passwordData.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters long');
            return;
        }

        try {
            setIsChangingPassword(true);

            const response = await api.put('/auth/updatepassword', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            if (response.data.success) {
                setPasswordMessage('Password changed successfully!');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setTimeout(() => setPasswordMessage(''), 5000);
            }
        } catch (err) {
            setPasswordError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const calculateLeaseStatus = () => {
        if (!userData.tenantInfo?.leaseStartDate || !userData.tenantInfo?.leaseEndDate) {
            return { status: 'Unknown', color: '#6b7280' };
        }

        const now = new Date();
        const startDate = new Date(userData.tenantInfo.leaseStartDate);
        const endDate = new Date(userData.tenantInfo.leaseEndDate);

        if (now < startDate) {
            return { status: 'Upcoming', color: '#f59e0b' };
        } else if (now > endDate) {
            return { status: 'Expired', color: '#ef4444' };
        } else {
            return { status: 'Active', color: '#10b981' };
        }
    };

    const leaseStatus = calculateLeaseStatus();

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
                    borderTop: '4px solid #1e40af',
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
        <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                    My Profile
                </h1>
                <p style={{ color: '#6b7280' }}>Manage your personal information and lease details</p>
            </div>

            {/* Profile Overview Card */}
            <div style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                color: 'white',
                padding: '24px',
                borderRadius: '12px',
                marginBottom: '24px',
                boxShadow: '0 8px 25px rgba(30, 64, 175, 0.3)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '16px'
                    }}>
                        <FaUser style={{ fontSize: '1.5rem' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '4px' }}>
                            {userData.name}
                        </h2>
                        <p style={{ opacity: 0.9 }}>Tenant - Room {userData.tenantInfo?.roomNumber}</p>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                            {userData.tenantInfo?.apartmentId?.unitNumber || userData.tenantInfo?.roomNumber}
                        </div>
                        <div style={{ opacity: 0.9, fontSize: '0.875rem' }}>Room Number</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: leaseStatus.color }}>
                            {leaseStatus.status}
                        </div>
                        <div style={{ opacity: 0.9, fontSize: '0.875rem' }}>Lease Status</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                            ${userData.tenantInfo?.monthlyRent || 0}
                        </div>
                        <div style={{ opacity: 0.9, fontSize: '0.875rem' }}>Monthly Rent</div>
                    </div>
                </div>
            </div>

            {/* Main Profile Card */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}>
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                        Profile Information
                    </h3>
                    {!isEditing ? (
                        <button
                            onClick={handleEdit}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                backgroundColor: '#1e40af',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <FaEdit />
                            Edit Profile
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    backgroundColor: isSaving ? '#9ca3af' : '#10b981',
                                    color: 'white',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    cursor: isSaving ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <FaSave />
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isSaving}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    backgroundColor: '#6b7280',
                                    color: 'white',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    cursor: isSaving ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <FaTimes />
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ padding: '24px' }}>
                    {/* Success/Error Messages */}
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

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
                        {/* Personal Information */}
                        <div>
                            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>
                                Personal Information
                            </h4>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    <FaUser style={{ marginRight: '8px', color: '#6b7280' }} />
                                    Full Name
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={editData.name || ''}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '1rem'
                                        }}
                                    />
                                ) : (
                                    <p style={{ color: '#1f2937', padding: '8px 0', fontWeight: '500' }}>{userData.name}</p>
                                )}
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    <FaEnvelope style={{ marginRight: '8px', color: '#6b7280' }} />
                                    Email Address
                                </label>
                                <p style={{ color: '#1f2937', padding: '8px 0', fontWeight: '500' }}>{userData.email}</p>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Email cannot be changed</p>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    <FaPhone style={{ marginRight: '8px', color: '#6b7280' }} />
                                    Phone Number
                                </label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={editData.phone || ''}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '1rem'
                                        }}
                                    />
                                ) : (
                                    <p style={{ color: '#1f2937', padding: '8px 0', fontWeight: '500' }}>{userData.phone}</p>
                                )}
                            </div>
                        </div>

                        {/* Lease Information */}
                        <div>
                            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>
                                Lease Information
                            </h4>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    <FaHome style={{ marginRight: '8px', color: '#6b7280' }} />
                                    Room Number
                                </label>
                                <p style={{ color: '#1f2937', padding: '8px 0', fontWeight: '500' }}>
                                    {userData.tenantInfo?.apartmentId?.unitNumber || userData.tenantInfo?.roomNumber}
                                </p>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    <FaCalendarAlt style={{ marginRight: '8px', color: '#6b7280' }} />
                                    Lease Start Date
                                </label>
                                <p style={{ color: '#1f2937', padding: '8px 0', fontWeight: '500' }}>
                                    {userData.tenantInfo?.leaseStartDate ?
                                        new Date(userData.tenantInfo.leaseStartDate).toLocaleDateString() :
                                        'Not specified'}
                                </p>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    <FaCalendarAlt style={{ marginRight: '8px', color: '#6b7280' }} />
                                    Lease End Date
                                </label>
                                <p style={{ color: '#1f2937', padding: '8px 0', fontWeight: '500' }}>
                                    {userData.tenantInfo?.leaseEndDate ?
                                        new Date(userData.tenantInfo.leaseEndDate).toLocaleDateString() :
                                        'Not specified'}
                                </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
                                        Monthly Rent
                                    </label>
                                    <p style={{ color: '#1f2937', padding: '8px 0', fontWeight: '500' }}>
                                        ${userData.tenantInfo?.monthlyRent || 0}
                                    </p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
                                        Security Deposit
                                    </label>
                                    <p style={{ color: '#1f2937', padding: '8px 0', fontWeight: '500' }}>
                                        ${userData.tenantInfo?.securityDeposit || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>
                            Emergency Contact Information
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
                                    Contact Name
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="emergencyContact.name"
                                        value={editData.emergencyContact?.name || ''}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '1rem'
                                        }}
                                    />
                                ) : (
                                    <p style={{ color: '#1f2937', padding: '8px 0', fontWeight: '500' }}>
                                        {userData.tenantInfo?.emergencyContact?.name || 'Not provided'}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
                                    Phone Number
                                </label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="emergencyContact.phone"
                                        value={editData.emergencyContact?.phone || ''}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '1rem'
                                        }}
                                    />
                                ) : (
                                    <p style={{ color: '#1f2937', padding: '8px 0', fontWeight: '500' }}>
                                        {userData.tenantInfo?.emergencyContact?.phone || 'Not provided'}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
                                    Relationship
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="emergencyContact.relationship"
                                        value={editData.emergencyContact?.relationship || ''}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '1rem'
                                        }}
                                    />
                                ) : (
                                    <p style={{ color: '#1f2937', padding: '8px 0', fontWeight: '500' }}>
                                        {userData.tenantInfo?.emergencyContact?.relationship || 'Not provided'}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
                                    Email (Optional)
                                </label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="emergencyContact.email"
                                        value={editData.emergencyContact?.email || ''}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '1rem'
                                        }}
                                    />
                                ) : (
                                    <p style={{ color: '#1f2937', padding: '8px 0', fontWeight: '500' }}>
                                        {userData.tenantInfo?.emergencyContact?.email || 'Not provided'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Change Section */}
            <div style={{
                backgroundColor: 'white', padding: '24px', borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <FaLock style={{ color: '#3b82f6', fontSize: '1.25rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                        Change Password
                    </h3>
                </div>

                {passwordMessage && (
                    <div style={{
                        backgroundColor: '#f0fdf4', borderLeft: '4px solid #10b981',
                        color: '#059669', padding: '12px', marginBottom: '20px',
                        borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <FaCheck />
                        {passwordMessage}
                    </div>
                )}

                {passwordError && (
                    <div style={{
                        backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444',
                        color: '#dc2626', padding: '12px', marginBottom: '20px',
                        borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <FaTimes />
                        {passwordError}
                    </div>
                )}

                <form onSubmit={handlePasswordSubmit}>
                    <div style={{ display: 'grid', gap: '16px', maxWidth: '500px' }}>
                        {/* Current Password */}
                        <div>
                            <label style={{
                                display: 'block', fontSize: '0.875rem', fontWeight: '500',
                                color: '#374151', marginBottom: '6px'
                            }}>
                                Current Password *
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    style={{
                                        width: '100%', padding: '10px 40px 10px 12px',
                                        border: '1px solid #d1d5db', borderRadius: '6px',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="Enter your current password"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('current')}
                                    style={{
                                        position: 'absolute', right: '12px', top: '50%',
                                        transform: 'translateY(-50%)', background: 'none',
                                        border: 'none', color: '#6b7280', cursor: 'pointer'
                                    }}
                                >
                                    {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label style={{
                                display: 'block', fontSize: '0.875rem', fontWeight: '500',
                                color: '#374151', marginBottom: '6px'
                            }}>
                                New Password *
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    style={{
                                        width: '100%', padding: '10px 40px 10px 12px',
                                        border: '1px solid #d1d5db', borderRadius: '6px',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="Enter your new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('new')}
                                    style={{
                                        position: 'absolute', right: '12px', top: '50%',
                                        transform: 'translateY(-50%)', background: 'none',
                                        border: 'none', color: '#6b7280', cursor: 'pointer'
                                    }}
                                >
                                    {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label style={{
                                display: 'block', fontSize: '0.875rem', fontWeight: '500',
                                color: '#374151', marginBottom: '6px'
                            }}>
                                Confirm New Password *
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    style={{
                                        width: '100%', padding: '10px 40px 10px 12px',
                                        border: '1px solid #d1d5db', borderRadius: '6px',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="Confirm your new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('confirm')}
                                    style={{
                                        position: 'absolute', right: '12px', top: '50%',
                                        transform: 'translateY(-50%)', background: 'none',
                                        border: 'none', color: '#6b7280', cursor: 'pointer'
                                    }}
                                >
                                    {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div style={{ marginTop: '8px' }}>
                            <button
                                type="submit"
                                disabled={isChangingPassword}
                                style={{
                                    backgroundColor: '#3b82f6', color: 'white',
                                    padding: '10px 20px', borderRadius: '6px',
                                    border: 'none', cursor: 'pointer',
                                    fontSize: '1rem', fontWeight: '500',
                                    opacity: isChangingPassword ? 0.7 : 1
                                }}
                            >
                                {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TenantProfile;
