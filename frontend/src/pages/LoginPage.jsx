// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsLoading(true);
            setError('');

            console.log('Attempting login with:', formData.email);

            const response = await api.login(formData.email, formData.password);

            console.log('Login response:', response);

            if (response.success && response.token && response.data) {
                const loginSuccess = login(response.token, response.data);

                if (loginSuccess) {
                    console.log('Login successful, redirecting...');

                    // Redirect based on role
                    if (response.data.role === 'admin') {
                        navigate('/admin/dashboard');
                    } else if (response.data.role === 'worker') {
                        navigate('/worker/dashboard');
                    } else if (response.data.role === 'tenant') {
                        navigate('/tenant/dashboard');
                    } else {
                        navigate('/');
                    }
                } else {
                    setError('Failed to process login response');
                }
            } else {
                setError(response.message || 'Login failed - invalid response format');
            }
        } catch (err) {
            console.error('Login error:', err);

            if (err.response?.status === 401) {
                setError('Invalid email or password');
            } else if (err.response?.status === 500) {
                setError('Server error. Please try again later.');
            } else if (err.code === 'NETWORK_ERROR' || !err.response) {
                setError('Cannot connect to server. Please check if the backend is running.');
            } else {
                setError(err.response?.data?.message || 'Login failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f3f4f6'
        }}>
            <div style={{
                maxWidth: '400px',
                width: '100%',
                padding: '32px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: '24px',
                    color: '#1f2937'
                }}>
                    Login to Apartment Management
                </h2>

                {error && (
                    <div style={{
                        backgroundColor: '#fef2f2',
                        borderLeft: '4px solid #ef4444',
                        color: '#dc2626',
                        padding: '12px',
                        marginBottom: '16px',
                        borderRadius: '4px'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '8px'
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontSize: '1rem'
                            }}
                            placeholder="Enter your email"
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '8px'
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontSize: '1rem'
                            }}
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            fontWeight: '500',
                            cursor: isLoading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default LoginPage;
