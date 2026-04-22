import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { formatEUR } from '@dart/core';

import { mobileColors, mobileRadius } from '@/src/theme';

const CATEGORY_OPTIONS = ['Groceries', 'Transport', 'Dining', 'Health', 'Other'] as const;
const INITIAL_CATEGORY = CATEGORY_OPTIONS[0];
const SAVE_DELAY_MS = 800;

type CategoryOption = (typeof CATEGORY_OPTIONS)[number];

export default function QuickAddScreen() {
  const [amountDigits, setAmountDigits] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption>(INITIAL_CATEGORY);
  const [isSaving, setIsSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const amountCents = amountDigits.length > 0 ? Number.parseInt(amountDigits, 10) : 0;
  const isSaveDisabled = amountCents <= 0 || isSaving;

  const handleDigitPress = (digit: string) => {
    if (isSaving) {
      return;
    }

    setAmountDigits((currentDigits) => {
      const nextDigits = `${currentDigits}${digit}`.replace(/^0+(?=\d)/, '');
      return nextDigits.slice(0, 6);
    });
  };

  const handleBackspace = () => {
    if (isSaving) {
      return;
    }

    setAmountDigits((currentDigits) => currentDigits.slice(0, -1));
  };

  const handleSave = () => {
    if (isSaveDisabled) {
      return;
    }

    setIsSaving(true);
    timerRef.current = setTimeout(() => {
      setIsSaving(false);
      setAmountDigits('');
      setSelectedCategory(INITIAL_CATEGORY);
      router.back();
    }, SAVE_DELAY_MS);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Pressable onPress={() => router.back()} style={styles.backdrop} />

      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>Add Expense</Text>
          <Text style={styles.subtitle}>Today · Quick capture</Text>
        </View>

        <View style={styles.amountBlock}>
          <Text style={styles.currencyLabel}>EUR</Text>
          <Text style={styles.amountValue}>{formatEUR(amountCents)}</Text>
          <Text style={styles.amountHint}>Local-only save simulation. No API or DB call.</Text>
        </View>

        <View style={styles.categoryRow}>
          {CATEGORY_OPTIONS.map((category) => {
            const isActive = category === selectedCategory;

            return (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={[styles.categoryChip, isActive ? styles.categoryChipActive : undefined]}
              >
                <Text style={[styles.categoryChipText, isActive ? styles.categoryChipTextActive : undefined]}>
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </View>

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

        <Pressable
          onPress={handleSave}
          style={[
            styles.saveButton,
            isSaveDisabled ? styles.saveButtonDisabled : undefined,
            isSaving ? styles.saveButtonSaved : undefined,
          ]}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? `Saved ${formatEUR(amountCents)}` : `Save ${formatEUR(amountCents)}`}
          </Text>
          <Text style={styles.saveButtonMeta}>
            {isSaving ? selectedCategory : 'Fast add for today'}
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
  amountHint: {
    color: mobileColors.textMuted,
    fontSize: 13,
    marginTop: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 22,
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
