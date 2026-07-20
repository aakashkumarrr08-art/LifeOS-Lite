import api from './api.js';

const getTasks = async (requestConfig = {}) => {
  const response = await api.get('/tasks', requestConfig);
  return response.data;
};

const createTask = async (payload) => {
  const response = await api.post('/tasks', payload);
  return response.data;
};

const updateTask = async (taskId, payload) => {
  const response = await api.put(`/tasks/${taskId}`, payload);
  return response.data;
};

const deleteTask = async (taskId) => {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
};

export { getTasks, createTask, updateTask, deleteTask };
