import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthData {
  userId: number;
  email: string;
  firstName: string;
  token: string;
}

interface AuthContextType {
  auth: AuthData | null;
  login: (data: AuthData) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sprawdź czy token jest zapisany (auto-login)
    const loadAuth = async () => {
      try {
        const stored = await AsyncStorage.getItem('auth');
        if (stored) setAuth(JSON.parse(stored));
      } finally {
        setLoading(false);
      }
    };
    loadAuth();
  }, []);

  const login = async (data: AuthData) => {
    await AsyncStorage.setItem('auth', JSON.stringify(data));
    await AsyncStorage.setItem('token', data.token);
    setAuth(data);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('auth');
    await AsyncStorage.removeItem('token');
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);