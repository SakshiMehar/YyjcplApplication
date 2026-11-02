import { useEffect, useRef } from 'react';
import { clearPendingCompany, getPendingCompany } from '../../../services/secureStorage';
import { useAppSelector } from '../../../store/hooks';
import { useUpsertRecruiterProfileMutation } from '../api/recruiterApi';

/**
 * Sends the company name typed at sign-up to PUT /api/recruiter/profile once the
 * recruiter is logged in (registration itself returns no token). Runs once per
 * session; the saved name is cleared only after the API accepts it, so a failed
 * call is retried on the next login.
 */
export function useSyncPendingCompany() {
  const user = useAppSelector(s => s.auth.user);
  const token = useAppSelector(s => s.auth.token);
  const [upsertProfile] = useUpsertRecruiterProfileMutation();
  const done = useRef(false);

  useEffect(() => {
    if (!token || !user || done.current) {
      return;
    }
    done.current = true;

    (async () => {
      const pending = await getPendingCompany().catch(() => null);
      // only for the account that registered it on this device
      if (!pending || (user.phone && pending.mobile !== user.phone)) {
        return;
      }
      try {
        await upsertProfile({ companyName: pending.companyName }).unwrap();
        await clearPendingCompany();
      } catch {
        // keep it for the next login
      }
    })();
  }, [token, user, upsertProfile]);
}
