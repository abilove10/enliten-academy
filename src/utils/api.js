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

const SUBSCRIPTION_CACHE_KEY = 'cached_subscription_status';

// Clear cache on page reload
window.addEventListener('load', () => {
    localStorage.removeItem(USER_DATA_CACHE_KEY);
    localStorage.removeItem("cached_conversations");
});

export const fetchQuizQuestions = async (group, category, subcategory) => {
  const url = `${API_URL}/api/quiz/questions?group=${encodeURIComponent(group)}&category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch quiz questions');
  return await response.json();
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
            localStorage.removeItem(USER_DATA_CACHE_KEY);
            localStorage.removeItem('cached_assessments');
            localStorage.removeItem(SUBSCRIPTION_CACHE_KEY);

            const response = await fetch(`${API_URL}/api/auth/google-signin-url`);
            
            if (!response.ok) {
                throw new Error('Failed to get Google Sign In URL');
            }
            
            const { url } = await response.json();
            
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
                const timeout = setTimeout(() => {
                    window.removeEventListener('message', messageHandler);
                    popup.close();
                    reject(new Error('Sign in timed out. Please try again.'));
                }, 120000); // 2 minutes timeout

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

                            const data = response;
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

                window.addEventListener('message', messageHandler);
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

            const cachedData = localStorage.getItem(USER_DATA_CACHE_KEY);
            if (cachedData) {
                const { data, timestamp } = JSON.parse(cachedData);
                const now = new Date().getTime();
                
                if (now - timestamp < CACHE_EXPIRY_TIME) {
                    return await security.decryptResponse_base64(data);
                }
                localStorage.removeItem(USER_DATA_CACHE_KEY);
            }

            const encryptedResponse = await this.fetchWithRetry(`${API_URL}/api/user/data`, {
                method: 'GET',
                headers: getHeaders(token),
                credentials: 'include'
            });

            if (encryptedResponse.data.status === 'error') {
                throw new Error('Failed to fetch key');
            }

            const response = await security.decryptResponse_base64(encryptedResponse["data"]);

            if (response && !response.photo_url) {
                response.photo_url = '';
            }

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

    async forceRefreshUserData() {
        localStorage.removeItem(USER_DATA_CACHE_KEY);
        return this.fetchUserData();
    },

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
                
                if (now - timestamp < CACHE_EXPIRY_TIME) {
                    var temp = await security.decryptResponse_base64(data);
                    return temp.assessments;
                }
                localStorage.removeItem('cached_assessments');
            }

            const encryptedResponse = await this.fetchWithRetry(`${API_URL}/api/assessment/user`, {
                method: 'GET',
                headers: getHeaders(token),
                credentials: 'include'
            });

            const response = await security.decryptResponse_base64(encryptedResponse["data"]);
            localStorage.setItem('cached_assessments', JSON.stringify({
                data: encryptedResponse["data"],
                timestamp: new Date().getTime()
            }));
    
            if (!response || !response.assessments) {
                return [];
            }

            return response.assessments;
        } catch (error) {
            console.error('Error fetching user assessments:', error);
            throw error;
        }
    },
    
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

    async fetchNews(formattedDate) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const cacheKey = `news_cache_${formattedDate}`;
            const cachedData = localStorage.getItem(cacheKey);

            const response = await this.fetchWithRetry(`${API_URL}/api/news/${formattedDate}`, {
                method: 'GET',
                headers: getHeaders(token),
                credentials: 'include'
            });

            if (!response || !response.data) {
                throw new Error('Invalid response format');
            }
            const decryptedData = await security.decryptResponse_base64(response.data);
            
            localStorage.setItem(cacheKey, JSON.stringify({
                data: response.data,
                timestamp: new Date().getTime()
            }));

            return decryptedData;
        } catch (error) {
            console.error('Error fetching news:', error);
            throw error;
        }
    },

    async createSubscription() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await this.fetchWithRetry(`${API_URL}/api/subscription/create`, {
                method: 'POST',
                headers: getHeaders(token),
                credentials: 'include'
            });

            const decryptedResponse = await security.decryptResponse_base64(response.data);
            return decryptedResponse;
        } catch (error) {
            console.error('Error creating subscription:', error);
            throw error;
        }
    },

    async verifyPayment(paymentDetails) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await this.fetchWithRetry(`${API_URL}/api/subscription/verify-payment`, {
                method: 'POST',
                headers: getHeaders(token),
                credentials: 'include',
                body: JSON.stringify(paymentDetails)
            });

            if (!response.data) {
                throw new Error('Invalid response format');
            }

            const decryptedResponse = await security.decryptResponse_base64(response.data);
            return decryptedResponse;
        } catch (error) {
            console.error('Error verifying payment:', error);
            throw error;
        }
    },

    async fetchSubscriptionStatus() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const cachedData = localStorage.getItem(SUBSCRIPTION_CACHE_KEY);
            if (cachedData) {
                const { data, timestamp } = JSON.parse(cachedData);
                const now = new Date().getTime();
                
                if (now - timestamp < CACHE_EXPIRY_TIME) {
                    return await security.decryptResponse_base64(data);
                }
                localStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
            }

            const response = await this.fetchWithRetry(`${API_URL}/api/subscription/status`, {
                method: 'GET',
                headers: getHeaders(token),
                credentials: 'include'
            });

            const decryptedResponse = await security.decryptResponse_base64(response.data);
            
            localStorage.setItem(SUBSCRIPTION_CACHE_KEY, JSON.stringify({
                data: response.data,
                timestamp: new Date().getTime()
            }));

            return decryptedResponse;
        } catch (error) {
            console.error('Error fetching subscription status:', error);
            throw error;
        }
    },

    async checkPaymentStatus(paymentLinkId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await this.fetchWithRetry(`${API_URL}/api/subscription/check-payment`, {
                method: 'POST',
                headers: getHeaders(token),
                credentials: 'include',
                body: JSON.stringify({ payment_link_id: paymentLinkId })
            });

            const decryptedResponse = await security.decryptResponse_base64(response.data);
            return decryptedResponse;
        } catch (error) {
            console.error('Error checking payment status:', error);
            throw error;
        }
    },

    async getConversations() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const encryptedResponse = await this.fetchWithRetry(`${API_URL}/conversations`, {
                method: 'GET',
                headers: getHeaders(token),
                credentials: 'include'
            });

            const response = await security.decryptResponse_base64(encryptedResponse["data"]);
            return response;
        } catch (error) {
            console.error('Error fetching user assessments:', error);
            throw error;
        }
    },

    async getMessages(conversation_id) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const encryptedResponse = await this.fetchWithRetry(`${API_URL}/messages/${conversation_id}`, {
                method: 'GET',
                headers: getHeaders(token),
                credentials: 'include'
            });

            const response = await security.decryptResponse_base64(encryptedResponse["data"]);
            return response;
        } catch (error) {
            console.error('Error fetching user assessments:', error);
            throw error;
        }
    },

    async fetchQuizData(group, category, subcategory) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const encryptedResponse = await this.fetchWithRetry(`${API_URL}/api/quiz/Group${group}/${category}/${subcategory}`, {
                method: 'GET',
                headers: getHeaders(token),
                credentials: 'include'
            });

            if (!encryptedResponse || !encryptedResponse.data) {
                throw new Error('Invalid response format');
            }

            const response = await security.decryptResponse_base64(encryptedResponse.data);
            return response;
        } catch (error) {
            console.error('Error fetching quiz data:', error);
            throw error;
        }
    },

    async fetchQuizCategories(group) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const encryptedResponse = await this.fetchWithRetry(`${API_URL}/api/quiz/categories/Group${group}`, {
                method: 'GET',
                headers: getHeaders(token),
                credentials: 'include'
            });

            if (!encryptedResponse || !encryptedResponse.data) {
                throw new Error('Invalid response format');
            }

            const response = await security.decryptResponse_base64(encryptedResponse.data);
            return response;
        } catch (error) {
            console.error('Error fetching quiz categories:', error);
            throw error;
        }
    },
};