export function buildSupabaseOtpPayload(email: string, callbackUrl: string) {
  return {
    create_user: true,
    email,
    options: {
      email_redirect_to: callbackUrl,
    },
  };
}

type SupabaseAuthStartError = {
  error: string;
  status: number;
};

export async function parseSupabaseAuthStartError(
  response: Response,
): Promise<SupabaseAuthStartError> {
  const fallback = {
    error: 'SUPABASE_AUTH_START_FAILED',
    status: response.status || 502,
  };

  try {
    const payload = (await response.json()) as {
      error_code?: unknown;
      msg?: unknown;
    };

    if (typeof payload.error_code === 'string' && payload.error_code.trim().length > 0) {
      return {
        error: payload.error_code,
        status: response.status,
      };
    }

    if (typeof payload.msg === 'string' && payload.msg.trim().length > 0) {
      return {
        error: payload.msg,
        status: response.status,
      };
    }
  } catch {
    return fallback;
  }

  return fallback;
}
