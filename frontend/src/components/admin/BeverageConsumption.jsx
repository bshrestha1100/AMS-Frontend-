import React, { useState, useEffect } from 'react'
import {
  FaWineBottle,
  FaChartBar,
  FaSync,
  FaCalendarAlt,
  FaUser,
  FaDollarSign,
  FaShoppingCart,
  FaChartLine,
  FaChartPie
} from 'react-icons/fa'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'
import api from '../../services/api'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const BeverageConsumption = () => {
  const [consumptions, setConsumptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [tenantSummary, setTenantSummary] = useState([]);
  const [beverages, setBeverages] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('consumption');
  const [chartData, setChartData] = useState({});

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    tenantId: 'all',
    beverageId: 'all',
    paymentStatus: 'all',
    category: 'all'
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'consumption') {
      fetchConsumptions();
    } else if (activeTab === 'stats') {
      fetchStats();
    } else if (activeTab === 'tenants') {
      fetchTenantSummary();
    } else if (activeTab === 'charts') {
      fetchChartData();
    }
  }, [filters, activeTab, pagination.currentPage]);

  const fetchInitialData = async () => {
    try {
      const [beveragesRes, tenantsRes] = await Promise.all([
        api.getAllBeverages(),
        api.getAllTenants()
      ]);

      if (beveragesRes.success) setBeverages(beveragesRes.data || []);
      if (tenantsRes.success) setTenants(tenantsRes.data || []);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  const fetchConsumptions = async () => {
    try {
      setIsLoading(true);
      setError('');

      const queryParams = {
        page: pagination.currentPage,
        limit: 20
      };

      // Add filters only if they have valid values
      if (filters.startDate) queryParams.startDate = filters.startDate;
      if (filters.endDate) queryParams.endDate = filters.endDate;
      if (filters.tenantId && filters.tenantId !== 'all') queryParams.tenantId = filters.tenantId;
      if (filters.beverageId && filters.beverageId !== 'all') queryParams.beverageId = filters.beverageId;
      if (filters.paymentStatus && filters.paymentStatus !== 'all') queryParams.paymentStatus = filters.paymentStatus;
      if (filters.category && filters.category !== 'all') queryParams.category = filters.category;

      const response = await api.getBeverageConsumption(queryParams);

      if (response.success) {
        setConsumptions(response.data || []);
        setPagination({
          currentPage: response.currentPage || 1,
          totalPages: response.totalPages || 1,
          total: response.total || 0
        });
      }
    } catch (err) {
      console.error('Error fetching consumptions:', err);
      setError('Failed to load consumption data');
      setConsumptions([]);
    } finally {
      setIsLoading(false);
    }
  };


  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError('');

      const queryParams = {};
      if (filters.startDate) queryParams.startDate = filters.startDate;
      if (filters.endDate) queryParams.endDate = filters.endDate;

      const response = await api.getBeverageConsumptionStats(queryParams);

      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics');
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTenantSummary = async () => {
    try {
      setIsLoading(true);
      setError('');

      const queryParams = {};
      if (filters.startDate) queryParams.startDate = filters.startDate;
      if (filters.endDate) queryParams.endDate = filters.endDate;

      const response = await api.getTenantConsumptionSummary(queryParams);

      if (response.success) {
        setTenantSummary(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching tenant summary:', err);
      setError('Failed to load tenant summary');
      setTenantSummary([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const queryParams = {};
      if (filters.startDate) queryParams.startDate = filters.startDate;
      if (filters.endDate) queryParams.endDate = filters.endDate;

      // Get current month/year for daily consumption
      const currentDate = new Date();
      const monthParams = {
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear()
      };

      const [statsRes, tenantRes, dailyRes] = await Promise.all([
        api.getBeverageConsumptionStats(queryParams).catch(err => {
          console.log('Stats endpoint not available:', err.message);
          return { success: false };
        }),
        api.getTenantConsumptionSummary(queryParams).catch(err => {
          console.log('Tenant summary endpoint not available:', err.message);
          return { success: false };
        }),
        api.getDailyConsumption(monthParams).catch(err => {
          console.log('Daily consumption endpoint not available:', err.message);
          return { success: false };
        })
      ]);

      const chartDataObj = {};

      console.log('Stats Response:', statsRes);
      
      if (statsRes.success && statsRes.data?.categoryStats) {
        console.log('Category Stats:', statsRes.data.categoryStats);
        chartDataObj.categories = processCategoryData(statsRes.data.categoryStats);
      }

      if (tenantRes.success && tenantRes.data) {
        chartDataObj.tenants = processTenantData(tenantRes.data);
      }

      if (dailyRes.success && dailyRes.data) {
        chartDataObj.daily = processDailyData(dailyRes.data);
      }

      setChartData(chartDataObj);
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError('Some chart data may not be available');
      setChartData({});
    } finally {
      setIsLoading(false);
    }
  };

  const processCategoryData = (categoryStats) => {
    return {
      labels: categoryStats.map(cat => cat._id || 'Unknown'),
      datasets: [{
        data: categoryStats.map(cat => cat.totalRevenue || 0),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      }]
    };
  };

  const processTenantData = (tenantData) => {
    const topTenants = tenantData.slice(0, 8);
    return {
      labels: topTenants.map(tenant => tenant.tenantName || 'Unknown'),
      datasets: [{
        label: 'Total Consumption (Rs)',
        data: topTenants.map(tenant => tenant.totalAmount || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }]
    };
  };

  const processDailyData = (dailyData) => {
    const { dailyData: data, daysInMonth } = dailyData;
    
    return {
      labels: Array.from({ length: daysInMonth }, (_, i) => i + 1), // [1, 2, 3, ..., 30/31]
      datasets: [{
        label: 'Beverage Count',
        data: data.map(day => day.beverageCount),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1,
        fill: false,
      }]
    };
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      tenantId: 'all',
      beverageId: 'all',
      paymentStatus: 'all',
      category: 'all'
    });
  };

  const getPaymentStatusColor = (status) => {
    if (!status) return { backgroundColor: '#f3f4f6', color: '#374151' };
    switch (status.toLowerCase()) {
      case 'paid': return { backgroundColor: '#d1fae5', color: '#065f46' };
      case 'pending': return { backgroundColor: '#fef3c7', color: '#92400e' };
      case 'cancelled': return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default: return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const formatCurrency = (amount) => typeof amount === 'number' ? amount.toFixed(2) : '0.00';
  const formatDate = (date) => {
    if (!date) return 'Unknown Date';
    try { return new Date(date).toLocaleDateString(); } 
    catch { return 'Invalid Date'; }
  };
  const safeString = (str, fallback = 'Unknown') => str && typeof str === 'string' ? str : fallback;
  const safeNumber = (num, fallback = 0) => typeof num === 'number' && !isNaN(num) ? num : fallback;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          title: function(context) {
            return `Day ${context[0].label}`;
          },
          label: function(context) {
            return `Beverages consumed: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: { 
      y: { 
        beginAtZero: true,
        title: {
          display: true,
          text: 'Beverage Count'
        },
        ticks: {
          stepSize: 1
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date (1-30)'
        }
      }
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } },
  };

  if (isLoading && activeTab === 'consumption' && consumptions.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{
          width: '40px', height: '40px', border: '4px solid #f3f3f3',
          borderTop: '4px solid #3b82f6', borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            Beverage Consumption Analytics
          </h1>
          <p style={{ color: '#6b7280' }}>Track and analyze rooftop beverage consumption with interactive charts</p>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'consumption') fetchConsumptions();
            else if (activeTab === 'stats') fetchStats();
            else if (activeTab === 'tenants') fetchTenantSummary();
            else if (activeTab === 'charts') fetchChartData();
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: '#3b82f6', color: 'white', padding: '8px 16px',
            borderRadius: '6px', border: 'none', cursor: 'pointer'
          }}
        >
          <FaSync /> Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444',
          color: '#dc2626', padding: '16px', marginBottom: '24px', borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          {[
            { key: 'consumption', label: 'Consumption Records', icon: FaWineBottle },
            { key: 'stats', label: 'Statistics', icon: FaChartBar },
            { key: 'tenants', label: 'Tenant Summary', icon: FaUser },
            { key: 'charts', label: 'Analytics Charts', icon: FaChartLine }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 24px',
                backgroundColor: activeTab === key ? '#f8fafc' : 'transparent',
                borderBottom: activeTab === key ? '2px solid #3b82f6' : '2px solid transparent',
                border: 'none', cursor: 'pointer', fontSize: '1rem',
                fontWeight: activeTab === key ? '600' : '400',
                color: activeTab === key ? '#3b82f6' : '#6b7280'
              }}
            >
              <Icon /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Date Range Filter */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <FaCalendarAlt style={{ color: '#6b7280' }} />
          <span style={{ fontWeight: '500', color: '#374151' }}>Date Range Filter:</span>
          <button onClick={clearFilters} style={{
            marginLeft: 'auto', padding: '4px 8px', backgroundColor: '#f3f4f6',
            color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '4px',
            cursor: 'pointer', fontSize: '0.875rem'
          }}>
            Clear All
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              style={{ width: '100%', padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              style={{ width: '100%', padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem' }}
            />
          </div>
          {activeTab === 'consumption' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Tenant
                </label>
                <select
                  value={filters.tenantId}
                  onChange={(e) => handleFilterChange('tenantId', e.target.value)}
                  style={{ width: '100%', padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem' }}
                >
                  <option value="all">All Tenants</option>
                  {tenants.map(tenant => (
                    <option key={tenant._id} value={tenant._id}>
                      {safeString(tenant.name)} (Room {safeString(tenant.tenantInfo?.roomNumber, 'N/A')})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Payment Status
                </label>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                  style={{ width: '100%', padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem' }}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Charts Tab Content */}
      {activeTab === 'charts' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Category Distribution and Tenant Consumption */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <FaChartPie style={{ color: '#10b981', fontSize: '1.25rem', marginRight: '8px' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>Category Distribution</h3>
              </div>
              <div style={{ height: '300px' }}>
                {chartData.categories ? (
                  <Pie data={chartData.categories} options={pieChartOptions} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280' }}>
                    No data available for category distribution
                  </div>
                )}
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <FaChartBar style={{ color: '#f59e0b', fontSize: '1.25rem', marginRight: '8px' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>Top Tenants by Consumption</h3>
              </div>
              <div style={{ height: '300px' }}>
                {chartData.tenants ? (
                  <Bar data={chartData.tenants} options={barChartOptions} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280' }}>
                    No data available for tenant consumption
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Daily Beverage Consumption */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <FaChartLine style={{ color: '#8b5cf6', fontSize: '1.25rem', marginRight: '8px' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                Daily Beverage Consumption (Current Month)
              </h3>
            </div>
            <div style={{ height: '400px' }}>
              {chartData.daily ? (
                <Line data={chartData.daily} options={chartOptions} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280' }}>
                  No data available for daily consumption
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Consumption Records Tab */}
      {activeTab === 'consumption' && (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
              Consumption Records ({pagination.total} total)
            </h3>
          </div>
          <div style={{ padding: '20px' }}>
            {consumptions.length > 0 ? (
              <>
                <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                  {consumptions.map(consumption => (
                    <div key={consumption._id || Math.random()} style={{
                      border: '1px solid #e5e7eb', borderRadius: '8px',
                      padding: '16px', backgroundColor: '#f8fafc'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <FaWineBottle style={{ color: '#3b82f6', marginRight: '8px' }} />
                            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                              {safeString(consumption.beverage?.name, 'Unknown Beverage')}
                            </h4>
                            <span style={{
                              marginLeft: '12px', padding: '2px 8px', borderRadius: '12px',
                              fontSize: '0.75rem', fontWeight: '500',
                              backgroundColor: consumption.beverage?.category === 'Alcoholic' ? '#fef3c7' : '#e0e7ff',
                              color: consumption.beverage?.category === 'Alcoholic' ? '#92400e' : '#3730a3'
                            }}>
                              {safeString(consumption.beverage?.category, 'Unknown')}
                            </span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', fontSize: '0.875rem' }}>
                            <div>
                              <span style={{ color: '#6b7280' }}>Tenant:</span>
                              <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                {safeString(consumption.tenant?.name, 'Unknown Tenant')}
                              </p>
                            </div>
                            <div>
                              <span style={{ color: '#6b7280' }}>Quantity:</span>
                              <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                {safeNumber(consumption.quantity)}
                              </p>
                            </div>
                            <div>
                              <span style={{ color: '#6b7280' }}>Unit Price:</span>
                              <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                Rs. {formatCurrency(consumption.unitPrice)}
                              </p>
                            </div>
                            <div>
                              <span style={{ color: '#6b7280' }}>Total:</span>
                              <p style={{ color: '#059669', fontWeight: '600' }}>
                                Rs. {formatCurrency(consumption.totalAmount)}
                              </p>
                            </div>
                            <div>
                              <span style={{ color: '#6b7280' }}>Date:</span>
                              <p style={{ color: '#1f2937', fontWeight: '500' }}>
                                {formatDate(consumption.consumptionDate)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <span style={{
                          ...getPaymentStatusColor(consumption.paymentStatus),
                          padding: '4px 12px', borderRadius: '9999px',
                          fontSize: '0.875rem', fontWeight: '500'
                        }}>
                          {consumption.paymentStatus ?
                            consumption.paymentStatus.charAt(0).toUpperCase() + consumption.paymentStatus.slice(1) :
                            'Unknown'
                          }
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                      disabled={pagination.currentPage === 1}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: pagination.currentPage === 1 ? '#f3f4f6' : '#3b82f6',
                        color: pagination.currentPage === 1 ? '#9ca3af' : 'white',
                        border: 'none', borderRadius: '4px',
                        cursor: pagination.currentPage === 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Previous
                    </button>
                    <span style={{
                      padding: '8px 12px', backgroundColor: '#f8fafc',
                      borderRadius: '4px', fontSize: '0.875rem'
                    }}>
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                      disabled={pagination.currentPage === pagination.totalPages}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: pagination.currentPage === pagination.totalPages ? '#f3f4f6' : '#3b82f6',
                        color: pagination.currentPage === pagination.totalPages ? '#9ca3af' : 'white',
                        border: 'none', borderRadius: '4px',
                        cursor: pagination.currentPage === pagination.totalPages ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <FaWineBottle style={{ fontSize: '4rem', color: '#9ca3af', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                  No Consumption Records
                </h3>
                <p style={{ color: '#6b7280' }}>
                  No beverage consumption records found for the selected criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          {stats ? (
            <>
              {/* Overall Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <FaShoppingCart style={{ color: '#3b82f6', fontSize: '1.5rem', marginRight: '12px' }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>Total Orders</h3>
                  </div>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                    {safeNumber(stats.overall?.totalConsumptions)}
                  </p>
                </div>

                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <FaWineBottle style={{ color: '#10b981', fontSize: '1.5rem', marginRight: '12px' }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>Total Quantity</h3>
                  </div>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                    {safeNumber(stats.overall?.totalQuantity)}
                  </p>
                </div>

                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <FaDollarSign style={{ color: '#f59e0b', fontSize: '1.5rem', marginRight: '12px' }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>Total Revenue</h3>
                  </div>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>
                    Rs. {formatCurrency(stats.overall?.totalRevenue)}
                  </p>
                </div>

                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <FaChartBar style={{ color: '#8b5cf6', fontSize: '1.5rem', marginRight: '12px' }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>Avg Order Value</h3>
                  </div>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                    Rs. {formatCurrency(stats.overall?.avgOrderValue)}
                  </p>
                </div>
              </div>

              {/* Category Stats */}
              {stats.categoryStats && stats.categoryStats.length > 0 && (
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                    Category Performance
                  </h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {stats.categoryStats.map((category, index) => (
                      <div key={category._id || index} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px'
                      }}>
                        <div>
                          <span style={{ fontWeight: '500', color: '#1f2937' }}>
                            {safeString(category._id, 'Unknown Category')}
                          </span>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {safeNumber(category.orderCount)} orders • {safeNumber(category.totalQuantity)} items
                          </p>
                        </div>
                        <span style={{ fontSize: '1.125rem', fontWeight: '600', color: '#059669' }}>
                          Rs. {formatCurrency(category.totalRevenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Beverages */}
              {stats.topBeverages && stats.topBeverages.length > 0 && (
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                    Top Beverages
                  </h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {stats.topBeverages.slice(0, 5).map((beverage, index) => (
                      <div key={beverage._id || index} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{
                            width: '24px', height: '24px', borderRadius: '50%',
                            backgroundColor: '#3b82f6', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.875rem', fontWeight: '600', marginRight: '12px'
                          }}>
                            {index + 1}
                          </span>
                          <div>
                            <span style={{ fontWeight: '500', color: '#1f2937' }}>
                              {safeString(beverage.beverageName, 'Unknown Beverage')}
                            </span>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              {safeString(beverage.category, 'Unknown')} • {safeNumber(beverage.orderCount)} orders
                            </p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                            {safeNumber(beverage.totalQuantity)} sold
                          </p>
                          <p style={{ fontSize: '0.875rem', color: '#059669' }}>
                            Rs. {formatCurrency(beverage.totalRevenue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{
              textAlign: 'center', padding: '48px', backgroundColor: 'white',
              borderRadius: '8px', border: '1px solid #e5e7eb'
            }}>
              <FaChartBar style={{ fontSize: '4rem', color: '#9ca3af', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                No Statistics Available
              </h3>
              <p style={{ color: '#6b7280' }}>
                No consumption data available for generating statistics.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tenants Tab */}
      {activeTab === 'tenants' && (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
              Tenant Consumption Summary
            </h3>
          </div>
          <div style={{ padding: '20px' }}>
            {tenantSummary.length > 0 ? (
              <div style={{ display: 'grid', gap: '16px' }}>
                {tenantSummary.map((tenant, index) => (
                  <div key={tenant._id || index} style={{
                    border: '1px solid #e5e7eb', borderRadius: '8px',
                    padding: '16px', backgroundColor: '#f8fafc'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                          <FaUser style={{ color: '#3b82f6', marginRight: '8px' }} />
                          <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                            {safeString(tenant.tenantName, 'Unknown Tenant')}
                          </h4>
                          <span style={{
                            marginLeft: '12px', padding: '2px 8px', borderRadius: '12px',
                            fontSize: '0.75rem', fontWeight: '500',
                            backgroundColor: '#e0e7ff', color: '#3730a3'
                          }}>
                            Room {safeString(tenant.roomNumber, 'N/A')}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', fontSize: '0.875rem' }}>
                          <div>
                            <span style={{ color: '#6b7280' }}>Total Orders:</span>
                            <p style={{ color: '#1f2937', fontWeight: '500' }}>
                              {safeNumber(tenant.totalOrders)}
                            </p>
                          </div>
                          <div>
                            <span style={{ color: '#6b7280' }}>Total Quantity:</span>
                            <p style={{ color: '#1f2937', fontWeight: '500' }}>
                              {safeNumber(tenant.totalQuantity)}
                            </p>
                          </div>
                          <div>
                            <span style={{ color: '#6b7280' }}>Total Amount:</span>
                            <p style={{ color: '#059669', fontWeight: '600' }}>
                              Rs. {formatCurrency(tenant.totalAmount)}
                            </p>
                          </div>
                          <div>
                            <span style={{ color: '#6b7280' }}>Pending:</span>
                            <p style={{ color: safeNumber(tenant.pendingAmount) > 0 ? '#dc2626' : '#059669', fontWeight: '500' }}>
                              Rs. {formatCurrency(tenant.pendingAmount)}
                            </p>
                          </div>
                          <div>
                            <span style={{ color: '#6b7280' }}>Last Order:</span>
                            <p style={{ color: '#1f2937', fontWeight: '500' }}>
                              {formatDate(tenant.lastOrder)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <FaUser style={{ fontSize: '4rem', color: '#9ca3af', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                  No Tenant Data
                </h3>
                <p style={{ color: '#6b7280' }}>
                  No tenant consumption data found for the selected period.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BeverageConsumption;
