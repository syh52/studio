
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define available avatar styles
export const AVATAR_STYLES = [
  { value: 'pixel-art', label: '经典像素人' },
  { value: 'pixel-art-neutral', label: '中性像素人' },
  { value: 'bottts', label: '像素机器人' },
  { value: 'shapes', label: '抽象像素形状' },
  { value: 'identicon', label: '像素方块图案' },
  // Add more styles from DiceBear as needed, ensuring they are pixelated
];
export const DEFAULT_AVATAR_STYLE = 'pixel-art';

interface User {
  id: string;
  email: string;
  username: string;
  indexPoints: number;
  lastCheckIn: string | null; // YYYY-MM-DD
  avatarStyle: string; // Added field for avatar style
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
  updateAvatarStyle: (newStyle: string) => void; // Added function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data - in a real app, this would come from a backend
const MOCK_USERS: Record<string, Omit<User, 'id' | 'indexPoints' | 'lastCheckIn' | 'avatarStyle' > & {password: string}> = {
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
      // Ensure avatarStyle exists, provide default if not
      if (!parsedUser.avatarStyle) {
        parsedUser.avatarStyle = DEFAULT_AVATAR_STYLE;
      }
      setUser(parsedUser);
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
      // Attempt to load existing user data, or initialize new if not fully present
      const storedUserRaw = localStorage.getItem('aviationLexiconUser');
      let existingUserData: Partial<User> = {};
      if (storedUserRaw) {
          const tempUser = JSON.parse(storedUserRaw);
          if (tempUser.email === email) {
              existingUserData = tempUser;
          }
      }
      
      // Prioritize local storage for points, lastCheckIn, and avatarStyle if they exist for this email
      const points = parseInt(localStorage.getItem(`${email}_points`) || "0");
      const lastCheckIn = localStorage.getItem(`${email}_lastCheckIn`) || null;
      const avatarStyle = localStorage.getItem(`${email}_avatarStyle`) || existingUserData.avatarStyle || DEFAULT_AVATAR_STYLE;


      const loggedInUser: User = {
        id: existingUserData.id || Date.now().toString(), // simple id or existing
        email: mockUser.email,
        username: mockUser.username,
        indexPoints: points,
        lastCheckIn: lastCheckIn,
        avatarStyle: avatarStyle,
      };
      setUser(loggedInUser);
      updateLocalStorage(loggedInUser); // This will now save the full user object including avatarStyle
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
    // For new registrations, set up their initial data structure for local storage.
    // This data will be fully populated into the User object upon first login.
    localStorage.setItem(`${email}_points`, "0");
    localStorage.removeItem(`${email}_lastCheckIn`); // Ensure no old check-in data
    localStorage.setItem(`${email}_avatarStyle`, DEFAULT_AVATAR_STYLE); // Set default avatar style
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    if (user) { // Save current user's full state before logging out
        localStorage.setItem(`${user.email}_points`, user.indexPoints.toString());
        if(user.lastCheckIn) localStorage.setItem(`${user.email}_lastCheckIn`, user.lastCheckIn);
        localStorage.setItem(`${user.email}_avatarStyle`, user.avatarStyle);
    }
    setUser(null);
    updateLocalStorage(null); // Clears the 'aviationLexiconUser' item
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

  const updateAvatarStyle = (newStyle: string) => {
    if (!user) return;
    if (AVATAR_STYLES.find(style => style.value === newStyle)) {
      const updatedUser = { ...user, avatarStyle: newStyle };
      setUser(updatedUser);
      updateLocalStorage(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, dailyCheckIn, addPoints, updateAvatarStyle }}>
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
