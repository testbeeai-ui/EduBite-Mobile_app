import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { theme } from '@edubite/ui';
import { todayKey } from '../../lib/game/date';
import {
  phenomenonForDate,
  quoteForDate,
  roleModelForDate,
} from '../../lib/inspiration/daily';
import {
  fetchInspirationPhenomena,
  fetchInspirationQuotes,
  fetchInspirationRoleModels,
  type InspirationPhenomena,
  type InspirationQuote,
  type InspirationRoleModel,
} from '../../lib/supabase';

export default function InspirationScreen() {
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<InspirationQuote | null>(null);
  const [roleModel, setRoleModel] = useState<InspirationRoleModel | null>(null);
  const [phenomenon, setPhenomenon] = useState<InspirationPhenomena | null>(null);

  useEffect(() => {
    let cancelled = false;
    const dateKey = todayKey();
    void (async () => {
      const [quotes, models, phenomena] = await Promise.all([
        fetchInspirationQuotes(),
        fetchInspirationRoleModels(),
        fetchInspirationPhenomena(),
      ]);
      if (cancelled) return;
      setQuote(quoteForDate(quotes, dateKey));
      setRoleModel(roleModelForDate(models, dateKey));
      setPhenomenon(phenomenonForDate(phenomena, dateKey));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.eyebrowRow}>
        <View style={styles.dot} />
        <Text style={styles.eyebrowText}>FUEL FOR THE STREAK</Text>
      </View>
      <Text style={styles.title}>Inspiration</Text>
      <Text style={styles.subtitle}>
        A quote, a role model, and one &quot;did you know&quot; a day — the why behind the
        daily bite.
      </Text>

      {loading ? (
        <ActivityIndicator color={theme.colors.teal} style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.quoteCard}>
            <Text style={styles.quoteMark}>&ldquo;</Text>
            <Text style={styles.quoteText}>
              {quote?.quote || 'Stay curious — every day adds a brick to mastery.'}
            </Text>
            {quote?.category ? (
              <Text style={styles.quoteCat}>{quote.category}</Text>
            ) : null}
            <Text style={styles.quoteLabel}>QUOTE OF THE DAY</Text>
          </View>

          <Text style={styles.sectionTitle}>Inspiring role model</Text>
          <View style={styles.card}>
            <View style={styles.roleTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(roleModel?.name || 'E').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.roleName}>{roleModel?.name || 'Edubite Explorer'}</Text>
                {roleModel?.tag ? (
                  <Text style={styles.roleTag}>{roleModel.tag}</Text>
                ) : null}
              </View>
            </View>
            {roleModel?.quote ? (
              <Text style={styles.roleQuote}>&ldquo;{roleModel.quote}&rdquo;</Text>
            ) : null}
            {roleModel?.bio ? (
              <Text style={styles.roleBio}>{roleModel.bio}</Text>
            ) : (
              <Text style={styles.roleBio}>
                Role models rotate daily from the Edubite inspiration catalog.
              </Text>
            )}
          </View>

          <Text style={styles.sectionTitle}>Why study science &amp; math</Text>
          <View style={[styles.card, styles.phenCard]}>
            <View style={styles.phenTop}>
              <View style={styles.phenIcon}>
                <Text style={styles.phenIconText}>{phenomenon?.icon || '🔬'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                {phenomenon?.badge ? (
                  <Text style={styles.phenBadge}>{phenomenon.badge}</Text>
                ) : null}
                <Text style={styles.phenQ}>
                  {phenomenon?.question || 'What makes today worth studying?'}
                </Text>
              </View>
            </View>
            <View style={styles.answerBox}>
              <Text style={styles.answerLabel}>Answer</Text>
              <Text style={styles.answerText}>
                {phenomenon?.explanation ||
                  'Science and math train you to see patterns, test ideas, and solve real problems.'}
              </Text>
            </View>
          </View>
        </>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  contentContainer: { padding: 16, paddingBottom: 26 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.amber },
  eyebrowText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: theme.colors.amber,
    fontFamily: theme.fonts.body,
  },
  title: {
    fontSize: 23,
    fontWeight: '800',
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textDim,
    lineHeight: 18,
    marginBottom: 18,
    fontFamily: theme.fonts.body,
  },
  quoteCard: {
    backgroundColor: theme.colors.card,
    borderColor: 'rgba(232,196,104,0.25)',
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginBottom: 18,
  },
  quoteMark: {
    fontSize: 36,
    color: theme.colors.amber,
    fontFamily: theme.fonts.heading,
    lineHeight: 40,
  },
  quoteText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: theme.fonts.heading,
  },
  quoteCat: {
    marginTop: 10,
    fontSize: 11,
    color: theme.colors.textFaint,
    fontFamily: theme.fonts.body,
  },
  quoteLabel: {
    marginTop: 12,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: theme.colors.textDim,
    fontFamily: theme.fonts.body,
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 10,
    fontFamily: theme.fonts.body,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },
  roleTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: theme.colors.purpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.purple,
    fontFamily: theme.fonts.heading,
  },
  roleName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
  },
  roleTag: {
    marginTop: 3,
    fontSize: 11,
    color: theme.colors.textFaint,
    fontFamily: theme.fonts.body,
  },
  roleQuote: {
    fontSize: 13,
    color: theme.colors.amber,
    fontStyle: 'italic',
    marginBottom: 10,
    lineHeight: 20,
    fontFamily: theme.fonts.body,
  },
  roleBio: {
    fontSize: 12.5,
    color: theme.colors.textDim,
    lineHeight: 19,
    fontFamily: theme.fonts.body,
  },
  phenCard: {
    borderColor: 'rgba(55,138,221,0.35)',
    backgroundColor: 'rgba(55,138,221,0.06)',
  },
  phenTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  phenIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phenIconText: { fontSize: 20 },
  phenBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.blue,
    letterSpacing: 0.4,
    fontFamily: theme.fonts.body,
  },
  phenQ: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    lineHeight: 21,
    fontFamily: theme.fonts.heading,
  },
  answerBox: {
    marginTop: 14,
    backgroundColor: theme.colors.cardHi,
    borderColor: theme.colors.borderSoft,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.amber,
    marginBottom: 6,
    fontFamily: theme.fonts.body,
  },
  answerText: {
    fontSize: 13,
    color: theme.colors.textDim,
    lineHeight: 20,
    fontFamily: theme.fonts.body,
  },
});
