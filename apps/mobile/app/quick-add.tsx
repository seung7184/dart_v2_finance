import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatEUR } from '@dart/core';

import { fetchMobileCategories, type MobileCategoryOption } from '@/src/api/categories';
import { postMobileManualTransaction } from '@/src/api/transactions';
import { useMobileAuthSession } from '@/src/auth/session-provider';
import { mobileColors, mobileRadius } from '@/src/theme';
import {
  appendDigit,
  buildQuickAddPayload,
  digitsToAmountCents,
  FALLBACK_CATEGORIES,
  isValidAmountCents,
  removeLastDigit,
  resolveCategoryId,
} from '@/src/transactions/quick-add';

type SaveState =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'success'; amountCents: number }
  | { kind: 'error'; message: string };

export default function QuickAddScreen() {
  const { state: authState } = useMobileAuthSession();

  const [amountDigits, setAmountDigits] = useState('');
  const [categories, setCategories] = useState<MobileCategoryOption[]>(FALLBACK_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<MobileCategoryOption>(
    FALLBACK_CATEGORIES[0]!,
  );
  const [saveState, setSaveState] = useState<SaveState>({ kind: 'idle' });

  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load table-backed categories; keep fallback list if unavailable
  useEffect(() => {
    if (authState.status !== 'signed_in') {
      return;
    }

    let cancelled = false;

    void fetchMobileCategories().then((result) => {
      if (cancelled) {
        return;
      }

      if (result.status === 'ok' && result.data.length > 0) {
        setCategories(result.data);
        setSelectedCategory(result.data[0]!);
      }
      // On failure keep FALLBACK_CATEGORIES — documented fallback behavior
    });

    return () => {
      cancelled = true;
    };
  }, [authState.status]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  const amountCents = digitsToAmountCents(amountDigits);
  const isSaving = saveState.kind === 'saving';
  const isSaveDisabled = !isValidAmountCents(amountCents) || isSaving || authState.status !== 'signed_in';

  const handleDigitPress = useCallback((digit: string) => {
    if (isSaving) {
      return;
    }
    setAmountDigits((current) => appendDigit(current, digit));
  }, [isSaving]);

  const handleBackspace = useCallback(() => {
    if (isSaving) {
      return;
    }
    setAmountDigits((current) => removeLastDigit(current));
  }, [isSaving]);

  const handleSave = useCallback(async () => {
    if (isSaveDisabled) {
      return;
    }

    if (authState.status !== 'signed_in') {
      setSaveState({ kind: 'error', message: 'You must be signed in to save an expense.' });
      return;
    }

    setSaveState({ kind: 'saving' });

    const categoryId = resolveCategoryId(selectedCategory);
    const payload = buildQuickAddPayload(amountCents, categoryId, '');
    const result = await postMobileManualTransaction(payload);

    if (result.status === 'auth_required') {
      setSaveState({ kind: 'error', message: 'Session expired. Please sign out and sign in again.' });
      return;
    }

    if (result.status === 'unavailable') {
      const message =
        result.message === 'NO_ACCOUNT_CONFIGURED'
          ? 'No account is set up yet. Add an account on the web app first.'
          : result.message === 'INVALID_AMOUNT'
            ? 'Amount is not valid.'
            : `Could not save: ${result.message}`;
      setSaveState({ kind: 'error', message });
      return;
    }

    const savedCents = amountCents;
    setSaveState({ kind: 'success', amountCents: savedCents });

    successTimerRef.current = setTimeout(() => {
      setAmountDigits('');
      setSelectedCategory(categories[0] ?? FALLBACK_CATEGORIES[0]!);
      setSaveState({ kind: 'idle' });
      router.back();
    }, 1_200);
  }, [isSaveDisabled, authState.status, selectedCategory, amountCents, categories]);

  const handleRetry = useCallback(() => {
    setSaveState({ kind: 'idle' });
  }, []);

  const isSignedOut = authState.status === 'signed_out' || authState.status === 'config_missing';

  return (
    <SafeAreaView style={styles.screen}>
      <Pressable onPress={() => router.back()} style={styles.backdrop} />

      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>Add Expense</Text>
          <Text style={styles.subtitle}>Today · Quick capture</Text>
        </View>

        {isSignedOut && (
          <View style={styles.authBanner}>
            <Text style={styles.authBannerText}>Sign in to save expenses.</Text>
          </View>
        )}

        <View style={styles.amountBlock}>
          <Text style={styles.currencyLabel}>EUR</Text>
          <Text style={styles.amountValue}>{formatEUR(amountCents)}</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryRow}
        >
          {categories.map((category) => {
            const isActive = category.id === selectedCategory.id && category.name === selectedCategory.name;

            return (
              <Pressable
                key={`${category.id}-${category.name}`}
                onPress={() => setSelectedCategory(category)}
                style={[styles.categoryChip, isActive ? styles.categoryChipActive : undefined]}
              >
                <Text
                  style={[styles.categoryChipText, isActive ? styles.categoryChipTextActive : undefined]}
                >
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.keypad}>
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['00', '0', '⌫'],
          ].map((row) => (
            <View key={row.join('-')} style={styles.keypadRow}>
              {row.map((key) => {
                const isBackspace = key === '⌫';

                return (
                  <Pressable
                    key={key}
                    onPress={() => (isBackspace ? handleBackspace() : handleDigitPress(key))}
                    style={[styles.key, isBackspace ? styles.keySecondary : undefined]}
                  >
                    <Text style={styles.keyText}>{key}</Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        {saveState.kind === 'error' && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{saveState.message}</Text>
            <Pressable onPress={handleRetry} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Try again</Text>
            </Pressable>
          </View>
        )}

        <Pressable
          onPress={() => void handleSave()}
          style={[
            styles.saveButton,
            isSaveDisabled ? styles.saveButtonDisabled : undefined,
            saveState.kind === 'success' ? styles.saveButtonSaved : undefined,
          ]}
          disabled={isSaveDisabled}
        >
          <Text style={styles.saveButtonText}>
            {saveState.kind === 'saving'
              ? 'Saving…'
              : saveState.kind === 'success'
                ? `Saved ${formatEUR(saveState.amountCents)}`
                : `Save ${formatEUR(amountCents)}`}
          </Text>
          <Text style={styles.saveButtonMeta}>
            {saveState.kind === 'saving' || saveState.kind === 'success'
              ? selectedCategory.name
              : 'Fast add for today'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: mobileColors.overlay,
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: mobileColors.background,
    borderColor: mobileColors.border,
    borderTopLeftRadius: mobileRadius.sheet,
    borderTopRightRadius: mobileRadius.sheet,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: mobileColors.border,
    borderRadius: mobileRadius.pill,
    height: 5,
    marginBottom: 18,
    width: 42,
  },
  header: {
    alignItems: 'center',
    gap: 4,
  },
  title: {
    color: mobileColors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: mobileColors.textMuted,
    fontSize: 14,
  },
  authBanner: {
    backgroundColor: mobileColors.surfaceHover,
    borderRadius: mobileRadius.card,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  authBannerText: {
    color: mobileColors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  amountBlock: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  currencyLabel: {
    color: mobileColors.textFaint,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  amountValue: {
    color: mobileColors.text,
    fontSize: 54,
    fontWeight: '700',
    letterSpacing: -2,
    marginTop: 10,
  },
  categoryScroll: {
    marginBottom: 22,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryChip: {
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderRadius: mobileRadius.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  categoryChipActive: {
    backgroundColor: mobileColors.accentMuted,
    borderColor: mobileColors.accent,
  },
  categoryChipText: {
    color: mobileColors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: mobileColors.accent,
  },
  keypad: {
    gap: 10,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 10,
  },
  key: {
    alignItems: 'center',
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderRadius: mobileRadius.card,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 68,
  },
  keySecondary: {
    backgroundColor: mobileColors.sidebar,
  },
  keyText: {
    color: mobileColors.text,
    fontSize: 28,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: mobileColors.surfaceHover,
    borderRadius: mobileRadius.card,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  errorBannerText: {
    color: mobileColors.text,
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    alignSelf: 'center',
  },
  retryButtonText: {
    color: mobileColors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: mobileColors.accent,
    borderRadius: mobileRadius.button,
    marginTop: 22,
    minHeight: 62,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  saveButtonDisabled: {
    backgroundColor: mobileColors.surfaceHover,
  },
  saveButtonSaved: {
    backgroundColor: mobileColors.positive,
  },
  saveButtonText: {
    color: mobileColors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  saveButtonMeta: {
    color: mobileColors.white,
    fontSize: 12,
    marginTop: 4,
    opacity: 0.84,
  },
});
