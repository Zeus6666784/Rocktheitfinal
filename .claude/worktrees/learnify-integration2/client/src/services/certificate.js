import api from './api';

export async function getCertificate(courseId) {
  const { data } = await api.get(`/certificate/${courseId}`);
  return data;
}
