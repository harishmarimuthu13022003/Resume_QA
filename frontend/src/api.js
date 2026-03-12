import axios from "axios";

const API = "http://localhost:8000";

export const uploadResume = (file) => {
  const form = new FormData();
  form.append("file", file);

  return axios.post(`${API}/upload-resume`, form);
};

export const getResumes = () => {
  return axios.get(`${API}/resumes`);
};

export const deleteResume = (filename) => {
  return axios.delete(`${API}/resumes/${filename}`);
};

export const askQuestion = (question) => {
  return axios.post(`${API}/ask`, { question });
};
