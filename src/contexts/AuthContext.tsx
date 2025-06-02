
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Default style is now fixed, constants for selection are removed.
const FIXED_AVATAR_STYLE = 'pixel-art';

interface User {
  id: string;
  email: string;
  username: string;
  indexPoints: number;
  lastCheckIn: string | null; // YYYY-MM-DD
  // avatarStyle field is removed
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
  // updateAvatarStyle function is removed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
      const parsedUser = JSON.parse(storedUser);
      // avatarStyle is no longer part of the user object from storage in this simplified version
      delete parsedUser.avatarStyle; 
      setUser(parsedUser);
    }
    setIsLoading(false);
  }, []);

  const updateLocalStorage = (updatedUser: User | null) => {
    if (updatedUser) {
      // avatarStyle is no longer saved
      localStorage.setItem('aviationLexiconUser', JSON.stringify(updatedUser));
    } else {
      localStorage.removeItem('aviationLexiconUser');
    }
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockUser = MOCK_USERS[email];
    if (mockUser && mockUser.password === pass) {
      const storedUserRaw = localStorage.getItem('aviationLexiconUser');
      let existingUserData: Partial<User> = {};
      if (storedUserRaw) {
          const tempUser = JSON.parse(storedUserRaw);
          if (tempUser.email === email) {
              existingUserData = tempUser;
          }
      }
      
      const points = parseInt(localStorage.getItem(`${email}_points`) || "0");
      const lastCheckIn = localStorage.getItem(`${email}_lastCheckIn`) || null;
      // avatarStyle is no longer managed per user here

      const loggedInUser: User = {
        id: existingUserData.id || Date.now().toString(),
        email: mockUser.email,
        username: mockUser.username,
        indexPoints: points,
        lastCheckIn: lastCheckIn,
        // avatarStyle removed
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
      return false; 
    }
    MOCK_USERS[email] = { email, username, password: pass };
    localStorage.setItem(`${email}_points`, "0");
    localStorage.removeItem(`${email}_lastCheckIn`);
    // No avatarStyle to set here
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    if (user) { 
        localStorage.setItem(`${user.email}_points`, user.indexPoints.toString());
        if(user.lastCheckIn) localStorage.setItem(`${user.email}_lastCheckIn`, user.lastCheckIn);
        // No avatarStyle to save
    }
    setUser(null);
    updateLocalStorage(null); 
    router.push('/login');
  };
  
  const dailyCheckIn = () => {
    if (!user) return false;
    const today = new Date().toISOString().split('T')[0]; 
    if (user.lastCheckIn === today) {
      return false; 
    }
    const pointsEarned = 10; 
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

  // updateAvatarStyle function is removed

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

// AVATAR_STYLES and DEFAULT_AVATAR_STYLE constants are removed
export { FIXED_AVATAR_STYLE }; // Export the fixed style if needed elsewhere, though components will hardcode it now.
