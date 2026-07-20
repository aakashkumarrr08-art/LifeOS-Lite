import api from './api.js';

const registerUser = async (payload) => {
  const response = await api.post('/auth/register', payload);
  return response.data;
};

const loginUser = async (payload) => {
  const response = await api.post('/auth/login', payload);
  return response.data;
};

const getProfile = async (requestConfig = {}) => {
  const response = await api.get('/auth/profile', requestConfig);
  return response.data;
};

export { registerUser, loginUser, getProfile };
