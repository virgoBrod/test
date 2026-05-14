"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface User {
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

interface Props {
  children: ReactNode;
}

// Hardcoded credentials - will be replaced with backend call
const HARDCODED_USER = {
  username: "Admin",
  password: "Admin123",
  role: "admin",
};

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("broadsecUser");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch {
        localStorage.removeItem("broadsecUser");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Check hardcoded credentials
    if (username === HARDCODED_USER.username && password === HARDCODED_USER.password) {
      const userData: User = {
        username: HARDCODED_USER.username,
        role: HARDCODED_USER.role,
      };
      setUser(userData);
      localStorage.setItem("broadsecUser", JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("broadsecUser");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}