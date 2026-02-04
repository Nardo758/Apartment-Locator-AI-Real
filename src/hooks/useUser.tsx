import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { api, type AuthUser } from '@/lib/api';
import type { UserType } from '@/components/routing/ProtectedRoute';
import { userTypeStorage } from '@/utils/authRouter';

export interface User {
  id: string;
  email: string;
  name?: string | null;
  subscriptionTier?: string | null;
  subscriptionStatus?: string | null;
  userType?: UserType | null;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  userType: UserType | null;
  setUserType: (type: UserType) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name?: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

const TOKEN_KEY = 'auth_token';

export const UserProvider = ({ children }: { children: ReactNode }): ReactNode => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserTypeState] = useState<UserType | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        try {
          const { user: currentUser } = await api.getMe(token);
          // Get userType from localStorage (TODO: will come from backend in future)
          const storedUserType = userTypeStorage.get();
          setUser({ ...currentUser, userType: storedUserType });
          setUserTypeState(storedUserType);
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
          setUserTypeState(null);
        }
      } else {
        // No token, but check if there's a stored user type (for unauthenticated state)
        const storedUserType = userTypeStorage.get();
        setUserTypeState(storedUserType);
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const setUserType = (type: UserType) => {
    userTypeStorage.set(type);
    setUserTypeState(type);
    if (user) {
      setUser({ ...user, userType: type });
    }
  };

  const login = async (email: string, password: string) => {
    const { user: loggedInUser, token } = await api.signIn(email, password);
    localStorage.setItem(TOKEN_KEY, token);
    const storedUserType = userTypeStorage.get();
    setUser({ ...loggedInUser, userType: storedUserType });
    setUserTypeState(storedUserType);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    userTypeStorage.clear();
    setUser(null);
    setUserTypeState(null);
  };

  const register = async (email: string, password: string, name?: string) => {
    const { user: newUser, token } = await api.signUp(email, password, name);
    localStorage.setItem(TOKEN_KEY, token);
    const storedUserType = userTypeStorage.get();
    setUser({ ...newUser, userType: storedUserType });
    setUserTypeState(storedUserType);
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated: !!user,
      userType,
      setUserType,
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
      userType: null,
      setUserType: () => {},
      login: async () => {},
      logout: () => {},
      register: async () => {},
    };
  }
  return context;
};
