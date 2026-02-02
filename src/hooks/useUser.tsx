import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name?: string;
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

export const UserProvider = ({ children }: { children: ReactNode }): ReactNode => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, _password: string) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name: email.split('@')[0],
    };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const register = async (email: string, _password: string, name?: string) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name: name || email.split('@')[0],
    };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
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
