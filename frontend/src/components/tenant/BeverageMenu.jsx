import React, { useState, useEffect } from 'react'
import { FaGlassCheers, FaPlus, FaWineBottle, FaCoffee, FaShoppingCart, FaCheck } from 'react-icons/fa'
import api from '../../services/api'

const BeverageMenu = () => {
    const [beverages, setBeverages] = useState([]);
    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchBeverages();
        fetchCart();
    }, []);

    const fetchBeverages = async () => {
        try {
            setIsLoading(true);
            const response = await api.getRooftopBeverages();

            if (response.success) {
                setBeverages(response.data);
            }
        } catch (err) {
            console.error('Error fetching beverages:', err);
            setError('Failed to load beverages');

            // Mock data for development
            setBeverages([
                {
                    _id: '1',
                    name: 'Coffee',
                    category: 'Non-Alcoholic',
                    price: 3.50,
                    description: 'Fresh brewed coffee',
                    isAvailable: true
                },
                {
                    _id: '2',
                    name: 'Beer',
                    category: 'Alcoholic',
                    price: 5.00,
                    description: 'Cold beer',
                    isAvailable: true
                },
                {
                    _id: '3',
                    name: 'Orange Juice',
                    category: 'Non-Alcoholic',
                    price: 2.50,
                    description: 'Fresh orange juice',
                    isAvailable: true
                },
                {
                    _id: '4',
                    name: 'Wine',
                    category: 'Alcoholic',
                    price: 8.00,
                    description: 'Red wine',
                    isAvailable: true
                },
                {
                    _id: '5',
                    name: 'Soda',
                    category: 'Non-Alcoholic',
                    price: 1.50,
                    description: 'Carbonated soft drink',
                    isAvailable: false
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCart = async () => {
        try {
            const response = await api.getBeverageCart();
            if (response.success) {
                setCart(response.data);
            }
        } catch (err) {
            console.error('Error fetching cart:', err);
        }
    };

    const addToCart = async (beverageId, quantity = 1) => {
        try {
            setIsProcessing(true);
            setError('');
            setSuccess('');

            const response = await api.addToCart(beverageId, quantity);

            if (response.success) {
                setCart(response.data);
                setSuccess('Item added to cart successfully!');
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            console.error('Error adding to cart:', err);
            setError(err.response?.data?.message || 'Failed to add item to cart');
        } finally {
            setIsProcessing(false);
        }
    };

    const quickOrder = async (beverageId, quantity = 1) => {
        try {
            setIsProcessing(true);
            setError('');
            setSuccess('');

            // Add to cart
            const addResponse = await api.addToCart(beverageId, quantity);

            if (addResponse.success) {
                // Immediately checkout
                const checkoutResponse = await api.checkoutCart();

                if (checkoutResponse.success) {
                    setSuccess('Order placed successfully! Item will be added to your monthly bill.');
                    await fetchCart(); // Refresh cart to show it's empty
                    setTimeout(() => setSuccess(''), 5000);
                }
            }
        } catch (err) {
            console.error('Error with quick order:', err);
            setError(err.response?.data?.message || 'Failed to place order');
        } finally {
            setIsProcessing(false);
        }
    };

    const getCategoryIcon = (category) => {
        return category === 'Alcoholic' ? <FaWineBottle /> : <FaCoffee />;
    };

    const filteredBeverages = filter === 'all'
        ? beverages
        : beverages.filter(b => b.category === filter);

    const getCartItemQuantity = (beverageId) => {
        if (!cart || !cart.items) return 0;
        const item = cart.items.find(item => item.beverageId._id === beverageId || item.beverageId === beverageId);
        return item ? item.quantity : 0;
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
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                        Beverage Menu
                    </h2>
                    <p style={{ color: '#6b7280' }}>Add beverages to your cart or order instantly</p>
                </div>

                {cart && cart.items.length > 0 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#eff6ff',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid #dbeafe'
                    }}>
                        <FaShoppingCart style={{ color: '#3b82f6', marginRight: '8px' }} />
                        <span style={{ color: '#1e40af', fontWeight: '500' }}>
                            {cart.items.length} items - Rs.{cart.totalAmount.toFixed(2)}
                        </span>
                    </div>
                )}
            </div>

            {/* Messages */}
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

            {/* Filter */}
            <div style={{
                backgroundColor: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Filter by category:</span>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    >
                        <option value="all">All Categories</option>
                        <option value="Alcoholic">Alcoholic</option>
                        <option value="Non-Alcoholic">Non-Alcoholic</option>
                    </select>
                </div>
            </div>

            {/* Beverages Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px'
            }}>
                {filteredBeverages.map(beverage => {
                    const cartQuantity = getCartItemQuantity(beverage._id);

                    return (
                        <div key={beverage._id} style={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            padding: '20px',
                            border: '1px solid #e5e7eb',
                            position: 'relative',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                        }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                            }}
                        >
                            {cartQuantity > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold'
                                }}>
                                    {cartQuantity}
                                </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{
                                    fontSize: '1.5rem',
                                    color: beverage.category === 'Alcoholic' ? '#dc2626' : '#059669',
                                    marginRight: '12px'
                                }}>
                                    {getCategoryIcon(beverage.category)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                                        {beverage.name}
                                    </h3>
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500',
                                        backgroundColor: beverage.category === 'Alcoholic' ? '#fee2e2' : '#dcfce7',
                                        color: beverage.category === 'Alcoholic' ? '#991b1b' : '#166534'
                                    }}>
                                        {beverage.category}
                                    </span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                                    Rs. {beverage.price.toFixed(2)}
                                </div>
                                {beverage.description && (
                                    <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: '1.4' }}>
                                        {beverage.description}
                                    </p>
                                )}
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    backgroundColor: beverage.isAvailable ? '#dcfce7' : '#fee2e2',
                                    color: beverage.isAvailable ? '#166534' : '#991b1b'
                                }}>
                                    {beverage.isAvailable ? 'Available' : 'Unavailable'}
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => addToCart(beverage._id)}
                                    disabled={!beverage.isAvailable || isProcessing}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '4px',
                                        padding: '10px 12px',
                                        backgroundColor: (!beverage.isAvailable || isProcessing) ? '#9ca3af' : '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: (!beverage.isAvailable || isProcessing) ? 'not-allowed' : 'pointer',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        transition: 'background-color 0.3s'
                                    }}
                                    onMouseOver={(e) => {
                                        if (beverage.isAvailable && !isProcessing) {
                                            e.target.style.backgroundColor = '#2563eb';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (beverage.isAvailable && !isProcessing) {
                                            e.target.style.backgroundColor = '#3b82f6';
                                        }
                                    }}
                                >
                                    <FaPlus />
                                    {isProcessing ? 'Adding...' : 'Add to Cart'}
                                </button>

                                <button
                                    onClick={() => quickOrder(beverage._id)}
                                    disabled={!beverage.isAvailable || isProcessing}
                                    title="Order instantly - will be added to your monthly bill"
                                    style={{
                                        padding: '10px 12px',
                                        backgroundColor: (!beverage.isAvailable || isProcessing) ? '#9ca3af' : '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: (!beverage.isAvailable || isProcessing) ? 'not-allowed' : 'pointer',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        transition: 'background-color 0.3s',
                                        minWidth: '44px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onMouseOver={(e) => {
                                        if (beverage.isAvailable && !isProcessing) {
                                            e.target.style.backgroundColor = '#059669';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (beverage.isAvailable && !isProcessing) {
                                            e.target.style.backgroundColor = '#10b981';
                                        }
                                    }}
                                >
                                    <FaCheck />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredBeverages.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '48px',
                    color: '#6b7280',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                }}>
                    <FaGlassCheers style={{ fontSize: '4rem', marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                        No Beverages Found
                    </h3>
                    <p style={{ color: '#6b7280' }}>
                        {beverages.length === 0 ? 'No beverages are available at the moment.' : `No ${filter.toLowerCase()} beverages found.`}
                    </p>
                </div>
            )}

            {/* Quick Order Info */}
            {beverages.length > 0 && (
                <div style={{
                    marginTop: '24px',
                    backgroundColor: '#fffbeb',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #fed7aa'
                }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                        <FaCheck style={{ color: '#d97706', marginTop: '2px' }} />
                        <div>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
                                Quick Order Feature
                            </h4>
                            <p style={{ fontSize: '0.75rem', color: '#b45309', margin: 0 }}>
                                Use the <FaCheck style={{ fontSize: '0.75rem' }} /> button to order instantly. Items will be immediately added to your consumption history and monthly bill, bypassing the cart.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BeverageMenu;
