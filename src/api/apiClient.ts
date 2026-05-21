import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ZMIEŃ na swój adres backendu (gdy uruchamiasz lokalnie):
// Android Emulator → 10.0.2.2 zastępuje localhost
// Urządzenie fizyczne → wpisz IP swojego komputera np. 192.168.1.10
const BASE_URL = 'http://10.0.2.2:5081';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Automatycznie dodaje token JWT do każdego zapytania
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;