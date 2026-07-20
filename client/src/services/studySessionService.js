import api from './api.js';

const getStudySessions = async (requestConfig = {}) => {
  const response = await api.get('/study-sessions', requestConfig);
  return response.data;
};

const createStudySession = async (payload) => {
  const response = await api.post('/study-sessions', payload);
  return response.data;
};

const updateStudySession = async (studySessionId, payload) => {
  const response = await api.put(`/study-sessions/${studySessionId}`, payload);
  return response.data;
};

const deleteStudySession = async (studySessionId) => {
  const response = await api.delete(`/study-sessions/${studySessionId}`);
  return response.data;
};

export { getStudySessions, createStudySession, updateStudySession, deleteStudySession };
