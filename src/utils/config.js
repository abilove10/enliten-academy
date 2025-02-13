const isDevelopment = import.meta.env.MODE === 'development';

export const config = {
    API_URL: isDevelopment 
        ? 'http://localhost:5000'
        : 'https://api.enliten.org.in',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
}; 