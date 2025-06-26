import React, { useState, useEffect } from 'react'
import { FaCalendarAlt, FaCheck, FaTimes, FaEye, FaFilter, FaSync, FaClock } from 'react-icons/fa'
import api from '../../services/api'

const LeaveManagement = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    status: 'all'
  });
  const [reviewData, setReviewData] = useState({
    status: '',
    reviewNotes: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await api.getAllLeaveRequests(filters);
      
      if (response.success) {
        setRequests(response.data);
      }
    } catch (err) {
      console.error('Error fetching leave requests:', err);
      setError('Failed to load leave requests');
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const reviewRequest = async () => {
    try {
      setError('');
      setSuccess('');
      
      const response = await api.reviewLeaveRequest(selectedRequest._id, reviewData);
      
      if (response.success) {
        setSuccess(`Leave request ${reviewData.status} successfully!`);
        await fetchRequests();
        setSelectedRequest(null);
        setReviewData({ status: '', reviewNotes: '' });
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error reviewing request:', err);
      setError(err.response?.data?.message || 'Failed to review request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return { backgroundColor: '#fef3c7', color: '#92400e' };
      case 'approved': return { backgroundColor: '#d1fae5', color: '#065f46' };
      case 'rejected': return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default: return { backgroundColor: '#f3f4f6', color: '#374151' };
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
            Leave Request Management
          </h1>
          <p style={{ color: '#6b7280' }}>Review and manage worker leave requests</p>
        </div>
        <button
          onClick={fetchRequests}
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

      {/* Filters */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaFilter style={{ color: '#6b7280' }} />
            <span style={{ fontWeight: '500', color: '#374151' }}>Filters:</span>
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '4px' }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {requests.map(request => (
          <div key={request._id} style={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0',
            borderRadius: '8px', 
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <FaCalendarAlt style={{ color: '#3b82f6', marginRight: '8px' }} />
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                    {request.leaveType}
                  </h3>
                </div>
                
                <p style={{ color: '#6b7280', marginBottom: '12px' }}>
                  {request.reason}
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.875rem' }}>
                  <div>
                    <span style={{ color: '#6b7280' }}>Worker:</span>
                    <p style={{ color: '#1f2937', fontWeight: '500' }}>
                      {request.workerId?.name}
                    </p>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280' }}>Duration:</span>
                    <p style={{ color: '#1f2937', fontWeight: '500' }}>
                      {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280' }}>Total Days:</span>
                    <p style={{ color: '#1f2937', fontWeight: '500' }}>
                      {request.totalDays} day{request.totalDays !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280' }}>Requested:</span>
                    <p style={{ color: '#1f2937', fontWeight: '500' }}>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {request.reviewedBy && (
                    <div>
                      <span style={{ color: '#6b7280' }}>Reviewed by:</span>
                      <p style={{ color: '#1f2937', fontWeight: '500' }}>
                        {request.reviewedBy.name}
                      </p>
                    </div>
                  )}
                </div>

                {request.reviewNotes && (
                  <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Review Notes:</span>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>
                      {request.reviewNotes}
                    </p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  ...getStatusColor(request.status),
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
                
                {request.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setReviewData({ status: 'approved', reviewNotes: '' });
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      <FaCheck />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setReviewData({ status: 'rejected', reviewNotes: '' });
                      }}
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
                      <FaTimes />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '48px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <FaCalendarAlt style={{ fontSize: '4rem', color: '#9ca3af', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
              No Leave Requests
            </h3>
            <p style={{ color: '#6b7280' }}>
              No leave requests match your current filters.
            </p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedRequest && (
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
                  {reviewData.status === 'approved' ? 'Approve' : 'Reject'} Leave Request
                </h3>
                <button
                  onClick={() => setSelectedRequest(null)}
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
            
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                  Request Details:
                </h4>
                <p><strong>Worker:</strong> {selectedRequest.workerId?.name}</p>
                <p><strong>Type:</strong> {selectedRequest.leaveType}</p>
                <p><strong>Duration:</strong> {new Date(selectedRequest.startDate).toLocaleDateString()} - {new Date(selectedRequest.endDate).toLocaleDateString()}</p>
                <p><strong>Total Days:</strong> {selectedRequest.totalDays}</p>
                <p><strong>Reason:</strong> {selectedRequest.reason}</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Review Notes (Optional)
                </label>
                <textarea
                  value={reviewData.reviewNotes}
                  onChange={(e) => setReviewData({...reviewData, reviewNotes: e.target.value})}
                  rows="3"
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '6px',
                    resize: 'vertical'
                  }}
                  placeholder="Add any notes about your decision..."
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setSelectedRequest(null)}
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
                  onClick={reviewRequest}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: reviewData.status === 'approved' ? '#10b981' : '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {reviewData.status === 'approved' ? 'Approve Request' : 'Reject Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
