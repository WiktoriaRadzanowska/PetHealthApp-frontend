import apiClient from './apiClient';

export const getUserProfile = (id: number) =>
  apiClient.get(`/api/users/${id}`);

export const updateProfile = (id: number, data: any) =>
  apiClient.put(`/api/users/${id}`, data);

export const changePassword = (id: number, currentPassword: string, newPassword: string) =>
  apiClient.put(`/api/users/${id}/password`, { currentPassword, newPassword });

export const updateNotifications = (id: number, pushEnabled: boolean, emailEnabled: boolean) =>
  apiClient.put(`/api/users/${id}/notifications`, { pushEnabled, emailEnabled });

export const deleteAccount = (id: number) =>
  apiClient.delete(`/api/users/${id}`);