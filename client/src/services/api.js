import axios from "axios";
const baseURL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5005/api";
//const baseURL = "http://localhost:5005/api";
const instance = axios.create({
  baseURL: baseURL
});
console.log(baseURL);

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;