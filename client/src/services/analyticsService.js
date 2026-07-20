import api from './api.js';

const getAnalyticsData = async (requestConfig = {}) => {
  const response = await api.get('/analytics', requestConfig);
  return response.data;
};

export { getAnalyticsData };
