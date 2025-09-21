'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { DataStructureType } from '@/types';

interface DataStructureContextType {
  currentDataStructure: DataStructureType;
  setCurrentDataStructure: (type: DataStructureType) => void;
}

const DataStructureContext = createContext<DataStructureContextType | undefined>(undefined);

interface DataStructureProviderProps {
  children: ReactNode;
  initialDataStructure?: DataStructureType;
}

const DataStructureProvider: React.FC<DataStructureProviderProps> = ({
  children,
  initialDataStructure = 'singly-linked-list',
}) => {
  const [currentDataStructure, setCurrentDataStructure] =
    React.useState<DataStructureType>(initialDataStructure);

  const value = {
    currentDataStructure,
    setCurrentDataStructure,
  };

  return <DataStructureContext.Provider value={value}>{children}</DataStructureContext.Provider>;
};

const useDataStructureContext = () => {
  const context = useContext(DataStructureContext);
  if (context === undefined) {
    throw new Error('useDataStructureContext must be used within a DataStructureProvider');
  }
  return context;
};

export { DataStructureProvider, useDataStructureContext };
