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

import { RIDER_CONTACT } from '../data';
import type { ThemeColors } from '../theme';
import { STITCH_SHADOW_FLOAT } from '../theme';
import { FONTS } from './fonts';
import { GlassSurface } from './stitchUi';

type ChatMessage = {
  id: string;
  from: 'rider' | 'user';
  text: string;
  time: string;
};

const RIDER_REPLIES = [
  "On my way with your coffee! I'll keep it upright.",
  'Traffic is light — should reach you in about 8 minutes.',
  'Almost there. Meet me at the lobby?',
  'Thanks! Enjoy your brew.',
];

function nowLabel() {
  return new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' });
}

export function RiderChatSheet({
  C,
  visible,
  onClose,
}: {
  C: ThemeColors;
  visible: boolean;
  onClose: () => void;
}) {
  const { height } = useWindowDimensions();
  const sheetBottom = Math.round(height * 0.36);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const slide = useRef(new Animated.Value(320)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const replyIdx = useRef(0);

  useEffect(() => {
    if (!visible) return;
    setMessages([
      {
        id: 'welcome',
        from: 'rider',
        text: `Hi! I'm ${RIDER_CONTACT.name}, your rider today. Your order is on the way.`,
        time: nowLabel(),
      },
    ]);
    setDraft('');
    Animated.parallel([
      Animated.spring(slide, { toValue: 0, friction: 8, tension: 80, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [fade, slide, visible]);

  const close = useCallback(() => {
    Animated.parallel([
      Animated.timing(slide, { toValue: 320, duration: 220, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) onClose();
    });
  }, [fade, onClose, slide]);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text || typing) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, from: 'user', text, time: nowLabel() };
    setMessages((prev) => [...prev, userMsg]);
    setDraft('');
    setTyping(true);

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 50);

    setTimeout(() => {
      const reply = RIDER_REPLIES[replyIdx.current % RIDER_REPLIES.length] ?? RIDER_REPLIES[0]!;
      replyIdx.current += 1;
      setMessages((prev) => [
        ...prev,
        { id: `r-${Date.now()}`, from: 'rider', text: reply, time: nowLabel() },
      ]);
      setTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }, 1400);
  }, [draft, typing]);

  if (!visible) return null;

  return (
    <View style={styles.root} pointerEvents="box-none">
      <Animated.View style={[styles.backdrop, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={close} />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.sheet,
            { bottom: sheetBottom, transform: [{ translateY: slide }] },
            STITCH_SHADOW_FLOAT,
          ]}
        >
          <GlassSurface level="float" style={styles.glass} strong>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={[styles.liveDot, { backgroundColor: '#22c55e' }]} />
                <View>
                  <Text style={[styles.headerTitle, { color: C.text }]}>{RIDER_CONTACT.name}</Text>
                  <Text style={[styles.headerSub, { color: C.textMuted }]}>Live chat · Rider</Text>
                </View>
              </View>
              <Pressable onPress={close} hitSlop={8} style={[styles.closeBtn, { backgroundColor: C.surfaceContainer }]}>
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
                    <View
                      style={[
                        styles.bubble,
                        isUser
                          ? { backgroundColor: C.primaryContainer }
                          : { backgroundColor: C.secondaryContainer, borderColor: C.outlineVariant },
                      ]}
                    >
                      <Text style={[styles.bubbleText, { color: isUser ? C.onPrimary : C.text }]}>{msg.text}</Text>
                      <Text style={[styles.bubbleTime, { color: isUser ? 'rgba(255,255,255,0.7)' : C.textFaint }]}>
                        {msg.time}
                      </Text>
                    </View>
                  </View>
                );
              })}
              {typing && (
                <View style={styles.bubbleRow}>
                  <View style={[styles.bubble, styles.typingBubble, { backgroundColor: C.secondaryContainer }]}>
                    <Text style={[styles.typingText, { color: C.textMuted }]}>{RIDER_CONTACT.name} is typing…</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={[styles.inputRow, { borderTopColor: C.outlineVariant }]}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Message your rider…"
                placeholderTextColor={C.textFaint}
                style={[styles.input, { color: C.text, backgroundColor: C.inputBg }]}
                returnKeyType="send"
                onSubmitEditing={send}
              />
              <Pressable
                onPress={send}
                disabled={!draft.trim() || typing}
                style={[
                  styles.sendBtn,
                  { backgroundColor: draft.trim() ? C.primaryContainer : C.surfaceContainer },
                ]}
              >
                <Ionicons name="send" size={16} color={draft.trim() ? C.onPrimary : C.textFaint} />
              </Pressable>
            </View>
          </GlassSurface>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, zIndex: 50 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(26,28,28,0.35)' },
  keyboard: { ...StyleSheet.absoluteFillObject },
  sheet: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 24,
    overflow: 'hidden',
    maxHeight: 340,
  },
  glass: { borderRadius: 24, overflow: 'hidden', padding: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  headerTitle: { fontFamily: FONTS.semiBold, fontSize: 15 },
  headerSub: { fontFamily: FONTS.regular, fontSize: 11, marginTop: 1 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  messages: { maxHeight: 200 },
  messagesContent: { paddingHorizontal: 14, paddingBottom: 8, gap: 8 },
  bubbleRow: { alignItems: 'flex-start' },
  bubbleRowUser: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  bubbleText: { fontFamily: FONTS.regular, fontSize: 14, lineHeight: 20 },
  bubbleTime: { fontFamily: FONTS.regular, fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  typingBubble: { paddingVertical: 10 },
  typingText: { fontFamily: FONTS.regular, fontSize: 13, fontStyle: 'italic' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
