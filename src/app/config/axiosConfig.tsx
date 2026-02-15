import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 300000, // 5 минут — видео upload удаан байж болно
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// axiosInstance.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     const token = localStorage.getItem('access_token');
    
//     if (token && config.headers) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
    
//     return config;
//   },
//   (error: AxiosError) => {
//     return Promise.reject(error);
//   }
// );

// axiosInstance.interceptors.response.use(
//   (response: AxiosResponse) => {
//     return response;
//   },
//   async (error: AxiosError) => {
//     const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const refreshToken = localStorage.getItem('refresh_token');
        
//         if (refreshToken) {
//           const response = await axios.post(`${BASE_URL}/token/refresh/`, {
//             refresh: refreshToken,
//           });

//           const { access } = response.data;
//           localStorage.setItem('access_token', access);

//           if (originalRequest.headers) {
//             originalRequest.headers.Authorization = `Bearer ${access}`;
//           }
//           return axiosInstance(originalRequest);
//         }
//       } catch (refreshError) {
//         localStorage.removeItem('access_token');
//         localStorage.removeItem('refresh_token');
//         window.location.href = '/login';
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

export default axiosInstance;