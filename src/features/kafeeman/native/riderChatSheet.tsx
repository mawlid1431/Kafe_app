import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RIDER_CONTACT } from '../data';
import { LOGO_GREEN } from '../brand';
import type { ThemeColors } from '../theme';
import { STITCH_SHADOW_FLOAT } from '../theme';
import { FONTS } from './fonts';
import { AppImage } from './ui';

const RIDER_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAzHgLdX0YOS86mh9XCTI25Jfp3B3rtaFkqo1rw3sPXHIShW94u6XXZG9O-FdMjYyfoadG3VgRfdyTaanH3J9ITMzmy4rOSudki5us3xLhgu3e4nsx6xaOIvQYX_9nWLo7Hfe3S7wpRwr8O2lrJtL5xZGDREa-IHHvd2SiKWRg8DxgYhWiBd60plNflKjjY6g1Y_UO0RTF5V1BkhTtEUQN3dcddi1YCsxXeRCMVHZaH-TTf81qWW0ibkVdpCcTWsgdD2vs7XVSVlYbw';

type ChatMessage = {
  id: string;
  from: 'rider' | 'user';
  text: string;
  time: string;
};

const QUICK_REPLIES = ["I'm at the lobby", 'Coming down now', 'Please call when here'];

const RIDER_REPLIES = [
  "On my way with your coffee — keeping it upright!",
  'Light traffic. ETA about 8 minutes.',
  'Almost there. I’m at your building entrance.',
  'No worries, I’ll wait at the lobby.',
];

function nowLabel() {
  return new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' });
}

