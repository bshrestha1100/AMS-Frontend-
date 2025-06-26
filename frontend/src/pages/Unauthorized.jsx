import React from 'react'
import { Link } from 'react-router-dom'

const Unauthorized = () => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc'
        }}>
            <div style={{ textAlign: 'center', maxWidth: '500px', padding: '20px' }}>
                <h1 style={{
                    fontSize: '6rem',
                    fontWeight: 'bold',
                    color: '#ef4444',
                    marginBottom: '1rem'
                }}>
                    403
                </h1>
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '1rem'
                }}>
                    Access Denied
                </h2>
                <p style={{
                    color: '#6b7280',
                    marginBottom: '2rem',
                    fontSize: '1.125rem'
                }}>
                    You don't have permission to access this page.
                </p>
                <Link
                    to="/"
                    style={{
                        display: 'inline-block',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        transition: 'background-color 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                >
                    Go Back Home
                </Link>
            </div>
        </div>
    );
};

export default Unauthorized;
