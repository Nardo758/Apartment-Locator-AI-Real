import { useState, useEffect } from 'react';
import { mockMarketData } from '../data/mockData';

export const useMarketData = () => {
  const [marketData, setMarketData] = useState(mockMarketData);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate market data updates
      setMarketData(prev => ({
        ...prev,
        occupancyRate: Math.round((94 + Math.random() * 2) * 10) / 10,
        daysOnMarket: Math.round(25 + Math.random() * 10)
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return marketData;
};