export function RiderChatSheet({
  C,
  visible,
  onClose,
  onCall,
}: {
  C: ThemeColors;
  visible: boolean;
  onClose: () => void;
  onCall?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const sheetHeight = Math.min(500, Math.round(height * 0.58));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const slide = useRef(new Animated.Value(sheetHeight)).current;
  const scrollRef = useRef<ScrollView>(null);
  const replyIdx = useRef(0);

  useEffect(() => {
    if (!visible) return;
    setMessages([
      {
        id: 'welcome',
        from: 'rider',
        text: `Hi! ${RIDER_CONTACT.name} here — I’ve picked up your order and I’m heading to you now.`,
        time: nowLabel(),
      },
    ]);
    setDraft('');
    slide.setValue(sheetHeight);
    Animated.spring(slide, { toValue: 0, friction: 9, tension: 70, useNativeDriver: true }).start();
  }, [sheetHeight, slide, visible]);

  const close = useCallback(() => {
    Animated.timing(slide, { toValue: sheetHeight, duration: 240, useNativeDriver: true }).start(({ finished }) => {
      if (finished) onClose();
    });
  }, [onClose, sheetHeight, slide]);

  const pushRiderReply = useCallback((text: string) => {
    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: `r-${Date.now()}`, from: 'rider', text, time: nowLabel() }]);
      setTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }, 1100 + Math.random() * 600);
  }, []);

  const send = useCallback(
    (textOverride?: string) => {
      const text = (textOverride ?? draft).trim();
      if (!text || typing) return;

      setMessages((prev) => [...prev, { id: `u-${Date.now()}`, from: 'user', text, time: nowLabel() }]);
      setDraft('');
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);

      const reply = RIDER_REPLIES[replyIdx.current % RIDER_REPLIES.length] ?? RIDER_REPLIES[0]!;
      replyIdx.current += 1;
      pushRiderReply(reply);
    },
    [draft, pushRiderReply, typing],
  );

  if (!visible) return null;

  return (
    <View style={styles.root}>
      <Pressable style={styles.backdrop} onPress={close} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.sheet,
            {
              height: sheetHeight,
              paddingBottom: insets.bottom + 8,
              transform: [{ translateY: slide }],
            },
            STITCH_SHADOW_FLOAT,
          ]}
        >
          <View style={[styles.handle, { backgroundColor: C.outlineVariant }]} />
          <View style={[styles.header, { borderBottomColor: C.glassBorderStrong }]}>
            <AppImage uri={RIDER_AVATAR} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <View style={styles.liveRow}>
                <View style={styles.liveDot} />
                <Text style={[styles.liveText, { color: C.success }]}>Live</Text>
              </View>
              <Text style={[styles.headerTitle, { color: C.text }]}>{RIDER_CONTACT.name}</Text>
              <Text style={[styles.headerSub, { color: C.textMuted }]}>Your delivery rider</Text>
            </View>
            {onCall ? (
              <Pressable onPress={onCall} style={[styles.iconBtn, { backgroundColor: C.primaryContainer }]}>
                <Ionicons name="call" size={18} color={C.onPrimary} />
              </Pressable>
            ) : null}
            <Pressable onPress={close} style={[styles.iconBtn, { backgroundColor: C.surfaceContainer }]}>
              <Ionicons name="close" size={18} color={C.textMuted} />
            </Pressable>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.messages}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((msg) => {
              const isUser = msg.from === 'user';
              return (
                <View key={msg.id} style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
                  {!isUser && <AppImage uri={RIDER_AVATAR} style={styles.bubbleAvatar} />}
                  <View
                    style={[
                      styles.bubble,
                      isUser
                        ? { backgroundColor: C.primaryContainer }
                        : { backgroundColor: C.secondaryContainer },
                    ]}
                  >
                    <Text style={[styles.bubbleText, { color: isUser ? C.onPrimary : C.text }]}>{msg.text}</Text>
                    <Text style={[styles.bubbleTime, { color: isUser ? 'rgba(255,255,255,0.72)' : C.textFaint }]}>
                      {msg.time}
                    </Text>
                  </View>
                </View>
              );
            })}
            {typing && (
              <View style={styles.bubbleRow}>
                <AppImage uri={RIDER_AVATAR} style={styles.bubbleAvatar} />
                <View style={[styles.bubble, styles.typingBubble, { backgroundColor: C.secondaryContainer }]}>
                  <Text style={[styles.typingText, { color: C.textMuted }]}>Typing…</Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={[styles.quickSection, { borderTopColor: C.glassBorderStrong, backgroundColor: C.surfaceLow }]}>
            <Text style={[styles.quickSectionLabel, { color: C.textMuted }]}>Quick replies</Text>
            <View style={styles.quickReplyList}>
              {QUICK_REPLIES.map((q) => (
                <Pressable
                  key={q}
                  onPress={() => send(q)}
                  disabled={typing}
                  style={({ pressed }) => [
                    styles.quickReplyBtn,
                    {
                      backgroundColor: C.secondaryContainer,
                      borderColor: C.primaryContainer,
                      opacity: pressed || typing ? 0.75 : 1,
                    },
                  ]}
                >
                  <View style={[styles.quickReplyIcon, { backgroundColor: C.surfaceLowest }]}>
                    <Ionicons name="chatbubble-outline" size={16} color={C.primaryContainer} />
                  </View>
                  <Text style={[styles.quickReplyText, { color: C.text }]}>{q}</Text>
                  <Ionicons name="chevron-forward" size={16} color={C.primaryContainer} />
                </Pressable>
              ))}
            </View>
          </View>

          <View style={[styles.inputRow, { borderTopColor: C.outlineVariant }]}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Type a message…"
              placeholderTextColor={C.textFaint}
              style={[styles.input, { color: C.text, backgroundColor: C.inputBg }]}
              returnKeyType="send"
              onSubmitEditing={() => send()}
            />
            <Pressable
              onPress={() => send()}
              disabled={!draft.trim() || typing}
              style={[styles.sendBtn, { backgroundColor: draft.trim() ? C.primaryContainer : C.surfaceContainer }]}
            >
              <Ionicons name="send" size={16} color={draft.trim() ? C.onPrimary : C.textFaint} />
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  keyboard: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: LOGO_GREEN },
  liveText: { fontFamily: FONTS.semiBold, fontSize: 11 },
  headerTitle: { fontFamily: FONTS.semiBold, fontSize: 16 },
  headerSub: { fontFamily: FONTS.regular, fontSize: 12 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messages: { flex: 1 },
  messagesContent: { padding: 16, gap: 10 },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubbleAvatar: { width: 28, height: 28, borderRadius: 14 },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleText: { fontFamily: FONTS.regular, fontSize: 14, lineHeight: 20 },
  bubbleTime: { fontFamily: FONTS.regular, fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  typingBubble: { paddingVertical: 12 },
  typingText: { fontFamily: FONTS.regular, fontSize: 13, fontStyle: 'italic' },
  quickSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderTopWidth: 1,
  },
  quickSectionLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  quickReplyList: { gap: 8 },
  quickReplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  quickReplyIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickReplyText: { flex: 1, fontFamily: FONTS.semiBold, fontSize: 14, lineHeight: 18 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: FONTS.regular,
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(96,128,112,0.2)',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
