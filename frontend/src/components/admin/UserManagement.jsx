import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaUser,
  FaUserPlus,
  FaUserMinus,
  FaTimes,
  FaCheck,
  FaBuilding,
  FaDollarSign,
  FaBed,
  FaBath
} from 'react-icons/fa';
import api from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [availableApartments, setAvailableApartments] = useState([]);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'tenant',
    phone: '',
    isActive: true,
    tenantInfo: {
      roomNumber: '',
      monthlyRent: '',
      apartmentId: '',
      leaseStartDate: '',
      leaseEndDate: '',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      }
    },
    workerInfo: {
      department: '',
      position: ''
    }
  });

  useEffect(() => {
    fetchUsers();
    fetchApartments();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  // In UserManagement.jsx - Update fetchUsers function
const fetchUsers = async () => {
    try {
        setIsLoading(true);
        // This will automatically exclude soft-deleted users
        const response = await api.get('/users');
        if (response.data.success) {
            setUsers(response.data.data);
        }
    } catch (err) {
        setError('Failed to fetch users');
        console.error('Error fetching users:', err);
    } finally {
        setIsLoading(false);
    }
};


  const fetchApartments = async () => {
    try {
      const response = await api.get('/apartments/available');
      if (response.data.success) {
        setApartments(response.data.data);
        setAvailableApartments(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching apartments:', err);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (statusFilter === 'active') return user.isActive;
        if (statusFilter === 'inactive') return !user.isActive;
        return true;
      });
    }

    setFilteredUsers(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      if (isEditing) {
        const response = await api.put(`/users/${selectedUser._id}`, formData);
        if (response.data.success) {
          setSuccessMessage('User updated successfully!');
          fetchUsers();
          fetchApartments(); // Refresh available apartments
        }
      } else {
        const response = await api.post('/users', formData);
        if (response.data.success) {
          setSuccessMessage('User created successfully!');
          fetchUsers();
          fetchApartments(); // Refresh available apartments
        }
      }
      
      resetForm();
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'tenant',
      phone: user.phone || '',
      isActive: user.isActive,
      tenantInfo: {
        roomNumber: user.tenantInfo?.roomNumber || '',
        monthlyRent: user.tenantInfo?.monthlyRent || '',
        apartmentId: user.tenantInfo?.apartmentId || '',
        leaseStartDate: user.tenantInfo?.leaseStartDate ? 
          new Date(user.tenantInfo.leaseStartDate).toISOString().split('T')[0] : '',
        leaseEndDate: user.tenantInfo?.leaseEndDate ? 
          new Date(user.tenantInfo.leaseEndDate).toISOString().split('T')[0] : '',
        emergencyContact: {
          name: user.tenantInfo?.emergencyContact?.name || '',
          phone: user.tenantInfo?.emergencyContact?.phone || '',
          relationship: user.tenantInfo?.emergencyContact?.relationship || ''
        }
      },
      workerInfo: user.workerInfo || {
        department: '',
        position: ''
      }
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setIsLoading(true);
        const response = await api.delete(`/users/${userId}`);
        if (response.data.success) {
          setSuccessMessage('User deleted successfully!');
          fetchUsers();
          fetchApartments(); // Refresh available apartments
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete user');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      setIsLoading(true);
      const response = await api.patch(`/users/${userId}/toggle-status`);
      if (response.data.success) {
        setSuccessMessage(`User ${response.data.data.isActive ? 'activated' : 'deactivated'} successfully!`);
        fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle user status');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'tenant',
      phone: '',
      isActive: true,
      tenantInfo: {
        roomNumber: '',
        monthlyRent: '',
        apartmentId: '',
        leaseStartDate: '',
        leaseEndDate: '',
        emergencyContact: {
          name: '',
          phone: '',
          relationship: ''
        }
      },
      workerInfo: {
        department: '',
        position: ''
      }
    });
    setSelectedUser(null);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTenantInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      tenantInfo: {
        ...prev.tenantInfo,
        [name]: value
      }
    }));
  };

  const handleEmergencyContactChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      tenantInfo: {
        ...prev.tenantInfo,
        emergencyContact: {
          ...prev.tenantInfo.emergencyContact,
          [name]: value
        }
      }
    }));
  };

  const handleWorkerInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      workerInfo: {
        ...prev.workerInfo,
        [name]: value
      }
    }));
  };

  const clearMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  const getStatusBadge = (user) => {
    if (user.isActive) {
      return {
        text: 'Active',
        style: { backgroundColor: '#d1fae5', color: '#065f46' }
      };
    } else {
      return {
        text: 'Inactive',
        style: { backgroundColor: '#fee2e2', color: '#991b1b' }
      };
    }
  };

  if (isLoading && users.length === 0) {
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
            User Management
          </h1>
          <p style={{ color: '#6b7280' }}>Create, update, and manage user accounts</p>
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
          <FaPlus /> Add User
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
              placeholder="Search users..."
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '10px', border: '1px solid #d1d5db',
              borderRadius: '6px', fontSize: '1rem'
            }}
          >
            <option value="all">All Roles</option>
            <option value="tenant">Tenant</option>
            <option value="worker">Worker</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px', border: '1px solid #d1d5db',
              borderRadius: '6px', fontSize: '1rem'
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Name</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Email</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Role</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Status</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Apartment</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => {
              const status = getStatusBadge(user);
              return (
                <tr key={user._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '16px', color: '#1f2937' }}>{user.name}</td>
                  <td style={{ padding: '16px', color: '#1f2937' }}>{user.email}</td>
                  <td style={{ padding: '16px', color: '#1f2937' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px',
                      backgroundColor: user.role === 'admin' ? '#e0e7ff' : 
                                      user.role === 'worker' ? '#fef3c7' : '#d1fae5',
                      color: user.role === 'admin' ? '#3730a3' : 
                             user.role === 'worker' ? '#92400e' : '#065f46',
                      fontSize: '0.875rem'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      ...status.style,
                      padding: '4px 12px', borderRadius: '20px',
                      fontSize: '0.875rem', fontWeight: '500'
                    }}>
                      {status.text}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#1f2937' }}>
                    {user.role === 'tenant' && user.tenantInfo?.apartmentId ? (
                      <span style={{ fontSize: '0.875rem', color: '#059669' }}>
                        Room {user.tenantInfo.roomNumber || 'N/A'}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '16px', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEdit(user)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        backgroundColor: '#f59e0b', color: 'white',
                        padding: '6px 10px', borderRadius: '4px',
                        border: 'none', cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user._id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        backgroundColor: user.isActive ? '#ef4444' : '#10b981',
                        color: 'white',
                        padding: '6px 10px', borderRadius: '4px',
                        border: 'none', cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      {user.isActive ? <FaUserMinus /> : <FaUserPlus />}
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        backgroundColor: '#ef4444', color: 'white',
                        padding: '6px 10px', borderRadius: '4px',
                        border: 'none', cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredUsers.length === 0 && !isLoading && (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <FaUser style={{ fontSize: '4rem', color: '#9ca3af', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
              No Users Found
            </h3>
            <p style={{ color: '#6b7280' }}>
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'No users match your current filters.'
                : 'Get started by adding your first user.'}
            </p>
          </div>
        )}
      </div>

      {/* User Form Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '12px',
            padding: '24px', width: '90%', maxWidth: '800px',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>
                {isEditing ? 'Edit User' : 'Add New User'}
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
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
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
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
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
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
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
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%', padding: '8px 12px',
                      border: '1px solid #d1d5db', borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="tenant">Tenant</option>
                    <option value="worker">Worker</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {!isEditing && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!isEditing}
                      style={{
                        width: '100%', padding: '8px 12px',
                        border: '1px solid #d1d5db', borderRadius: '6px',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Status
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="radio"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={() => setFormData(prev => ({ ...prev, isActive: true }))}
                      />
                      Active
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="radio"
                        name="isActive"
                        checked={!formData.isActive}
                        onChange={() => setFormData(prev => ({ ...prev, isActive: false }))}
                      />
                      Inactive
                    </label>
                  </div>
                </div>
              </div>

              {/* Tenant Information */}
              {formData.role === 'tenant' && (
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                    Tenant Information
                  </h3>
                  
                  {/* Basic Info */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                        Room Number *
                      </label>
                      <input
                        type="text"
                        name="roomNumber"
                        value={formData.tenantInfo.roomNumber}
                        onChange={handleTenantInfoChange}
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
                        Monthly Rent *
                      </label>
                      <input
                        type="number"
                        name="monthlyRent"
                        value={formData.tenantInfo.monthlyRent}
                        onChange={handleTenantInfoChange}
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
                        Lease Start Date *
                      </label>
                      <input
                        type="date"
                        name="leaseStartDate"
                        value={formData.tenantInfo.leaseStartDate}
                        onChange={handleTenantInfoChange}
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
                        Lease End Date *
                      </label>
                      <input
                        type="date"
                        name="leaseEndDate"
                        value={formData.tenantInfo.leaseEndDate}
                        onChange={handleTenantInfoChange}
                        required
                        style={{
                          width: '100%', padding: '8px 12px',
                          border: '1px solid #d1d5db', borderRadius: '6px',
                          fontSize: '1rem'
                        }}
                      />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                        Apartment
                      </label>
                      <select
                        name="apartmentId"
                        value={formData.tenantInfo.apartmentId}
                        onChange={handleTenantInfoChange}
                        style={{
                          width: '100%', padding: '8px 12px',
                          border: '1px solid #d1d5db', borderRadius: '6px',
                          fontSize: '1rem'
                        }}
                      >
                        <option value="">Select Apartment</option>
                        {availableApartments.map(apartment => (
                          <option key={apartment._id} value={apartment._id}>
                            Unit {apartment.unitNumber} (Building {apartment.building})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                      Emergency Contact *
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                          Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.tenantInfo.emergencyContact.name}
                          onChange={handleEmergencyContactChange}
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
                          Phone *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.tenantInfo.emergencyContact.phone}
                          onChange={handleEmergencyContactChange}
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
                          Relationship *
                        </label>
                        <select
                          name="relationship"
                          value={formData.tenantInfo.emergencyContact.relationship}
                          onChange={handleEmergencyContactChange}
                          required
                          style={{
                            width: '100%', padding: '8px 12px',
                            border: '1px solid #d1d5db', borderRadius: '6px',
                            fontSize: '1rem'
                          }}
                        >
                          <option value="">Select Relationship</option>
                          <option value="parent">Parent</option>
                          <option value="spouse">Spouse</option>
                          <option value="sibling">Sibling</option>
                          <option value="friend">Friend</option>
                          <option value="relative">Relative</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Worker Information */}
              {formData.role === 'worker' && (
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                    Worker Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                        Department
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={formData.workerInfo.department}
                        onChange={handleWorkerInfoChange}
                        style={{
                          width: '100%', padding: '8px 12px',
                          border: '1px solid #d1d5db', borderRadius: '6px',
                          fontSize: '1rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                        Position
                      </label>
                      <input
                        type="text"
                        name="position"
                        value={formData.workerInfo.position}
                        onChange={handleWorkerInfoChange}
                        style={{
                          width: '100%', padding: '8px 12px',
                          border: '1px solid #d1d5db', borderRadius: '6px',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

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

export default UserManagement;
