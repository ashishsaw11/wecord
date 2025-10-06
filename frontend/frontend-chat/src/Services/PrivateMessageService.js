import axios from 'axios';
import { baseURL } from '../Config/AxiosHelper';

const API_URL = `${baseURL}/api/v1/messages`;

export const sendPrivateMessage = (stompClient, message) => {
    if (stompClient) {
        stompClient.send("/app/private", {}, JSON.stringify(message));
    }
};

export const getPrivateMessages = async (sender, receiver) => {
    try {
        const response = await axios.get(`${API_URL}/${sender}/${receiver}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching private messages:', error);
        throw error;
    }
};