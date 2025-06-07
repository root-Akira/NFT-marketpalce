import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWeb3 } from './Web3Context';
import toast from 'react-hot-toast';

export interface UserProfile {
  address: string;
  username?: string;
  bio?: string;
  avatar?: string;
  twitter?: string;
  instagram?: string;
  website?: string;
  joinedDate: number;
  totalItems: number;
  totalSales: number;
  totalVolume: string;
  verified?: boolean;
}



interface UserContextType {
  userProfile: UserProfile | null;
  isLoading: boolean;
  getUserProfile: (address: string) => Promise<UserProfile | null>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<boolean>;
}

const UserContext = createContext<UserContextType>({
  userProfile: null,
  isLoading: false,
  getUserProfile: async () => null,
  updateProfile: async () => false,
});

export const useUser = () => useContext(UserContext);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { account } = useWeb3();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [allProfiles, setAllProfiles] = useState<Map<string, UserProfile>>(new Map());

  // Initialize user profile from localStorage
  useEffect(() => {
    if (account) {
      loadUserProfile(account);
    } else {
      setUserProfile(null);
    }
  }, [account]);

  const loadUserProfile = async (address: string) => {
    try {
      const savedProfile = localStorage.getItem(`userProfile_${address.toLowerCase()}`);
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setUserProfile(profile);
        setAllProfiles(prev => new Map(prev.set(address.toLowerCase(), profile)));
      } else {        // Create default profile
        const defaultProfile: UserProfile = {
          address: address.toLowerCase(),
          joinedDate: Date.now(),
          totalItems: 0,
          totalSales: 0,
          totalVolume: '0',
        };
        setUserProfile(defaultProfile);
        setAllProfiles(prev => new Map(prev.set(address.toLowerCase(), defaultProfile)));
        localStorage.setItem(`userProfile_${address.toLowerCase()}`, JSON.stringify(defaultProfile));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const getUserProfile = async (address: string): Promise<UserProfile | null> => {
    const normalizedAddress = address.toLowerCase();
    
    // Check if we already have this profile in memory
    if (allProfiles.has(normalizedAddress)) {
      return allProfiles.get(normalizedAddress) || null;
    }

    try {
      const savedProfile = localStorage.getItem(`userProfile_${normalizedAddress}`);
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setAllProfiles(prev => new Map(prev.set(normalizedAddress, profile)));
        return profile;
      }
        // Create minimal profile if doesn't exist
      const minimalProfile: UserProfile = {
        address: normalizedAddress,
        joinedDate: Date.now(),
        totalItems: 0,
        totalSales: 0,
        totalVolume: '0',
      };
      
      setAllProfiles(prev => new Map(prev.set(normalizedAddress, minimalProfile)));
      return minimalProfile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  };

  const updateProfile = async (profileUpdate: Partial<UserProfile>): Promise<boolean> => {
    if (!account || !userProfile) {
      toast.error('Please connect your wallet first');
      return false;
    }

    try {
      setIsLoading(true);
      const updatedProfile = { ...userProfile, ...profileUpdate };
      setUserProfile(updatedProfile);
      setAllProfiles(prev => new Map(prev.set(account.toLowerCase(), updatedProfile)));
      localStorage.setItem(`userProfile_${account.toLowerCase()}`, JSON.stringify(updatedProfile));
      
      toast.success('Profile updated successfully!');
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      return false;
    } finally {
      setIsLoading(false);
    }  };

  const value = {
    userProfile,
    isLoading,
    getUserProfile,
    updateProfile,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
