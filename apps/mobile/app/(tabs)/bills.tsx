import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatEUR } from '@dart/core';

import { mobileColors, mobileRadius } from '@/src/theme';

const UPCOMING_BILLS = [
  {
    id: 'bill-1',
    name: 'Rent',
    dueLabel: 'Due Apr 25',
    frequencyLabel: 'Monthly',
    amountCents: 85000,
  },
  {
    id: 'bill-2',
    name: 'Spotify',
    dueLabel: 'Due Apr 23',
    frequencyLabel: 'Monthly',
    amountCents: 1199,
  },
  {
    id: 'bill-3',
    name: 'Gym',
    dueLabel: 'Due Apr 28',
    frequencyLabel: 'Monthly',
    amountCents: 2999,
  },
  {
    id: 'bill-4',
    name: 'Health insurance',
    dueLabel: 'Due May 1',
    frequencyLabel: 'Monthly',
    amountCents: 14350,
  },
] as const;

export default function BillsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Upcoming recurring bills</Text>
          <Text style={styles.title}>Protected before payday</Text>
          <Text style={styles.subtitle}>
            Readonly view of the bills expected before the next salary cycle.
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Protected obligations</Text>
          <Text style={styles.summaryValue}>{formatEUR(98548)}</Text>
          <Text style={styles.summaryMeta}>4 recurring bills upcoming</Text>
        </View>

        <View style={styles.listCard}>
          {UPCOMING_BILLS.map((bill, index) => (
            <View
              key={bill.id}
              style={[styles.billRow, index < UPCOMING_BILLS.length - 1 ? styles.billDivider : undefined]}
            >
              <View style={styles.billLeft}>
                <View style={styles.dot} />
                <View style={styles.billTextBlock}>
                  <Text style={styles.billTitle}>{bill.name}</Text>
                  <Text style={styles.billDetail}>
                    {bill.dueLabel} · {bill.frequencyLabel}
                  </Text>
                </View>
              </View>

              <Text style={styles.billAmount}>{formatEUR(bill.amountCents)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: mobileColors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 14,
  },
  header: {
    gap: 8,
    paddingTop: 8,
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
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  subtitle: {
    color: mobileColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderRadius: mobileRadius.card,
    borderWidth: 1,
    padding: 18,
    gap: 8,
  },
  summaryLabel: {
    color: mobileColors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: mobileColors.warning,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  summaryMeta: {
    color: mobileColors.textFaint,
    fontSize: 13,
  },
  listCard: {
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderRadius: mobileRadius.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  billRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
    padding: 18,
  },
  billDivider: {
    borderBottomColor: mobileColors.border,
    borderBottomWidth: 1,
  },
  billLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  dot: {
    backgroundColor: mobileColors.warning,
    borderRadius: mobileRadius.pill,
    height: 8,
    width: 8,
  },
  billTextBlock: {
    flex: 1,
    gap: 4,
  },
  billTitle: {
    color: mobileColors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  billDetail: {
    color: mobileColors.textMuted,
    fontSize: 13,
  },
  billAmount: {
    color: mobileColors.text,
    fontSize: 15,
    fontWeight: '700',
  },
});
