import React, { useState, useEffect } from 'react'
import { FaShoppingCart, FaPlus, FaMinus, FaTrash, FaSync, FaCheck } from 'react-icons/fa'
import api from '../../services/api'

const BeverageCart = () => {
    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            setIsLoading(true);
            const response = await api.getBeverageCart();

            if (response.success) {
                setCart(response.data);
            }
        } catch (err) {
            console.error('Error fetching cart:', err);
            setError('Failed to load cart');

            // Mock data for development
            setCart({
                _id: '1',
                items: [
                    {
                        _id: 'item1',
                        beverageId: { _id: '1', name: 'Coffee', category: 'Non-Alcoholic' },
                        beverageName: 'Coffee',
                        quantity: 2,
                        unitPrice: 3.50,
                        totalPrice: 7.00
                    },
                    {
                        _id: 'item2',
                        beverageId: { _id: '2', name: 'Beer', category: 'Alcoholic' },
                        beverageName: 'Beer',
                        quantity: 1,
                        unitPrice: 5.00,
                        totalPrice: 5.00
                    }
                ],
                totalAmount: 12.00,
                status: 'active'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const updateQuantity = async (itemId, newQuantity) => {
        try {
            setIsUpdating(true);
            setError('');

            const response = await api.updateCartItem(itemId, newQuantity);

            if (response.success) {
                setCart(response.data);
                setSuccess('Cart updated successfully!');
                setTimeout(() => setSuccess(''), 2000);
            }
        } catch (err) {
            console.error('Error updating cart:', err);
            setError('Failed to update cart item');
        } finally {
            setIsUpdating(false);
        }
    };

    const removeItem = async (itemId) => {
        if (window.confirm('Are you sure you want to remove this item from cart?')) {
            try {
                setIsUpdating(true);
                setError('');

                const response = await api.removeFromCart(itemId);

                if (response.success) {
                    setCart(response.data);
                    setSuccess('Item removed from cart!');
                    setTimeout(() => setSuccess(''), 2000);
                }
            } catch (err) {
                console.error('Error removing item:', err);
                setError('Failed to remove item from cart');
            } finally {
                setIsUpdating(false);
            }
        }
    };

    const handleCheckout = async () => {
        if (window.confirm(`Confirm your order of ${cart.items.length} items for Rs. ${cart.totalAmount.toFixed(2)}? This will be added to your monthly bill.`)) {
            try {
                setIsCheckingOut(true);
                setError('');

                const response = await api.checkoutCart();

                if (response.success) {
                    setSuccess(`Order placed successfully! ${response.data.totalItems} items will be added to your monthly bill.`);

                    // Clear the cart by fetching fresh data
                    await fetchCart();

                    // Show success message for longer
                    setTimeout(() => setSuccess(''), 5000);
                }
            } catch (err) {
                console.error('Error during checkout:', err);
                setError(err.response?.data?.message || 'Failed to place order');
            } finally {
                setIsCheckingOut(false);
            }
        }
    };

    const getCategoryColor = (category) => {
        return category === 'Alcoholic'
            ? { backgroundColor: '#fee2e2', color: '#991b1b' }
            : { backgroundColor: '#dcfce7', color: '#166534' };
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
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                        My Beverage Cart
                    </h2>
                    <p style={{ color: '#6b7280' }}>
                        Add items and checkout to place your order
                    </p>
                </div>

                <button
                    onClick={fetchCart}
                    disabled={isUpdating || isCheckingOut}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: (isUpdating || isCheckingOut) ? 'not-allowed' : 'pointer',
                        opacity: (isUpdating || isCheckingOut) ? 0.7 : 1
                    }}
                >
                    <FaSync />
                    Refresh
                </button>
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

            {/* Cart Items */}
            {cart && cart.items && cart.items.length > 0 ? (
                <div>
                    {/* Cart Items List */}
                    <div style={{ marginBottom: '24px' }}>
                        {cart.items.map(item => (
                            <div key={item._id} style={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '20px',
                                marginBottom: '16px',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginRight: '12px' }}>
                                                {item.beverageName}
                                            </h3>
                                            <span style={{
                                                ...getCategoryColor(item.beverageId?.category || 'Non-Alcoholic'),
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: '500'
                                            }}>
                                                {item.beverageId?.category || 'Non-Alcoholic'}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                                Unit Price: Rs. {item.unitPrice.toFixed(2)}
                                            </span>
                                            <span style={{ color: '#1f2937', fontSize: '1rem', fontWeight: '600' }}>
                                                Total: Rs. {item.totalPrice.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {/* Quantity Controls */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <button
                                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                disabled={isUpdating || isCheckingOut || item.quantity <= 1}
                                                style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: (isUpdating || isCheckingOut || item.quantity <= 1) ? 'not-allowed' : 'pointer',
                                                    opacity: (isUpdating || isCheckingOut || item.quantity <= 1) ? 0.5 : 1
                                                }}
                                            >
                                                <FaMinus />
                                            </button>

                                            <span style={{
                                                padding: '8px 16px',
                                                backgroundColor: '#f3f4f6',
                                                borderRadius: '4px',
                                                fontWeight: '600',
                                                minWidth: '40px',
                                                textAlign: 'center'
                                            }}>
                                                {item.quantity}
                                            </span>

                                            <button
                                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                disabled={isUpdating || isCheckingOut}
                                                style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: '#10b981',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: (isUpdating || isCheckingOut) ? 'not-allowed' : 'pointer',
                                                    opacity: (isUpdating || isCheckingOut) ? 0.5 : 1
                                                }}
                                            >
                                                <FaPlus />
                                            </button>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => removeItem(item._id)}
                                            disabled={isUpdating || isCheckingOut}
                                            style={{
                                                padding: '8px 12px',
                                                backgroundColor: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: (isUpdating || isCheckingOut) ? 'not-allowed' : 'pointer',
                                                opacity: (isUpdating || isCheckingOut) ? 0.5 : 1
                                            }}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Cart Summary and Checkout */}
                    <div style={{
                        backgroundColor: '#f8fafc',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '24px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <span style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151' }}>
                                Total Items: {cart.items.length}
                            </span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                                Total: Rs. {cart.totalAmount.toFixed(2)}
                            </span>
                        </div>

                        {/* Checkout Button */}
                        <div style={{ marginBottom: '16px' }}>
                            <button
                                onClick={handleCheckout}
                                disabled={isCheckingOut || isUpdating || cart.items.length === 0}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '16px 24px',
                                    backgroundColor: isCheckingOut ? '#9ca3af' : '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: (isCheckingOut || isUpdating || cart.items.length === 0) ? 'not-allowed' : 'pointer',
                                    fontSize: '1.125rem',
                                    fontWeight: '600',
                                    transition: 'background-color 0.3s'
                                }}
                                onMouseOver={(e) => {
                                    if (!isCheckingOut && !isUpdating && cart.items.length > 0) {
                                        e.target.style.backgroundColor = '#059669';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!isCheckingOut && !isUpdating && cart.items.length > 0) {
                                        e.target.style.backgroundColor = '#10b981';
                                    }
                                }}
                            >
                                <FaCheck />
                                {isCheckingOut ? 'Processing Order...' : `Checkout - Rs. ${cart.totalAmount.toFixed(2)}`}
                            </button>
                        </div>

                        <div style={{
                            backgroundColor: '#eff6ff',
                            padding: '16px',
                            borderRadius: '6px',
                            border: '1px solid #dbeafe'
                        }}>
                            <p style={{ color: '#1e40af', fontSize: '0.875rem', margin: 0 }}>
                                <strong>Note:</strong> After checkout, these items will be added to your consumption history and included in your next monthly utility bill. Your cart will be cleared for new orders.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                /* Empty Cart */
                <div style={{
                    textAlign: 'center',
                    padding: '48px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                }}>
                    <FaShoppingCart style={{ fontSize: '4rem', color: '#9ca3af', marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                        Your Cart is Empty
                    </h3>
                    <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                        Add some beverages from the menu to get started!
                    </p>
                </div>
            )}
        </div>
    );
};

export default BeverageCart;
