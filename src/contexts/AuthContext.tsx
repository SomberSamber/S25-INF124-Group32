import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  userProfile: any | null;
  loading: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
            console.log('User profile loaded successfully');
          } else {
            console.log('No user profile found in Firestore');
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Don't fail authentication if profile fetch fails
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      // Create the Firebase Auth user
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Update the user's display name
      if (username) {
        await updateProfile(user, { displayName: username });
      }

      // Create user profile in Firestore
      const userProfile = {
        id: user.uid,
        email: user.email,
        username: username || '',
        avatarUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      try {
        await setDoc(doc(db, 'users', user.uid), userProfile);
        setUserProfile(userProfile);
        console.log('User profile created successfully in Firestore');
      } catch (firestoreError) {
        console.error('Error creating user profile in Firestore:', firestoreError);
        // Don't fail the entire registration if Firestore write fails
        // The user account is still created in Firebase Auth
      }

      // User is automatically signed in after createUserWithEmailAndPassword
      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { error: error.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      return { error: null };
    } catch (error: any) {
      console.error('Logout error:', error);
      return { error: error.message };
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    signUp,
    signIn,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 