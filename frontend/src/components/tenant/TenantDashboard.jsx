import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { FaHome, FaBuilding, FaFileInvoiceDollar, FaUser, FaCalendarAlt } from 'react-icons/fa'
import api from '../../services/api'

const TenantDashboard = () => {
    console.log("TenantDashboard rendering");

    const [stats, setStats] = useState({
        totalBills: 0,
        pendingBills: 0,
        paidBills: 0,
        totalAmount: 0
    });
    const [roomInfo, setRoomInfo] = useState(null);
    const [recentBills, setRecentBills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            setError('');

            // Fetch real data from database
            const [profileRes, billsRes] = await Promise.all([
                api.getTenantProfile().catch(() => ({ success: false })),
                api.getMyUtilityBills().catch(() => ({ success: false }))
            ]);

            // Set room info from tenant profile
            if (profileRes.success && profileRes.data) {
                // Try to get apartment details from populated apartmentId
                const apt = profileRes.data.tenantInfo?.apartmentId;
                setRoomInfo({
                    unitNumber: profileRes.data.tenantInfo?.roomNumber || apt?.unitNumber || 'N/A',
                    type: apt?.type || profileRes.data.tenantInfo?.apartmentType || 'N/A',
                    floor: apt?.floor || profileRes.data.tenantInfo?.floor || 'N/A',
                    area: apt?.area || profileRes.data.tenantInfo?.area || 'N/A',
                    location: apt?.building || apt?.location || apt?.address || 'N/A'
                });
            }
            // Process bills data
            if (billsRes.success && billsRes.data) {
                const bills = billsRes.data;

                // Calculate stats from real bills data
                const totalBills = bills.length;
                const pendingBills = bills.filter(bill => bill.status === 'sent').length;
                const paidBills = bills.filter(bill => bill.status === 'paid').length;
                const totalAmount = bills
                    .filter(bill => bill.status === 'sent')
                    .reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);

                setStats({
                    totalBills,
                    pendingBills,
                    paidBills,
                    totalAmount
                });

                // Format recent bills for display
                const formattedBills = bills.slice(0, 5).map(bill => {
                    const billingDate = bill.billingPeriod?.startDate ?
                        new Date(bill.billingPeriod.startDate) : new Date();

                    return {
                        _id: bill._id,
                        billMonth: billingDate.toLocaleDateString('en-US', { month: 'long' }),
                        billYear: billingDate.getFullYear(),
                        totalAmount: bill.totalAmount || 0,
                        status: bill.status === 'sent' ? 'pending' : bill.status,
                        dueDate: bill.dueDate
                    };
                });

                setRecentBills(formattedBills);
            }

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data from database. Please try refreshing the page.');

            // Clear data on error
            setRoomInfo(null);
            setStats({
                totalBills: 0,
                pendingBills: 0,
                paidBills: 0,
                totalAmount: 0
            });
            setRecentBills([]);

        } finally {
            setIsLoading(false);
        }
    };

    const getBillingMonth = (billingPeriod) => {
        if (!billingPeriod || !billingPeriod.startDate) return 'Unknown';
        try {
            const startDate = new Date(billingPeriod.startDate);
            return startDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
            });
        } catch (error) {
            return 'Invalid';
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
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                    Tenant Dashboard
                </h1>
                <p style={{ color: '#6b7280' }}>Welcome to your tenant portal. Manage your apartment and bills here.</p>

                {error && (
                    <div style={{
                        backgroundColor: '#fef3c7',
                        borderLeft: '4px solid #f59e0b',
                        color: '#92400e',
                        padding: '12px',
                        marginTop: '12px',
                        borderRadius: '4px',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                        <button
                            onClick={fetchDashboardData}
                            style={{
                                marginLeft: '12px',
                                padding: '4px 8px',
                                backgroundColor: '#f59e0b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                            }}
                        >
                            Retry
                        </button>
                    </div>
                )}
            </div>

            {/* Room Info Card */}
            {roomInfo && (
                <div style={{
                    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                    color: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    boxShadow: '0 8px 25px rgba(30, 64, 175, 0.3)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                        <FaBuilding style={{ fontSize: '2rem', marginRight: '16px' }} />
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '4px' }}>
                                Unit {roomInfo.unitNumber}
                            </h2>
                            <p style={{ opacity: 0.9 }}>Your Apartment</p>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
                        <div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{roomInfo.type}</div>
                            <div style={{ opacity: 0.9, fontSize: '0.875rem' }}>Type</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Floor {roomInfo.floor}</div>
                            <div style={{ opacity: 0.9, fontSize: '0.875rem' }}>Location</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{roomInfo.area} sq ft</div>
                            <div style={{ opacity: 0.9, fontSize: '0.875rem' }}>Area</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Show message if no room info available */}
            {!roomInfo && !isLoading && (
                <div style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '24px',
                    marginBottom: '24px',
                    textAlign: 'center'
                }}>
                    <FaBuilding style={{ fontSize: '3rem', color: '#9ca3af', marginBottom: '12px' }} />
                    <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>No Apartment Information</h3>
                    <p style={{ color: '#6b7280' }}>Unable to load apartment details from database.</p>
                </div>
            )}

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    borderLeft: '4px solid #1e40af'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                                Total Bills
                            </h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e40af' }}>
                                {stats.totalBills}
                            </p>
                        </div>
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#dbeafe',
                            borderRadius: '50%'
                        }}>
                            <FaFileInvoiceDollar style={{ color: '#1e40af', fontSize: '1.25rem' }} />
                        </div>
                    </div>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    borderLeft: '4px solid #f59e0b'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                                Pending Bills
                            </h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                                {stats.pendingBills}
                            </p>
                        </div>
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#fef3c7',
                            borderRadius: '50%'
                        }}>
                            <FaCalendarAlt style={{ color: '#f59e0b', fontSize: '1.25rem' }} />
                        </div>
                    </div>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    borderLeft: '4px solid #10b981'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                                Paid Bills
                            </h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                                {stats.paidBills}
                            </p>
                        </div>
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#d1fae5',
                            borderRadius: '50%'
                        }}>
                            <FaHome style={{ color: '#10b981', fontSize: '1.25rem' }} />
                        </div>
                    </div>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    borderLeft: '4px solid #8b5cf6'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                                Total Amount
                            </h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                                Rs. {stats.totalAmount?.toFixed(2) || '0.00'}
                            </p>
                        </div>
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#ede9fe',
                            borderRadius: '50%'
                        }}>
                            <FaFileInvoiceDollar style={{ color: '#8b5cf6', fontSize: '1.25rem' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Bills */}
            {recentBills.length > 0 && (
                <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', marginBottom: '32px' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>Recent Bills</h2>
                    </div>
                    <div style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {recentBills.map(bill => (
                                <div key={bill._id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '16px',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div>
                                                <p style={{ fontWeight: '500', color: '#1f2937' }}>
                                                    {bill.billMonth} {bill.billYear}
                                                </p>
                                                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                                    Due: {new Date(bill.dueDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                                <p style={{ fontWeight: '600', color: '#1f2937' }}>
                                                    Rs. {bill.totalAmount.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '4px 12px',
                                        borderRadius: '9999px',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        backgroundColor: bill.status === 'paid' ? '#d1fae5' : '#fef3c7',
                                        color: bill.status === 'paid' ? '#065f46' : '#92400e'
                                    }}>
                                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Show message if no bills available */}
            {recentBills.length === 0 && !isLoading && (
                <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', marginBottom: '32px' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>Recent Bills</h2>
                    </div>
                    <div style={{ padding: '48px', textAlign: 'center' }}>
                        <FaFileInvoiceDollar style={{ fontSize: '3rem', color: '#9ca3af', marginBottom: '12px' }} />
                        <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>No Bills Available</h3>
                        <p style={{ color: '#6b7280' }}>No utility bills found in the database.</p>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px'
            }}>
                <div style={{
                    backgroundColor: '#eff6ff',
                    padding: '24px',
                    borderRadius: '8px',
                    border: '1px solid #dbeafe'
                }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e3a8a', marginBottom: '8px' }}>
                        My Room Details
                    </h3>
                    <p style={{ color: '#1d4ed8', marginBottom: '16px' }}>
                        View your apartment specifications and features
                    </p>
                    <NavLink
                        to="/tenant/room-details"
                        style={{
                            display: 'inline-block',
                            backgroundColor: '#1e40af',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            transition: 'background-color 0.3s'
                        }}
                    >
                        View Room
                    </NavLink>
                </div>

                <div style={{
                    backgroundColor: '#fef3c7',
                    padding: '24px',
                    borderRadius: '8px',
                    border: '1px solid #fed7aa'
                }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
                        My Bills
                    </h3>
                    <p style={{ color: '#d97706', marginBottom: '16px' }}>
                        View and manage your utility bills and payments
                    </p>
                    <NavLink
                        to="/tenant/bills"
                        style={{
                            display: 'inline-block',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            transition: 'background-color 0.3s'
                        }}
                    >
                        View Bills
                    </NavLink>
                </div>

                <div style={{
                    backgroundColor: '#faf5ff',
                    padding: '24px',
                    borderRadius: '8px',
                    border: '1px solid #e9d5ff'
                }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#5b21b6', marginBottom: '8px' }}>
                        My Profile
                    </h3>
                    <p style={{ color: '#7c3aed', marginBottom: '16px' }}>
                        Update your personal information and settings
                    </p>
                    <NavLink
                        to="/tenant/profile"
                        style={{
                            display: 'inline-block',
                            backgroundColor: '#8b5cf6',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            transition: 'background-color 0.3s'
                        }}
                    >
                        Edit Profile
                    </NavLink>
                </div>
            </div>
        </div>
    );
};

export default TenantDashboard;
