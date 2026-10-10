"use client";
import { useEffect, useState } from 'react';
export function useCustomerSession() {
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    fetch('/api/customer/session', { cache: 'no-store' }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to check your sign-in.');
      if (active) setSession(data);
    }).catch(error => { if (active) setError(error.message); });
    return () => { active = false; };
  }, []);
  return { session, error, setSession };
}
