import { useState, useCallback } from "react";

export function useCamera() {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      setIsActive(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Camera access denied");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
    setError(null);
  }, []);

  return { isActive, isLoading, error, start, stop };
}
