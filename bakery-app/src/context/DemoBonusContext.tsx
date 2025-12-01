import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DemoBonusContextType {
  demoBonusPoints: number;
  addDemoBonus: (points: number) => void;
  resetDemoBonus: () => void;
}

const DemoBonusContext = createContext<DemoBonusContextType | undefined>(undefined);

export function DemoBonusProvider({ children }: { children: ReactNode }) {
  const [demoBonusPoints, setDemoBonusPoints] = useState(0);

  const addDemoBonus = (points: number) => {
    setDemoBonusPoints(prev => prev + points);
  };

  const resetDemoBonus = () => {
    setDemoBonusPoints(0);
  };

  return (
    <DemoBonusContext.Provider value={{ demoBonusPoints, addDemoBonus, resetDemoBonus }}>
      {children}
    </DemoBonusContext.Provider>
  );
}

export const useDemoBonus = () => {
  const context = useContext(DemoBonusContext);
  if (!context) {
    throw new Error('useDemoBonus must be used within DemoBonusProvider');
  }
  return context;
};
