import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaHome,
  FaUser,
  FaTimes,
  FaBuilding,
  FaDollarSign,
  FaBed,
  FaBath
} from 'react-icons/fa';
import api from '../../services/api';

const ApartmentManagement = () => {
  const [apartments, setApartments] = useState([]);
  const [filteredApartments, setFilteredApartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');
  const [newAmenity, setNewAmenity] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    unitNumber: '',
    building: '',
    floor: '',
    type: '',
    bedrooms: '',
    bathrooms: '',
    rent: '',
    deposit: '',
    area: '',
    amenities: [],
    description: ''
  });

  useEffect(() => {
    fetchApartments();
  }, []);

  useEffect(() => {
    filterApartments();
  }, [apartments, searchTerm, statusFilter, typeFilter, floorFilter]);

  const fetchApartments = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/apartments');
      if (response.data.success) {
        setApartments(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch apartments');
      console.error('Error fetching apartments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterApartments = () => {
    let filtered = apartments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.unitNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.building?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => {
        if (statusFilter === 'available') return !apt.isOccupied;
        if (statusFilter === 'occupied') return apt.isOccupied;
        return true;
      });
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(apt => apt.type === typeFilter);
    }

    // Floor filter
    if (floorFilter !== 'all') {
      filtered = filtered.filter(apt => apt.floor?.toString() === floorFilter);
    }

    setFilteredApartments(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      if (isEditing) {
        const response = await api.put(`/apartments/${selectedApartment._id}`, formData);
        if (response.data.success) {
          setSuccessMessage('Apartment updated successfully!');
          fetchApartments();
        }
      } else {
        const response = await api.post('/apartments', formData);
        if (response.data.success) {
          setSuccessMessage('Apartment created successfully!');
          fetchApartments();
        }
      }
      
      resetForm();
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save apartment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (apartment) => {
    setSelectedApartment(apartment);
    setFormData({
      unitNumber: apartment.unitNumber || '',
      building: apartment.building || '',
      floor: apartment.floor || '',
      type: apartment.type || '',
      bedrooms: apartment.bedrooms || '',
      bathrooms: apartment.bathrooms || '',
      rent: apartment.rent || '',
      deposit: apartment.deposit || '',
      area: apartment.area || '',
      amenities: apartment.amenities || [],
      description: apartment.description || ''
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (apartmentId) => {
    if (window.confirm('Are you sure you want to delete this apartment?')) {
      try {
        setIsLoading(true);
        const response = await api.delete(`/apartments/${apartmentId}`);
        if (response.data.success) {
          setSuccessMessage('Apartment deleted successfully!');
          fetchApartments();
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete apartment');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      unitNumber: '',
      building: '',
      floor: '',
      type: '',
      bedrooms: '',
      bathrooms: '',
      rent: '',
      deposit: '',
      area: '',
      amenities: [],
      description: ''
    });
    setNewAmenity('');
    setSelectedApartment(null);
    setIsEditing(false);
  };

  // Add these functions after your existing handlers
const handleAddAmenity = () => {
  if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
    setFormData(prev => ({
      ...prev,
      amenities: [...prev.amenities, newAmenity.trim()]
    }));
    setNewAmenity('');
  }
};

const handleRemoveAmenity = (amenityToRemove) => {
  setFormData(prev => ({
    ...prev,
    amenities: prev.amenities.filter(amenity => amenity !== amenityToRemove)
  }));
};

const handleAmenityKeyPress = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleAddAmenity();
  }
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusBadge = (apartment) => {
    if (apartment.isOccupied) {
      return {
        text: 'Occupied',
        style: { backgroundColor: '#fee2e2', color: '#991b1b' }
      };
    } else {
      return {
        text: 'Available',
        style: { backgroundColor: '#d1fae5', color: '#065f46' }
      };
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  // Get unique values for filters
  const uniqueTypes = [...new Set(apartments.map(apt => apt.type).filter(Boolean))];
  const uniqueFloors = [...new Set(apartments.map(apt => apt.floor).filter(Boolean))].sort((a, b) => a - b);

  if (isLoading && apartments.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{
          width: '40px', height: '40px', border: '4px solid #f3f3f3',
          borderTop: '4px solid #3b82f6', borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>
          {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
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
            Apartment Management
          </h1>
          <p style={{ color: '#6b7280' }}>Create, update, and manage apartment listings</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: '#3b82f6', color: 'white', padding: '12px 20px',
            borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontSize: '1rem', fontWeight: '500'
          }}
        >
          <FaPlus /> Add Apartment
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444',
          color: '#dc2626', padding: '16px', marginBottom: '24px',
          borderRadius: '4px', display: 'flex', justifyContent: 'space-between'
        }}>
          <span>{error}</span>
          <button onClick={clearMessages} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
            <FaTimes />
          </button>
        </div>
      )}

      {successMessage && (
        <div style={{
          backgroundColor: '#f0fdf4', borderLeft: '4px solid #10b981',
          color: '#059669', padding: '16px', marginBottom: '24px',
          borderRadius: '4px', display: 'flex', justifyContent: 'space-between'
        }}>
          <span>{successMessage}</span>
          <button onClick={clearMessages} style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer' }}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div style={{
        backgroundColor: 'white', padding: '20px', borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', marginBottom: '24px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input
              type="text"
              placeholder="Search apartments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', paddingLeft: '40px', padding: '10px',
                border: '1px solid #d1d5db', borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px', border: '1px solid #d1d5db',
              borderRadius: '6px', fontSize: '1rem'
            }}
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: '10px', border: '1px solid #d1d5db',
              borderRadius: '6px', fontSize: '1rem'
            }}
          >
            <option value="all">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            style={{
              padding: '10px', border: '1px solid #d1d5db',
              borderRadius: '6px', fontSize: '1rem'
            }}
          >
            <option value="all">All Floors</option>
            {uniqueFloors.map(floor => (
              <option key={floor} value={floor}>Floor {floor}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Apartments Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px'
      }}>
        {filteredApartments.map(apartment => {
          const status = getStatusBadge(apartment);
          return (
            <div
              key={apartment._id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                    Unit {apartment.unitNumber}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '0.875rem' }}>
                    <FaBuilding />
                    <span>Building {apartment.building} • Floor {apartment.floor}</span>
                  </div>
                </div>
                <span style={{
                  ...status.style,
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  {status.text}
                </span>
              </div>

              {/* Details */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
                    <FaHome style={{ color: '#6b7280' }} />
                    <span style={{ fontSize: '0.875rem' }}>{apartment.type}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
                    <FaBed style={{ color: '#6b7280' }} />
                    <span style={{ fontSize: '0.875rem' }}>{apartment.bedrooms} Bed</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
                    <FaBath style={{ color: '#6b7280' }} />
                    <span style={{ fontSize: '0.875rem' }}>{apartment.bathrooms} Bath</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
                    <FaDollarSign style={{ color: '#6b7280' }} />
                    <span style={{ fontSize: '0.875rem' }}>Rs. {apartment.rent}/month</span>
                  </div>
                </div>

                {apartment.isOccupied && apartment.currentTenant && (
                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
                      <FaUser style={{ color: '#6b7280' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                        Current Tenant: {apartment.currentTenant.name}
                      </span>
                    </div>
                    {apartment.currentTenant.email && (
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px', marginLeft: '20px' }}>
                        {apartment.currentTenant.email}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleEdit(apartment)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    backgroundColor: '#f59e0b', color: 'white',
                    padding: '8px 12px', borderRadius: '6px',
                    border: 'none', cursor: 'pointer',
                    fontSize: '0.875rem', fontWeight: '500'
                  }}
                >
                  <FaEdit /> Edit
                </button>

                <button
                  onClick={() => handleDelete(apartment._id)}
                  disabled={apartment.isOccupied}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    backgroundColor: apartment.isOccupied ? '#9ca3af' : '#ef4444',
                    color: 'white', padding: '8px 12px', borderRadius: '6px',
                    border: 'none', cursor: apartment.isOccupied ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem', fontWeight: '500'
                  }}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredApartments.length === 0 && !isLoading && (
        <div style={{
          textAlign: 'center', padding: '48px',
          backgroundColor: 'white', borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <FaHome style={{ fontSize: '4rem', color: '#9ca3af', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
            No Apartments Found
          </h3>
          <p style={{ color: '#6b7280' }}>
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || floorFilter !== 'all'
              ? 'No apartments match your current filters.'
              : 'Get started by adding your first apartment.'}
          </p>
        </div>
      )}

      {/* Apartment Form Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '12px',
            padding: '24px', width: '90%', maxWidth: '600px',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>
                {isEditing ? 'Edit Apartment' : 'Add New Apartment'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none', border: 'none', fontSize: '1.5rem',
                  color: '#6b7280', cursor: 'pointer'
                }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Unit Number *
                  </label>
                  <input
                    type="text"
                    name="unitNumber"
                    value={formData.unitNumber}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%', padding: '8px 12px',
                      border: '1px solid #d1d5db', borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Building *
                  </label>
                  <input
                    type="text"
                    name="building"
                    value={formData.building}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%', padding: '8px 12px',
                      border: '1px solid #d1d5db', borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Floor *
                  </label>
                  <input
                    type="number"
                    name="floor"
                    value={formData.floor}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%', padding: '8px 12px',
                      border: '1px solid #d1d5db', borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%', padding: '8px 12px',
                      border: '1px solid #d1d5db', borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="">Select Type</option>
                    <option value="1BHK">1 BHK</option>
                    <option value="2BHK">2 BHK</option>
                    <option value="3BHK">3 BHK</option>
                    <option value="Penthouse">Penthouse</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    style={{
                      width: '100%', padding: '8px 12px',
                      border: '1px solid #d1d5db', borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    style={{
                      width: '100%', padding: '8px 12px',
                      border: '1px solid #d1d5db', borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Monthly Rent *
                  </label>
                  <input
                    type="number"
                    name="rent"
                    value={formData.rent}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%', padding: '8px 12px',
                      border: '1px solid #d1d5db', borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Security Deposit
                  </label>
                  <input
                    type="number"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleInputChange}
                    style={{
                      width: '100%', padding: '8px 12px',
                      border: '1px solid #d1d5db', borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              {/* Area and Amenities Section */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Area (sq ft) *
                </label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%', padding: '8px 12px',
                    border: '1px solid #d1d5db', borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              {/* Amenities Section */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Amenities
                </label>
                
                {/* Add Amenity Input */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input
                    type="text"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyPress={handleAmenityKeyPress}
                    placeholder="Enter amenity (e.g., Swimming Pool, Gym, Parking)"
                    style={{
                      flex: 1, padding: '8px 12px',
                      border: '1px solid #d1d5db', borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddAmenity}
                    style={{
                      padding: '8px 16px', backgroundColor: '#10b981', color: 'white',
                      border: 'none', borderRadius: '6px', cursor: 'pointer',
                      fontSize: '0.875rem', fontWeight: '500'
                    }}
                  >
                    Add
                  </button>
                </div>

                {/* Display Added Amenities */}
                {formData.amenities.length > 0 && (
                  <div style={{ 
                    border: '1px solid #e5e7eb', borderRadius: '6px', 
                    padding: '12px', backgroundColor: '#f8fafc' 
                  }}>
                    <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '8px', fontWeight: '500' }}>
                      Added Amenities:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {formData.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            backgroundColor: '#e0e7ff', color: '#3730a3',
                            padding: '4px 8px', borderRadius: '16px',
                            fontSize: '0.875rem', fontWeight: '500'
                          }}
                        >
                          {amenity}
                          <button
                            type="button"
                            onClick={() => handleRemoveAmenity(amenity)}
                            style={{
                              background: 'none', border: 'none', color: '#3730a3',
                              cursor: 'pointer', fontSize: '1rem', padding: '0',
                              display: 'flex', alignItems: 'center'
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  style={{
                    width: '100%', padding: '8px 12px',
                    border: '1px solid #d1d5db', borderRadius: '6px',
                    fontSize: '1rem', resize: 'vertical'
                  }}
                />
              </div>


              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 20px', border: '1px solid #d1d5db',
                    borderRadius: '6px', backgroundColor: 'white',
                    color: '#374151', cursor: 'pointer', fontSize: '1rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    padding: '10px 20px', border: 'none',
                    borderRadius: '6px', backgroundColor: '#3b82f6',
                    color: 'white', cursor: 'pointer', fontSize: '1rem',
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  {isLoading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApartmentManagement;
