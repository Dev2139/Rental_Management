import React, { createContext, useContext, ReactNode } from 'react';
import usePropertyStatus from '@/hooks/usePropertyStatus';

interface PropertyStatusContextType {
  getStatus: (propertyId: string) => 'available' | 'rented' | 'under_maintenance';
  setStatus: (propertyId: string, status: 'available' | 'rented' | 'under_maintenance') => void;
  clearStatus: (propertyId: string) => void;
  clearAllStatuses: () => void;
}

const PropertyStatusContext = createContext<PropertyStatusContextType | undefined>(undefined);

export const PropertyStatusProvider = ({ children }: { children: ReactNode }) => {
  const { getStatus, setStatus, clearStatus, clearAllStatuses } = usePropertyStatus();

  return (
    <PropertyStatusContext.Provider
      value={{
        getStatus,
        setStatus,
        clearStatus,
        clearAllStatuses,
      }}
    >
      {children}
    </PropertyStatusContext.Provider>
  );
};

export const usePropertyStatusContext = () => {
  const context = useContext(PropertyStatusContext);
  if (!context) {
    throw new Error('usePropertyStatusContext must be used within PropertyStatusProvider');
  }
  return context;
};

export default PropertyStatusContext;
