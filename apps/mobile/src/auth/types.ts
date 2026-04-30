import type { Session, User } from '@supabase/supabase-js';

export type MobileAuthStatus =
  | 'loading'
  | 'signed_out'
  | 'signed_in'
  | 'config_missing';

export type MobileAuthState =
  | {
      status: 'loading';
      session: null;
      user: null;
    }
  | {
      status: 'signed_out' | 'config_missing';
      session: null;
      user: null;
    }
  | {
      status: 'signed_in';
      session: Session;
      user: User;
    };

export type MagicLinkRequestResult =
  | {
      status: 'sent';
      email: string;
      redirectTo: string;
    }
  | {
      status: 'error';
      message: string;
    };
