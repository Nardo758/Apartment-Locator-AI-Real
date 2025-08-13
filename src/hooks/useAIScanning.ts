import { useState, useEffect } from 'react';

export const useAIScanning = () => {
  const [propertiesScanned, setPropertiesScanned] = useState(595);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setPropertiesScanned(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return { propertiesScanned, isScanning };
};