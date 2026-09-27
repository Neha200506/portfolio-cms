import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getAbout = () => API.get("/about");
export const createAbout = (data) => API.post("/about", data);
export const updateAbout = (id, data) => API.put(`/about/${id}`, data);
export const deleteAbout = (id) => API.delete(`/about/${id}`);

export const getSkills = () => API.get("/skills");
export const createSkill = (data) => API.post("/skills", data);
export const updateSkill = (id, data) => API.put(`/skills/${id}`, data);
export const deleteSkill = (id) => API.delete(`/skills/${id}`);

export default API;

