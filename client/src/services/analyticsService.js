import api from './api.js';

const getAnalyticsData = async () => {
  const response = await api.get('/analytics');
  return response.data;
};

export { getAnalyticsData };
