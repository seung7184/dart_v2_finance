import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatEUR } from '@dart/core';

import { mobileColors, mobileRadius } from '@/src/theme';

const RECENT_TRANSACTIONS = [
  {
    id: 'tx-1',
    occurredLabel: 'Today',
    description: 'Albert Heijn',
    detail: 'Groceries',
    amountCents: -2840,
    intentLabel: 'Living expense',
    statusLabel: 'Reviewed',
  },
  {
    id: 'tx-2',
    occurredLabel: 'Today',
    description: 'NS Treinticket',
    detail: 'Transport',
    amountCents: -1280,
    intentLabel: 'Living expense',
    statusLabel: 'Reviewed',
  },
  {
    id: 'tx-3',
    occurredLabel: 'Apr 21',
    description: 'Tikkie from Elisa',
    detail: 'Dinner reimbursement',
    amountCents: 4250,
    intentLabel: 'Reimbursement in',
    statusLabel: 'Reviewed',
  },
  {
    id: 'tx-4',
    occurredLabel: 'Apr 20',
    description: 'ING to Trading 212',
    detail: 'Monthly contribution',
    amountCents: -80000,
    intentLabel: 'Investment contribution',
    statusLabel: 'Reviewed',
  },
  {
    id: 'tx-5',
    occurredLabel: 'Apr 19',
    description: 'Spotify',
    detail: 'Recurring bill',
    amountCents: -1199,
    intentLabel: 'Recurring bill',
    statusLabel: 'Auto-approved',
  },
] as const;

function getAmountColor(amountCents: number) {
  return amountCents >= 0 ? mobileColors.positive : mobileColors.text;
}

function getStatusColors(statusLabel: string) {
  if (statusLabel === 'Auto-approved') {
    return {
      backgroundColor: mobileColors.accentMuted,
      color: mobileColors.accent,
    };
  }

  return {
    backgroundColor: mobileColors.surfaceHover,
    color: mobileColors.textMuted,
  };
}

export default function TransactionsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Recent transactions</Text>
          <Text style={styles.title}>Latest activity</Text>
          <Text style={styles.subtitle}>
            Readonly review of recent imports and manual entries.
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Recent outflow</Text>
          <Text style={styles.summaryValue}>{formatEUR(95919)}</Text>
          <Text style={styles.summaryMeta}>5 recent items shown</Text>
        </View>

        <View style={styles.listCard}>
          {RECENT_TRANSACTIONS.map((transaction, index) => {
            const statusColors = getStatusColors(transaction.statusLabel);

            return (
              <View
                key={transaction.id}
                style={[
                  styles.transactionRow,
                  index < RECENT_TRANSACTIONS.length - 1 ? styles.transactionDivider : undefined,
                ]}
              >
                <View style={styles.transactionLeft}>
                  <Text style={styles.transactionDate}>{transaction.occurredLabel}</Text>
                  <Text style={styles.transactionTitle}>{transaction.description}</Text>
                  <Text style={styles.transactionDetail}>{transaction.detail}</Text>
                  <View style={styles.metaRow}>
                    <View style={styles.intentBadge}>
                      <Text style={styles.intentBadgeText}>{transaction.intentLabel}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusColors.backgroundColor },
                      ]}
                    >
                      <Text style={[styles.statusBadgeText, { color: statusColors.color }]}>
                        {transaction.statusLabel}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.amountBlock}>
                  <Text
                    style={[
                      styles.amountValue,
                      { color: getAmountColor(transaction.amountCents) },
                    ]}
                  >
                    {transaction.amountCents >= 0
                      ? `+ ${formatEUR(transaction.amountCents)}`
                      : `- ${formatEUR(Math.abs(transaction.amountCents))}`}
                  </Text>
                </View>
              </View>
            );
          })}
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
    color: mobileColors.text,
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
  transactionRow: {
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
    padding: 18,
  },
  transactionDivider: {
    borderBottomColor: mobileColors.border,
    borderBottomWidth: 1,
  },
  transactionLeft: {
    flex: 1,
    gap: 4,
  },
  transactionDate: {
    color: mobileColors.textFaint,
    fontSize: 12,
    fontWeight: '600',
  },
  transactionTitle: {
    color: mobileColors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  transactionDetail: {
    color: mobileColors.textMuted,
    fontSize: 13,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  intentBadge: {
    backgroundColor: mobileColors.sidebar,
    borderRadius: mobileRadius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  intentBadgeText: {
    color: mobileColors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    borderRadius: mobileRadius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  amountBlock: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amountValue: {
    fontSize: 15,
    fontWeight: '700',
  },
});
