import React, { useState, useEffect } from 'react'
import { FaBuilding, FaBed, FaBath, FaRuler, FaMapMarkerAlt, FaCalendarAlt, FaUser, FaWifi, FaSnowflake, FaTv, FaCar, FaCog } from 'react-icons/fa'
import api from '../../services/api'

const RoomDetails = () => {
    console.log("RoomDetails rendering");

    const [roomData, setRoomData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRoomDetails();
    }, []);

    const fetchRoomDetails = async () => {
        try {
            setIsLoading(true);
            setError('');

            const response = await api.getTenantRoom();

            if (response.success && response.data) {
                setRoomData(response.data);
            } else {
                setError('No room assigned to your account');
            }

        } catch (err) {
            console.error('Error fetching room details:', err);

            // Mock data for development
            const mockRoomData = {
                unitNumber: 'A101',
                floor: 2,
                type: '2BHK',
                area: 850,
                bedrooms: 2,
                bathrooms: 2,
                balcony: true,
                furnished: 'Semi-Furnished',
                assignedDate: '2024-01-15',
                description: 'Spacious 2BHK apartment with modern amenities and great city view.',
                features: [
                    'Air Conditioning',
                    'WiFi Ready',
                    'Modular Kitchen',
                    'Wardrobe',
                    'Geyser',
                    'Parking Space'
                ],
                building: {
                    name: 'Sunrise Apartments',
                    address: '123 Main Street, City Center',
                    totalFloors: 10
                }
            };

            setRoomData(mockRoomData);
            if (err.response?.status !== 404) {
                setError('Failed to load room details. Showing sample data.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getFeatureIcon = (feature) => {
        const lowerFeature = feature.toLowerCase();
        if (lowerFeature.includes('wifi')) return <FaWifi />;
        if (lowerFeature.includes('air') || lowerFeature.includes('ac')) return <FaSnowflake />;
        if (lowerFeature.includes('tv')) return <FaTv />;
        if (lowerFeature.includes('parking')) return <FaCar />;
        return <FaCog />;
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

    if (!roomData) {
        return (
            <div style={{ padding: '24px' }}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    padding: '48px',
                    textAlign: 'center'
                }}>
                    <FaBuilding style={{ fontSize: '4rem', color: '#9ca3af', marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                        No Room Assigned
                    </h3>
                    <p style={{ color: '#6b7280' }}>
                        You don't have a room assigned to your account yet. Please contact the administrator.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                    My Room Details
                </h1>
                <p style={{ color: '#6b7280' }}>Complete information about your assigned room</p>

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
                    </div>
                )}
            </div>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                marginBottom: '24px',
                overflow: 'hidden'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    padding: '24px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                        <FaBuilding style={{ fontSize: '2rem', marginRight: '16px' }} />
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '4px' }}>
                                Unit {roomData.unitNumber}
                            </h2>
                            <p style={{ opacity: 0.9 }}>
                                {roomData.building?.name || 'Apartment Building'}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{roomData.type}</div>
                            <div style={{ opacity: 0.9, fontSize: '0.875rem' }}>Room Type</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{roomData.area} sq ft</div>
                            <div style={{ opacity: 0.9, fontSize: '0.875rem' }}>Total Area</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Floor {roomData.floor}</div>
                            <div style={{ opacity: 0.9, fontSize: '0.875rem' }}>Location</div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    padding: '24px'
                }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                        Room Specifications
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                            <FaBed style={{ color: '#3b82f6', marginRight: '12px', fontSize: '1.2rem' }} />
                            <div>
                                <div style={{ fontWeight: '500', color: '#1f2937' }}>{roomData.bedrooms}</div>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Bedrooms</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                            <FaBath style={{ color: '#3b82f6', marginRight: '12px', fontSize: '1.2rem' }} />
                            <div>
                                <div style={{ fontWeight: '500', color: '#1f2937' }}>{roomData.bathrooms}</div>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Bathrooms</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                            <FaRuler style={{ color: '#3b82f6', marginRight: '12px', fontSize: '1.2rem' }} />
                            <div>
                                <div style={{ fontWeight: '500', color: '#1f2937' }}>{roomData.area} sq ft</div>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Area</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                            <FaBuilding style={{ color: '#3b82f6', marginRight: '12px', fontSize: '1.2rem' }} />
                            <div>
                                <div style={{ fontWeight: '500', color: '#1f2937' }}>{roomData.furnished}</div>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Furnishing</div>
                            </div>
                        </div>
                    </div>

                    {roomData.balcony && (
                        <div style={{
                            marginTop: '16px',
                            padding: '12px',
                            backgroundColor: '#f0fdf4',
                            borderRadius: '6px',
                            borderLeft: '4px solid #10b981'
                        }}>
                            <div style={{ fontWeight: '500', color: '#065f46' }}>✓ Balcony Available</div>
                        </div>
                    )}
                </div>

                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    padding: '24px'
                }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                        Features & Amenities
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                        {roomData.features?.map((feature, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px',
                                backgroundColor: '#eff6ff',
                                borderRadius: '6px',
                                border: '1px solid #dbeafe'
                            }}>
                                <div style={{ color: '#3b82f6', marginRight: '12px', fontSize: '1.1rem' }}>
                                    {getFeatureIcon(feature)}
                                </div>
                                <span style={{ fontWeight: '500', color: '#1f2937' }}>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    padding: '24px'
                }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                        Building Information
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                        <FaBuilding style={{ color: '#6b7280', marginRight: '12px' }} />
                        <div>
                            <div style={{ fontWeight: '500', color: '#1f2937' }}>{roomData.building?.name}</div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Building Name</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                        <FaMapMarkerAlt style={{ color: '#6b7280', marginRight: '12px' }} />
                        <div>
                            <div style={{ fontWeight: '500', color: '#1f2937' }}>{roomData.building?.address}</div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Address</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FaCalendarAlt style={{ color: '#6b7280', marginRight: '12px' }} />
                        <div>
                            <div style={{ fontWeight: '500', color: '#1f2937' }}>
                                {new Date(roomData.assignedDate).toLocaleDateString()}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Move-in Date</div>
                        </div>
                    </div>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    padding: '24px'
                }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                        Description
                    </h3>
                    <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                        {roomData.description || 'No description available for this room.'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RoomDetails;
