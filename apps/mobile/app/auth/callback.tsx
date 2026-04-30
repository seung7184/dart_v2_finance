import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useMobileAuthSession } from '@/src/auth/session-provider';
import { mobileSupabase } from '@/src/auth/supabase';
import { mobileColors } from '@/src/theme';

type CallbackStatus = 'loading' | 'error';

function getSingleParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export default function MobileAuthCallbackScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { refreshSession } = useMobileAuthSession();
  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [message, setMessage] = useState('Completing sign-in');

  useEffect(() => {
    async function completeSignIn() {
      if (!mobileSupabase) {
        setStatus('error');
        setMessage('Mobile Supabase auth is not configured.');
        return;
      }

      const callbackError =
        getSingleParam(params.error_description) ??
        getSingleParam(params.error) ??
        getSingleParam(params.error_code);
      if (callbackError) {
        setStatus('error');
        setMessage(callbackError);
        return;
      }

      const code = getSingleParam(params.code);
      if (!code) {
        setStatus('error');
        setMessage('The sign-in link did not include a valid auth code.');
        return;
      }

      const { error } = await mobileSupabase.auth.exchangeCodeForSession(code);
      if (error) {
        setStatus('error');
        setMessage(error.message);
        return;
      }

      await refreshSession();
      router.replace('/(tabs)');
    }

    void completeSignIn();
  }, [params.code, refreshSession, router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        {status === 'loading' ? <ActivityIndicator color={mobileColors.safe} /> : null}
        <Text style={[styles.message, status === 'error' ? styles.error : undefined]}>
          {message}
        </Text>
        {status === 'error' ? (
          <Pressable onPress={() => router.replace('/auth/sign-in')} style={styles.button}>
            <Text style={styles.buttonText}>Back to sign in</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: mobileColors.background,
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    gap: 14,
    justifyContent: 'center',
    padding: 24,
  },
  message: {
    color: mobileColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  error: {
    color: mobileColors.warning,
  },
  button: {
    alignItems: 'center',
    backgroundColor: mobileColors.accent,
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 18,
  },
  buttonText: {
    color: mobileColors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
