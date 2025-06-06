import api from './api.js';

const authService = {
    login: async (credentials) => {
        try {
            console.log("AuthService - Credentials:", credentials);
            const response = await api.post('/user/login', credentials);
            console.log("AuthService - Response Data:", response.data);
            return response.data;
        } catch (error) {
            console.error("API Error:", error);
            // Extract error message from different possible locations
            const errorMessage = error.response?.data?.message || 
                               error.response?.data?.error || 
                               error.message || 
                               "Login failed. Please try again.";
            throw new Error(errorMessage);
        }
    },
    


    register: async (userData) => {
        try {
            console.log("inside the register ");
            console.log(userData);
            const response = await api.post('/user/register', userData);
            console.log("data added");
            return response.data;
        } catch (error) {
            console.error("API Error:", error);
            // Extract error message from different possible locations
            const errorMessage = error.response?.data?.message || 
                               error.response?.data?.error || 
                               error.message || 
                               "Registration failed. Please try again.";
            throw new Error(errorMessage);
        }
    },
    

    logout: async () => {
        try {
            console.log("hello");
            const response = await api.get('/user/logout');
            return response;
        } catch (error) {
            console.error("API Error:", error);
            const errorMessage = error.response?.data?.message || 
                               error.response?.data?.error || 
                               error.message || 
                               "Logout failed. Please try again.";
            throw new Error(errorMessage);
        }
    }
};
export default authService;