import { useState, useEffect } from 'react';
import { getCMSByKey } from '../api/endpoints';

export function useCMS(key: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchCms = async () => {
      try {
        setLoading(true);
        const res = await getCMSByKey(key);
        if (mounted && res && res.isActive !== false) {
          setData(res.value);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Failed to fetch CMS block');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCms();
    return () => { mounted = false; };
  }, [key]);

  return { data, loading, error };
}
