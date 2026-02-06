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
  setUserType: (type: UserType) => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  googleLogin: (credential: string) => Promise<User>;
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
          // User type now comes from database
          setUser(currentUser);
          setUserTypeState(currentUser.userType || null);
          
          // Migrate localStorage userType to database if needed
          const storedUserType = userTypeStorage.get();
          if (storedUserType && !currentUser.userType) {
            try {
              await api.updateUserType(token, storedUserType);
              setUser({ ...currentUser, userType: storedUserType });
              setUserTypeState(storedUserType);
              userTypeStorage.clear(); // Clear after successful migration
            } catch (error) {
              console.error('Failed to migrate userType to database:', error);
            }
          }
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

  const setUserType = async (type: UserType) => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    // Update state immediately for responsive UI
    setUserTypeState(type);
    if (user) {
      setUser({ ...user, userType: type });
    }
    
    // If authenticated, persist to database
    if (token) {
      try {
        const { user: updatedUser } = await api.updateUserType(token, type);
        setUser((prevUser) => (prevUser ? { ...prevUser, ...updatedUser } : updatedUser));
        setUserTypeState(updatedUser.userType || type);
        userTypeStorage.clear(); // Clear localStorage after successful DB update
      } catch (error) {
        console.error('Failed to update userType in database:', error);
        // Fallback to localStorage if database update fails
        userTypeStorage.set(type);
      }
    } else {
      // If not authenticated, store in localStorage temporarily
      userTypeStorage.set(type);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    const { user: loggedInUser, token } = await api.signIn(email, password);
    localStorage.setItem(TOKEN_KEY, token);
    
    // Use userType from database
    setUser(loggedInUser);
    setUserTypeState(loggedInUser.userType || null);
    
    // Migrate localStorage userType to database if needed
    const storedUserType = userTypeStorage.get();
    if (storedUserType && !loggedInUser.userType) {
      try {
        await api.updateUserType(token, storedUserType);
        const updatedUser = { ...loggedInUser, userType: storedUserType };
        setUser(updatedUser);
        setUserTypeState(storedUserType);
        userTypeStorage.clear(); // Clear after successful migration
        return updatedUser;
      } catch (error) {
        console.error('Failed to migrate userType to database:', error);
      }
    }
    
    return loggedInUser;
  };

  const googleLogin = async (credential: string): Promise<User> => {
    const { user: googleUser, token } = await api.googleAuth(credential);
    localStorage.setItem(TOKEN_KEY, token);

    setUser(googleUser);
    setUserTypeState(googleUser.userType || null);

    // Migrate localStorage userType to database if needed
    const storedUserType = userTypeStorage.get();
    if (storedUserType && !googleUser.userType) {
      try {
        await api.updateUserType(token, storedUserType);
        const updatedUser = { ...googleUser, userType: storedUserType };
        setUser(updatedUser);
        setUserTypeState(storedUserType);
        userTypeStorage.clear();
        return updatedUser;
      } catch (error) {
        console.error('Failed to migrate userType to database:', error);
      }
    }

    return googleUser;
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
    
    // Use userType from database
    setUser(newUser);
    setUserTypeState(newUser.userType || null);
    
    // Migrate localStorage userType to database if set before registration
    const storedUserType = userTypeStorage.get();
    if (storedUserType && !newUser.userType) {
      try {
        await api.updateUserType(token, storedUserType);
        setUser({ ...newUser, userType: storedUserType });
        setUserTypeState(storedUserType);
        userTypeStorage.clear(); // Clear after successful migration
      } catch (error) {
        console.error('Failed to set userType in database:', error);
      }
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      userType,
      setUserType,
      login,
      googleLogin,
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
      setUserType: async () => {},
      login: async (): Promise<User> => { throw new Error('UserProvider not found'); },
      googleLogin: async (): Promise<User> => { throw new Error('UserProvider not found'); },
      logout: () => {},
      register: async () => {},
    };
  }
  return context;
};
