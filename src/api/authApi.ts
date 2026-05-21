import apiClient from './apiClient';

export const loginApi = (email: string, password: string) =>
  apiClient.post('/api/auth/login', { email, password });

export const registerApi = (
  email: string, password: string,
  firstName: string, lastName: string
) =>
  apiClient.post('/api/auth/register', { email, password, firstName, lastName });