import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { isMobileSupabaseConfigured, mobileSupabase } from './supabase';
import type { MobileAuthState } from './types';

type MobileAuthContextValue = {
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
  state: MobileAuthState;
};

const loadingState: MobileAuthState = {
  session: null,
  status: 'loading',
  user: null,
};

const signedOutState: MobileAuthState = {
  session: null,
  status: 'signed_out',
  user: null,
};

const configMissingState: MobileAuthState = {
  session: null,
  status: 'config_missing',
  user: null,
};

const MobileAuthContext = createContext<MobileAuthContextValue | null>(null);

export function MobileAuthSessionProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<MobileAuthState>(
    isMobileSupabaseConfigured() ? loadingState : configMissingState,
  );

  const refreshSession = useCallback(async () => {
    if (!mobileSupabase) {
      setState(configMissingState);
      return;
    }

    const { data } = await mobileSupabase.auth.getSession();
    const session = data.session;

    if (!session?.user) {
      setState(signedOutState);
      return;
    }

    setState({
      session,
      status: 'signed_in',
      user: session.user,
    });
  }, []);

  const signOut = useCallback(async () => {
    if (!mobileSupabase) {
      setState(configMissingState);
      return;
    }

    await mobileSupabase.auth.signOut({ scope: 'local' });
    setState(signedOutState);
  }, []);

  useEffect(() => {
    if (!mobileSupabase) {
      setState(configMissingState);
      return undefined;
    }

    void refreshSession();

    const { data } = mobileSupabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setState(signedOutState);
        return;
      }

      setState({
        session,
        status: 'signed_in',
        user: session.user,
      });
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [refreshSession]);

  const value = useMemo<MobileAuthContextValue>(
    () => ({
      refreshSession,
      signOut,
      state,
    }),
    [refreshSession, signOut, state],
  );

  return (
    <MobileAuthContext.Provider value={value}>
      {children}
    </MobileAuthContext.Provider>
  );
}

export function useMobileAuthSession(): MobileAuthContextValue {
  const context = useContext(MobileAuthContext);

  if (!context) {
    throw new Error('useMobileAuthSession must be used within MobileAuthSessionProvider');
  }

  return context;
}
