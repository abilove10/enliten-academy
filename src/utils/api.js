import { SecurityClient } from './encryption';
import { config } from './config';

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

// Ensure SecurityClient is initialized properly
// async function initializeSecurityClient() {
//     const key = await get_key();
//     if (key) {
//         const security = new SecurityClient(key);
//         return security;
//     }
//     return null;
// }
// initializeSecurityClient().then((security) => {
//     if (security) {
//         console.log("SecurityClient initialized successfully");
//     } else {
//         console.log("Failed to initialize SecurityClient");
//     }
// });
const security = new SecurityClient();

// Add these constants at the top of the file with other constants
const USER_DATA_CACHE_KEY = 'cached_user_data';
// const CACHE_EXPIRY_TIME = 15 * 60 * 1000;
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Clear cache on page reload
window.addEventListener('load', () => {
    localStorage.removeItem(USER_DATA_CACHE_KEY);
});

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
        try {
            const encryptedData = await security.encryptRequest(data);
            const response = await fetch(`${API_URL}/api/auth/request-otp`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(encryptedData)
            });
            
            if (!response.ok) throw new Error('Failed to send OTP');
            
            const responseData = await response.json();
            return security.decryptResponse(responseData);
        } catch (error) {
            console.error('Request OTP Error:', error);
            throw error;
        }
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
        try {
            // console.log('Fetching Google Sign In URL...');
            localStorage.removeItem(USER_DATA_CACHE_KEY);
            localStorage.removeItem('cached_assessments');

            const response = await fetch(`${API_URL}/api/auth/google-signin-url`);
            
            if (!response.ok) {
                throw new Error('Failed to get Google Sign In URL');
            }
            
            const { url } = await response.json();
            // console.log('Received Google Sign In URL:', url);
            
            // Open popup with specific features
            const popup = window.open(
                url, 
                'Google Sign In',
                'width=500,height=600,resizable=yes,scrollbars=yes,status=yes'
            );
            
            if (!popup) {
                alert("Popup was blocked by the browser. Please enable popups and try again.");
                throw new Error('Popup was blocked by the browser. Please enable popups and try again.');
            }

            return new Promise((resolve, reject) => {
                // Set timeout for the entire operation
                const timeout = setTimeout(() => {
                    window.removeEventListener('message', messageHandler);
                    popup.close();
                    reject(new Error('Sign in timed out. Please try again.'));
                }, 120000); // 2 minutes timeout

                // Message event handler
                const messageHandler = async (event) => {
                    if (event.origin !== window.location.origin) {
                        console.log('Invalid origin:', event.origin);
                        return;
                    }

                    if (event.data.type === 'GOOGLE_SIGN_IN_SUCCESS') {
                        clearTimeout(timeout);
                        window.removeEventListener('message', messageHandler);

                        try {
                            const { code } = event.data;
                            alert("success 1");
                            const tokenResponse = await fetch(`${API_URL}/api/auth/google-signin-callback`, {
                                method: 'POST',
                                headers: getHeaders(),
                                body: JSON.stringify({ code }),
                                credentials: 'include'
                            });
                            const r = await tokenResponse.json();
                            localStorage.setItem('token', r["ads_id"]);

                            const response = await security.decryptResponse_base64(JSON.parse(JSON.stringify(r["data"])));
                            if (!tokenResponse.ok) {
                                throw new Error(`Token exchange failed: ${tokenResponse.status}`);
                            }
                            alert("success 2");

                            const data = response;
                            // Don't rely on popup.close() working
                            try {
                                popup.close();
                            } catch (e) {
                                console.log('Could not automatically close popup');
                            }
                            resolve(data);
                        } catch (error) {
                            console.error('Token exchange error:', error);
                            reject(error);
                        }
                    } else if (event.data.type === 'GOOGLE_SIGN_IN_ERROR') {
                        console.error('Received error message:', event.data.error);
                        clearTimeout(timeout);
                        window.removeEventListener('message', messageHandler);
                        popup.close();
                        reject(new Error(event.data.error || 'Sign in failed'));
                    }
                };

                // Add message event listener
                window.addEventListener('message', messageHandler);

                // Focus the popup
                popup.focus();
            });
        } catch (error) {
            console.error('Google SignIn Error:', error);
            throw error;
        }
    },

    async fetchUserData() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Check cache first
            const cachedData = localStorage.getItem(USER_DATA_CACHE_KEY);
            if (cachedData) {
                const { data, timestamp } = JSON.parse(cachedData);
                const now = new Date().getTime();
                
                // If cache hasn't expired, return cached data
                if (now - timestamp < CACHE_EXPIRY_TIME) {
                    return await security.decryptResponse_base64(data);
                }
                // If expired, remove the cached data
                localStorage.removeItem(USER_DATA_CACHE_KEY);
            }

            const encryptedResponse = await this.fetchWithRetry(`${API_URL}/api/user/data`, {
                method: 'GET',
                headers: getHeaders(token),
                credentials: 'include'
            });

            if(encryptedResponse.data.status === 'error'){
                throw new Error('Failed to fetch key');
            }

            const response = await security.decryptResponse_base64(encryptedResponse["data"]);

            // Ensure we have a valid photo_url
            if (response && !response.photo_url) {
                response.photo_url = ''; // Set empty string if no photo URL
            }

            // Cache the response with timestamp
            localStorage.setItem(USER_DATA_CACHE_KEY, JSON.stringify({
                data: encryptedResponse["data"],
                timestamp: new Date().getTime()
            }));

            return response;
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    },

    // Optional method to force refresh
    async forceRefreshUserData() {
        localStorage.removeItem(USER_DATA_CACHE_KEY);
        return this.fetchUserData();
    },

    //get user assessments
    async fetchUserAssessments() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            const cachedassessments = localStorage.getItem('cached_assessments');
            if (cachedassessments) {
                const { data, timestamp } = JSON.parse(cachedassessments);
                const now = new Date().getTime();
                
                // If cache hasn't expired, return cached data
                if (now - timestamp < CACHE_EXPIRY_TIME) {
                    var temp =await security.decryptResponse_base64(data);
                    // console.log(temp)
                    return temp.assessments
                }
                // If expired, remove the cached data
                localStorage.removeItem('cached_assessments');
            }

            const encryptedResponse = await this.fetchWithRetry(`${API_URL}/api/assessment/user`, {
                method: 'GET',
                headers: getHeaders(token),
                credentials: 'include'
            });
            // console.log(encryptedResponse)

            const response = await security.decryptResponse_base64(encryptedResponse["data"]);
            localStorage.setItem('cached_assessments', JSON.stringify({
                data: encryptedResponse["data"],
                timestamp: new Date().getTime()
            }));
    
            if (!response || !response.assessments) {
                return []; // Return empty array if no assessments found
            }

            return response.assessments;
        } catch (error) {
            console.error('Error fetching user assessments:', error);
            throw error;
        }
    },
    
    // Add retry logic for fetch requests
    async fetchWithRetry(url, options, retries = 3, delay = 1000) {
        try {
            const response = await fetch(url, options);

            if (response.status === 429) {
                if (retries > 0) {
                    console.log(`Rate limited, retrying in ${delay}ms... (${retries} retries left)`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return this.fetchWithRetry(url, options, retries - 1, delay * 2);
                } else {
                    throw new Error('Rate limit exceeded. Please try again later.');
                }
            }

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    throw new Error('Session expired');
                }
                throw new Error(`API Error: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            if (error.message.includes('Rate limit')) {
                throw { status: 429, message: error.message };
            }
            throw error;
        }
    },

    async fetchData(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        return this.fetchWithRetry(`${config.API_URL}${endpoint}`, {
            ...options,
            headers: {
                ...getHeaders(token),
                ...options.headers
            },
            credentials: 'include'
        });
    },

    async logout() {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await fetch(`${API_URL}/api/auth/logout`, {
                method: 'POST',
                headers: getHeaders(token),
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    },

    // Add other API methods here
}; 