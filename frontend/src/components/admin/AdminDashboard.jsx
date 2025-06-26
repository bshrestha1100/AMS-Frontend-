import React, { useState, useEffect } from 'react'
import {
  FaUsers,
  FaBuilding,
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaWineBottle,
  FaSync,
  FaChartLine,
  FaHome,
  FaUserTie
} from 'react-icons/fa'
import api from '../../services/api'


const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalApartments: 0,
    occupiedApartments: 0,
    availableApartments: 0,
    amountToReceive: 0,
    amountReceived: 0,
    beverageConsumption: 0,
    totalBills: 0,
    paidBills: 0,
    pendingBills: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Fetch all required data from database
      const [
        usersRes,
        apartmentsRes,
        billsRes,
        beverageRes
      ] = await Promise.all([
        api.getAllUsers().catch(() => ({ success: false, data: [] })),
        api.getApartments().catch(() => ({ success: false, data: [] })),
        api.getAllUtilityBills().catch(() => ({ success: false, data: [] })),
        api.getBeverageConsumptionStats().catch(() => ({ success: false, data: { totalConsumption: 0 } }))
      ]);

      // Process users data
      const users = usersRes.success ? usersRes.data : [];
      const totalUsers = users.length;

      // Process apartments data
      const apartments = apartmentsRes.success ? apartmentsRes.data : [];
      const totalApartments = apartments.length;
      const occupiedApartments = apartments.filter(apt => apt.isOccupied).length;
      const availableApartments = totalApartments - occupiedApartments;

      // Process bills data
      const bills = billsRes.success ? billsRes.data : [];
      const totalBills = bills.length;
      const paidBills = bills.filter(bill => bill.status === 'paid').length;
      const pendingBills = bills.filter(bill => bill.status === 'sent').length;

      // Calculate amounts
      const amountToReceive = bills
        .filter(bill => bill.status === 'sent')
        .reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);

      const amountReceived = bills
        .filter(bill => bill.status === 'paid')
        .reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);

      // Process beverage consumption
      const beverageConsumption = beverageRes.success ? beverageRes.data.totalConsumption : 0;

      // Recent activities
      const activities = [
        ...bills.slice(0, 3).map(bill => ({
          type: 'bill',
          message: `Bill ${bill.billNumber} ${bill.status === 'paid' ? 'paid' : 'sent'} to ${bill.tenantId?.name}`,
          time: bill.updatedAt,
          status: bill.status
        })),
        ...users.slice(0, 2).map(user => ({
          type: 'user',
          message: `New ${user.role} ${user.name} added`,
          time: user.createdAt,
          status: 'created'
        }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

      setDashboardData({
        totalUsers,
        totalApartments,
        occupiedApartments,
        availableApartments,
        amountToReceive,
        amountReceived,
        beverageConsumption,
        totalBills,
        paidBills,
        pendingBills
      });

      setRecentActivities(activities);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data from database');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return 'Rs. 0.00'; // Handle undefined/null/NaN/invalid
    }
    return `Rs. ${amount.toFixed(2)}`;
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            Admin Dashboard
          </h1>
          <p style={{ color: '#6b7280' }}>Overview of apartment management system</p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#3b82f6',
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
          <div style={{ marginTop: '8px' }}>
            <button
              onClick={fetchDashboardData}
              style={{
                padding: '4px 8px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Section 1: Total Apartments & Users */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
          📊 System Overview
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {/* Total Users */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderLeft: '4px solid #3b82f6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Total Users
                </h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                  {dashboardData.totalUsers}
                </p>
              </div>
              <div style={{
                padding: '12px',
                backgroundColor: '#dbeafe',
                borderRadius: '50%'
              }}>
                <FaUsers style={{ color: '#3b82f6', fontSize: '1.5rem' }} />
              </div>
            </div>
          </div>

          {/* Total Apartments */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderLeft: '4px solid #10b981'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Total Apartments
                </h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                  {dashboardData.totalApartments}
                </p>
              </div>
              <div style={{
                padding: '12px',
                backgroundColor: '#d1fae5',
                borderRadius: '50%'
              }}>
                <FaBuilding style={{ color: '#10b981', fontSize: '1.5rem' }} />
              </div>
            </div>
          </div>

          {/* Occupied Apartments */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderLeft: '4px solid #f59e0b'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Occupied
                </h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                  {dashboardData.occupiedApartments}
                </p>
              </div>
              <div style={{
                padding: '12px',
                backgroundColor: '#fef3c7',
                borderRadius: '50%'
              }}>
                <FaHome style={{ color: '#f59e0b', fontSize: '1.5rem' }} />
              </div>
            </div>
          </div>

          {/* Available Apartments */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderLeft: '4px solid #8b5cf6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Available
                </h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                  {dashboardData.availableApartments}
                </p>
              </div>
              <div style={{
                padding: '12px',
                backgroundColor: '#ede9fe',
                borderRadius: '50%'
              }}>
                <FaBuilding style={{ color: '#8b5cf6', fontSize: '1.5rem' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Financial Overview */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
          💰 Financial Overview
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Amount to Receive */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderLeft: '4px solid #ef4444'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Amount to Receive
                </h3>
                <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#ef4444' }}>
                  {formatCurrency(dashboardData.amountToReceive)}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  From {dashboardData.pendingBills} pending bills
                </p>
              </div>
              <div style={{
                padding: '12px',
                backgroundColor: '#fee2e2',
                borderRadius: '50%'
              }}>
                <FaFileInvoiceDollar style={{ color: '#ef4444', fontSize: '1.5rem' }} />
              </div>
            </div>
          </div>

          {/* Amount Received */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderLeft: '4px solid #059669'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Amount Received
                </h3>
                <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#059669' }}>
                  {formatCurrency(dashboardData.amountReceived)}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  From {dashboardData.paidBills} paid bills
                </p>
              </div>
              <div style={{
                padding: '12px',
                backgroundColor: '#d1fae5',
                borderRadius: '50%'
              }}>
                <FaMoneyBillWave style={{ color: '#059669', fontSize: '1.5rem' }} />
              </div>
            </div>
          </div>

          {/* Beverage Consumption */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderLeft: '4px solid #7c3aed'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Beverage Consumption
                </h3>
                <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#7c3aed' }}>
                  {formatCurrency(dashboardData.beverageConsumption)}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Total rooftop consumption
                </p>
              </div>
              <div style={{
                padding: '12px',
                backgroundColor: '#ede9fe',
                borderRadius: '50%'
              }}>
                <FaWineBottle style={{ color: '#7c3aed', fontSize: '1.5rem' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Quick Stats */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
          📈 Quick Stats
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
              {dashboardData.totalBills}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Bills</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
              {dashboardData.paidBills}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Paid Bills</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {dashboardData.pendingBills}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pending Bills</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>
              {((dashboardData.occupiedApartments / dashboardData.totalApartments) * 100 || 0).toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Occupancy Rate</div>
          </div>
        </div>
      </div>

      {/* Section 4: Recent Activities */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
          🔔 Recent Activities
        </h2>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ padding: '20px' }}>
            {recentActivities.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentActivities.map((activity, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '6px',
                    borderLeft: `3px solid ${activity.type === 'bill' ? '#3b82f6' : '#10b981'}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {activity.type === 'bill' ? (
                        <FaFileInvoiceDollar style={{ color: '#3b82f6' }} />
                      ) : (
                        <FaUserTie style={{ color: '#10b981' }} />
                      )}
                      <span style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                        {activity.message}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {formatDate(activity.time)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                <FaChartLine style={{ fontSize: '2rem', marginBottom: '8px' }} />
                <p>No recent activities</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
