import api from './api.js';

const getDashboardData = async (requestConfig = {}) => {
  const response = await api.get('/dashboard', requestConfig);
  return response.data;
};

export { getDashboardData };
