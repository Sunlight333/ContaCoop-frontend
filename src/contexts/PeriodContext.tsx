import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Period {
  year: number;
  month: number;
}

interface PeriodContextType {
  selectedPeriod: Period;
  setSelectedPeriod: (period: Period) => void;
  formatPeriod: (period?: Period) => string;
  availablePeriods: Period[];
}

const PeriodContext = createContext<PeriodContextType | undefined>(undefined);

// Generate available periods (last 24 months)
const generateAvailablePeriods = (): Period[] => {
  const periods: Period[] = [];
  const now = new Date();
  
  for (let i = 0; i < 24; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    periods.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    });
  }
  
  return periods;
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function PeriodProvider({ children }: { children: ReactNode }) {
  const availablePeriods = generateAvailablePeriods();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>(availablePeriods[0]);

  const formatPeriod = (period?: Period) => {
    const p = period || selectedPeriod;
    return `${monthNames[p.month - 1]} ${p.year}`;
  };

  return (
    <PeriodContext.Provider 
      value={{ 
        selectedPeriod, 
        setSelectedPeriod, 
        formatPeriod,
        availablePeriods,
      }}
    >
      {children}
    </PeriodContext.Provider>
  );
}

export function usePeriod() {
  const context = useContext(PeriodContext);
  if (context === undefined) {
    throw new Error('usePeriod must be used within a PeriodProvider');
  }
  return context;
}
