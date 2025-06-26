// Application constants
export const APP_NAME = 'Apartment Management System';

export const USER_ROLES = {
    ADMIN: 'admin',
    WORKER: 'worker',
    TENANT: 'tenant'
};

export const LEAVE_TYPES = {
    SICK: 'sick',
    PERSONAL: 'personal',
    VACATION: 'vacation',
    EMERGENCY: 'emergency',
    MATERNITY: 'maternity',
    PATERNITY: 'paternity',
    OTHER: 'other'
};

export const BEVERAGE_CATEGORIES = {
    ALCOHOLIC: 'Alcoholic',
    NON_ALCOHOLIC: 'Non-Alcoholic'
};

export const BILL_STATUS = {
    PENDING: 'pending',
    PAID: 'paid',
    OVERDUE: 'overdue'
};

export const READING_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
};

export const API_ENDPOINTS = {
    AUTH: '/auth',
    USERS: '/users',
    TENANTS: '/tenant',
    WORKERS: '/workers',
    APARTMENTS: '/apartments',
    UTILITIES: '/utilities',
    UTILITY_READINGS: '/utility-readings',
    BEVERAGES: '/beverages',
    LEAVE_REQUESTS: '/leave-requests'
};

export const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
    THEME: 'theme'
};
