import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { aiAPI } from '../services/api';
import { ChatMessage } from '../types';
import { useLanguage } from '../context/LanguageContext';

export default function AIChatScreen() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  const contextText = useMemo(
    () =>
      messages
        .slice(-6)
        .map((m) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
        .join('\n'),
    [messages]
  );

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    setIsWaiting(true);

    try {
      const response = await aiAPI.chat(text, contextText || null);
      if (response.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: response.data.reply,
            source: response.data.source,
          },
        ]);
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: error.response?.data?.message || t('ai.error'),
          source: 'error',
        },
      ]);
    } finally {
      setLoading(false);
      setIsWaiting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🤖 {t('ai.title')}</Text>
        <Text style={styles.subtitle}>{t('ai.subtitle')}</Text>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={messages.length === 0 ? styles.emptyWrap : styles.messagesWrap}
        data={messages}
        keyExtractor={(_, idx) => String(idx)}
        ListEmptyComponent={<Text style={styles.emptyText}>{t('ai.empty')}</Text>}
        renderItem={({ item }) => (
          <View style={[styles.message, item.role === 'user' ? styles.userMessage : styles.aiMessage]}>
            <Text style={styles.messageText}>{item.content}</Text>
          </View>
        )}
      />

      {isWaiting && (
        <View style={styles.waiting}>
          <ActivityIndicator color="#8aa0ff" />
          <Text style={styles.waitingText}>{t('ai.thinking')}</Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <Pressable style={styles.clearBtn} onPress={() => setMessages([])}>
          <Text style={styles.clearBtnText}>🗑</Text>
        </Pressable>
        <TextInput
          style={styles.input}
          placeholder={t('ai.askPlaceholder')}
          placeholderTextColor="#778099"
          value={input}
          onChangeText={setInput}
          editable={!loading}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <Pressable style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]} onPress={sendMessage} disabled={!input.trim() || loading}>
          <Text style={styles.sendBtnText}>{loading ? '⏳' : '➤'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1115' },
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  title: { color: '#f2f4fa', fontSize: 24, fontWeight: '700' },
  subtitle: { color: '#9ca6bd', fontSize: 14, marginTop: 4 },
  list: { flex: 1 },
  emptyWrap: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  messagesWrap: { padding: 12, gap: 10 },
  emptyText: { color: '#8f97aa' },
  message: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, maxWidth: '88%' },
  userMessage: { backgroundColor: '#355cff', marginLeft: 'auto' },
  aiMessage: { backgroundColor: '#1a1d26', borderWidth: 1, borderColor: '#2e3649', marginRight: 'auto' },
  messageText: { color: '#eff2fa', fontSize: 15, lineHeight: 20 },
  waiting: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  waitingText: { color: '#93a3d5' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#1f2430',
    backgroundColor: '#12151d',
  },
  clearBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1c2130',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtnText: { color: '#c4cbdd' },
  input: {
    flex: 1,
    backgroundColor: '#1a1f2c',
    borderWidth: 1,
    borderColor: '#2b3347',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#f5f7fb',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#4066ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.55 },
  sendBtnText: { color: 'white', fontSize: 17, fontWeight: '700' },
});
