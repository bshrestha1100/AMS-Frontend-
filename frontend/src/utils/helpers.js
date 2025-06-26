// Helper utility functions

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

export const formatDate = (date, options = {}) => {
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    return new Date(date).toLocaleDateString('en-US', {
        ...defaultOptions,
        ...options
    });
};

export const calculateDaysBetween = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
};

export const getStatusColor = (status) => {
    const statusColors = {
        pending: { backgroundColor: '#fef3c7', color: '#92400e' },
        approved: { backgroundColor: '#d1fae5', color: '#065f46' },
        rejected: { backgroundColor: '#fee2e2', color: '#991b1b' },
        paid: { backgroundColor: '#d1fae5', color: '#065f46' },
        overdue: { backgroundColor: '#fee2e2', color: '#991b1b' }
    };

    return statusColors[status] || { backgroundColor: '#f3f4f6', color: '#374151' };
};

export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.length >= 10;
};

export const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
};

export const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
};

export const downloadFile = (data, filename, type = 'text/csv') => {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
};
