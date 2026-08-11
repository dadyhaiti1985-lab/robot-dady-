import { useState, useEffect, useCallback, useRef } from 'react';
import { authApiFetch } from '@/lib/authApi';
import { toast } from 'sonner';

export const useAccountData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isCachedData, setIsCachedData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const cacheRef = useRef({ data: null, timestamp: 0 });
  const lastManualRefresh = useRef(0);

  const fetchData = useCallback(async (isManual = false) => {
    const now = Date.now();

    // Cache check before fetching - if cached data < 30s old, return
    if (!isManual && cacheRef.current.data && (now - cacheRef.current.timestamp < 30000)) {
      return;
    }

    // Debouncing manual refresh (minimum 5 seconds)
    if (isManual) {
      if (now - lastManualRefresh.current < 5000) {
        toast.info('Please wait a moment before refreshing again');
        return;
      }
      lastManualRefresh.current = now;
      setIsRefreshing(true);
    } else if (!cacheRef.current.data) {
      setLoading(true);
    }

    try {
      setError(null);
      // Single batch endpoint call
      const res = await authApiFetch('/bot/dashboard-data');

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch account data');
      }

      const responseData = await res.json();
      const newTimestamp = responseData.timestamp || now;
      
      cacheRef.current = {
        data: responseData,
        timestamp: newTimestamp
      };

      setData(responseData);
      setLastUpdated(new Date(newTimestamp));
      setIsCachedData(responseData.cached === true);

      if (isManual) {
        if (responseData.cached) {
          toast.warning('Rate limited - Using cached data');
        } else {
          toast.success('Account data updated successfully');
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      
      // Graceful fallback to cache on 429/Rate limit errors
      if (err.message.includes('Rate limited') && cacheRef.current.data) {
         setIsCachedData(true);
         if (isManual) {
           toast.warning('Rate limited - Using cached data');
         }
      } else {
         setError(err.message);
         if (isManual) toast.error('Error updating data');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // 30 seconds auto-refresh interval
    const interval = setInterval(() => fetchData(false), 30000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    balance: data?.balance || null,
    portfolio: data?.portfolio || [],
    transactions: data?.transactions || [],
    status: data?.status || null,
    loading,
    isRefreshing,
    error,
    lastUpdated,
    isCachedData,
    refetch: () => fetchData(true)
  };
};