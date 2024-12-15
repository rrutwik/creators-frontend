import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { ChatSession } from '../interfaces';

const BASE_URL = 'http://localhost:3000';

export const getAccessToken = () => Cookies.get('session_token');
export const getRefreshToken = () => Cookies.get('refresh_token');
export const isAuthenticated = () => !!getAccessToken();
export const setAccessToken = (token: string) =>
    Cookies.set('session_token', token, { expires: 1 });
export const setRefreshToken = (token: string) =>
    Cookies.set('refresh_token', token, { expires: 1 });

const getAuthenticatedAxiosInstance = (): AxiosInstance => {
    const accessToken = getAccessToken();
    return axios.create({
        baseURL: BASE_URL,
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });
};

async function refreshAccessToken(): Promise<boolean> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');
    try {
        const response = await axios.post(`${BASE_URL}/auth/refresh_token`, { refreshToken });
        setAccessToken(response.data.data.sessionToken);
        setRefreshToken(response.data.data.refreshToken);
        return checkAuthentication();
    } catch (error) {
        console.error('Error refreshing access token:', error);
        throw new Error('Session refresh failed');
    }
}

export const getUserDetails = async () => {
    try {
        const axiosInstance = getAuthenticatedAxiosInstance();
        const response = await axiosInstance.get('/auth/me');
        return response.data; // Assuming the user data is returned directly
    } catch (error) {
        console.error('Failed to fetch user details:', error);
        throw error;
    }
};

// Check current user authentication status using the /me endpoint
export const checkAuthentication = async (): Promise<boolean> => {
    try {
        await getUserDetails();
        return true;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            try {
                const response = await refreshAccessToken();
                return response;
            } catch (refreshError) {
                return false;
            }
        } else {
            throw error;
        }
    }
};

// Function to handle user logout
export const logout = async () => {
    try {
        const axiosInstance = getAuthenticatedAxiosInstance();
        await axiosInstance.post(`${BASE_URL}/auth/logout`);
        Cookies.remove('session_token');
        Cookies.remove('refresh_token');
    } catch (error) {
        console.error('Logout failed:', error);
        throw error;
    }
};

async function handleRequest<T>(requestFunc: () => Promise<AxiosResponse<T>>): Promise<T> {
    try {
        const response = await requestFunc();
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            // If the token is expired or invalid, try to refresh it
            await refreshAccessToken();
            const response = await requestFunc(); // Retry the original request with the new token
            return response.data;
        } else {
            throw error;
        }
    }
}

export const loginWithGoogle = (data: {}) => {
    return handleRequest(() => axios.post(`${BASE_URL}/auth/google_login`, data));
};

export const getPastChats = async (offset: number, limit: number) => {
    const data = await handleRequest(() =>
        getAuthenticatedAxiosInstance().get('/chat', { params: { offset, limit } })
    );
    return data.data;
};

export const getAvailableBots = () => {
    return {
        data: [{ uuid: 'gpt-chat', name: 'Gita GPT', createdAt: new Date() }],
    };
};

export const createOrder = (body: { amount: number }) => {
    return handleRequest(() =>
        getAuthenticatedAxiosInstance().post('/user/create_razorpay_order', body)
    );
};

export const getChat = (chatId: string) => {
    return handleRequest(() => getAuthenticatedAxiosInstance().get(`/chat/${chatId}`));
};

export const sendMessage = (message: string, chatUUID?: string) => {
    return handleRequest<{message: string, data: ChatSession}>(() =>
        getAuthenticatedAxiosInstance().post(`/chat/message`, { chat_id: chatUUID, message })
    );
};
export {}; // Ensure TypeScript recognizes this file as a module
