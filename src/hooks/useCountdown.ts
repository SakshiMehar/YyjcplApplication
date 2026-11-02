import { useCallback, useEffect, useState } from 'react';

/** Seconds countdown, e.g. for "Resend OTP (00:30)". */
export function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      return;
    }
    const id = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  const restart = useCallback(() => setRemaining(seconds), [seconds]);
  const label = `00:${String(Math.max(remaining, 0)).padStart(2, '0')}`;

  return { remaining, label, isDone: remaining <= 0, restart };
}
