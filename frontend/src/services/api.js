import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error('API Error:', error.response?.status, error.response?.data?.message || error.message);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Token expired or invalid - logout user
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }

    // Handle other common errors
    if (error.response?.status === 403) {
      console.error('Access forbidden - insufficient permissions');
    }

    if (error.response?.status >= 500) {
      console.error('Server error - please try again later');
    }

    return Promise.reject(error);
  }
);

// ===== AUTHENTICATION FUNCTIONS =====

// Login
api.login = async (email, password) => {
  try {
    console.log('Attempting login for:', email);
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Register
api.register = async (userData) => {
  try {
    console.log('Attempting registration');
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Get current user
api.getCurrentUser = async () => {
  try {
    console.log('Fetching current user');
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

// Update user details
api.updateUserDetails = async (userData) => {
  try {
    console.log('Updating user details:', userData);
    const response = await api.put('/auth/updatedetails', userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user details:', error);
    throw error;
  }
};

// Update password
api.updatePassword = async (passwordData) => {
  try {
    console.log('Updating password');
    const response = await api.put('/auth/updatepassword', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

// Logout
api.logout = async () => {
  try {
    console.log('Logging out');
    const response = await api.get('/auth/logout');
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// ===== USER MANAGEMENT FUNCTIONS (ADMIN) =====

// Get all users
api.getAllUsers = async () => {
  try {
    console.log('Fetching all users');
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Create new user
api.createUser = async (userData) => {
  try {
    console.log('Creating new user:', userData);
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update user
api.updateUser = async (userId, userData) => {
  try {
    console.log('Updating user:', userId, userData);
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Delete user
api.deleteUser = async (userId) => {
  try {
    console.log('Deleting user:', userId);
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Toggle user status
api.toggleUserStatus = async (userId) => {
  try {
    console.log('Toggling user status:', userId);
    const response = await api.patch(`/users/${userId}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error('Error toggling user status:', error);
    throw error;
  }
};

api.changePassword = async (passwordData) => {
  try {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// ===== TENANT MANAGEMENT FUNCTIONS =====

// Get all tenants (admin only)
api.getAllTenants = async () => {
  try {
    console.log('Fetching all tenants');
    const response = await api.get('/tenant/admin/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching tenants:', error);
    throw error;
  }
};

// Get single tenant details (admin only)
api.getTenantDetails = async (tenantId) => {
  try {
    console.log('Fetching tenant details:', tenantId);
    const response = await api.get(`/tenant/admin/${tenantId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tenant details:', error);
    throw error;
  }
};

// Update tenant (admin only)
api.updateTenantDetails = async (tenantId, tenantData) => {
  try {
    console.log('Updating tenant:', tenantId, tenantData);
    const response = await api.put(`/tenant/admin/${tenantId}`, tenantData);
    return response.data;
  } catch (error) {
    console.error('Error updating tenant:', error);
    throw error;
  }
};

// Get tenant profile (tenant only)
api.getTenantProfile = async () => {
  try {
    console.log('Fetching tenant profile');
    const response = await api.get('/tenant/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching tenant profile:', error);
    throw error;
  }
};

// Update tenant profile (tenant only)
api.updateTenantProfile = async (profileData) => {
  try {
    console.log('Updating tenant profile:', profileData);
    const response = await api.put('/tenant/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating tenant profile:', error);
    throw error;
  }
};

// Get tenant room details (tenant only)
api.getTenantRoom = async () => {
  try {
    console.log('Fetching tenant room details');
    const response = await api.get('/tenant/room');
    return response.data;
  } catch (error) {
    console.error('Error fetching tenant room:', error);
    throw error;
  }
};

// Get tenant dashboard data (tenant only)
api.getTenantDashboard = async () => {
  try {
    console.log('Fetching tenant dashboard data');
    const response = await api.get('/tenant/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching tenant dashboard:', error);
    throw error;
  }
};

// ===== MAINTENANCE REQUEST FUNCTIONS =====

// Submit maintenance request (tenant)
api.submitMaintenanceRequest = async (requestData) => {
  try {
    console.log('Submitting maintenance request:', requestData);
    const response = await api.post('/maintenance', requestData);
    return response.data;
  } catch (error) {
    console.error('Error submitting maintenance request:', error);
    throw error;
  }
};

// Get tenant's maintenance requests
api.getTenantMaintenanceRequests = async () => {
  try {
    console.log('Fetching tenant maintenance requests');
    const response = await api.get('/maintenance/my-requests');
    return response.data;
  } catch (error) {
    console.error('Error fetching tenant requests:', error);
    throw error;
  }
};

// Get worker's assigned maintenance requests
api.getWorkerMaintenanceRequests = async () => {
  try {
    console.log('Fetching worker maintenance requests');
    const response = await api.get('/maintenance/my-assignments');
    return response.data;
  } catch (error) {
    console.error('Error fetching worker assignments:', error);
    throw error;
  }
};

// Update maintenance request status (worker)
api.updateMaintenanceStatus = async (requestId, statusData) => {
  try {
    console.log('Updating maintenance status:', requestId, statusData);
    const response = await api.patch(`/maintenance/${requestId}/status`, statusData);
    return response.data;
  } catch (error) {
    console.error('Error updating maintenance status:', error);
    throw error;
  }
};

// Get all maintenance requests (admin)
api.getAllMaintenanceRequests = async (filters = {}) => {
  try {
    console.log('Fetching all maintenance requests');
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/maintenance/admin/all?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all maintenance requests:', error);
    throw error;
  }
};

// Assign maintenance request to worker (admin)
api.assignMaintenanceRequest = async (requestId, assignmentData) => {
  try {
    console.log('Assigning maintenance request:', requestId, assignmentData);
    const response = await api.patch(`/maintenance/${requestId}/assign`, assignmentData);
    return response.data;
  } catch (error) {
    console.error('Error assigning maintenance request:', error);
    throw error;
  }
};

// Get available workers (admin)
api.getAvailableWorkers = async () => {
  try {
    console.log('Fetching available workers');
    const response = await api.get('/maintenance/admin/workers');
    return response.data;
  } catch (error) {
    console.error('Error fetching workers:', error);
    throw error;
  }
};

// ===== APARTMENT MANAGEMENT FUNCTIONS =====

// Get all apartments
api.getAllApartments = async () => {
  try {
    console.log('Fetching all apartments');
    const response = await api.get('/apartments');
    return response.data;
  } catch (error) {
    console.error('Error fetching apartments:', error);
    throw error;
  }
};

// Create new apartment
api.createApartment = async (apartmentData) => {
  try {
    console.log('Creating new apartment:', apartmentData);
    const response = await api.post('/apartments', apartmentData);
    return response.data;
  } catch (error) {
    console.error('Error creating apartment:', error);
    throw error;
  }
};

// Update apartment
api.updateApartment = async (apartmentId, apartmentData) => {
  try {
    console.log('Updating apartment:', apartmentId, apartmentData);
    const response = await api.put(`/apartments/${apartmentId}`, apartmentData);
    return response.data;
  } catch (error) {
    console.error('Error updating apartment:', error);
    throw error;
  }
};

// Delete apartment
api.deleteApartment = async (apartmentId) => {
  try {
    console.log('Deleting apartment:', apartmentId);
    const response = await api.delete(`/apartments/${apartmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting apartment:', error);
    throw error;
  }
};

// Get available apartments
api.getAvailableApartments = async () => {
  try {
    console.log('Fetching available apartments');
    const response = await api.get('/apartments/available');
    return response.data;
  } catch (error) {
    console.error('Error fetching available apartments:', error);
    throw error;
  }
};

// ===== UTILITY BILL FUNCTIONS =====

// Get utility bills
api.getUtilityBills = async () => {
  try {
    console.log('Fetching utility bills');
    const response = await api.get('/tenant/bills');
    return response.data;
  } catch (error) {
    console.error('Error fetching utility bills:', error);
    throw error;
  }
};

// Create utility bill
api.createUtilityBill = async (billData) => {
  try {
    console.log('Creating utility bill:', billData);
    const response = await api.post('/utilities', billData);
    return response.data;
  } catch (error) {
    console.error('Error creating utility bill:', error);
    throw error;
  }
};

// Update utility bill
api.updateUtilityBill = async (billId, billData) => {
  try {
    console.log('Updating utility bill:', billId, billData);
    const response = await api.put(`/utility-bills/admin/${billId}`, billData);
    return response.data;
  } catch (error) {
    console.error('Error updating utility bill:', error);
    throw error;
  }
};

// Delete utility bill
api.deleteUtilityBill = async (billId) => {
  try {
    console.log('Deleting utility bill:', billId);
    const response = await api.delete(`/utility-bills/admin/${billId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting utility bill:', error);
    throw error;
  }
};

// Get all utility bills (admin)
api.getAllUtilityBills = async () => {
  try {
    console.log('Fetching all utility bills');
    const response = await api.get('/utilities');
    return response.data;
  } catch (error) {
    console.error('Error fetching all utility bills:', error);
    throw error;
  }
};

// Simple create and send bill in one step
api.createAndSendBill = async (billData) => {
  try {
    console.log('Creating and sending bill:', billData);
    const response = await api.post('/utility-bills/admin/create-and-send', billData);
    return response.data;
  } catch (error) {
    console.error('Error creating and sending bill:', error);
    throw error;
  }
};

// Get beverage summary for bill creation
api.getBeverageSummaryForBill = async (tenantId, startDate, endDate) => {
  try {
    const response = await api.get(`/utility-bills/admin/beverage-summary/${tenantId}?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching beverage summary:', error);
    throw error;
  }
};



// ===== LEAVE REQUEST FUNCTIONS =====

// Submit leave request
api.submitLeaveRequest = async (leaveData) => {
  try {
    console.log('Submitting leave request:', leaveData);
    const response = await api.post('/leave-requests', leaveData);
    return response.data;
  } catch (error) {
    console.error('Error submitting leave request:', error);
    throw error;
  }
};

// Get my leave requests
api.getMyLeaveRequests = async () => {
  try {
    console.log('Fetching my leave requests');
    const response = await api.get('/leave-requests/my-requests');
    return response.data;
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    throw error;
  }
};

// Get leave stats
api.getLeaveStats = async () => {
  try {
    console.log('Fetching leave stats');
    const response = await api.get('/leave-requests/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching leave stats:', error);
    throw error;
  }
};

// Get all leave requests (admin)
api.getAllLeaveRequests = async (filters = {}) => {
  try {
    console.log('Fetching all leave requests');
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/leave-requests/admin/all?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all leave requests:', error);
    throw error;
  }
};

// Review leave request (admin)
api.reviewLeaveRequest = async (requestId, reviewData) => {
  try {
    console.log('Reviewing leave request:', requestId, reviewData);
    const response = await api.patch(`/leave-requests/${requestId}/review`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error reviewing leave request:', error);
    throw error;
  }
};

// ===== BEVERAGE FUNCTIONS =====

// Get all beverages
api.getAllBeverages = async () => {
  try {
    console.log('Fetching all beverages');
    const response = await api.get('/beverages');
    return response.data;
  } catch (error) {
    console.error('Error fetching beverages:', error);
    throw error;
  }
};

// Create beverage
api.createBeverage = async (beverageData) => {
  try {
    console.log('Creating beverage:', beverageData);
    const response = await api.post('/beverages', beverageData);
    return response.data;
  } catch (error) {
    console.error('Error creating beverage:', error);
    throw error;
  }
};

// Update beverage
api.updateBeverage = async (beverageId, beverageData) => {
  try {
    console.log('Updating beverage:', beverageId, beverageData);
    const response = await api.put(`/beverages/${beverageId}`, beverageData);
    return response.data;
  } catch (error) {
    console.error('Error updating beverage:', error);
    throw error;
  }
};

// Delete beverage
api.deleteBeverage = async (beverageId) => {
  try {
    console.log('Deleting beverage:', beverageId);
    const response = await api.delete(`/beverages/${beverageId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting beverage:', error);
    throw error;
  }
};

// ===== BEVERAGE CONSUMPTION FUNCTIONS =====

// Get beverage consumption records (admin)
api.getBeverageConsumption = async (filters = {}) => {
  try {
    console.log('Fetching beverage consumption records');
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/beverage-consumption/admin/all?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching beverage consumption:', error);
    throw error;
  }
};

// Get beverage consumption statistics (admin)
api.getBeverageConsumptionStats = async (filters = {}) => {
  try {
    console.log('Fetching beverage consumption stats');
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/beverage-consumption/admin/stats?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching consumption stats:', error);
    throw error;
  }
};

// Get tenant consumption summary (admin)
api.getTenantConsumptionSummary = async (filters = {}) => {
  try {
    console.log('Fetching tenant consumption summary');
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/beverage-consumption/admin/tenant-summary?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tenant summary:', error);
    throw error;
  }
};

// Get tenant's own consumption (tenant)
api.getMyBeverageConsumption = async (page = 1, limit = 20) => {
  try {
    console.log('Fetching my beverage consumption');
    const response = await api.get(`/beverage-consumption/my-consumption?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching my consumption:', error);
    throw error;
  }
};
// Mark beverages as paid
api.markBeveragesAsPaid = async (utilityBillId) => {
  try {
    const response = await api.put(`/beverage-consumption/admin/mark-as-paid/${utilityBillId}`);
    return response.data;
  } catch (error) {
    console.error('Error marking beverages as paid:', error);
    throw error;
  }
};


// ===== ROOFTOP FUNCTIONS =====

// Rooftop Reservations
api.getRooftopReservations = async () => {
  try {
    console.log('Fetching rooftop reservations');
    const response = await api.get('/rooftop/reservations');
    return response.data;
  } catch (error) {
    console.error('Error fetching rooftop reservations:', error);
    throw error;
  }
};

api.createRooftopReservation = async (reservationData) => {
  try {
    console.log('Creating rooftop reservation:', reservationData);
    const response = await api.post('/rooftop/reservations', reservationData);
    return response.data;
  } catch (error) {
    console.error('Error creating rooftop reservation:', error);
    throw error;
  }
};

api.cancelRooftopReservation = async (reservationId) => {
  try {
    console.log('Cancelling rooftop reservation:', reservationId);
    const response = await api.patch(`/rooftop/reservations/${reservationId}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling rooftop reservation:', error);
    throw error;
  }
};

// Admin rooftop reservation management
api.getAllRooftopReservations = async () => {
  try {
    console.log('Fetching all rooftop reservations (admin)');
    const response = await api.get('/rooftop/reservations/admin/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all rooftop reservations:', error);
    throw error;
  }
};

api.reviewRooftopReservation = async (reservationId, status, adminNotes = '') => {
  try {
    console.log('Reviewing rooftop reservation:', reservationId, status);
    const response = await api.put(`/rooftop/reservations/${reservationId}/review`, {
      status,
      adminNotes
    });
    return response.data;
  } catch (error) {
    console.error('Error reviewing rooftop reservation:', error);
    throw error;
  }
};

// Get all apartments
api.getApartments = async () => {
  try {
    console.log('Fetching all apartments');
    const response = await api.get('/apartments');
    return response.data;
  } catch (error) {
    console.error('Error fetching apartments:', error);
    throw error;
  }
};

// Get available apartments for user assignment
api.getAvailableApartments = async () => {
  try {
    console.log('Fetching available apartments');
    const response = await api.get('/apartments/available');
    return response.data;
  } catch (error) {
    console.error('Error fetching available apartments:', error);
    throw error;
  }
};

// In your api.js, update this function:
api.getBeverageConsumption = async (filters = {}) => {
  try {
    console.log('Fetching beverage consumption with filters:', filters);
    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    // Change this endpoint to match your backend route
    const response = await api.get(`/beverage-consumption/admin/all?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching beverage consumption:', error);
    throw error;
  }
};

// Add these functions to your existing api.js file

api.getDailyConsumption = async (filters = {}) => {
  try {
    console.log('Fetching daily consumption');
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/beverage-consumption/admin/daily-consumption?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching daily consumption:', error);
    throw error;
  }
};

api.getMonthlyConsumptionTrends = async (filters = {}) => {
  try {
    console.log('Fetching monthly consumption trends');
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/beverage-consumption/admin/monthly-trends?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly trends:', error);
    throw error;
  }
};

// Update your getBeverageConsumption function to use the correct endpoint
api.getBeverageConsumption = async (filters = {}) => {
  try {
    console.log('Fetching beverage consumption with filters:', filters);
    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await api.get(`/beverage-consumption/admin/all?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching beverage consumption:', error);
    throw error;
  }
};


// Beverage Cart
api.getBeverageCart = async () => {
  try {
    console.log('Fetching beverage cart');
    const response = await api.get('/rooftop/cart');
    return response.data;
  } catch (error) {
    console.error('Error fetching beverage cart:', error);
    throw error;
  }
};

api.addToCart = async (beverageId, quantity) => {
  try {
    console.log('Adding to cart:', beverageId, quantity);
    const response = await api.post('/rooftop/cart/add', { beverageId, quantity });
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

api.updateCartItem = async (itemId, quantity) => {
  try {
    console.log('Updating cart item:', itemId, quantity);
    const response = await api.put(`/rooftop/cart/item/${itemId}`, { quantity });
    return response.data;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

api.removeFromCart = async (itemId) => {
  try {
    console.log('Removing from cart:', itemId);
    const response = await api.delete(`/rooftop/cart/item/${itemId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

// Checkout cart
api.checkoutCart = async () => {
  try {
    console.log('Checking out cart');
    const response = await api.post('/rooftop/cart/checkout');
    return response.data;
  } catch (error) {
    console.error('Error checking out cart:', error);
    throw error;
  }
};

// Beverages for rooftop
api.getRooftopBeverages = async () => {
  try {
    console.log('Fetching rooftop beverages');
    const response = await api.get('/rooftop/beverages');
    return response.data;
  } catch (error) {
    console.error('Error fetching rooftop beverages:', error);
    throw error;
  }
};

// Consumption History
api.getBeverageConsumptionHistory = async () => {
  try {
    console.log('Fetching beverage consumption history');
    const response = await api.get('/rooftop/consumption-history');
    return response.data;
  } catch (error) {
    console.error('Error fetching consumption history:', error);
    throw error;
  }
};

// Get tenant's beverage consumption
api.getTenantBeverageConsumption = async () => {
  try {
    console.log('Fetching tenant beverage consumption');
    const response = await api.get('/tenant/beverage-consumption');
    return response.data;
  } catch (error) {
    console.error('Error fetching tenant consumption:', error);
    throw error;
  }
};

// ===== UTILITY BILL FUNCTIONS =====

// Get all utility bills (admin)
api.getAllUtilityBills = async (filters = {}) => {
  try {
    console.log('Fetching all utility bills');
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/utility-bills/admin/all?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching utility bills:', error);
    throw error;
  }
};

// Create utility bill (admin)
api.createUtilityBill = async (billData) => {
  try {
    console.log('Creating utility bill:', billData);
    const response = await api.post('/utility-bills/admin/create', billData);
    return response.data;
  } catch (error) {
    console.error('Error creating utility bill:', error);
    throw error;
  }
};

// Generate bills batch (admin)
api.generateUtilityBillsBatch = async (billIds) => {
  try {
    console.log('Generating bills batch:', billIds);
    const response = await api.post('/utility-bills/admin/generate-batch', { billIds });
    return response.data;
  } catch (error) {
    console.error('Error generating bills batch:', error);
    throw error;
  }
};

// Review utility bill (admin)
api.reviewUtilityBill = async (billId, reviewData) => {
  try {
    console.log('Reviewing utility bill:', billId, reviewData);
    const response = await api.patch(`/utility-bills/admin/${billId}/review`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error reviewing utility bill:', error);
    throw error;
  }
};

// Send utility bills (admin)
api.sendUtilityBills = async (billIds) => {
  try {
    console.log('Sending utility bills:', billIds);
    const response = await api.post('/utility-bills/admin/send-bills', { billIds });
    return response.data;
  } catch (error) {
    console.error('Error sending utility bills:', error);
    throw error;
  }
};

// Mark bill as paid (admin)
api.markBillAsPaid = async (billId, paymentData) => {
  try {
    console.log('Marking bill as paid:', billId, paymentData);
    const response = await api.patch(`/utility-bills/admin/${billId}/mark-paid`, paymentData);
    return response.data;
  } catch (error) {
    console.error('Error marking bill as paid:', error);
    throw error;
  }
};

// Get tenant's utility bills
api.getMyUtilityBills = async (filters = {}) => {
  try {
    console.log('Fetching my utility bills');
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/utility-bills/my-bills?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching my utility bills:', error);
    throw error;
  }
};

// ===== HISTORICAL DATA FUNCTIONS =====

// Get historical tenants
api.getHistoricalTenants = async () => {
  try {
    console.log('Fetching historical tenants');
    const response = await api.get('/historical/tenants');
    return response.data;
  } catch (error) {
    console.error('Error fetching historical tenants:', error);
    throw error;
  }
};

// Get tenant history
api.getTenantHistory = async (tenantId) => {
  try {
    console.log('Fetching tenant history:', tenantId);
    const response = await api.get(`/historical/tenant/${tenantId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tenant history:', error);
    throw error;
  }
};

// Archive tenant
api.archiveTenant = async (tenantId, reasonForLeaving) => {
  try {
    console.log('Archiving tenant:', tenantId);
    const response = await api.post(`/historical/tenant/${tenantId}/archive`, { reasonForLeaving });
    return response.data;
  } catch (error) {
    console.error('Error archiving tenant:', error);
    throw error;
  }
};

// ===== ADMIN FUNCTIONS =====

// Manual billing trigger
api.triggerManualBilling = async () => {
  try {
    console.log('Triggering manual billing');
    const response = await api.post('/admin/trigger-billing');
    return response.data;
  } catch (error) {
    console.error('Error triggering manual billing:', error);
    throw error;
  }
};

// Get system statistics
api.getSystemStats = async () => {
  try {
    console.log('Fetching system statistics');
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching system stats:', error);
    throw error;
  }
};

// Get dashboard data (admin)
api.getAdminDashboard = async () => {
  try {
    console.log('Fetching admin dashboard data');
    const response = await api.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    throw error;
  }
};

// ===== WORKER FUNCTIONS =====

// Get worker dashboard data
api.getWorkerDashboard = async () => {
  try {
    console.log('Fetching worker dashboard data');
    const response = await api.get('/worker/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching worker dashboard:', error);
    throw error;
  }
};

// Get worker profile
api.getWorkerProfile = async () => {
  try {
    console.log('Fetching worker profile');
    const response = await api.get('/worker/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching worker profile:', error);
    throw error;
  }
};

// Update worker profile
api.updateWorkerProfile = async (profileData) => {
  try {
    console.log('Updating worker profile:', profileData);
    const response = await api.put('/worker/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating worker profile:', error);
    throw error;
  }
};

export default api;
