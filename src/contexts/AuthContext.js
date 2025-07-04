import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';


const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [adminToken, setAdminToken] = useState(null);

    const setCookie = (name, value, maxAge) => {
        document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
    };

    const removeCookie = (name) => {
        document.cookie = `${name}=; Max-Age=0; path=/`;
    };

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
        return null;
    };

    const checkTokenExpiration = (token) => {
        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            return decoded.exp < currentTime;
        } catch (error) {
            console.error('Error decoding token:', error);
            return true;
        }
    };

    const loginAdmin = (token) => {
        setCookie('adminToken', token, 7 * 24 * 60 * 60 * 1000);
        setAdminToken(token);
        setIsAdminAuthenticated(true);
    };

    const logoutAdmin = (isExpired = false) => {
        if (isExpired) {
            setCookie('authAdminMessage', 'Sesi Anda telah berakhir. Silakan login kembali!', 10);
        }
        removeCookie('adminToken');
        setIsAdminAuthenticated(false);
    };

    useEffect(() => {
        const adminToken = getCookie('adminToken');

        // Validasi token admin
        if (adminToken) {
            if (checkTokenExpiration(adminToken)) {
                logoutAdmin(true);
            } else {
                setIsAdminAuthenticated(true);
                setAdminToken(adminToken);
            }
        }

        setIsAuthChecked(true);


        const interceptor = axios.interceptors.response.use(
            (response) => response,

            (error) => {
                if (error.response && error.response.status === 401) {
                    const isTokenExpired = error.response.data?.message === 'Unauthorized: Token expired';
                    const role = error.response.data?.role;

                    if (isTokenExpired) {

                        logoutAdmin();

                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                
                isAdminAuthenticated,
                loginAdmin,
                logoutAdmin,
                isAuthChecked,
                adminToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
