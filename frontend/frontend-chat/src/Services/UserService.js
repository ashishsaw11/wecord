import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1/users';

export const searchUsers = async (query) => {
    try {
        const response = await axios.get(`${API_URL}/search`, {
            params: { query }
        });
        return response.data;
    } catch (error) {
        console.error('Error searching users:', error);
        throw error;
    }
};