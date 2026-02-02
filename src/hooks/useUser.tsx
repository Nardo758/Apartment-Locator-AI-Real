import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { api, type AuthUser } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  name?: string | null;
  subscriptionTier?: string | null;
  subscriptionStatus?: string | null;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name?: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

const TOKEN_KEY = 'auth_token';

export const UserProvider = ({ children }: { children: ReactNode }): ReactNode => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        try {
          const { user: currentUser } = await api.getMe(token);
          setUser(currentUser);
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const { user: loggedInUser, token } = await api.signIn(email, password);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(loggedInUser);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const register = async (email: string, password: string, name?: string) => {
    const { user: newUser, token } = await api.signUp(email, password, name);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(newUser);
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated: !!user,
      login,
      logout,
      register
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    return {
      user: null,
      loading: true,
      isAuthenticated: false,
      login: async () => {},
      logout: () => {},
      register: async () => {},
    };
  }
  return context;
};
