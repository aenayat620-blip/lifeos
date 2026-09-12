import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Profile } from '../types';
import {
  initDB, findUserByEmail, createUser, setSession, getSession, clearSession,
  simpleHash, generateId, getItem, putItem, seedSampleData
} from '../db';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  completeOnboarding: (data: Partial<Profile>, withSample?: boolean) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    try {
      await initDB();
      const session = await getSession();
      if (session) {
        const u = await getItem<User>('users', session.userId);
        if (u) {
          setUser(u);
          const p = await getItem<Profile>('profiles', session.userId);
          setProfile(p || null);
        } else {
          await clearSession();
        }
      }
    } catch (e) {
      console.error('Session load error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = async (email: string, password: string) => {
    try {
      const existing = await findUserByEmail(email);
      if (!existing || existing.passwordHash !== simpleHash(password)) {
        return { ok: false, error: 'ایمیل یا رمز عبور اشتباه است' };
      }
      await setSession(existing.id, generateId());
      setUser(existing);
      const p = await getItem<Profile>('profiles', existing.id);
      setProfile(p || null);
      return { ok: true };
    } catch {
      return { ok: false, error: 'خطا در ورود. دوباره تلاش کنید.' };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const existing = await findUserByEmail(email);
      if (existing) return { ok: false, error: 'این ایمیل قبلاً ثبت شده است' };
      if (password.length < 6) return { ok: false, error: 'رمز عبور باید حداقل ۶ کاراکتر باشد' };
      const id = generateId();
      const newUser: User = {
        id,
        email: email.toLowerCase(),
        name,
        passwordHash: simpleHash(password),
        createdAt: new Date().toISOString(),
        onboardingCompleted: false,
      };
      await createUser(newUser);
      const defaultProfile: Profile = {
        userId: id,
        name,
        units: 'metric',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        updatedAt: new Date().toISOString(),
      };
      await putItem('profiles', { ...defaultProfile, id });
      await setSession(id, generateId());
      setUser(newUser);
      setProfile(defaultProfile);
      return { ok: true };
    } catch {
      return { ok: false, error: 'خطا در ثبت‌نام. دوباره تلاش کنید.' };
    }
  };

  const logout = async () => {
    await clearSession();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return;
    const updated: Profile = {
      ...(profile || { userId: user.id, name: user.name, units: 'metric', timezone: 'Asia/Tehran', updatedAt: '' }),
      ...data,
      userId: user.id,
      updatedAt: new Date().toISOString(),
    };
    await putItem('profiles', { ...updated, id: user.id });
    setProfile(updated);
  };

  const completeOnboarding = async (data: Partial<Profile>, withSample = false) => {
    if (!user) return;
    await updateProfile(data);
    const updatedUser = { ...user, onboardingCompleted: true };
    await putItem('users', updatedUser);
    setUser(updatedUser);
    if (withSample) {
      await seedSampleData(user.id);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    const p = await getItem<Profile>('profiles', user.id);
    setProfile(p || null);
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading, login, signup, logout, updateProfile, completeOnboarding, refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
