import apiClient from './apiClient';

export const getUserPets = (userId: number) =>
  apiClient.get(`/api/pets/user/${userId}`);

export const getPetById = (id: number) =>
  apiClient.get(`/api/pets/${id}`);

export const getDashboard = (petId: number) =>
  apiClient.get(`/api/pets/${petId}/dashboard`);

export const createPet = (formData: FormData) =>
  apiClient.post('/api/pets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updatePet = (id: number, formData: FormData) =>
  apiClient.put(`/api/pets/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deletePet = (id: number) =>
  apiClient.delete(`/api/pets/${id}`);