
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  username: string;
  indexPoints: number;
  lastCheckIn: string | null; // YYYY-MM-DD
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (username: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  dailyCheckIn: () => boolean;
  addPoints: (points: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data - in a real app, this would come from a backend
const MOCK_USERS: Record<string, Omit<User, 'id' | 'indexPoints' | 'lastCheckIn' > & {password: string}> = {
  "user@example.com": { email: "user@example.com", username: "TestUser", password: "password123" },
  "wechat_user_placeholder@lexicon.app": { email: "wechat_user_placeholder@lexicon.app", username: "微信用户", password: "mock_wechat_password" },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('aviationLexiconUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const updateLocalStorage = (updatedUser: User | null) => {
    if (updatedUser) {
      localStorage.setItem('aviationLexiconUser', JSON.stringify(updatedUser));
    } else {
      localStorage.removeItem('aviationLexiconUser');
    }
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockUser = MOCK_USERS[email];
    if (mockUser && mockUser.password === pass) {
      const loggedInUser: User = {
        id: Date.now().toString(), // simple id
        email: mockUser.email,
        username: mockUser.username,
        indexPoints: user?.email === email ? user.indexPoints : (parseInt(localStorage.getItem(`${email}_points`) || "0")), // Persist points
        lastCheckIn: user?.email === email ? user.lastCheckIn : (localStorage.getItem(`${email}_lastCheckIn`) || null),
      };
      setUser(loggedInUser);
      updateLocalStorage(loggedInUser);
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const register = async (username: string, email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    if (MOCK_USERS[email]) {
      setIsLoading(false);
      return false; // User already exists
    }
    MOCK_USERS[email] = { email, username, password: pass };
    const newUser: User = {
      id: Date.now().toString(),
      email,
      username,
      indexPoints: 0,
      lastCheckIn: null,
    };
    // For new registrations, we don't set the user immediately,
    // but ensure their data is ready for first login.
    // setUser(newUser); // Removed: User should login after registration
    // updateLocalStorage(newUser); // Removed: User should login after registration
    localStorage.setItem(`${email}_points`, "0");
    localStorage.removeItem(`${email}_lastCheckIn`);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    if (user) { // Save current user's points before logging out
        localStorage.setItem(`${user.email}_points`, user.indexPoints.toString());
        if(user.lastCheckIn) localStorage.setItem(`${user.email}_lastCheckIn`, user.lastCheckIn);
    }
    setUser(null);
    updateLocalStorage(null);
    router.push('/login');
  };
  
  const dailyCheckIn = () => {
    if (!user) return false;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    if (user.lastCheckIn === today) {
      return false; // Already checked in today
    }
    const pointsEarned = 10; // Example points for daily check-in
    const updatedUser = { ...user, indexPoints: user.indexPoints + pointsEarned, lastCheckIn: today };
    setUser(updatedUser);
    updateLocalStorage(updatedUser);
    return true;
  };

  const addPoints = (points: number) => {
    if (!user) return;
    const updatedUser = { ...user, indexPoints: user.indexPoints + points };
    setUser(updatedUser);
    updateLocalStorage(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, dailyCheckIn, addPoints }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
