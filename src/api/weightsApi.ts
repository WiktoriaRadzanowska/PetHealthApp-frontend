import apiClient from './apiClient';

export const getWeightHistory = (petId: number, range?: string) =>
  apiClient.get(`/api/weight/pet/${petId}`, { params: { range } });

export const addWeight = (petId: number, weightKg: number, measuredAt: string) =>
  apiClient.post('/api/weight', { petId, weightKg, measuredAt });