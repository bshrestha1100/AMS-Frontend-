import React, { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash, FaFileInvoiceDollar } from 'react-icons/fa'
import api from '../../services/api'

const UtilityManagement = () => {
    const [bills, setBills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingBill, setEditingBill] = useState(null);

    const [formData, setFormData] = useState({
        apartmentId: '',
        tenantId: '',
        billMonth: '',
        billYear: new Date().getFullYear(),
        dueDate: '',
        meteredUtilities: {
            electricity: { previousReading: 0, currentReading: 0, rate: 10 },
            heatingCooling: { previousReading: 0, currentReading: 0, rate: 8 }
        },
        fixedCharges: {
            cleaningService: { quantity: 1, rate: 500 },
            waterJar: { quantity: 0, rate: 0 },
            gas: { quantity: 0, rate: 0 }
        }
    });

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            setIsLoading(true);
            const response = await api.getUtilityBills();

            if (response.success) {
                setBills(response.data);
            }
        } catch (err) {
            console.error('Error fetching bills:', err);
            setError('Failed to load utility bills');

            // Mock data for development
            setBills([
                {
                    _id: '1',
                    apartmentId: { unitNumber: 'A101' },
                    tenantId: { name: 'John Doe' },
                    billMonth: 'December',
                    billYear: 2024,
                    totalAmount: 450.00,
                    status: 'pending',
                    dueDate: '2024-12-15'
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError('');
            setSuccess('');

            if (editingBill) {
                // Update existing bill
                setSuccess('Bill updated successfully!');
            } else {
                await api.createUtilityBill(formData);
                setSuccess('Bill created successfully!');
            }

            await fetchBills();
            resetForm();

        } catch (err) {
            console.error('Error saving bill:', err);
            setError(err.response?.data?.message || 'Failed to save bill');
        }
    };

    const resetForm = () => {
        setFormData({
            apartmentId: '',
            tenantId: '',
            billMonth: '',
            billYear: new Date().getFullYear(),
            dueDate: '',
            meteredUtilities: {
                electricity: { previousReading: 0, currentReading: 0, rate: 10 },
                heatingCooling: { previousReading: 0, currentReading: 0, rate: 8 }
            },
            fixedCharges: {
                cleaningService: { quantity: 1, rate: 500 },
                waterJar: { quantity: 0, rate: 0 },
                gas: { quantity: 0, rate: 0 }
            }
        });
        setEditingBill(null);
        setShowModal(false);
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
            case 'paid':
                return { backgroundColor: '#d1fae5', color: '#065f46' };
            case 'overdue':
                return { backgroundColor: '#fee2e2', color: '#991b1b' };
            default:
                return { backgroundColor: '#fef3c7', color: '#92400e' };
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
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                        Utility Management
                    </h1>
                    <p style={{ color: '#6b7280' }}>Manage utility bills and charges</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
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
                        fontSize: '1rem'
                    }}
                >
                    <FaPlus />
                    Generate Bill
                </button>
            </div>

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

            {bills.length === 0 ? (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    padding: '48px',
                    textAlign: 'center'
                }}>
                    <FaFileInvoiceDollar style={{ fontSize: '4rem', color: '#9ca3af', marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                        No Bills Found
                    </h3>
                    <p style={{ color: '#6b7280' }}>No utility bills have been generated yet.</p>
                </div>
            ) : (
                <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f9fafb' }}>
                            <tr>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Apartment</th>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Tenant</th>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Period</th>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Amount</th>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map((bill, index) => (
                                <tr key={bill._id} style={{ borderTop: index > 0 ? '1px solid #e5e7eb' : 'none' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                                            {bill.apartmentId?.unitNumber || 'N/A'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                                            {bill.tenantId?.name || 'N/A'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                                            {bill.billMonth} {bill.billYear}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                                            ${bill.totalAmount?.toFixed(2) || '0.00'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            ...getStatusColor(bill.status),
                                            padding: '4px 8px',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500'
                                        }}>
                                            {bill.status?.charAt(0).toUpperCase() + bill.status?.slice(1)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: '#f59e0b',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                <FaEdit />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal for creating/editing bills */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                                {editingBill ? 'Edit Bill' : 'Generate New Bill'}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                        Bill Month *
                                    </label>
                                    <select
                                        name="billMonth"
                                        value={formData.billMonth}
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
                                        <option value="">Select Month</option>
                                        {['January', 'February', 'March', 'April', 'May', 'June',
                                            'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                                                <option key={month} value={month}>{month}</option>
                                            ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                        Bill Year *
                                    </label>
                                    <input
                                        type="number"
                                        name="billYear"
                                        value={formData.billYear}
                                        onChange={handleInputChange}
                                        required
                                        min="2020"
                                        max="2030"
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                    Due Date *
                                </label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={resetForm}
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
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {editingBill ? 'Update' : 'Generate'} Bill
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UtilityManagement;