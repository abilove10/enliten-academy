import { SecurityClient } from './encryption';
import { config } from './config';

const security = new SecurityClient();
const API_URL = config.API_URL;

if (!API_URL) {
    console.error('API_URL is not configured properly');
}

// Add base headers for all requests
const getHeaders = (token = null) => {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
};

export const api = {
    async login(credentials) {
        const encryptedData = await security.encryptRequest(credentials);
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify(encryptedData)
        });
        const data = await response.json();
        return security.decryptResponse(data);
    },

    async getUserData(token) {
        const response = await fetch(`${API_URL}/api/user/data`, {
            headers: getHeaders(token)
        });
        const data = await response.json();
        return security.decryptResponse(data);
    },

    async requestOTP(data) {
        const encryptedData = await security.encryptRequest(data);
        const response = await fetch(`${API_URL}/api/auth/request-otp`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(encryptedData)
        });
        const responseData = await response.json();
        return security.decryptResponse(responseData);
    },

    async verifyOTP(data) {
        const encryptedData = await security.encryptRequest(data);
        const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(encryptedData)
        });
        const responseData = await response.json();
        return security.decryptResponse(responseData);
    },

    async googleSignIn() {
        const response = await fetch(`${API_URL}/api/auth/google-signin-url`);
        const { url } = await response.json();
        // Open Google sign-in popup
        window.open(url, 'Google Sign In', 'width=500,height=600');
        
        // Listen for the auth callback
        return new Promise((resolve, reject) => {
            window.addEventListener('message', async (event) => {
                if (event.origin !== API_URL) return;
                if (event.data.type === 'GOOGLE_SIGN_IN_SUCCESS') {
                    const { code } = event.data;
                    // Exchange code for token
                    const tokenResponse = await fetch(`${API_URL}/api/auth/google-signin-callback`, {
                        method: 'POST',
                        headers: getHeaders(),
                        body: JSON.stringify({ code })
                    });
                    const data = await tokenResponse.json();
                    resolve(data);
                }
            });
        });
    },

    async fetchUserData() {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_URL}/api/user/data`, {
            method: 'GET',
            credentials: 'include',
            headers: getHeaders(token)
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                throw new Error('Session expired');
            }
            throw new Error('Failed to fetch user data');
        }

        return response.json();
    },

    // Add other API methods here
}; 