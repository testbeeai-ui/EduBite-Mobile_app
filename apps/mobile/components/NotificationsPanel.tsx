import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from '@edubite/ui';
import { useGame } from '../lib/game/GameProvider';

const TARGET_ROUTES: Record<string, string> = {
  dailydose: '/dailydose',
  funbrain: '/funbrain',
  habits: '/habits',
  puzzles: '/puzzles',
  ai_integrity: '/ai_integrity',
  achievements: '/achievements',
  inspiration: '/inspiration',
  braingym: '/braingym',
  profile: '/profile',
  index: '/',
  home: '/',
};

export function NotificationsPanel({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}) {
  const { state, markNotificationRead, clearNotification } = useGame();
  const notes = state.notifications || [];
  const unreadCount = notes.filter((n) => !n.read).length;

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.head}>
            <View>
              <Text style={styles.title}>Notifications</Text>
              <Text style={styles.sub}>
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : notes.length > 0
                    ? 'All caught up'
                    : 'Nothing new yet'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.list}>
            {notes.length === 0 ? (
              <Text style={styles.empty}>No notifications yet.</Text>
            ) : (
              notes.map((note) => {
                const route =
                  (note.targetView && TARGET_ROUTES[note.targetView]) || null;
                return (
                  <TouchableOpacity
                    key={note.id}
                    style={[styles.card, !note.read && styles.cardUnread]}
                    onPress={() => {
                      markNotificationRead(note.id);
                      onClose();
                      if (route) onNavigate(route);
                    }}
                  >
                    <Text style={styles.icon}>{note.icon || '✨'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardText}>{note.text}</Text>
                      {note.createdAt ? (
                        <Text style={styles.meta}>
                          {new Date(note.createdAt).toLocaleString()}
                        </Text>
                      ) : null}
                    </View>
                    <TouchableOpacity
                      onPress={() => clearNotification(note.id)}
                      hitSlop={8}
                    >
                      <Text style={styles.clear}>Clear</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '78%',
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderColor: theme.colors.border,
    borderWidth: 1,
    paddingBottom: 20,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSoft,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
  },
  sub: {
    marginTop: 2,
    fontSize: 11,
    color: theme.colors.textFaint,
    fontFamily: theme.fonts.body,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: theme.colors.textDim, fontSize: 14 },
  list: { padding: 16, gap: 10 },
  empty: {
    textAlign: 'center',
    color: theme.colors.textFaint,
    marginTop: 24,
    fontFamily: theme.fonts.body,
  },
  card: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    padding: 12,
  },
  cardUnread: {
    borderColor: 'rgba(29,158,117,0.45)',
    backgroundColor: theme.colors.tealSoft,
  },
  icon: { fontSize: 18 },
  cardText: {
    fontSize: 12.5,
    color: theme.colors.text,
    lineHeight: 18,
    fontFamily: theme.fonts.body,
  },
  meta: {
    marginTop: 4,
    fontSize: 10,
    color: theme.colors.textFaint,
    fontFamily: theme.fonts.body,
  },
  clear: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textDim,
    fontFamily: theme.fonts.body,
  },
});
