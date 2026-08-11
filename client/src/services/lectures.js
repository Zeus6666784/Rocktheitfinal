import api from './api';

export async function getLecture(id) {
  const { data } = await api.get(`/lectures/${id}`);
  return data.data;
}
