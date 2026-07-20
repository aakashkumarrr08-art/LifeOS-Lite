import { useCallback, useEffect, useRef } from 'react';

function useRequestLifecycle() {
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const createRequestSignal = useCallback(() => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    return controller.signal;
  }, []);

  const isMounted = useCallback(() => isMountedRef.current, []);

  return {
    createRequestSignal,
    isMounted,
  };
}

export default useRequestLifecycle;
