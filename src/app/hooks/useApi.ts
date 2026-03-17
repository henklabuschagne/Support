import { useState, useCallback } from 'react';
import type { ApiResult } from '../lib/api';

/**
 * Hook for async data fetching with loading/error tracking.
 */
export function useApiCall<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (apiFn: () => Promise<ApiResult<T>>) => {
    setLoading(true);
    setError(null);
    const result = await apiFn();
    setLoading(false);
    if (result.success) {
      setData(result.data);
    } else {
      setError(result.error.message);
    }
    return result;
  }, []);

  return { data, loading, error, execute };
}

/**
 * Hook for async mutations with loading/error tracking.
 */
export function useApiMutation<TInput, TOutput>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (
    apiFn: (input: TInput) => Promise<ApiResult<TOutput>>,
    input: TInput
  ) => {
    setLoading(true);
    setError(null);
    const result = await apiFn(input);
    setLoading(false);
    if (!result.success) {
      setError(result.error.message);
    }
    return result;
  }, []);

  return { loading, error, mutate };
}
