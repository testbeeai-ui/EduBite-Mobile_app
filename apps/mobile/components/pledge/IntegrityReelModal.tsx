import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@edubite/ui';
import type { PledgeType } from '../../lib/pledge/constants';
import { REEL_DURATION_SEC } from '../../lib/pledge/constants';
import { getPledgeReelDayNumber, resolveJourneyJoinDate, todayKey } from '../../lib/pledge/day';
import { fetchPledgeReelDay, type PledgeReelDay } from '../../lib/supabase';

type Props = {
  type: PledgeType | null;
  open: boolean;
  gamePayload: Record<string, unknown> | null | undefined;
  onClose: () => void;
  onComplete: () => void;
  onSignWithoutReel: () => void;
};

function renderHeadline(headline: string, emphasisWord: string) {
  if (!emphasisWord) return { before: headline, emphasis: '', after: '' };
  const idx = headline.toLowerCase().indexOf(emphasisWord.toLowerCase());
  if (idx === -1) return { before: headline, emphasis: '', after: '' };
  return {
    before: headline.slice(0, idx),
    emphasis: headline.slice(idx, idx + emphasisWord.length),
    after: headline.slice(idx + emphasisWord.length),
  };
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const reelCache = new Map<string, PledgeReelDay>();

export function IntegrityReelModal({
  type,
  open,
  gamePayload,
  onClose,
  onComplete,
  onSignWithoutReel,
}: Props) {
  const asOfDateKey = todayKey();
  const journeyJoin = resolveJourneyJoinDate(gamePayload, asOfDateKey);
  const slot = type === 'am' ? 'am' : 'pm';

  const [elapsed, setElapsed] = useState(0);
  const [reelDay, setReelDay] = useState<PledgeReelDay | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!open || !type) {
      setElapsed(0);
      setReelDay(null);
      setLoadFailed(false);
      return;
    }

    setElapsed(0);
    setReelDay(null);
    setLoadFailed(false);

    let cancelled = false;
    const dayNumber = getPledgeReelDayNumber(journeyJoin, asOfDateKey);
    const cacheKey = `${journeyJoin}:${asOfDateKey}:${slot}`;
    const cached = reelCache.get(cacheKey);
    if (cached?.slides?.length === 4) {
      setReelDay(cached);
      return;
    }

    void (async () => {
      const reel = await fetchPledgeReelDay(slot, dayNumber);
      if (cancelled) return;
      if (reel?.slides?.length === 4) {
        reelCache.set(cacheKey, reel);
        setReelDay(reel);
      } else {
        setLoadFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, type, journeyJoin, asOfDateKey, slot]);

  useEffect(() => {
    if (!open || !reelDay) return;
    const id = setInterval(() => {
      setElapsed((e) => Math.min(REEL_DURATION_SEC, e + 1));
    }, 1000);
    return () => clearInterval(id);
  }, [open, reelDay]);

  const total = REEL_DURATION_SEC;
  const done = elapsed >= total;
  const segmentSec = total / 4;
  const slideIndex = Math.min(3, Math.floor(elapsed / segmentSec));
  const slide = reelDay?.slides[slideIndex] ?? reelDay?.slides[0];
  const headline = useMemo(
    () => renderHeadline(slide?.headline || '', slide?.emphasisWord || ''),
    [slide?.headline, slide?.emphasisWord],
  );
  const pct = elapsed / total;
  const segFill = (idx: number) => {
    const segIndex = Math.min(3, Math.floor(pct * 4));
    const fill = (pct * 4 - segIndex) * 100;
    if (idx < segIndex) return 100;
    if (idx === segIndex) return fill;
    return 0;
  };

  if (!type) return null;

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.shell} onPress={(e) => e.stopPropagation()}>
          <LinearGradient
            colors={['#1a1030', '#05070B']}
            style={styles.card}
          >
            {!reelDay ? (
              <View style={styles.loadingBox}>
                <Text style={styles.loadingTitle}>
                  {loadFailed ? "Couldn't load today's pledge" : "Loading today's pledge…"}
                </Text>
                <Text style={styles.loadingSub}>
                  {loadFailed
                    ? 'You can still sign the pledge, or close and try again.'
                    : 'Getting the correct day for you.'}
                </Text>
                {loadFailed ? (
                  <View style={styles.loadingActions}>
                    <TouchableOpacity
                      style={styles.continueWrap}
                      onPress={onSignWithoutReel}
                      activeOpacity={0.9}
                    >
                      <LinearGradient
                        colors={
                          type === 'am'
                            ? [theme.colors.amber, '#f7c15c']
                            : [theme.colors.purple, theme.colors.pink]
                        }
                        style={styles.continueBtn}
                      >
                        <Text
                          style={[
                            styles.continueText,
                            { color: type === 'am' ? '#2A1A02' : '#2A0E1E' },
                          ]}
                        >
                          Sign pledge anyway →
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.ghostBtn} onPress={onClose}>
                      <Text style={styles.ghostText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            ) : (
              <>
                <View style={styles.segments}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <View key={i} style={styles.segTrack}>
                      <View style={[styles.segFill, { width: `${segFill(i)}%` }]} />
                    </View>
                  ))}
                </View>

                <View style={styles.topMeta}>
                  <Text style={styles.topMetaText}>
                    🔇 Day {reelDay.day} · {reelDay.theme}
                  </Text>
                  <Text style={styles.topMetaText}>{total - elapsed}</Text>
                </View>

                <View style={styles.slideBody}>
                  <Text style={styles.slideIcon}>{slide?.icon || '🧠'}</Text>
                  <Text style={styles.slideHeadline}>
                    {headline.emphasis ? (
                      <>
                        {headline.before}
                        <Text style={styles.emphasis}>{headline.emphasis}</Text>
                        {headline.after}
                      </>
                    ) : (
                      headline.before
                    )}
                  </Text>
                  <Text style={styles.slideCaption}>{slide?.caption}</Text>
                </View>

                <Text style={styles.timer}>
                  {formatTime(elapsed)} / 0:60
                </Text>

                <TouchableOpacity
                  style={[styles.ghostBtn, !done && styles.ghostDisabled]}
                  disabled={!done}
                  onPress={onComplete}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.ghostText, done && styles.ghostReady]}>
                    {done
                      ? 'Continue → mark pledge signed'
                      : 'Skip locked — keep watching'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  shell: { borderRadius: 22, overflow: 'hidden' },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingBottom: 16,
    minHeight: 360,
  },
  loadingBox: {
    minHeight: 300,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    fontFamily: theme.fonts.heading,
  },
  loadingSub: {
    marginTop: 12,
    fontSize: 12.5,
    lineHeight: 19,
    color: theme.colors.textDim,
    textAlign: 'center',
    fontFamily: theme.fonts.body,
  },
  loadingActions: { marginTop: 20, width: '100%', gap: 8 },
  segments: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  segTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  segFill: {
    height: '100%',
    backgroundColor: theme.colors.text,
  },
  topMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  topMetaText: {
    fontSize: 10.5,
    color: theme.colors.textDim,
    fontFamily: theme.fonts.body,
    fontWeight: '700',
  },
  slideBody: {
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 16,
    alignItems: 'center',
  },
  slideIcon: { fontSize: 42 },
  slideHeadline: {
    marginTop: 16,
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 28,
    textAlign: 'center',
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
  },
  emphasis: { color: theme.colors.pink, fontStyle: 'normal' },
  slideCaption: {
    marginTop: 12,
    fontSize: 12.5,
    lineHeight: 19,
    textAlign: 'center',
    color: theme.colors.textDim,
    fontFamily: theme.fonts.body,
  },
  timer: {
    textAlign: 'center',
    fontSize: 12,
    color: theme.colors.textDim,
    fontFamily: theme.fonts.body,
    marginBottom: 8,
  },
  continueWrap: { borderRadius: 13, overflow: 'hidden' },
  continueBtn: { paddingVertical: 13, alignItems: 'center' },
  continueText: { fontWeight: '800', fontSize: 13, fontFamily: theme.fonts.body },
  ghostBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 13,
    borderRadius: 13,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ghostDisabled: { opacity: 0.55 },
  ghostText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textDim,
    fontFamily: theme.fonts.body,
  },
  ghostReady: { color: theme.colors.teal },
});
