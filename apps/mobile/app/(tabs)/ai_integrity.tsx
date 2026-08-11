import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { theme } from '@edubite/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../../lib/game/GameProvider';
import { PledgeSignModal } from '../../components/pledge/PledgeSignModal';
import { IntegrityReelModal } from '../../components/pledge/IntegrityReelModal';
import {
  AI_RESOURCES,
  PLEDGE_AM,
  PLEDGE_PM,
  type PledgeType,
} from '../../lib/pledge/constants';
import { openHttpsUrl } from '../../lib/safe-link';

export default function AIIntegrityScreen() {
  const { state, saving, setPledge } = useGame();

  const [signModal, setSignModal] = useState<PledgeType | null>(null);
  const [reelModal, setReelModal] = useState<PledgeType | null>(null);

  const gamePayload = useMemo(
    () => ({
      joinedDate: state.joinedDate,
      lastActiveDate: state.lastActiveDate,
      pledgeAM: state.pledgeAM,
      pledgePM: state.pledgePM,
    }),
    [state.joinedDate, state.lastActiveDate, state.pledgeAM, state.pledgePM],
  );

  const finishPledge = useCallback(
    async (type: PledgeType) => {
      await setPledge(type, true);
      setReelModal(null);
      setSignModal(null);
    },
    [setPledge],
  );

  const openSign = (type: PledgeType) => {
    setReelModal(null);
    setSignModal(type);
  };

  const openReel = (type: PledgeType) => {
    setSignModal(null);
    setReelModal(type);
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.eyebrowRow}>
          <View style={styles.dot} />
          <Text style={styles.eyebrowText}>INTEGRITY LAYER</Text>
        </View>
        <Text style={styles.title}>AI — Use It to Learn, Not to Skip Learning</Text>
        <Text style={styles.subtitle}>
          Morning and night pledges — open either anytime. Each plays a 60-second reel for
          today.
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.iic}>🤖</Text>
          <Text style={styles.infoText}>
            AI can explain a concept beautifully — but if it&apos;s doing the thinking{' '}
            <Text style={{ fontStyle: 'italic', color: theme.colors.text }}>for</Text> you,
            the exam is where that gap shows up. Growing research links heavy AI reliance to
            weaker independent reasoning, especially in students. The two pledges below are a
            daily checkpoint, not a restriction: use AI to understand, never to skip the
            struggle that builds the skill.
          </Text>
        </View>

        <PledgeCard
          type="am"
          emoji="🌅"
          meta={PLEDGE_AM.time}
          title={PLEDGE_AM.title}
          quote={PLEDGE_AM.quote}
          signed={state.pledgeAM}
          buttonLabel={PLEDGE_AM.buttonLabel}
          disabled={saving}
          onSign={() => openSign('am')}
          onWatchReel={() => openReel('am')}
        />

        <PledgeCard
          type="pm"
          emoji="🌙"
          meta={PLEDGE_PM.time}
          title={PLEDGE_PM.title}
          quote={PLEDGE_PM.quote}
          signed={state.pledgePM}
          buttonLabel={PLEDGE_PM.buttonLabel}
          disabled={saving}
          onSign={() => openSign('pm')}
          onWatchReel={() => openReel('pm')}
        />

        <Text style={styles.secHeading}>The research on AI overuse</Text>

        {AI_RESOURCES.map((article) => (
          <TouchableOpacity
            key={article.id}
            style={styles.articleCard}
            activeOpacity={0.85}
            onPress={() => void openHttpsUrl(article.url)}
          >
            <View style={styles.articleIc}>
              <Text style={{ fontSize: 15 }}>{article.icon}</Text>
            </View>
            <View style={styles.articleBody}>
              <View style={styles.articleTop}>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <Text style={styles.articleArrow}>↗</Text>
              </View>
              <Text style={styles.articleSource}>{article.src}</Text>
              <Text style={styles.articleDesc}>{article.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>

      <PledgeSignModal
        type={signModal ?? 'am'}
        open={signModal !== null}
        onClose={() => setSignModal(null)}
        onConfirm={() => {
          if (!signModal) return;
          const next = signModal;
          setSignModal(null);
          setReelModal(next);
        }}
      />

      <IntegrityReelModal
        type={reelModal}
        open={reelModal !== null}
        gamePayload={gamePayload}
        onClose={() => setReelModal(null)}
        onComplete={() => {
          if (reelModal) void finishPledge(reelModal);
        }}
        onSignWithoutReel={() => {
          if (reelModal) void finishPledge(reelModal);
        }}
      />
    </>
  );
}

function PledgeCard({
  type,
  emoji,
  meta,
  title,
  quote,
  signed,
  buttonLabel,
  disabled,
  onSign,
  onWatchReel,
}: {
  type: PledgeType;
  emoji: string;
  meta: string;
  title: string;
  quote: string;
  signed: boolean;
  buttonLabel: string;
  disabled?: boolean;
  onSign: () => void;
  onWatchReel: () => void;
}) {
  const isAm = type === 'am';

  return (
    <View style={styles.pledgeCard}>
      <View style={styles.pledgeTop}>
        <Text style={styles.pledgeIc}>{emoji}</Text>
        <Text style={styles.pledgeTime}>{meta}</Text>
      </View>
      <Text style={styles.pledgeAvail}>Available anytime · today&apos;s reel</Text>
      <Text style={styles.pledgeName}>{title}</Text>
      <View
        style={[
          styles.pledgeQuote,
          isAm ? styles.pledgeQuoteMorning : styles.pledgeQuoteNight,
        ]}
      >
        <Text style={styles.pledgeQuoteText}>&ldquo;{quote}&rdquo;</Text>
      </View>

      {!signed ? (
        <TouchableOpacity
          onPress={onSign}
          disabled={disabled}
          style={styles.signBtnWrap}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={
              isAm
                ? [theme.colors.amber, '#f7c15c']
                : [theme.colors.purple, theme.colors.pink]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.signBtn}
          >
            <Text style={isAm ? styles.signBtnTextMorning : styles.signBtnTextNight}>
              {buttonLabel}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <View style={styles.signedStack}>
          <TouchableOpacity
            onPress={onWatchReel}
            disabled={disabled}
            style={styles.signBtnWrap}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={
                isAm
                  ? [theme.colors.amber, '#f7c15c']
                  : [theme.colors.purple, theme.colors.pink]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.signBtn}
            >
              <Text style={isAm ? styles.signBtnTextMorning : styles.signBtnTextNight}>
                Watch today&apos;s reel →
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.signedLabel}>✓ Signed for today</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 26,
  },
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
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 7,
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textDim,
    lineHeight: 18,
    marginBottom: 16,
    fontFamily: theme.fonts.body,
  },

  infoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
  },
  iic: { fontSize: 20 },
  infoText: {
    fontSize: 12,
    color: theme.colors.textDim,
    lineHeight: 19.2,
    flex: 1,
    fontFamily: theme.fonts.body,
  },

  pledgeCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  pledgeTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  pledgeIc: { fontSize: 20 },
  pledgeTime: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textDim,
    fontFamily: theme.fonts.body,
  },
  pledgeAvail: {
    fontSize: 10.5,
    color: theme.colors.teal,
    marginVertical: 2,
    marginBottom: 8,
    paddingLeft: 30,
    fontFamily: theme.fonts.body,
  },
  pledgeName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
    paddingLeft: 30,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
  },

  pledgeQuote: {
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderRadius: 10,
    backgroundColor: theme.colors.cardAlt,
    marginBottom: 14,
    borderLeftWidth: 3,
  },
  pledgeQuoteMorning: { borderLeftColor: theme.colors.amber },
  pledgeQuoteNight: { borderLeftColor: theme.colors.purple },
  pledgeQuoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18.6,
    color: theme.colors.textDim,
    fontFamily: theme.fonts.body,
  },

  signBtnWrap: { borderRadius: 13, overflow: 'hidden' },
  signBtn: {
    width: '100%',
    padding: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signBtnTextMorning: {
    fontWeight: '800',
    fontSize: 13,
    color: '#2A1A02',
    fontFamily: theme.fonts.body,
  },
  signBtnTextNight: {
    fontWeight: '800',
    fontSize: 13,
    color: '#2A0E1E',
    fontFamily: theme.fonts.body,
  },
  signedStack: { gap: 8 },
  signedLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.teal,
    fontFamily: theme.fonts.body,
  },

  secHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginVertical: 20,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSoft,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
  },

  articleCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 15,
    padding: 13,
    marginBottom: 10,
  },
  articleIc: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.cardHi,
    alignItems: 'center',
    justifyContent: 'center',
  },
  articleBody: { flex: 1 },
  articleTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 6,
  },
  articleTitle: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '700',
    lineHeight: 16.87,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
  },
  articleArrow: { color: theme.colors.textFaint, fontSize: 12, fontFamily: theme.fonts.body },
  articleSource: {
    fontSize: 9.5,
    fontWeight: '700',
    color: theme.colors.teal,
    letterSpacing: 0.3,
    marginTop: 3,
    marginBottom: 6,
    fontFamily: theme.fonts.body,
  },
  articleDesc: {
    fontSize: 11,
    color: theme.colors.textFaint,
    lineHeight: 16.5,
    fontFamily: theme.fonts.body,
  },
});
