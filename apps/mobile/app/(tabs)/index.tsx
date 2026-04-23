import { router } from 'expo-router';
import { Platform } from 'react-native';
import { SafeAreaView, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatEUR } from '@dart/core';

import { getRevenueCatBillingState } from '@/src/billing/revenuecat';
import { mobileColors, mobileRadius } from '@/src/theme';

export default function HomeScreen() {
  const bills = [
    { name: 'Rent', dueLabel: 'Due Apr 25', amountCents: 85000 },
    { name: 'Spotify', dueLabel: 'Due Apr 23', amountCents: 1199 },
  ];
  const billingState = getRevenueCatBillingState(process.env);
  const activePlatformState = Platform.OS === 'android' ? billingState.google : billingState.apple;
  const billingBadgeLabel =
    billingState.runtimeStatus === 'sdk_ready'
      ? 'SDK ready'
      : billingState.contractStatus === 'configured'
        ? 'SDK missing'
        : billingState.contractStatus === 'partial'
          ? 'Partial config'
          : 'Pending keys';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Safe to spend today</Text>
            <Text style={styles.heroValue}>{formatEUR(3720)}</Text>
            <Text style={styles.heroCaption}>
              Conservative daily guide based on your cash, upcoming obligations, and planned
              investing until payday.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Remaining until payday</Text>
          <View style={styles.cardRow}>
            <Text style={styles.cardValue}>{formatEUR(29800)}</Text>
            <Text style={styles.cardMeta}>8 days left</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Upcoming bills</Text>
            <Text style={styles.cardMeta}>{bills.length} due</Text>
          </View>
          <View style={styles.stack}>
            {bills.map((bill) => (
              <View key={bill.name} style={styles.listRow}>
                <View>
                  <Text style={styles.listTitle}>{bill.name}</Text>
                  <Text style={styles.listMeta}>{bill.dueLabel}</Text>
                </View>
                <Text style={styles.listAmount}>{formatEUR(bill.amountCents)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Planned investing</Text>
            <View style={styles.protectedBadge}>
              <Text style={styles.protectedBadgeText}>Protected</Text>
            </View>
          </View>
          <Text style={styles.cardValue}>{formatEUR(80000)}</Text>
          <Text style={styles.cardMeta}>VWCE + SXR8 target on Apr 28</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Mobile billing</Text>
            <View style={styles.protectedBadge}>
              <Text style={styles.protectedBadgeText}>{billingBadgeLabel}</Text>
            </View>
          </View>
          <Text style={styles.listTitle}>RevenueCat billing contract</Text>
          <Text style={styles.cardMeta}>
            Offering: {billingState.offering} · Entitlement: {billingState.entitlement}
          </Text>
          <Text style={styles.cardMeta}>
            Packages: {billingState.apple.packageIds.join(' · ')}
          </Text>
          <Text style={styles.cardMeta}>
            Apple billing: {billingState.apple.publicKeyPresent ? 'Configured' : 'Unavailable'}
          </Text>
          <Text style={styles.cardMeta}>
            Google billing: {billingState.google.publicKeyPresent ? 'Configured' : 'Unavailable'}
          </Text>
          <Text style={styles.cardMeta}>
            This {activePlatformState.platform === 'ios' ? 'iOS' : 'Android'} build currently sees{' '}
            {activePlatformState.publicKeyPresent ? 'a platform key' : 'no platform key'}.
          </Text>
          <Text style={styles.cardMeta}>
            RevenueCat SDK runtime: {billingState.runtimeStatus === 'sdk_ready' ? 'Installed' : 'Not installed'}
          </Text>
          <Text style={styles.cardMeta}>
            TODO(owner): set both platform public keys, install `react-native-purchases` in a dev
            build, and verify the `default` offering exposes `$rc_monthly` and `$rc_annual` for
            entitlement `premium`.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.fabWrap}>
        <Pressable onPress={() => router.push('/quick-add')} style={styles.fab}>
          <Text style={styles.fabText}>+ Quick Add</Text>
        </Pressable>
      </View>
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
    paddingBottom: 116,
    gap: 14,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  eyebrow: {
    color: mobileColors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroValue: {
    color: mobileColors.safe,
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1.8,
    marginTop: 12,
  },
  heroCaption: {
    color: mobileColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  card: {
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderRadius: mobileRadius.card,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  cardLabel: {
    color: mobileColors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cardRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardValue: {
    color: mobileColors.text,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  cardMeta: {
    color: mobileColors.textMuted,
    fontSize: 13,
  },
  stack: {
    gap: 12,
  },
  listRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listTitle: {
    color: mobileColors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  listMeta: {
    color: mobileColors.textFaint,
    fontSize: 12,
    marginTop: 4,
  },
  listAmount: {
    color: mobileColors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  protectedBadge: {
    backgroundColor: mobileColors.accentMuted,
    borderRadius: mobileRadius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  protectedBadgeText: {
    color: mobileColors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  fabWrap: {
    backgroundColor: mobileColors.background,
    bottom: 0,
    left: 0,
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    position: 'absolute',
    right: 0,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: mobileColors.accent,
    borderRadius: mobileRadius.button,
    justifyContent: 'center',
    minHeight: 56,
  },
  fabText: {
    color: mobileColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
