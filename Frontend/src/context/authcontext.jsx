import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../service/authservice';
import { toast } from 'react-hot-toast';
import api from '../service/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // ✅ Check authentication on app start
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userData = localStorage.getItem("user");
                const isLoggedIn = localStorage.getItem("isLoggedIn");
                const expiry = localStorage.getItem("expiry");

                if (userData && expiry) {
                    const isExpired = Date.now() > Number(expiry);
                    if (isExpired) {
                        console.log("Session expired. Logging out.");
                        localStorage.removeItem("user");
                        localStorage.removeItem("isLoggedIn");
                        localStorage.removeItem("expiry");
                        setUser(null);
                        return;
                    }
                    setUser(JSON.parse(userData));
                } else if (isLoggedIn) {
                    const response = await api.get("/user/current-user", { withCredentials: true });
                    console.log("Auth Check API Response:", response);

                    if (response.data?.data?.userobject) {
                        const currentUser = response.data.data.userobject;
                        setUser(currentUser);
                        localStorage.setItem("user", JSON.stringify(currentUser));
                        const newExpiry = Date.now() + SESSION_DURATION;
                        localStorage.setItem("expiry", newExpiry.toString());
                    }
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    useEffect(() => {
        const warmup = async () => {
            const hasPinged = sessionStorage.getItem("pinged");

            if (!hasPinged) {
                try {
                    await api.get("/ping");
                    console.log("Backend warmed up");
                    sessionStorage.setItem("pinged", "true");
                } catch (err) {
                    console.log("Backend still sleeping...");
                }
            }
        };

        warmup();
    }, []);

    const login = async (credentials) => {
        try {
            const response = await authService.login(credentials);
            console.log("Login Response:", response);

            if (!response || !response.data) {
                throw new Error("Invalid response from the server");
            }

            const user = response.data.loggedinuser;
            const expiry = Date.now() + SESSION_DURATION;

            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("expiry", expiry.toString());

            setUser(user);
            toast.success('Welcome back!');
            navigate("/jobs");

        } catch (error) {
            toast.error(error.message || 'Login failed. Please try again.');
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            console.log("Inside register function in AuthContext", userData);

            const response = await authService.register(userData);
            console.log("Register Response:", response);

            if (!response || !response.data) {
                throw new Error("Invalid response from the server");
            }

            const token = response.data.token;
            const user = response.data.userobject;
            const expiry = Date.now() + SESSION_DURATION;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("expiry", expiry.toString());

            setUser(user);
            toast.success('Registration successful!');
            navigate("/jobs");
        } catch (error) {
            console.error("Error during registration:", error);
            const errorMessage = error?.message || error?.response?.data?.message || "Signup failed. Please try again.";
            toast.error(errorMessage);
            throw error;
        }
    };

    const logout = async () => {
        try {
            const response = await authService.logout();
            console.log(response.status);
            if (response.status === 200) {
                localStorage.removeItem("user");
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("expiry");
                localStorage.removeItem("token");
                setUser(null);
                toast.success('Logged out successfully');
                console.log("loggin out");
                navigate('/login');
            }
        } catch (error) {
            toast.error('Error logging out');
            throw error;
        }
    };

    return (
        <AuthContext.Provider 
            value={{ user, setUser, login, logout, register, loading }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
