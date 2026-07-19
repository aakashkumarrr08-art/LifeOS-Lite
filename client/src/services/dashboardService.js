import api from './api.js';

const getDashboardData = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

export { getDashboardData };

