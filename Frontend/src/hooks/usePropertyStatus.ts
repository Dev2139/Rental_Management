import { useState, useCallback, useEffect } from 'react';

// Default status for each property
const DEFAULT_STATUS = 'available';

interface PropertyStatus {
  [propertyId: string]: 'available' | 'rented' | 'under_maintenance';
}

const STORAGE_KEY = 'property_statuses';

export const usePropertyStatus = () => {
  const [statuses, setStatuses] = useState<PropertyStatus>(() => {
    // Load from localStorage on init
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load property statuses:', error);
      return {};
    }
  });

  // Save to localStorage whenever statuses change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
    } catch (error) {
      console.error('Failed to save property statuses:', error);
    }
  }, [statuses]);

  const getStatus = useCallback(
    (propertyId: string): 'available' | 'rented' | 'under_maintenance' => {
      return statuses[propertyId] || DEFAULT_STATUS;
    },
    [statuses]
  );

  const setStatus = useCallback(
    (propertyId: string, status: 'available' | 'rented' | 'under_maintenance') => {
      setStatuses((prev) => ({
        ...prev,
        [propertyId]: status,
      }));
    },
    []
  );

  const clearStatus = useCallback((propertyId: string) => {
    setStatuses((prev) => {
      const newStatuses = { ...prev };
      delete newStatuses[propertyId];
      return newStatuses;
    });
  }, []);

  const clearAllStatuses = useCallback(() => {
    setStatuses({});
  }, []);

  return {
    statuses,
    getStatus,
    setStatus,
    clearStatus,
    clearAllStatuses,
  };
};

export default usePropertyStatus;
