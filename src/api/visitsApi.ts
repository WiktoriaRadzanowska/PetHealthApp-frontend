import apiClient from './apiClient';

export interface VisitFilter {
  visitType?: string;
  costMin?: number;
  costMax?: number;
  hasAttachments?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export const getPetVisits = (petId: number, filter?: VisitFilter) =>
  apiClient.get(`/api/visits/pet/${petId}`, { params: filter });

export const getVisitById = (id: number) =>
  apiClient.get(`/api/visits/${id}`);

export const createVisit = (formData: FormData) =>
  apiClient.post('/api/visits', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateVisit = (id: number, data: any) =>
  apiClient.put(`/api/visits/${id}`, data);

export const deleteVisit = (id: number) =>
  apiClient.delete(`/api/visits/${id}`);