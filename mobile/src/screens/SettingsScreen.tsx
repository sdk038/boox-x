import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

type Props = {
  onOpenAuth: () => void;
};

export default function SettingsScreen({ onOpenAuth }: Props) {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('settings.title')}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>{t('settings.language')}</Text>
        <View style={styles.row}>
          <Pressable
            style={[styles.langBtn, language === 'ru' && styles.langBtnActive]}
            onPress={() => setLanguage('ru')}
          >
            <Text style={styles.langText}>{t('settings.languageRu')}</Text>
          </Pressable>
          <Pressable
            style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
            onPress={() => setLanguage('en')}
          >
            <Text style={styles.langText}>{t('settings.languageEn')}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.status}>
          {isAuthenticated
            ? `${t('settings.authStateUser')} ${user.name}`
            : t('settings.authStateGuest')}
        </Text>
        {isAuthenticated ? (
          <Pressable style={styles.outlineBtn} onPress={logout}>
            <Text style={styles.outlineText}>{t('common.logout')}</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.outlineBtn} onPress={onOpenAuth}>
            <Text style={styles.outlineText}>{t('settings.openAuth')}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1115', padding: 14, gap: 10 },
  title: { color: '#f4f6fa', fontSize: 24, fontWeight: '700', marginBottom: 6 },
  card: {
    borderWidth: 1,
    borderColor: '#2e3446',
    borderRadius: 14,
    backgroundColor: '#151922',
    padding: 12,
    gap: 10,
  },
  label: { color: '#dce3ff', fontWeight: '700', fontSize: 16 },
  row: { flexDirection: 'row', gap: 8 },
  langBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a3140',
    backgroundColor: '#141924',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  langBtnActive: {
    backgroundColor: '#1a2c66',
    borderColor: '#4f74ff',
  },
  langText: { color: '#eef2ff' },
  status: { color: '#aeb8cf', marginBottom: 4 },
  outlineBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#446cff',
    paddingVertical: 10,
    alignItems: 'center',
  },
  outlineText: { color: '#c9d7ff', fontWeight: '700' },
});
