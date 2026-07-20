import api from './api.js';

const getAttendanceRecords = async () => {
  const response = await api.get('/attendance');
  return response.data;
};

const createAttendance = async (payload) => {
  const response = await api.post('/attendance', payload);
  return response.data;
};

const updateAttendance = async (attendanceId, payload) => {
  const response = await api.put(`/attendance/${attendanceId}`, payload);
  return response.data;
};

const deleteAttendance = async (attendanceId) => {
  const response = await api.delete(`/attendance/${attendanceId}`);
  return response.data;
};

export { getAttendanceRecords, createAttendance, updateAttendance, deleteAttendance };
