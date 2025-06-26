import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Function to check if token is expired
const isTokenExpired = (token) => {
    if (!token) return true;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        return payload.exp < currentTime;
    } catch (error) {
        console.error('Error checking token expiration:', error);
        return true;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuthState();
    }, []);

    const checkAuthState = () => {
        try {
            console.log('Checking auth state...');
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');

            console.log('Token exists:', !!token);
            console.log('User data exists:', !!userData);

            if (token && userData && !isTokenExpired(token)) {
                const parsedUser = JSON.parse(userData);
                console.log('Setting user from localStorage:', parsedUser);
                setUser(parsedUser);
            } else {
                console.log('Clearing invalid/expired auth data');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            }
        } catch (error) {
            console.error('Error checking auth state:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = (token, userData) => {
        try {
            console.log('Login function called with:', { token: !!token, userData });

            if (isTokenExpired(token)) {
                console.error('Token is expired');
                return false;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            console.log('Login successful, user set:', userData);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const logout = () => {
        console.log('Logout function called');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
