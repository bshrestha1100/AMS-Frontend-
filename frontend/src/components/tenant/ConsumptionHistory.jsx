import React, { useState, useEffect } from 'react'
import {
    FaWineBottle,
    FaChartBar,
    FaCalendarAlt,
    FaSync,
    FaUser,
    FaDollarSign,
    FaFileInvoiceDollar,
    FaInfoCircle
} from 'react-icons/fa'
import api from '../../services/api'

const ConsumptionHistory = () => {
    const [consumptions, setConsumptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        category: 'all',
        paymentStatus: 'all' // Add payment status filter
    });

    useEffect(() => {
        fetchConsumptions();
    }, [filters]);

    const fetchConsumptions = async () => {
        try {
            setIsLoading(true);
            setError('');

            // Try different API endpoints for beverage consumption
            let response;
            try {
                response = await api.getTenantBeverageConsumption();
            } catch (err) {
                try {
                    response = await api.getBeverageConsumptionHistory();
                } catch (err2) {
                    response = await api.getMyBeverageConsumption();
                }
            }

            console.log('API Response:', response);

            if (response && response.success && response.data) {
                console.log('Consumption data:', response.data);

                // Filter the data based on current filters
                let filteredData = response.data;

                // Apply date filters
                if (filters.startDate) {
                    filteredData = filteredData.filter(item =>
                        new Date(getConsumptionDate(item)) >= new Date(filters.startDate)
                    );
                }

                if (filters.endDate) {
                    filteredData = filteredData.filter(item =>
                        new Date(getConsumptionDate(item)) <= new Date(filters.endDate)
                    );
                }

                // Apply category filter
                if (filters.category !== 'all') {
                    filteredData = filteredData.filter(item =>
                        getBeverageCategory(item) === filters.category
                    );
                }

                // Apply payment status filter
                if (filters.paymentStatus !== 'all') {
                    filteredData = filteredData.filter(item =>
                        getPaymentStatus(item) === filters.paymentStatus
                    );
                }

                setConsumptions(filteredData);
            } else {
                setConsumptions([]);
            }
        } catch (err) {
            console.error('Error fetching consumption history:', err);
            setError('Failed to load consumption history from database');
            setConsumptions([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Enhanced function to get beverage name safely
    const getBeverageName = (consumption) => {
        // Check for populated beverageId (Mongoose populate)
        if (consumption.beverageId && typeof consumption.beverageId === 'object' && consumption.beverageId.name) {
            return consumption.beverageId.name;
        }

        // Check all possible beverage name locations
        if (consumption.beverage && consumption.beverage.name) {
            return consumption.beverage.name;
        }

        if (consumption.beverageName) {
            return consumption.beverageName;
        }

        if (consumption.name) {
            return consumption.name;
        }

        if (consumption.item) {
            return consumption.item;
        }

        if (consumption.beverage_name) {
            return consumption.beverage_name;
        }

        if (consumption.product) {
            return consumption.product;
        }

        return 'Unknown Beverage';
    };

    // Enhanced function to get beverage category safely
    const getBeverageCategory = (consumption) => {
        // Check for populated beverageId (Mongoose populate)
        if (consumption.beverageId && typeof consumption.beverageId === 'object' && consumption.beverageId.category) {
            return consumption.beverageId.category;
        }

        // Check all possible category locations
        if (consumption.beverage && consumption.beverage.category) {
            return consumption.beverage.category;
        }

        if (consumption.category) {
            return consumption.category;
        }

        if (consumption.type) {
            return consumption.type;
        }

        if (consumption.beverage_category) {
            return consumption.beverage_category;
        }

        if (consumption.beverage_type) {
            return consumption.beverage_type;
        }

        // Try to infer category from beverage name
        const beverageName = getBeverageName(consumption).toLowerCase();
        if (beverageName.includes('beer') || beverageName.includes('wine') || beverageName.includes('whiskey') || beverageName.includes('vodka')) {
            return 'Alcoholic';
        }

        return 'Non-Alcoholic'; // Default to Non-Alcoholic instead of Unknown
    };

    // Safe string handling functions
    const safeString = (str, fallback = 'Unknown') => {
        if (!str) return fallback;
        return typeof str === 'string' ? str : String(str);
    };

    const safeCapitalize = (str) => {
        const safeStr = safeString(str);
        if (!safeStr || safeStr === 'Unknown') return safeStr;

        try {
            return safeStr.charAt(0).toUpperCase() + safeStr.slice(1);
        } catch (error) {
            return safeStr;
        }
    };

    const formatCurrency = (amount) => {
        const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
        return `Rs. ${numAmount.toFixed(2)}`;
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleDateString();
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const getStatusColor = (status) => {
        const safeStatus = safeString(status, 'pending').toLowerCase();
        switch (safeStatus) {
            case 'paid': return { backgroundColor: '#d1fae5', color: '#065f46' };
            case 'pending': return { backgroundColor: '#fef3c7', color: '#92400e' };
            case 'cancelled': return { backgroundColor: '#fee2e2', color: '#991b1b' };
            default: return { backgroundColor: '#f3f4f6', color: '#374151' };
        }
    };

    // Get total amount with multiple fallbacks
    const getTotalAmount = (consumption) => {
        if (consumption.totalAmount) return consumption.totalAmount;
        if (consumption.total) return consumption.total;
        if (consumption.amount) return consumption.amount;

        // Calculate from quantity and price
        const quantity = consumption.quantity || 1;
        const unitPrice = consumption.unitPrice || consumption.price || 0;
        return quantity * unitPrice;
    };

    // Get unit price with multiple fallbacks
    const getUnitPrice = (consumption) => {
        if (consumption.unitPrice) return consumption.unitPrice;
        if (consumption.price) return consumption.price;
        if (consumption.rate) return consumption.rate;
        return 0;
    };

    // Get consumption date with multiple fallbacks
    const getConsumptionDate = (consumption) => {
        if (consumption.consumptionDate) return consumption.consumptionDate;
        if (consumption.orderDate) return consumption.orderDate;
        if (consumption.date) return consumption.date;
        if (consumption.createdAt) return consumption.createdAt;
        return null;
    };

    // Enhanced payment status function with utility bill integration
    const getPaymentStatus = (consumption) => {
        // If linked to a utility bill, check the bill status
        if (consumption.utilityBillId) {
            return consumption.paymentStatus || 'pending';
        }

        // Fallback to original status checking
        if (consumption.paymentStatus) return consumption.paymentStatus;
        if (consumption.status) return consumption.status;
        if (consumption.payment_status) return consumption.payment_status;
        return 'pending';
    };

    // Get utility bill information
    const getUtilityBillInfo = (consumption) => {
        if (consumption.utilityBillId) {
            return {
                billId: consumption.utilityBillId,
                billingPeriod: consumption.billingPeriod,
                includedInBill: consumption.includedInBill || false
            };
        }
        return null;
    };

    // Get payment status display with enhanced info
    const getPaymentStatusDisplay = (consumption) => {
        const status = getPaymentStatus(consumption);
        const billInfo = getUtilityBillInfo(consumption);

        if (billInfo && billInfo.includedInBill) {
            if (status === 'paid') {
                return {
                    text: 'Paid via Utility Bill',
                    color: getStatusColor('paid'),
                    icon: <FaFileInvoiceDollar />
                };
            } else {
                return {
                    text: 'Pending in Utility Bill',
                    color: getStatusColor('pending'),
                    icon: <FaFileInvoiceDollar />
                };
            }
        }

        return {
            text: safeCapitalize(status),
            color: getStatusColor(status),
            icon: <FaDollarSign />
        };
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            startDate: '',
            endDate: '',
            category: 'all',
            paymentStatus: 'all'
        });
    };

    // Calculate summary statistics
    const getSummaryStats = () => {
        const totalAmount = consumptions.reduce((sum, item) => sum + getTotalAmount(item), 0);
        const paidAmount = consumptions
            .filter(item => getPaymentStatus(item) === 'paid')
            .reduce((sum, item) => sum + getTotalAmount(item), 0);
        const pendingAmount = consumptions
            .filter(item => getPaymentStatus(item) === 'pending')
            .reduce((sum, item) => sum + getTotalAmount(item), 0);

        return {
            total: totalAmount,
            paid: paidAmount,
            pending: pendingAmount,
            count: consumptions.length
        };
    };

    const stats = getSummaryStats();

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
                        Beverage Consumption History
                    </h1>
                    <p style={{ color: '#6b7280' }}>Track your rooftop beverage orders and consumption</p>
                </div>
                <button
                    onClick={fetchConsumptions}
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

            {/* Summary Statistics */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center'
                }}>
                    <FaChartBar style={{ fontSize: '2rem', color: '#3b82f6', marginBottom: '8px' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                        {stats.count}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Orders</div>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center'
                }}>
                    <FaDollarSign style={{ fontSize: '2rem', color: '#059669', marginBottom: '8px' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                        {formatCurrency(stats.total)}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Amount</div>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center'
                }}>
                    <FaFileInvoiceDollar style={{ fontSize: '2rem', color: '#059669', marginBottom: '8px' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                        {formatCurrency(stats.paid)}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Paid Amount</div>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center'
                }}>
                    <FaInfoCircle style={{ fontSize: '2rem', color: '#f59e0b', marginBottom: '8px' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                        {formatCurrency(stats.pending)}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Pending Amount</div>
                </div>
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
                    <div style={{ marginTop: '8px' }}>
                        <button
                            onClick={fetchConsumptions}
                            style={{
                                padding: '4px 8px',
                                backgroundColor: '#dc2626',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                            }}
                        >
                            Retry
                        </button>
                    </div>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <FaCalendarAlt style={{ color: '#6b7280' }} />
                    <span style={{ fontWeight: '500', color: '#374151' }}>Filter Consumption History:</span>
                    <button
                        onClick={clearFilters}
                        style={{
                            marginLeft: 'auto',
                            padding: '4px 8px',
                            backgroundColor: '#f3f4f6',
                            color: '#6b7280',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                        }}
                    >
                        Clear All
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '6px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontSize: '0.875rem'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                            End Date
                        </label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '6px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontSize: '0.875rem'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                            Category
                        </label>
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '6px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontSize: '0.875rem'
                            }}
                        >
                            <option value="all">All Categories</option>
                            <option value="Alcoholic">Alcoholic</option>
                            <option value="Non-Alcoholic">Non-Alcoholic</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                            Payment Status
                        </label>
                        <select
                            value={filters.paymentStatus}
                            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '6px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontSize: '0.875rem'
                            }}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Consumption List */}
            <div style={{ display: 'grid', gap: '16px' }}>
                {consumptions.length > 0 ? (
                    consumptions.map((consumption, index) => {
                        const beverageName = getBeverageName(consumption);
                        const beverageCategory = getBeverageCategory(consumption);
                        const totalAmount = getTotalAmount(consumption);
                        const unitPrice = getUnitPrice(consumption);
                        const consumptionDate = getConsumptionDate(consumption);
                        const paymentStatusDisplay = getPaymentStatusDisplay(consumption);
                        const billInfo = getUtilityBillInfo(consumption);

                        return (
                            <div key={consumption._id || consumption.id || index} style={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                padding: '20px',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                            <FaWineBottle style={{ color: '#3b82f6', marginRight: '8px' }} />
                                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                                                {beverageName}
                                            </h3>
                                            <span style={{
                                                marginLeft: '12px',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: '500',
                                                backgroundColor: beverageCategory === 'Alcoholic' ? '#fef3c7' : '#e0e7ff',
                                                color: beverageCategory === 'Alcoholic' ? '#92400e' : '#3730a3'
                                            }}>
                                                {beverageCategory}
                                            </span>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', fontSize: '0.875rem' }}>
                                            <div>
                                                <span style={{ color: '#6b7280' }}>Quantity:</span>
                                                <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                                    {consumption.quantity || 1}
                                                </p>
                                            </div>
                                            <div>
                                                <span style={{ color: '#6b7280' }}>Unit Price:</span>
                                                <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                                    {formatCurrency(unitPrice)}
                                                </p>
                                            </div>
                                            <div>
                                                <span style={{ color: '#6b7280' }}>Total Amount:</span>
                                                <p style={{ color: '#059669', fontWeight: '600' }}>
                                                    {formatCurrency(totalAmount)}
                                                </p>
                                            </div>
                                            <div>
                                                <span style={{ color: '#6b7280' }}>Date:</span>
                                                <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                                    {formatDate(consumptionDate)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Utility Bill Information */}
                                        {billInfo && billInfo.includedInBill && (
                                            <div style={{
                                                marginTop: '12px',
                                                padding: '8px 12px',
                                                backgroundColor: '#f0f9ff',
                                                borderLeft: '3px solid #3b82f6',
                                                borderRadius: '4px',
                                                fontSize: '0.875rem'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e40af' }}>
                                                    <FaFileInvoiceDollar />
                                                    <span style={{ fontWeight: '500' }}>Included in Utility Bill</span>
                                                </div>
                                                {billInfo.billingPeriod && (
                                                    <div style={{ color: '#6b7280', marginTop: '4px' }}>
                                                        Billing Period: {formatDate(billInfo.billingPeriod.startDate)} - {formatDate(billInfo.billingPeriod.endDate)}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{
                                            ...paymentStatusDisplay.color,
                                            padding: '4px 12px',
                                            borderRadius: '9999px',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            {paymentStatusDisplay.icon}
                                            {paymentStatusDisplay.text}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '48px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                    }}>
                        <FaWineBottle style={{ fontSize: '4rem', color: '#9ca3af', marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                            No Consumption History
                        </h3>
                        <p style={{ color: '#6b7280' }}>
                            {error ? 'Unable to load consumption data from database.' : 'No beverage consumption records found in the database.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConsumptionHistory;
