import React, { useState, useEffect } from 'react'
import { FaWineBottle, FaPlus, FaEdit, FaTrash, FaSync, FaFilter, FaSort } from 'react-icons/fa'
import api from '../../services/api'

const RooftopManagement = () => {
  const [beverages, setBeverages] = useState([]);
  const [filteredBeverages, setFilteredBeverages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBeverage, setEditingBeverage] = useState(null);

  // Filter and Sort States
  const [filters, setFilters] = useState({
    category: 'all',
    availability: 'all',
    priceRange: 'all',
    search: ''
  });

  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc'
  });

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Alcoholic',
    isAvailable: true
  });

  // Updated categories - only 2 options
  const categories = ['Alcoholic', 'Non-Alcoholic'];

  const priceRanges = [
    { label: 'All Prices', value: 'all' },
    { label: 'Under Rs.100', value: 'under100' },
    { label: 'Rs.100 - Rs.500', value: '100to500' },
    { label: 'Over Rs.500', value: 'over500' }
  ];

  useEffect(() => {
    fetchBeverages();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [beverages, filters, sortConfig]);

  const fetchBeverages = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await api.getAllBeverages();

      if (response.success) {
        setBeverages(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch beverages');
      }
    } catch (err) {
      console.error('Error fetching beverages:', err);
      setError('Failed to load beverages from database');
      setBeverages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...beverages];

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(beverage =>
        beverage.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        beverage.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(beverage => beverage.category === filters.category);
    }

    // Apply availability filter
    if (filters.availability !== 'all') {
      const isAvailable = filters.availability === 'available';
      filtered = filtered.filter(beverage => beverage.isAvailable === isAvailable);
    }

    // Apply price range filter
    if (filters.priceRange !== 'all') {
      filtered = filtered.filter(beverage => {
        const price = parseFloat(beverage.price);
        switch (filters.priceRange) {
          case 'under100':
            return price < 100;
          case '100to500':
            return price >= 100 && price <= 500;
          case 'over500':
            return price > 500;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'price') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else if (sortConfig.key === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredBeverages(filtered);
  };

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      availability: 'all',
      priceRange: 'all',
      search: ''
    });
    setSortConfig({
      key: 'name',
      direction: 'asc'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setSuccess('');

      let response;
      if (editingBeverage) {
        response = await api.updateBeverage(editingBeverage._id, formData);
      } else {
        response = await api.createBeverage(formData);
      }

      if (response.success) {
        setSuccess(editingBeverage ? 'Beverage updated successfully!' : 'Beverage created successfully!');
        await fetchBeverages();
        resetForm();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(response.message || 'Failed to save beverage');
      }
    } catch (err) {
      console.error('Error saving beverage:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save beverage');
    }
  };

  const handleEdit = (beverage) => {
    setEditingBeverage(beverage);
    setFormData({
      name: beverage.name,
      price: beverage.price,
      description: beverage.description,
      category: beverage.category,
      isAvailable: beverage.isAvailable
    });
    setShowForm(true);
  };

  const handleDelete = async (beverageId) => {
    if (window.confirm('Are you sure you want to delete this beverage?')) {
      try {
        setError('');
        const response = await api.deleteBeverage(beverageId);

        if (response.success) {
          setSuccess('Beverage deleted successfully!');
          await fetchBeverages();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          throw new Error(response.message || 'Failed to delete beverage');
        }
      } catch (err) {
        console.error('Error deleting beverage:', err);
        setError(err.response?.data?.message || err.message || 'Failed to delete beverage');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      category: 'Alcoholic',
      isAvailable: true
    });
    setEditingBeverage(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
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
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            Beverage Management
          </h1>
          <p style={{ color: '#6b7280' }}>
            Manage rooftop beverages and pricing ({filteredBeverages.length} of {beverages.length} shown)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={fetchBeverages}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#6b7280',
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
          <button
            onClick={() => setShowForm(true)}
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
            <FaPlus />
            Add Beverage
          </button>
        </div>
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

      {/* Show message if no data from database */}
      {!isLoading && beverages.length === 0 && !error && (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          marginBottom: '24px'
        }}>
          <FaWineBottle style={{ fontSize: '4rem', color: '#9ca3af', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
            No Beverages in Database
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            No beverages have been added to the database yet. Click "Add Beverage" to create your first beverage.
          </p>
          <button
            onClick={() => setShowForm(true)}
            style={{
              display: 'inline-flex',
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
            <FaPlus />
            Add First Beverage
          </button>
        </div>
      )}

      {/* Only show filters and list if we have data */}
      {beverages.length > 0 && (
        <>
          {/* Filters and Search */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FaFilter style={{ color: '#6b7280' }} />
              <span style={{ fontWeight: '500', color: '#374151' }}>Filters & Search:</span>
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
              {/* Search */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by name or description..."
                  style={{
                    width: '100%',
                    padding: '6px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              {/* Category Filter - Only 2 options */}
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

              {/* Availability Filter */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Availability
                </label>
                <select
                  value={filters.availability}
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="all">All Items</option>
                  <option value="available">Available Only</option>
                  <option value="unavailable">Unavailable Only</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Price Range
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}
                >
                  {priceRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div style={{
            backgroundColor: 'white',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <FaSort style={{ color: '#6b7280' }} />
              <span style={{ fontWeight: '500', color: '#374151' }}>Sort by:</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { key: 'name', label: 'Name' },
                { key: 'price', label: 'Price' },
                { key: 'category', label: 'Category' },
                { key: 'createdAt', label: 'Date Added' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleSort(key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    backgroundColor: sortConfig.key === key ? '#3b82f6' : '#f3f4f6',
                    color: sortConfig.key === key ? 'white' : '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  {label} <span>{getSortIcon(key)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Beverages List */}
          <div style={{ display: 'grid', gap: '16px' }}>
            {filteredBeverages.map(beverage => (
              <div key={beverage._id} style={{
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
                        {beverage.name}
                      </h3>
                      <span style={{
                        marginLeft: '12px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: beverage.isAvailable ? '#d1fae5' : '#fee2e2',
                        color: beverage.isAvailable ? '#065f46' : '#991b1b'
                      }}>
                        {beverage.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>

                    <p style={{ color: '#6b7280', marginBottom: '12px' }}>
                      {beverage.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.875rem' }}>
                      <span style={{ color: '#6b7280' }}>
                        Price: <strong style={{ color: '#059669' }}>Rs.{beverage.price}</strong>
                      </span>
                      <span style={{ color: '#6b7280' }}>
                        Category: <strong>{beverage.category}</strong>
                      </span>
                      {beverage.createdAt && (
                        <span style={{ color: '#6b7280' }}>
                          Added: <strong>{new Date(beverage.createdAt).toLocaleDateString()}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEdit(beverage)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      <FaEdit />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(beverage._id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      <FaTrash />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredBeverages.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '48px',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <FaFilter style={{ fontSize: '4rem', color: '#9ca3af', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                  No Matching Beverages
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                  No beverages match your current filters.
                </p>
                <button
                  onClick={clearFilters}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Form Modal */}
      {showForm && (
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
            maxWidth: '500px',
            width: '100%'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                  {editingBeverage ? 'Edit Beverage' : 'Add New Beverage'}
                </h3>
                <button
                  onClick={resetForm}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    color: '#6b7280',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  placeholder="Beverage name"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  placeholder="0.00"
                />
              </div>

              {/* Updated Category dropdown - only 2 options */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="Alcoholic">Alcoholic</option>
                  <option value="Non-Alcoholic">Non-Alcoholic</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                  placeholder="Beverage description..."
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleChange}
                    style={{ marginRight: '8px' }}
                  />
                  Available for order
                </label>
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
                  {editingBeverage ? 'Update Beverage' : 'Add Beverage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RooftopManagement;
