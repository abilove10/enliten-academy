export const getEnvVar = (key) => {
    const value = process.env[`REACT_APP_${key}`];
    if (!value) {
        console.warn(`Environment variable REACT_APP_${key} is not set`);
        return '';
    }
    return value;
};

export const config = {
    apiUrl: getEnvVar('API_URL'),
    rsaPublicKey: getEnvVar('RSA_PUBLIC_KEY'),
}; 