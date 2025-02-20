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
            console.log('Fetching Google Sign In URL...');
            const response = await fetch(`${API_URL}/api/auth/google-signin-url`);
            
            if (!response.ok) {
                throw new Error('Failed to get Google Sign In URL');
            }
            
            const { url } = await response.json();
            console.log('Received Google Sign In URL:', url);
            
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
                    console.log('Received message event:', event.data);
                    
                    // Validate origin
                    if (event.origin !== window.location.origin) {
                        console.log('Invalid origin:', event.origin);
                        return;
                    }

                    if (event.data.type === 'GOOGLE_SIGN_IN_SUCCESS') {
                        console.log('Received success message with code');
                        clearTimeout(timeout);
                        window.removeEventListener('message', messageHandler);

                        try {
                            const { code } = event.data;
                            console.log('Exchanging code for token...');
                            
                            const tokenResponse = await fetch(`${API_URL}/api/auth/google-signin-callback`, {
                                method: 'POST',
                                headers: getHeaders(),
                                body: JSON.stringify({ code }),
                                credentials: 'include'
                            });

                            if (!tokenResponse.ok) {
                                throw new Error(`Token exchange failed: ${tokenResponse.status}`);
                            }

                            const data = await tokenResponse.json();
                            console.log('Token exchange successful');
                            popup.close();
                            resolve(data);
                        } catch (error) {
                            console.error('Token exchange error:', error);
                            popup.close();
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

            const encryptedResponse = await this.fetchWithRetry(`${API_URL}/api/user/data`, {
                method: 'GET',
                headers: getHeaders(token),
                credentials: 'include'
            });
            //console.log(encryptedResponse.data.status)
            if(encryptedResponse.data.status=='error'){
                throw new Error('Faild to fetch key')
            }

            const response = await security.decryptResponse_base64(encryptedResponse["data"]);

            // Ensure we have a valid photo_url
            if (response && !response.photo_url) {
                response.photo_url = ''; // Set empty string if no photo URL
            }
            return response;
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    },

    //get user assessments
    async fetchUserAssessments() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
    
            const encryptedResponse = await this.fetchWithRetry(`${API_URL}/api/assessment/user`, {
                method: 'GET',
                headers: getHeaders(token),
                credentials: 'include'
            });
            console.log(encryptedResponse)

            const response = await security.decryptResponse_base64(encryptedResponse["data"]);
    
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