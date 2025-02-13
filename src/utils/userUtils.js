import { api } from './api';

export const createUserDocument = async (userData) => {
    try {
        const response = await api.fetchData('/api/user/create', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        return response;
    } catch (error) {
        console.error("Error creating user document:", error);
        throw error;
    }
}; 