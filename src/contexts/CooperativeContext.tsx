import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cooperativeApi, Cooperative } from '@/services/api';
import { useAuth } from './AuthContext';

interface CooperativeContextType {
  selectedCooperative: Cooperative | null;
  setSelectedCooperative: (cooperative: Cooperative | null) => void;
  cooperatives: Cooperative[];
  isLoading: boolean;
  refreshCooperatives: () => Promise<void>;
}

const CooperativeContext = createContext<CooperativeContextType | undefined>(undefined);

export function CooperativeProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [selectedCooperative, setSelectedCooperative] = useState<Cooperative | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCooperatives = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const coops = await cooperativeApi.getAll();
      setCooperatives(coops);

      // Auto-select first cooperative if none selected
      if (coops.length > 0 && !selectedCooperative) {
        // Try to select user's cooperative first
        if (user.cooperativeId) {
          const userCoop = coops.find(c => c.id === user.cooperativeId);
          if (userCoop) {
            setSelectedCooperative(userCoop);
          } else {
            setSelectedCooperative(coops[0]);
          }
        } else {
          setSelectedCooperative(coops[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load cooperatives:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      refreshCooperatives();
    }
  }, [user, authLoading]);

  // Clear selection on logout
  useEffect(() => {
    if (!user) {
      setCooperatives([]);
      setSelectedCooperative(null);
    }
  }, [user]);

  return (
    <CooperativeContext.Provider
      value={{
        selectedCooperative,
        setSelectedCooperative,
        cooperatives,
        isLoading,
        refreshCooperatives,
      }}
    >
      {children}
    </CooperativeContext.Provider>
  );
}

export function useCooperative() {
  const context = useContext(CooperativeContext);
  if (context === undefined) {
    throw new Error('useCooperative must be used within a CooperativeProvider');
  }
  return context;
}
