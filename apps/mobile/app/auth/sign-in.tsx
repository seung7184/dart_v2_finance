import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { requestMobileMagicLink } from '@/src/auth/supabase';
import { useMobileAuthSession } from '@/src/auth/session-provider';
import { mobileColors, mobileRadius } from '@/src/theme';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function MobileSignInScreen() {
  const { state } = useMobileAuthSession();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const normalizedEmail = email.trim().toLowerCase();
  const isConfigured = state.status !== 'config_missing';
  const canSubmit = isConfigured && isValidEmail(normalizedEmail) && !isSubmitting;

  async function handleRequestLink() {
    if (!canSubmit) {
      return;
    }

    setMessage(null);
    setIsSubmitting(true);
    const result = await requestMobileMagicLink(normalizedEmail);
    setIsSubmitting(false);

    if (result.status === 'error') {
      setMessage(result.message);
      return;
    }

    setMessage(`Magic link sent to ${result.email}. Open it on this device to continue.`);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Dart Finance</Text>
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>
              Use the same Supabase account as the web app. Mobile keeps the session in secure
              device storage.
            </Text>
          </View>

          <View style={styles.panel}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              editable={!isSubmitting}
              inputMode="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={mobileColors.textFaint}
              style={styles.input}
              value={email}
            />

            <Pressable
              disabled={!canSubmit}
              onPress={handleRequestLink}
              style={[styles.button, !canSubmit ? styles.buttonDisabled : undefined]}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Sending link' : 'Send magic link'}
              </Text>
            </Pressable>

            {state.status === 'config_missing' ? (
              <Text style={styles.warning}>
                Mobile Supabase env vars are missing. Add public URL and anon key placeholders to
                your local Expo environment before testing sign-in.
              </Text>
            ) : null}

            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: mobileColors.background,
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    gap: 10,
    marginBottom: 22,
  },
  eyebrow: {
    color: mobileColors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: mobileColors.text,
    fontSize: 34,
    fontWeight: '700',
  },
  subtitle: {
    color: mobileColors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  panel: {
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderRadius: mobileRadius.card,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  label: {
    color: mobileColors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: mobileColors.surfaceHover,
    borderColor: mobileColors.border,
    borderRadius: mobileRadius.button,
    borderWidth: 1,
    color: mobileColors.text,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  button: {
    alignItems: 'center',
    backgroundColor: mobileColors.accent,
    borderRadius: mobileRadius.button,
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: mobileColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  message: {
    color: mobileColors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  warning: {
    color: mobileColors.warning,
    fontSize: 13,
    lineHeight: 19,
  },
});
