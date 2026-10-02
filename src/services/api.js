import axios from "axios";

const API = axios.create({
  baseURL: "https://portfolio-backend-rz1n.onrender.com/api",
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

export const getBlogs = () => API.get("/blogs");
export const createBlog = (data) => API.post("/blogs", data);
export const updateBlog = (id, data) => API.put(`/blogs/${id}`, data);
export const deleteBlog = (id) => API.delete(`/blogs/${id}`);

export const getExperience = () => API.get("/experience");
export const createExperience = (data) => API.post("/experience", data);
export const updateExperience = (id, data) => API.put(`/experience/${id}`, data);
export const deleteExperience = (id) => API.delete(`/experience/${id}`);

export const getMessages = () => API.get("/messages");
export const updateMessage = (id, data) => API.put(`/messages/${id}`, data);
export const deleteMessage = (id) => API.delete(`/messages/${id}`);

export const getMedia = () => API.get("/media");
export const uploadMediaFile = (formData, onUploadProgress) =>
  API.post("/media/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });

export const replaceMediaFile = (id, formData, onUploadProgress) =>
  API.put(`/media/${id}/replace`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });

export const deleteMedia = (id) => API.delete(`/media/${id}`);

export default API;