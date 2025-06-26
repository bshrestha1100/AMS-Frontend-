import React, { useState, useEffect } from 'react'
import { FaFileInvoiceDollar, FaPlus, FaPaperPlane, FaSync, FaMoneyBillWave, FaEdit, FaTrash, FaEye, FaMinus } from 'react-icons/fa'
import api from '../../services/api'

const UtilityBillManagement = () => {
    const [bills, setBills] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingBill, setEditingBill] = useState(null);
    const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);
    const [viewingBill, setViewingBill] = useState(null);

    const [formData, setFormData] = useState({
        tenantId: '',
        billingMonth: new Date().toISOString().slice(0, 7),
        meteredUtilities: [
            { type: 'electricity', previousReading: 0, currentReading: 0, rate: 15 },
            { type: 'floor_heating', previousReading: 0, currentReading: 0, rate: 20 },
            { type: 'car_charging', previousReading: 0, currentReading: 0, rate: 25 }
        ],
        otherServices: [
            { type: 'water_jar', quantity: 0, rate: 50 },
            { type: 'cleaning_service', quantity: 0, rate: 100 },
            { type: 'gas', quantity: 0, rate: 80 }
        ],
        dueDate: ''
    });

    const [paymentData, setPaymentData] = useState({
        paymentMethod: 'cash',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [billsRes, tenantsRes] = await Promise.all([
                api.getAllUtilityBills(),
                api.getAllTenants()
            ]);

            if (billsRes.success) setBills(billsRes.data || []);
            if (tenantsRes.success) setTenants(tenantsRes.data || []);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const calculateMeteredTotal = () => {
        return formData.meteredUtilities.reduce((total, utility) => {
            const units = utility.currentReading - utility.previousReading;
            return total + (units * utility.rate);
        }, 0);
    };

    const calculateOtherServicesTotal = () => {
        return formData.otherServices.reduce((total, service) => {
            return total + (service.quantity * service.rate);
        }, 0);
    };

    const calculateGrandTotal = () => {
        return calculateMeteredTotal() + calculateOtherServicesTotal();
    };

    const addOtherService = () => {
        setFormData(prev => ({
            ...prev,
            otherServices: [...prev.otherServices, { type: '', quantity: 0, rate: 0 }]
        }));
    };

    const removeOtherService = (index) => {
        setFormData(prev => ({
            ...prev,
            otherServices: prev.otherServices.filter((_, i) => i !== index)
        }));
    };

    const updateMeteredUtility = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            meteredUtilities: prev.meteredUtilities.map((utility, i) =>
                i === index ? { ...utility, [field]: parseFloat(value) || 0 } : utility
            )
        }));
    };

    const updateOtherService = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            otherServices: prev.otherServices.map((service, i) =>
                i === index ? { ...service, [field]: field === 'type' ? value : parseFloat(value) || 0 } : service
            )
        }));
    };

    const handleCreateAndSend = async (e) => {
        e.preventDefault();

        try {
            setError('');
            setSuccess('');
            setIsLoading(true);

            // Prepare utilities data for backend
            const utilities = [];

            // Add metered utilities
            formData.meteredUtilities.forEach(utility => {
                const units = utility.currentReading - utility.previousReading;
                if (units > 0 || utility.currentReading > 0) {
                    utilities.push({
                        utilityType: utility.type,
                        previousReading: utility.previousReading,
                        currentReading: utility.currentReading,
                        consumption: units,
                        rate: utility.rate,
                        amount: units * utility.rate
                    });
                }
            });

            // Add other services
            formData.otherServices.forEach(service => {
                if (service.quantity > 0 && service.type) {
                    utilities.push({
                        utilityType: service.type,
                        previousReading: 0,
                        currentReading: service.quantity,
                        consumption: service.quantity,
                        rate: service.rate,
                        amount: service.quantity * service.rate
                    });
                }
            });

            const billData = {
                tenantId: formData.tenantId,
                billingPeriod: {
                    startDate: new Date(formData.billingMonth + '-01'),
                    endDate: new Date(formData.billingMonth + '-31')
                },
                utilities,
                subtotal: calculateGrandTotal(),
                totalAmount: calculateGrandTotal(),
                dueDate: formData.dueDate,
                status: 'sent'
            };

            const response = await api.createAndSendBill(billData);

            if (response.success) {
                setSuccess('Bill created and sent to tenant successfully!');
                await fetchData();
                resetForm();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            console.error('Error creating bill:', err);
            setError(err.response?.data?.message || 'Failed to create and send bill');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (bill) => {
        setEditingBill(bill);

        const billingMonth = new Date(bill.billingPeriod.startDate).toISOString().slice(0, 7);

        // Initialize metered utilities
        const meteredUtilities = [
            { type: 'electricity', previousReading: 0, currentReading: 0, rate: 15 },
            { type: 'floor_heating', previousReading: 0, currentReading: 0, rate: 20 },
            { type: 'car_charging', previousReading: 0, currentReading: 0, rate: 25 }
        ];

        // Initialize other services
        const otherServices = [
            { type: 'water_jar', quantity: 0, rate: 50 },
            { type: 'cleaning_service', quantity: 0, rate: 100 },
            { type: 'gas', quantity: 0, rate: 80 }
        ];

        // Populate from existing bill data
        bill.utilities?.forEach(utility => {
            const meteredIndex = meteredUtilities.findIndex(m => m.type === utility.utilityType);
            if (meteredIndex !== -1) {
                meteredUtilities[meteredIndex] = {
                    type: utility.utilityType,
                    previousReading: utility.previousReading || 0,
                    currentReading: utility.currentReading || 0,
                    rate: utility.rate || 0
                };
            } else {
                const otherIndex = otherServices.findIndex(s => s.type === utility.utilityType);
                if (otherIndex !== -1) {
                    otherServices[otherIndex] = {
                        type: utility.utilityType,
                        quantity: utility.consumption || 0,
                        rate: utility.rate || 0
                    };
                } else {
                    // Add custom service
                    otherServices.push({
                        type: utility.utilityType,
                        quantity: utility.consumption || 0,
                        rate: utility.rate || 0
                    });
                }
            }
        });

        setFormData({
            tenantId: bill.tenantId._id,
            billingMonth,
            meteredUtilities,
            otherServices,
            dueDate: new Date(bill.dueDate).toISOString().slice(0, 10)
        });

        setShowEditForm(true);
    };

    const handleUpdateBill = async (e) => {
        e.preventDefault();

        try {
            setError('');
            setSuccess('');
            setIsLoading(true);

            // Prepare utilities data for backend
            const utilities = [];

            // Add metered utilities
            formData.meteredUtilities.forEach(utility => {
                const units = utility.currentReading - utility.previousReading;
                if (units > 0 || utility.currentReading > 0) {
                    utilities.push({
                        utilityType: utility.type,
                        previousReading: utility.previousReading,
                        currentReading: utility.currentReading,
                        consumption: units,
                        rate: utility.rate,
                        amount: units * utility.rate
                    });
                }
            });

            // Add other services
            formData.otherServices.forEach(service => {
                if (service.quantity > 0 && service.type) {
                    utilities.push({
                        utilityType: service.type,
                        previousReading: 0,
                        currentReading: service.quantity,
                        consumption: service.quantity,
                        rate: service.rate,
                        amount: service.quantity * service.rate
                    });
                }
            });

            const billData = {
                tenantId: formData.tenantId,
                billingPeriod: {
                    startDate: new Date(formData.billingMonth + '-01'),
                    endDate: new Date(formData.billingMonth + '-31')
                },
                utilities,
                subtotal: calculateGrandTotal(),
                totalAmount: calculateGrandTotal(),
                dueDate: formData.dueDate
            };

            const response = await api.updateUtilityBill(editingBill._id, billData);

            if (response.success) {
                setSuccess('Bill updated successfully!');
                await fetchData();
                resetForm();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            console.error('Error updating bill:', err);
            setError(err.response?.data?.message || 'Failed to update bill');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (billId, billNumber) => {
        if (window.confirm(`Are you sure you want to delete bill ${billNumber}? This action cannot be undone.`)) {
            try {
                setError('');
                const response = await api.deleteUtilityBill(billId);

                if (response.success) {
                    setSuccess('Bill deleted successfully!');
                    await fetchData();
                    setTimeout(() => setSuccess(''), 3000);
                }
            } catch (err) {
                console.error('Error deleting bill:', err);
                setError(err.response?.data?.message || 'Failed to delete bill');
            }
        }
    };

    const handleMarkAsPaid = (bill) => {
        setSelectedBillForPayment(bill);
        setShowPaymentModal(true);
    };

    const confirmMarkAsPaid = async () => {
        try {
            setError('');
            setSuccess('');

            const response = await api.markBillAsPaid(selectedBillForPayment._id, paymentData);

            if (response.success) {
                setSuccess(`Bill ${selectedBillForPayment.billNumber} marked as paid successfully!`);
                await fetchData();
                setShowPaymentModal(false);
                setSelectedBillForPayment(null);
                setPaymentData({ paymentMethod: 'cash', notes: '' });
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            console.error('Error marking bill as paid:', err);
            setError(err.response?.data?.message || 'Failed to mark bill as paid');
        }
    };

    const handleView = (bill) => {
        setViewingBill(bill);
        setShowViewModal(true);
    };

    const resetForm = () => {
        setFormData({
            tenantId: '',
            billingMonth: new Date().toISOString().slice(0, 7),
            meteredUtilities: [
                { type: 'electricity', previousReading: 0, currentReading: 0, rate: 15 },
                { type: 'floor_heating', previousReading: 0, currentReading: 0, rate: 20 },
                { type: 'car_charging', previousReading: 0, currentReading: 0, rate: 25 }
            ],
            otherServices: [
                { type: 'water_jar', quantity: 0, rate: 50 },
                { type: 'cleaning_service', quantity: 0, rate: 100 },
                { type: 'gas', quantity: 0, rate: 80 }
            ],
            dueDate: ''
        });
        setShowCreateForm(false);
        setShowEditForm(false);
        setEditingBill(null);
    };

    const formatCurrency = (amount) => `Rs. ${amount.toFixed(2)}`;
    const formatDate = (date) => new Date(date).toLocaleDateString();

    const getUtilityDisplayName = (type) => {
        const names = {
            electricity: 'Electricity',
            floor_heating: 'Floor Heating',
            car_charging: 'Car Charging',
            water_jar: 'Water Jar',
            cleaning_service: 'Cleaning Service',
            gas: 'Gas'
        };
        return names[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    if (isLoading && bills.length === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                        Utility Bills
                    </h1>
                    <p style={{ color: '#6b7280' }}>Create, edit, and manage utility bills</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#6b7280', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                        <FaSync /> Refresh
                    </button>
                    <button onClick={() => setShowCreateForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#3b82f6', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                        <FaPlus /> Create & Send Bill
                    </button>
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#dc2626', padding: '16px', marginBottom: '24px', borderRadius: '4px' }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #10b981', color: '#059669', padding: '16px', marginBottom: '24px', borderRadius: '4px' }}>
                    {success}
                </div>
            )}

            {/* Bills List - Same as before */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                        All Bills ({bills.length})
                    </h3>
                </div>

                <div style={{ padding: '20px' }}>
                    {bills.length > 0 ? (
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {bills.map(bill => (
                                <div key={bill._id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', backgroundColor: '#f8fafc' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                <FaFileInvoiceDollar style={{ color: '#3b82f6', marginRight: '8px' }} />
                                                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                                                    {bill.billNumber}
                                                </h4>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.875rem' }}>
                                                <div>
                                                    <span style={{ color: '#6b7280' }}>Tenant:</span>
                                                    <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                                        {bill.tenantId?.name} (Room {bill.tenantId?.tenantInfo?.roomNumber})
                                                    </p>
                                                </div>
                                                <div>
                                                    <span style={{ color: '#6b7280' }}>Month:</span>
                                                    <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                                        {new Date(bill.billingPeriod?.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span style={{ color: '#6b7280' }}>Amount:</span>
                                                    <p style={{ color: '#059669', fontWeight: '600', fontSize: '1rem' }}>
                                                        {formatCurrency(bill.totalAmount)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span style={{ color: '#6b7280' }}>Due Date:</span>
                                                    <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                                        {formatDate(bill.dueDate)}
                                                    </p>
                                                </div>
                                                {bill.paidAt && (
                                                    <div>
                                                        <span style={{ color: '#6b7280' }}>Paid On:</span>
                                                        <p style={{ color: '#059669', fontWeight: '500' }}>
                                                            {formatDate(bill.paidAt)}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '9999px',
                                                fontSize: '0.875rem',
                                                fontWeight: '500',
                                                backgroundColor: bill.status === 'paid' ? '#d1fae5' : '#dbeafe',
                                                color: bill.status === 'paid' ? '#065f46' : '#1e40af'
                                            }}>
                                                {bill.status === 'sent' ? 'Sent to Tenant' : bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                                            </span>

                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button
                                                    onClick={() => handleView(bill)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        padding: '6px 8px',
                                                        backgroundColor: '#6b7280',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.75rem'
                                                    }}
                                                >
                                                    <FaEye />
                                                    View
                                                </button>

                                                {bill.status !== 'paid' && (
                                                    <button
                                                        onClick={() => handleEdit(bill)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            padding: '6px 8px',
                                                            backgroundColor: '#f59e0b',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        <FaEdit />
                                                        Edit
                                                    </button>
                                                )}

                                                {bill.status === 'sent' && (
                                                    <button
                                                        onClick={() => handleMarkAsPaid(bill)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            padding: '6px 8px',
                                                            backgroundColor: '#059669',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        <FaMoneyBillWave />
                                                        Mark Paid
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleDelete(bill._id, bill.billNumber)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        padding: '6px 8px',
                                                        backgroundColor: '#ef4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.75rem'
                                                    }}
                                                >
                                                    <FaTrash />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '48px' }}>
                            <FaFileInvoiceDollar style={{ fontSize: '4rem', color: '#9ca3af', marginBottom: '16px' }} />
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                                No Bills Yet
                            </h3>
                            <p style={{ color: '#6b7280' }}>Create your first utility bill to get started.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Form Modal */}
            {showCreateForm && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                                    Create & Send Utility Bill
                                </h3>
                                <button onClick={resetForm} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#6b7280', cursor: 'pointer' }}>×</button>
                            </div>
                        </div>

                        <form onSubmit={handleCreateAndSend} style={{ padding: '24px' }}>
                            {/* Tenant Selection */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                    Select Tenant *
                                </label>
                                <select
                                    value={formData.tenantId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, tenantId: e.target.value }))}
                                    required
                                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem' }}
                                >
                                    <option value="">Choose a tenant</option>
                                    {tenants.map(tenant => (
                                        <option key={tenant._id} value={tenant._id}>
                                            {tenant.name} - Room {tenant.tenantInfo?.roomNumber}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Billing Month & Due Date */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                        Billing Month *
                                    </label>
                                    <input
                                        type="month"
                                        value={formData.billingMonth}
                                        onChange={(e) => setFormData(prev => ({ ...prev, billingMonth: e.target.value }))}
                                        required
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                        Due Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                        required
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem' }}
                                    />
                                </div>
                            </div>

                            {/* Metered Utilities Section */}
                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                                    📊 Metered Utilities
                                </h4>
                                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        {formData.meteredUtilities.map((utility, index) => (
                                            <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: '8px', alignItems: 'end' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>Utility Type</label>
                                                    <div style={{ padding: '6px 8px', backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '4px', fontWeight: '500' }}>
                                                        {getUtilityDisplayName(utility.type)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Previous Reading</label>
                                                    <input
                                                        type="number"
                                                        value={utility.previousReading}
                                                        onChange={(e) => updateMeteredUtility(index, 'previousReading', e.target.value)}
                                                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Current Reading</label>
                                                    <input
                                                        type="number"
                                                        value={utility.currentReading}
                                                        onChange={(e) => updateMeteredUtility(index, 'currentReading', e.target.value)}
                                                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Units</label>
                                                    <div style={{ padding: '6px 8px', backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '4px', fontWeight: '500', textAlign: 'center' }}>
                                                        {Math.max(0, utility.currentReading - utility.previousReading)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Rate (Rs.)</label>
                                                    <input
                                                        type="number"
                                                        value={utility.rate}
                                                        onChange={(e) => updateMeteredUtility(index, 'rate', e.target.value)}
                                                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total (Rs.)</label>
                                                    <div style={{ padding: '6px 8px', backgroundColor: '#f0fdf4', border: '1px solid #10b981', borderRadius: '4px', fontWeight: '600', color: '#059669', textAlign: 'center' }}>
                                                        {((utility.currentReading - utility.previousReading) * utility.rate).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '12px', textAlign: 'right', fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                                        Metered Utilities Total: Rs. {calculateMeteredTotal().toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            {/* Other Services Section */}
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', display: 'flex', alignItems: 'center' }}>
                                        🛠️ Other Services
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={addOtherService}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            padding: '4px 8px',
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        <FaPlus />
                                        Add Service
                                    </button>
                                </div>
                                <div style={{ backgroundColor: '#fffbeb', padding: '16px', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        {formData.otherServices.map((service, index) => (
                                            <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '8px', alignItems: 'end' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>Service Type</label>
                                                    {['water_jar', 'cleaning_service', 'gas'].includes(service.type) ? (
                                                        <div style={{ padding: '6px 8px', backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '4px', fontWeight: '500' }}>
                                                            {getUtilityDisplayName(service.type)}
                                                        </div>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={service.type}
                                                            onChange={(e) => updateOtherService(index, 'type', e.target.value)}
                                                            placeholder="Enter service name"
                                                            style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                                                        />
                                                    )}
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Quantity</label>
                                                    <input
                                                        type="number"
                                                        value={service.quantity}
                                                        onChange={(e) => updateOtherService(index, 'quantity', e.target.value)}
                                                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Rate (Rs.)</label>
                                                    <input
                                                        type="number"
                                                        value={service.rate}
                                                        onChange={(e) => updateOtherService(index, 'rate', e.target.value)}
                                                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total (Rs.)</label>
                                                    <div style={{ padding: '6px 8px', backgroundColor: '#f0fdf4', border: '1px solid #10b981', borderRadius: '4px', fontWeight: '600', color: '#059669', textAlign: 'center', minWidth: '80px' }}>
                                                        {(service.quantity * service.rate).toFixed(2)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeOtherService(index)}
                                                        style={{
                                                            padding: '6px',
                                                            backgroundColor: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <FaMinus />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '12px', textAlign: 'right', fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                                        Other Services Total: Rs. {calculateOtherServicesTotal().toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            {/* Grand Total */}
                            <div style={{ backgroundColor: '#f0f9ff', padding: '16px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', border: '2px solid #3b82f6' }}>
                                <h4 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af', margin: 0 }}>
                                    Grand Total: Rs. {calculateGrandTotal().toFixed(2)}
                                </h4>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    style={{ padding: '10px 20px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '10px 20px',
                                        backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        fontWeight: '500'
                                    }}
                                >
                                    <FaPaperPlane />
                                    {isLoading ? 'Creating & Sending...' : 'Create & Send Bill'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Form Modal - Similar structure but for editing */}
            {showEditForm && editingBill && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                                    Edit Bill - {editingBill.billNumber}
                                </h3>
                                <button onClick={resetForm} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#6b7280', cursor: 'pointer' }}>×</button>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateBill} style={{ padding: '24px' }}>
                            {/* Same form structure as create form but with update handler */}
                            {/* Tenant Selection */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                    Select Tenant *
                                </label>
                                <select
                                    value={formData.tenantId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, tenantId: e.target.value }))}
                                    required
                                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem' }}
                                >
                                    <option value="">Choose a tenant</option>
                                    {tenants.map(tenant => (
                                        <option key={tenant._id} value={tenant._id}>
                                            {tenant.name} - Room {tenant.tenantInfo?.roomNumber}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Billing Month & Due Date */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                        Billing Month *
                                    </label>
                                    <input
                                        type="month"
                                        value={formData.billingMonth}
                                        onChange={(e) => setFormData(prev => ({ ...prev, billingMonth: e.target.value }))}
                                        required
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                        Due Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                        required
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem' }}
                                    />
                                </div>
                            </div>

                            {/* Metered Utilities Section */}
                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                                    📊 Metered Utilities
                                </h4>
                                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        {formData.meteredUtilities.map((utility, index) => (
                                            <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: '8px', alignItems: 'end' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>Utility Type</label>
                                                    <div style={{ padding: '6px 8px', backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '4px', fontWeight: '500' }}>
                                                        {getUtilityDisplayName(utility.type)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Previous Reading</label>
                                                    <input
                                                        type="number"
                                                        value={utility.previousReading}
                                                        onChange={(e) => updateMeteredUtility(index, 'previousReading', e.target.value)}
                                                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Current Reading</label>
                                                    <input
                                                        type="number"
                                                        value={utility.currentReading}
                                                        onChange={(e) => updateMeteredUtility(index, 'currentReading', e.target.value)}
                                                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Units</label>
                                                    <div style={{ padding: '6px 8px', backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '4px', fontWeight: '500', textAlign: 'center' }}>
                                                        {Math.max(0, utility.currentReading - utility.previousReading)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Rate (Rs.)</label>
                                                    <input
                                                        type="number"
                                                        value={utility.rate}
                                                        onChange={(e) => updateMeteredUtility(index, 'rate', e.target.value)}
                                                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total (Rs.)</label>
                                                    <div style={{ padding: '6px 8px', backgroundColor: '#f0fdf4', border: '1px solid #10b981', borderRadius: '4px', fontWeight: '600', color: '#059669', textAlign: 'center' }}>
                                                        {((utility.currentReading - utility.previousReading) * utility.rate).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '12px', textAlign: 'right', fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                                        Metered Utilities Total: Rs. {calculateMeteredTotal().toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            {/* Other Services Section */}
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', display: 'flex', alignItems: 'center' }}>
                                        🛠️ Other Services
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={addOtherService}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            padding: '4px 8px',
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        <FaPlus />
                                        Add Service
                                    </button>
                                </div>
                                <div style={{ backgroundColor: '#fffbeb', padding: '16px', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        {formData.otherServices.map((service, index) => (
                                            <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '8px', alignItems: 'end' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>Service Type</label>
                                                    {['water_jar', 'cleaning_service', 'gas'].includes(service.type) ? (
                                                        <div style={{ padding: '6px 8px', backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '4px', fontWeight: '500' }}>
                                                            {getUtilityDisplayName(service.type)}
                                                        </div>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={service.type}
                                                            onChange={(e) => updateOtherService(index, 'type', e.target.value)}
                                                            placeholder="Enter service name"
                                                            style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                                                        />
                                                    )}
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Quantity</label>
                                                    <input
                                                        type="number"
                                                        value={service.quantity}
                                                        onChange={(e) => updateOtherService(index, 'quantity', e.target.value)}
                                                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Rate (Rs.)</label>
                                                    <input
                                                        type="number"
                                                        value={service.rate}
                                                        onChange={(e) => updateOtherService(index, 'rate', e.target.value)}
                                                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total (Rs.)</label>
                                                    <div style={{ padding: '6px 8px', backgroundColor: '#f0fdf4', border: '1px solid #10b981', borderRadius: '4px', fontWeight: '600', color: '#059669', textAlign: 'center', minWidth: '80px' }}>
                                                        {(service.quantity * service.rate).toFixed(2)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeOtherService(index)}
                                                        style={{
                                                            padding: '6px',
                                                            backgroundColor: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <FaMinus />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '12px', textAlign: 'right', fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                                        Other Services Total: Rs. {calculateOtherServicesTotal().toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            {/* Grand Total */}
                            <div style={{ backgroundColor: '#f0f9ff', padding: '16px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', border: '2px solid #3b82f6' }}>
                                <h4 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af', margin: 0 }}>
                                    Grand Total: Rs. {calculateGrandTotal().toFixed(2)}
                                </h4>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    style={{ padding: '10px 20px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '10px 20px',
                                        backgroundColor: isLoading ? '#9ca3af' : '#f59e0b',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        fontWeight: '500'
                                    }}
                                >
                                    <FaEdit />
                                    {isLoading ? 'Updating...' : 'Update Bill'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Payment Modal - Same as before */}
            {showPaymentModal && selectedBillForPayment && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)', maxWidth: '500px', width: '100%' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                                    Mark Bill as Paid
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        setSelectedBillForPayment(null);
                                        setPaymentData({ paymentMethod: 'cash', notes: '' });
                                    }}
                                    style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#6b7280', cursor: 'pointer' }}
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <p style={{ color: '#6b7280', marginBottom: '8px' }}>
                                    Bill Number: <strong>{selectedBillForPayment.billNumber}</strong>
                                </p>
                                <p style={{ color: '#6b7280', marginBottom: '8px' }}>
                                    Tenant: <strong>{selectedBillForPayment.tenantId?.name}</strong>
                                </p>
                                <p style={{ color: '#6b7280', marginBottom: '8px' }}>
                                    Amount: <strong style={{ color: '#059669' }}>Rs. {formatCurrency(selectedBillForPayment.totalAmount)}</strong>
                                </p>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                    Payment Method *
                                </label>
                                <select
                                    value={paymentData.paymentMethod}
                                    onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem' }}
                                >
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="online">Online Transfer</option>
                                    <option value="check">Check</option>
                                    <option value="account">Account Deduction</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                    Payment Notes
                                </label>
                                <textarea
                                    value={paymentData.notes}
                                    onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                                    rows="3"
                                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', resize: 'vertical' }}
                                    placeholder="Add any payment notes or reference number..."
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        setSelectedBillForPayment(null);
                                        setPaymentData({ paymentMethod: 'cash', notes: '' });
                                    }}
                                    style={{ padding: '10px 20px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmMarkAsPaid}
                                    style={{ padding: '10px 20px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500' }}
                                >
                                    Confirm Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Bill Modal */}
            {showViewModal && viewingBill && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                                    Bill Details - {viewingBill.billNumber}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowViewModal(false);
                                        setViewingBill(null);
                                    }}
                                    style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#6b7280', cursor: 'pointer' }}
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div style={{ padding: '24px' }}>
                            {/* Bill Information */}
                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                                    Bill Information
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.875rem' }}>
                                    <div>
                                        <span style={{ color: '#6b7280' }}>Tenant:</span>
                                        <p style={{ fontWeight: '500', color: '#1f2937' }}>
                                            {viewingBill.tenantId?.name} (Room {viewingBill.tenantId?.tenantInfo?.roomNumber})
                                        </p>
                                    </div>
                                    <div>
                                        <span style={{ color: '#6b7280' }}>Billing Period:</span>
                                        <p style={{ fontWeight: '500', color: '#1f2937' }}>
                                            {new Date(viewingBill.billingPeriod?.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div>
                                        <span style={{ color: '#6b7280' }}>Due Date:</span>
                                        <p style={{ fontWeight: '500', color: '#1f2937' }}>{formatDate(viewingBill.dueDate)}</p>
                                    </div>
                                    <div>
                                        <span style={{ color: '#6b7280' }}>Status:</span>
                                        <p style={{ fontWeight: '500', color: '#1f2937' }}>
                                            {viewingBill.status === 'sent' ? 'Sent to Tenant' : viewingBill.status.charAt(0).toUpperCase() + viewingBill.status.slice(1)}
                                        </p>
                                    </div>
                                    {viewingBill.paidAt && (
                                        <div>
                                            <span style={{ color: '#6b7280' }}>Paid On:</span>
                                            <p style={{ fontWeight: '500', color: '#059669' }}>{formatDate(viewingBill.paidAt)}</p>
                                        </div>
                                    )}
                                    {viewingBill.paymentMethod && (
                                        <div>
                                            <span style={{ color: '#6b7280' }}>Payment Method:</span>
                                            <p style={{ fontWeight: '500', color: '#1f2937' }}>{viewingBill.paymentMethod}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Metered Utilities */}
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                                    📊 Metered Utilities
                                </h4>
                                <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f8fafc' }}>
                                                <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.875rem' }}>Utility</th>
                                                <th style={{ padding: '8px', textAlign: 'center', fontSize: '0.875rem' }}>Previous</th>
                                                <th style={{ padding: '8px', textAlign: 'center', fontSize: '0.875rem' }}>Current</th>
                                                <th style={{ padding: '8px', textAlign: 'center', fontSize: '0.875rem' }}>Units</th>
                                                <th style={{ padding: '8px', textAlign: 'center', fontSize: '0.875rem' }}>Rate</th>
                                                <th style={{ padding: '8px', textAlign: 'right', fontSize: '0.875rem' }}>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {viewingBill.utilities?.filter(utility =>
                                                ['electricity', 'floor_heating', 'car_charging'].includes(utility.utilityType)
                                            ).map((utility, index) => (
                                                <tr key={index}>
                                                    <td style={{ padding: '8px', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                                                        {getUtilityDisplayName(utility.utilityType)}
                                                    </td>
                                                    <td style={{ padding: '8px', textAlign: 'center', fontSize: '0.875rem' }}>
                                                        {utility.previousReading || 0}
                                                    </td>
                                                    <td style={{ padding: '8px', textAlign: 'center', fontSize: '0.875rem' }}>
                                                        {utility.currentReading || 0}
                                                    </td>
                                                    <td style={{ padding: '8px', textAlign: 'center', fontSize: '0.875rem' }}>
                                                        {utility.consumption || 0}
                                                    </td>
                                                    <td style={{ padding: '8px', textAlign: 'center', fontSize: '0.875rem' }}>
                                                        Rs. {formatCurrency(utility.rate)}
                                                    </td>
                                                    <td style={{ padding: '8px', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#059669' }}>
                                                        Rs. {formatCurrency(utility.amount)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Other Services */}
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                                    🛠️ Other Services
                                </h4>
                                <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#fffbeb' }}>
                                                <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.875rem' }}>Service</th>
                                                <th style={{ padding: '8px', textAlign: 'center', fontSize: '0.875rem' }}>Quantity</th>
                                                <th style={{ padding: '8px', textAlign: 'center', fontSize: '0.875rem' }}>Rate</th>
                                                <th style={{ padding: '8px', textAlign: 'right', fontSize: '0.875rem' }}>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {viewingBill.utilities?.filter(utility =>
                                                !['electricity', 'floor_heating', 'car_charging'].includes(utility.utilityType)
                                            ).map((utility, index) => (
                                                <tr key={index}>
                                                    <td style={{ padding: '8px', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                                                        {getUtilityDisplayName(utility.utilityType)}
                                                    </td>
                                                    <td style={{ padding: '8px', textAlign: 'center', fontSize: '0.875rem' }}>
                                                        {utility.consumption || 0}
                                                    </td>
                                                    <td style={{ padding: '8px', textAlign: 'center', fontSize: '0.875rem' }}>
                                                        Rs. {formatCurrency(utility.rate)}
                                                    </td>
                                                    <td style={{ padding: '8px', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#059669' }}>
                                                        Rs. {formatCurrency(utility.amount)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Bill Summary */}
                            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #d1d5db' }}>
                                    <span style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>Total Amount:</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#059669' }}>
                                        Rs. {formatCurrency(viewingBill.totalAmount)}
                                    </span>
                                </div>
                            </div>

                            {/* Admin Notes */}
                            {viewingBill.adminNotes && (
                                <div style={{ marginTop: '16px', backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '8px' }}>
                                    <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0369a1', margin: '0 0 4px 0' }}>
                                        Admin Notes:
                                    </h5>
                                    <p style={{ fontSize: '0.875rem', color: '#0369a1', margin: 0 }}>
                                        {viewingBill.adminNotes}
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

export default UtilityBillManagement;