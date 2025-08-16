// src/services/authService.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('token'); // get JWT from localStorage


const API = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true, // optional if your backend uses cookies
});


const config = {
    headers: {
        Authorization: `Bearer ${token}`,
    },
    withCredentials: true, // if backend uses cookies
};



// Helper to get token
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            Authorization: `Bearer ${token}`
        },
        withCredentials: true
    };
};

// ==================== Email Verification ====================
const sendVerificationLink = async () => {
    const token = localStorage.getItem('token'); // or sessionStorage or however you store it

    return await API.post(
        '/auth/send-verification-email', // correct endpoint
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};

export const verifyEmail = async (tokenOrOtp) => {
    const res = await axios.post(`${API_URL}/verify-email`, { code: tokenOrOtp }, getAuthHeaders());
    return res.data;
};

// ==================== Password Management ====================
export const changePassword = (oldPassword, newPassword) => {
    const token = localStorage.getItem('token'); // JWT if you have auth
    return axios.post(
        `${API_URL}/change-password`,
        { oldPassword, newPassword },
        {
            headers: {
                Authorization: `Bearer ${token}`, // optional if backend requires auth
            },
        }
    );
};

export const forgotPassword = async (email) => {
    const res = await axios.post(`${API_URL}/forgot-password`, { email });
    return res.data;
};

export const resetPassword = async (token, newPassword) => {
    const res = await axios.post(`${API_URL}/reset-password`, { token, newPassword });
    return res.data;
};

// ==================== Two Factor Auth ====================

export const enable2FA = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.post(`${API_URL}/enable-2fa`, {}, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const verify2FA = async (otp) => {
    const token = localStorage.getItem('token');
    const res = await axios.post(`${API_URL}/verify-2fa`, { otp }, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};


export const verifyTwoFactor = async (otp) => {
    const res = await axios.post(`${API_URL}/2fa/verify`, { otp }, getAuthHeaders());
    return res.data;
};

export const disableTwoFactor = async () => {
    const res = await axios.post(`${API_URL}/2fa/disable`, {}, getAuthHeaders());
    return res.data;
};

// ==================== Security & Sessions ====================
export const getSecurityLogs = async () => {
    const res = await axios.get(`${API_URL}/security-logs`, getAuthHeaders());
    if (!res.data.success) throw new Error("Failed to fetch logs");
    return res.data.data;
};


export const getActiveSessions = async () => {
    const res = await axios.get(`${API_URL}/active-sessions`, getAuthHeaders());
    return res.data;
};

export const logoutSession = async (sessionId) => {
    const res = await axios.post(`${API_URL}/sessions/logout`, { sessionId }, getAuthHeaders());
    return res.data;
};

export const logoutAllSessions = async () => {
    const res = await axios.post(`${API_URL}/sessions/logout-all`, {}, getAuthHeaders());
    return res.data;
};

export const updateEmail = (email) => axios.put(`${API_URL}/update-email`, { email }, config);

export const updateName = ({ firstName, lastName }) =>
    axios.put(`${API_URL}/update-name`, { firstName, lastName }, config);

export const uploadProfileImage = (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    return axios.put(`${API_URL}/upload-profile-image`, formData, {
        ...config,
        headers: { ...config.headers, 'Content-Type': 'multipart/form-data' },
    });
};

export const getUser = () => {
    const token = localStorage.getItem("token");

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    return axios.get(`${API_URL}/users/me`, config);
};


export default {
    sendVerificationLink,
    verifyEmail,
    changePassword,
    forgotPassword,
    resetPassword,
    enable2FA,
    verifyTwoFactor,
    disableTwoFactor,
    getSecurityLogs,
    getActiveSessions,
    logoutSession,
    logoutAllSessions,
    verify2FA,
    updateEmail,
    updateName,
    uploadProfileImage,
    getUser
};