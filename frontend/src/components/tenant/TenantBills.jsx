import React, { useState, useEffect } from 'react'
import { FaFileInvoiceDollar, FaEye, FaDownload, FaCalendarAlt, FaSync } from 'react-icons/fa'
import api from '../../services/api'

const TenantBills = () => {
    const [bills, setBills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedBill, setSelectedBill] = useState(null);
    const [filters, setFilters] = useState({
        status: 'all',
        year: new Date().getFullYear()
    });

    useEffect(() => {
        fetchBills();
    }, [filters]);

    const fetchBills = async () => {
        try {
            setIsLoading(true);
            setError('');

            const response = await api.getMyUtilityBills(filters);

            if (response.success) {
                setBills(response.data || []);
            } else {
                throw new Error(response.message || 'Failed to fetch bills');
            }
        } catch (err) {
            console.error('Error fetching bills:', err);
            setError('Failed to load utility bills from database');
            setBills([]);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'sent': return { backgroundColor: '#dbeafe', color: '#1e40af' };
            case 'paid': return { backgroundColor: '#d1fae5', color: '#065f46' };
            case 'overdue': return { backgroundColor: '#fee2e2', color: '#991b1b' };
            default: return { backgroundColor: '#f3f4f6', color: '#374151' };
        }
    };

    const formatCurrency = (amount) => {
        return typeof amount === 'number' ? amount.toFixed(2) : '0.00';
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleDateString();
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const getBillingMonth = (billingPeriod) => {
        if (!billingPeriod || !billingPeriod.startDate) return 'Unknown Period';
        try {
            const startDate = new Date(billingPeriod.startDate);
            return startDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
            });
        } catch (error) {
            return 'Invalid Period';
        }
    };

    const getBillingPeriodRange = (billingPeriod) => {
        if (!billingPeriod || !billingPeriod.startDate || !billingPeriod.endDate) {
            return 'Unknown Period';
        }
        try {
            const startDate = new Date(billingPeriod.startDate);
            const endDate = new Date(billingPeriod.endDate);
            return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
        } catch (error) {
            return 'Invalid Period';
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
                        My Utility Bills
                    </h1>
                    <p style={{ color: '#6b7280' }}>View and manage your monthly utility bills</p>
                </div>
                <button
                    onClick={fetchBills}
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

            {/* Error Message */}
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

            {/* Filters */}
            <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                marginBottom: '24px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                            Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                        >
                            <option value="all">All Bills</option>
                            <option value="sent">Pending Payment</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                            Year
                        </label>
                        <select
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
                            style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                        >
                            {[2025, 2024, 2023].map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Bills List */}
            <div style={{ display: 'grid', gap: '16px' }}>
                {bills.length > 0 ? (
                    bills.map(bill => (
                        <div key={bill._id} style={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div style={{ flex: 1 }}>
                                    {/* Bill Header with Month */}
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                        <FaCalendarAlt style={{ color: '#3b82f6', marginRight: '12px', fontSize: '1.5rem' }} />
                                        <div>
                                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                                                {getBillingMonth(bill.billingPeriod)} Utility Bill
                                            </h3>
                                            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '4px 0 0 0' }}>
                                                Bill #{bill.billNumber}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Billing Period */}
                                    <div style={{
                                        backgroundColor: '#f0f9ff',
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        marginBottom: '16px',
                                        border: '1px solid #0ea5e9'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FaCalendarAlt style={{ color: '#0369a1', fontSize: '0.875rem' }} />
                                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0369a1' }}>
                                                Billing Period: {getBillingPeriodRange(bill.billingPeriod)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bill Details */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                                        <div>
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Amount:</span>
                                            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#059669', margin: '4px 0' }}>
                                                Rs. {formatCurrency(bill.totalAmount)}
                                            </p>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Due Date:</span>
                                            <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', margin: '4px 0' }}>
                                                {formatDate(bill.dueDate)}
                                            </p>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Bill Date:</span>
                                            <p style={{ fontSize: '1rem', fontWeight: '500', color: '#1f2937', margin: '4px 0' }}>
                                                {formatDate(bill.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Utilities Summary */}
                                    {bill.utilities && bill.utilities.length > 0 && (
                                        <div style={{ marginBottom: '16px' }}>
                                            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                                                Utilities Breakdown:
                                            </h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
                                                {bill.utilities.map((utility, index) => (
                                                    <div key={index} style={{
                                                        backgroundColor: '#f8fafc',
                                                        padding: '8px 12px',
                                                        borderRadius: '6px',
                                                        border: '1px solid #e2e8f0'
                                                    }}>
                                                        <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'capitalize' }}>
                                                            {utility.utilityType}
                                                        </div>
                                                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
                                                            Rs. {formatCurrency(utility.amount)}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                            {utility.consumption} units
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Status and Actions */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                                    <span style={{
                                        ...getStatusColor(bill.status),
                                        padding: '6px 16px',
                                        borderRadius: '20px',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        textTransform: 'capitalize'
                                    }}>
                                        {bill.status === 'sent' ? 'Pending Payment' : bill.status}
                                    </span>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => setSelectedBill(bill)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                padding: '8px 12px',
                                                backgroundColor: '#3b82f6',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '0.875rem',
                                                fontWeight: '500'
                                            }}
                                        >
                                            <FaEye />
                                            View Details
                                        </button>

                                        {bill.status === 'sent' && (
                                            <button
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    padding: '8px 12px',
                                                    backgroundColor: '#059669',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.875rem',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                💳 Pay Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '48px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb'
                    }}>
                        <FaFileInvoiceDollar style={{ fontSize: '4rem', color: '#9ca3af', marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                            No Bills Found
                        </h3>
                        <p style={{ color: '#6b7280' }}>
                            {error ? 'Unable to load bills from database.' : 'No utility bills found for the selected criteria.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Bill Details Modal */}
            {selectedBill && (
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
                        borderRadius: '12px',
                        boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)',
                        maxWidth: '600px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                                        {getBillingMonth(selectedBill.billingPeriod)} Utility Bill
                                    </h3>
                                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '4px 0 0 0' }}>
                                        Bill #{selectedBill.billNumber}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedBill(null)}
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
                            {/* Billing Period */}
                            <div style={{
                                backgroundColor: '#f0f9ff',
                                padding: '16px',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                border: '1px solid #0ea5e9'
                            }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#0369a1', margin: '0 0 8px 0' }}>
                                    📅 Billing Period
                                </h4>
                                <p style={{ fontSize: '0.875rem', color: '#0369a1', margin: 0 }}>
                                    {getBillingPeriodRange(selectedBill.billingPeriod)}
                                </p>
                            </div>

                            {/* Utilities Details */}
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                                    Utility Details
                                </h4>
                                <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f8fafc' }}>
                                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                                                    Utility
                                                </th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                                                    Consumption
                                                </th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                                                    Rate
                                                </th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                                                    Amount
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedBill.utilities?.map((utility, index) => (
                                                <tr key={index} style={{ borderTop: '1px solid #e5e7eb' }}>
                                                    <td style={{ padding: '12px', fontSize: '0.875rem', color: '#1f2937', textTransform: 'capitalize' }}>
                                                        {utility.utilityType}
                                                    </td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '0.875rem', color: '#1f2937' }}>
                                                        {utility.consumption} units
                                                    </td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '0.875rem', color: '#1f2937' }}>
                                                        Rs. {formatCurrency(utility.rate)}
                                                    </td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#059669' }}>
                                                        Rs. {formatCurrency(utility.amount)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Bill Summary */}
                            <div style={{
                                backgroundColor: '#f8fafc',
                                padding: '16px',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Subtotal:</span>
                                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                                        Rs. {formatCurrency(selectedBill.subtotal)}
                                    </span>
                                </div>
                                {selectedBill.tax > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Tax:</span>
                                        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                                            Rs. {formatCurrency(selectedBill.tax)}
                                        </span>
                                    </div>
                                )}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    paddingTop: '8px',
                                    borderTop: '1px solid #d1d5db'
                                }}>
                                    <span style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>Total Amount:</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#059669' }}>
                                        Rs.{formatCurrency(selectedBill.totalAmount)}
                                    </span>
                                </div>
                            </div>

                            {/* Due Date */}
                            <div style={{
                                backgroundColor: selectedBill.status === 'overdue' ? '#fef2f2' : '#fffbeb',
                                padding: '12px',
                                borderRadius: '8px',
                                marginTop: '16px',
                                textAlign: 'center'
                            }}>
                                <span style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: selectedBill.status === 'overdue' ? '#dc2626' : '#d97706'
                                }}>
                                    Due Date: {formatDate(selectedBill.dueDate)}
                                </span>
                            </div>

                            {/* Admin Notes */}
                            {selectedBill.adminNotes && (
                                <div style={{
                                    backgroundColor: '#f0f9ff',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    marginTop: '16px'
                                }}>
                                    <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0369a1', margin: '0 0 4px 0' }}>
                                        Notes:
                                    </h5>
                                    <p style={{ fontSize: '0.875rem', color: '#0369a1', margin: 0 }}>
                                        {selectedBill.adminNotes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantBills;
