import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function apiErrorMessage(error, fallback = 'Something went wrong.') {
  return error?.response?.data?.error || fallback;
}

export function apiFieldErrors(error) {
  return error?.response?.data?.details || {};
}
