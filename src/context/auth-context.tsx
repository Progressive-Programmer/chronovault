"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { deriveMasterKey } from '@/lib/crypto';
import { createUserDocument, getUserDocument } from '@/lib/actions';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  masterKey: CryptoKey | null;
  loading: boolean;
  signIn: (p: any) => Promise<void>;
  signUp: (p: any) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to generate a new salt
function generateSalt(): string {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  let binary = '';
  salt.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
        setLoading(false);
        return; // Do not run auth listener if Firebase is not configured
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setMasterKey(null); // Clear key on logout
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const signIn = async ({ email, password }: any) => {
    if (!auth) throw new Error("Firebase is not configured. Please check your .env file.");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const loggedInUser = userCredential.user;
    if (!loggedInUser) throw new Error("Login failed, user not found.");

    const userDoc = await getUserDocument(loggedInUser.uid);
    if (!userDoc) throw new Error("Could not find user data. Please contact support.");
    
    const derivedKey = await deriveMasterKey(password, userDoc.salt);
    setMasterKey(derivedKey);
    setUser(loggedInUser);
  };

  const signUp = async ({ email, password }: any) => {
    if (!auth) throw new Error("Firebase is not configured. Please check your .env file.");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;
    if (!newUser) throw new Error("Sign up failed, user not created.");

    const salt = generateSalt();
    await createUserDocument(newUser.uid, email, salt);

    const derivedKey = await deriveMasterKey(password, salt);
    setMasterKey(derivedKey);
    setUser(newUser);
  };

  const signOut = async () => {
    if (!auth) throw new Error("Firebase is not configured. Please check your .env file.");
    await firebaseSignOut(auth);
    setUser(null);
    setMasterKey(null);
  };

  const value = {
    user,
    masterKey,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
