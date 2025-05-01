import { useEffect, useState } from 'react';
import { API_BASE } from '../utils/apiBase';

export function useBackendStatus(pollInterval = 5000) {
  const [isBackendUp, setIsBackendUp] = useState<boolean>(false);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(`${API_BASE}/`, { method: 'GET' });
        if (!res.ok) throw new Error('Backend not OK');
        setIsBackendUp(true);
      } catch {
        setIsBackendUp(false);
      }
    };

    checkBackend(); // Check immediately on mount

    const interval = setInterval(checkBackend, pollInterval); // Check every X seconds
    return () => clearInterval(interval);
  }, [pollInterval]);

  return isBackendUp;
}
