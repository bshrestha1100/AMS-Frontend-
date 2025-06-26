import React, { useState, useEffect } from 'react'
import { FaCalendarPlus, FaCalendarAlt, FaFileAlt, FaClock } from 'react-icons/fa'
import api from '../../services/api'

const LeaveRequestForm = () => {
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    totalDays: 0 // Add totalDays field
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const leaveTypes = [
    'Sick Leave',
    'Vacation',
    'Personal Leave',
    'Emergency Leave',
    'Maternity/Paternity Leave',
    'Other'
  ];

  // Calculate total days when start or end date changes
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate >= startDate) {
        // Calculate the difference in days
        const timeDiff = endDate.getTime() - startDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
        
        setFormData(prev => ({
          ...prev,
          totalDays: daysDiff
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          totalDays: 0
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        totalDays: 0
      }));
    }
  }, [formData.startDate, formData.endDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
      setError('Please fill in all required fields');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date cannot be earlier than start date');
      return;
    }

    if (formData.totalDays <= 0) {
      setError('Invalid date range');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      console.log('Submitting leave request:', formData); // Debug log
      
      const response = await api.submitLeaveRequest(formData);
      
      if (response.success) {
        setSuccess('Leave request submitted successfully!');
        setFormData({
          leaveType: '',
          startDate: '',
          endDate: '',
          reason: '',
          totalDays: 0
        });
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error submitting leave request:', err);
      setError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
          Request Leave
        </h1>
        <p style={{ color: '#6b7280' }}>Submit a new leave request for approval</p>
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

      {/* Form */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '32px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        maxWidth: '600px'
      }}>
        <form onSubmit={handleSubmit}>
          {/* Leave Type */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: '8px' 
            }}>
              <FaFileAlt style={{ marginRight: '8px', color: '#6b7280' }} />
              Leave Type *
            </label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              required
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: 'white'
              }}
            >
              <option value="">Select leave type</option>
              {leaveTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                <FaCalendarAlt style={{ marginRight: '8px', color: '#6b7280' }} />
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                min={today}
                required
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                <FaCalendarAlt style={{ marginRight: '8px', color: '#6b7280' }} />
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate || today}
                required
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          {/* Total Days Display */}
          {formData.totalDays > 0 && (
            <div style={{ 
              marginBottom: '24px',
              padding: '12px',
              backgroundColor: '#f0f9ff',
              border: '1px solid #0ea5e9',
              borderRadius: '8px'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: '#0369a1',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                <FaClock style={{ marginRight: '8px' }} />
                Total Leave Days: {formData.totalDays} day{formData.totalDays !== 1 ? 's' : ''}
              </div>
            </div>
          )}

          {/* Reason */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: '8px' 
            }}>
              <FaFileAlt style={{ marginRight: '8px', color: '#6b7280' }} />
              Reason *
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              rows="4"
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px',
                fontSize: '1rem',
                resize: 'vertical'
              }}
              placeholder="Please provide a reason for your leave request..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || formData.totalDays <= 0}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: (isSubmitting || formData.totalDays <= 0) ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: (isSubmitting || formData.totalDays <= 0) ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            <FaCalendarPlus />
            {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LeaveRequestForm;
