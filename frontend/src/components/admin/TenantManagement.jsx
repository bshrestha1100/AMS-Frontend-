import React, { useState, useEffect } from 'react'
import { FaUser, FaEye, FaEdit, FaSearch, FaFilter, FaSync } from 'react-icons/fa'
import api from '../../services/api'

const TenantManagement = () => {
    const [tenants, setTenants] = useState([]);
    const [filteredTenants, setFilteredTenants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedTenant, setSelectedTenant] = useState(null);

    useEffect(() => {
        fetchTenants();
    }, []);

    useEffect(() => {
        filterTenants();
    }, [tenants, searchTerm, statusFilter]);

    const fetchTenants = async () => {
        try {
            setIsLoading(true);
            setError('');

            const response = await api.getAllTenants();

            if (response.success) {
                setTenants(response.data);
            } else {
                setError('Failed to load tenants');
            }
        } catch (err) {
            console.error('Error fetching tenants:', err);
            setError('Failed to load tenant data. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const filterTenants = () => {
        let filtered = [...tenants];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(tenant =>
                tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tenant.tenantInfo?.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tenant.tenantInfo?.apartmentId?.unitNumber?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(tenant => {
                if (statusFilter === 'active') return tenant.isActive;
                if (statusFilter === 'inactive') return !tenant.isActive;
                if (statusFilter === 'lease-active') {
                    return tenant.tenantInfo?.leaseStatus === 'active';
                }
                if (statusFilter === 'lease-expired') {
                    return tenant.tenantInfo?.leaseStatus === 'expired';
                }
                return true;
            });
        }

        setFilteredTenants(filtered);
    };

    const getLeaseStatus = (tenant) => {
        if (!tenant.tenantInfo?.leaseStartDate || !tenant.tenantInfo?.leaseEndDate) {
            return { status: 'Unknown', color: '#6b7280' };
        }

        const now = new Date();
        const startDate = new Date(tenant.tenantInfo.leaseStartDate);
        const endDate = new Date(tenant.tenantInfo.leaseEndDate);

        if (now < startDate) {
            return { status: 'Upcoming', color: '#f59e0b' };
        } else if (now > endDate) {
            return { status: 'Expired', color: '#ef4444' };
        } else {
            return { status: 'Active', color: '#10b981' };
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
                    borderTop: '4px solid #1e40af',
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
                        Tenant Management
                    </h1>
                    <p style={{ color: '#6b7280' }}>Manage tenant profiles and lease information</p>
                </div>
                <button
                    onClick={fetchTenants}
                    disabled={isLoading}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#1e40af',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.7 : 1
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

            {/* Search and Filter */}
            <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                marginBottom: '24px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '300px' }}>
                        <FaSearch style={{ color: '#6b7280' }} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or room number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontSize: '0.875rem'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaFilter style={{ color: '#6b7280' }} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                        >
                            <option value="all">All Tenants</option>
                            <option value="active">Active Users</option>
                            <option value="inactive">Inactive Users</option>
                            <option value="lease-active">Active Lease</option>
                            <option value="lease-expired">Expired Lease</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div style={{ marginBottom: '16px' }}>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    Showing {filteredTenants.length} of {tenants.length} tenants
                </span>
            </div>

            {/* Tenants Grid */}
            {filteredTenants.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
                    {filteredTenants.map(tenant => {
                        const leaseStatus = getLeaseStatus(tenant);
                        return (
                            <div key={tenant._id} style={{
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                padding: '20px',
                                border: '1px solid #e5e7eb'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        backgroundColor: '#1e40af',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '12px'
                                    }}>
                                        <FaUser style={{ color: 'white', fontSize: '1.2rem' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                                            {tenant.name}
                                        </h3>
                                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                            {tenant.tenantInfo?.apartmentId?.unitNumber || tenant.tenantInfo?.roomNumber || 'No room assigned'}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            backgroundColor: tenant.isActive ? '#dcfce7' : '#fee2e2',
                                            color: tenant.isActive ? '#166534' : '#991b1b'
                                        }}>
                                            {tenant.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            backgroundColor: leaseStatus.color + '20',
                                            color: leaseStatus.color
                                        }}>
                                            {leaseStatus.status}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.875rem' }}>
                                        <div>
                                            <span style={{ color: '#6b7280' }}>Email:</span>
                                            <p style={{ color: '#1f2937', fontWeight: '500', wordBreak: 'break-word' }}>{tenant.email}</p>
                                        </div>
                                        <div>
                                            <span style={{ color: '#6b7280' }}>Phone:</span>
                                            <p style={{ color: '#1f2937', fontWeight: '500' }}>{tenant.phone || 'Not provided'}</p>
                                        </div>
                                        <div>
                                            <span style={{ color: '#6b7280' }}>Rent:</span>
                                            <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                                ${tenant.tenantInfo?.monthlyRent || 'Not set'}
                                            </p>
                                        </div>
                                        <div>
                                            <span style={{ color: '#6b7280' }}>Lease End:</span>
                                            <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                                {tenant.tenantInfo?.leaseEndDate ?
                                                    new Date(tenant.tenantInfo.leaseEndDate).toLocaleDateString() :
                                                    'Not set'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => setSelectedTenant(tenant)}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '4px',
                                            backgroundColor: '#1e40af',
                                            color: 'white',
                                            padding: '8px 12px',
                                            borderRadius: '4px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        <FaEye />
                                        View Details
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    padding: '48px',
                    textAlign: 'center'
                }}>
                    <FaUser style={{ fontSize: '4rem', color: '#9ca3af', marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                        No Tenants Found
                    </h3>
                    <p style={{ color: '#6b7280' }}>
                        {tenants.length === 0 ? 'No tenants have been added yet.' : 'Try adjusting your search or filters.'}
                    </p>
                </div>
            )}

            {/* Tenant Details Modal */}
            {selectedTenant && (
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
                        borderRadius: '8px',
                        boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)',
                        maxWidth: '800px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>
                                    Tenant Details
                                </h3>
                                <button
                                    onClick={() => setSelectedTenant(null)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '1.5rem',
                                        color: '#6b7280',
                                        cursor: 'pointer'
                                    }}
                                >
                                    &times;
                                </button>
                            </div>
                        </div>

                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                                {/* Personal Information */}
                                <div>
                                    <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                                        Personal Information
                                    </h4>
                                    <div>
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Name</label>
                                            <p style={{ color: '#1f2937', fontWeight: '500' }}>{selectedTenant.name}</p>
                                        </div>
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Email</label>
                                            <p style={{ color: '#1f2937', fontWeight: '500' }}>{selectedTenant.email}</p>
                                        </div>
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Phone</label>
                                            <p style={{ color: '#1f2937', fontWeight: '500' }}>{selectedTenant.phone || 'Not provided'}</p>
                                        </div>
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Status</label>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: '500',
                                                backgroundColor: selectedTenant.isActive ? '#dcfce7' : '#fee2e2',
                                                color: selectedTenant.isActive ? '#166534' : '#991b1b'
                                            }}>
                                                {selectedTenant.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Lease Information */}
                                <div>
                                    <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                                        Lease Information
                                    </h4>
                                    <div>
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Room Number</label>
                                            <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                                {selectedTenant.tenantInfo?.apartmentId?.unitNumber || selectedTenant.tenantInfo?.roomNumber || 'Not assigned'}
                                            </p>
                                        </div>
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Building</label>
                                            <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                                {selectedTenant.tenantInfo?.apartmentId?.building || 'Not specified'}
                                            </p>
                                        </div>
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Monthly Rent</label>
                                            <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                                ${selectedTenant.tenantInfo?.monthlyRent || 'Not set'}
                                            </p>
                                        </div>
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Lease Period</label>
                                            <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                                {selectedTenant.tenantInfo?.leaseStartDate ?
                                                    new Date(selectedTenant.tenantInfo.leaseStartDate).toLocaleDateString() : 'Not set'} - {' '}
                                                {selectedTenant.tenantInfo?.leaseEndDate ?
                                                    new Date(selectedTenant.tenantInfo.leaseEndDate).toLocaleDateString() : 'Not set'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            {selectedTenant.tenantInfo?.emergencyContact && (
                                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                                    <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                                        Emergency Contact
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minWidth(200px, 1fr))', gap: '16px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Name</label>
                                            <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                                {selectedTenant.tenantInfo.emergencyContact.name || 'Not provided'}
                                            </p>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Phone</label>
                                            <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                                {selectedTenant.tenantInfo.emergencyContact.phone || 'Not provided'}
                                            </p>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Relationship</label>
                                            <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                                {selectedTenant.tenantInfo.emergencyContact.relationship || 'Not provided'}
                                            </p>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Email</label>
                                            <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                                {selectedTenant.tenantInfo.emergencyContact.email || 'Not provided'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Account Information */}
                            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                                    Account Information
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minWidth(200px, 1fr))', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Created</label>
                                        <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                            {new Date(selectedTenant.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Last Updated</label>
                                        <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                            {new Date(selectedTenant.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantManagement;
