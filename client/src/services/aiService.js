import api from './api.js';

const getAiDashboardSummary = async (requestConfig = {}) => {
  const response = await api.get('/ai/dashboard-summary', requestConfig);
  return response.data;
};

const createAiStudyPlan = async (options = {}, requestConfig = {}) => {
  const response = await api.post('/ai/study-plan', options, requestConfig);
  return response.data;
};

const createAiRevisionPlan = async (options = {}, requestConfig = {}) => {
  const response = await api.post('/ai/revision-plan', options, requestConfig);
  return response.data;
};

const createAiProductivityTips = async (requestConfig = {}) => {
  const response = await api.post('/ai/productivity-tips', {}, requestConfig);
  return response.data;
};

export {
  createAiProductivityTips,
  createAiRevisionPlan,
  createAiStudyPlan,
  getAiDashboardSummary,
};
