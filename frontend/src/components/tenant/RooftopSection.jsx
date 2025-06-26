import React, { useState } from 'react'
import { FaUmbrellaBeach, FaGlassCheers, FaCalendarPlus, FaShoppingCart, FaHistory } from 'react-icons/fa'
import RooftopReservation from './RooftopReservation'
import BeverageMenu from './BeverageMenu'
import BeverageCart from './BeverageCart'
import ConsumptionHistory from './ConsumptionHistory'

const RooftopSection = () => {
    const [activeTab, setActiveTab] = useState('reservation');

    const tabs = [
        { id: 'reservation', label: 'Make Reservation', icon: <FaCalendarPlus /> },
        { id: 'beverages', label: 'Beverage Menu', icon: <FaGlassCheers /> },
        { id: 'cart', label: 'My Cart', icon: <FaShoppingCart /> },
        { id: 'history', label: 'Consumption History', icon: <FaHistory /> }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'reservation':
                return <RooftopReservation />;
            case 'beverages':
                return <BeverageMenu />;
            case 'cart':
                return <BeverageCart />;
            case 'history':
                return <ConsumptionHistory />;
            default:
                return <RooftopReservation />;
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '24px',
                borderRadius: '12px',
                marginBottom: '24px',
                textAlign: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <FaUmbrellaBeach style={{ fontSize: '2.5rem', marginRight: '16px' }} />
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                        Rooftop Services
                    </h1>
                </div>
                <p style={{ fontSize: '1.125rem', opacity: 0.9, margin: 0 }}>
                    Reserve the rooftop for your events and enjoy our beverage services
                </p>
            </div>

            {/* Navigation Tabs */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                marginBottom: '24px',
                overflow: 'hidden'
            }}>
                <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                padding: '16px 20px',
                                border: 'none',
                                backgroundColor: activeTab === tab.id ? '#3b82f6' : 'transparent',
                                color: activeTab === tab.id ? 'white' : '#6b7280',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontSize: '0.875rem',
                                fontWeight: '500'
                            }}
                            onMouseOver={(e) => {
                                if (activeTab !== tab.id) {
                                    e.target.style.backgroundColor = '#f3f4f6';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (activeTab !== tab.id) {
                                    e.target.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                minHeight: '500px'
            }}>
                {renderContent()}
            </div>
        </div>
    );
};

export default RooftopSection;
