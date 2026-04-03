import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { aiAPI } from '../services/api';
import { GeneratedPresentation } from '../types';
import { useLanguage } from '../context/LanguageContext';

const STYLES: { id: string; label: string }[] = [
  { id: 'noir', label: 'Нуар' },
  { id: 'papirus', label: 'Папирус' },
  { id: 'neon', label: 'Неон' },
  { id: 'mist', label: 'Туман' },
];

export default function AIPresentationsScreen() {
  const { t } = useLanguage();
  const [topic, setTopic] = useState('');
  const [slidesCount, setSlidesCount] = useState('8');
  const [style, setStyle] = useState('noir');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedPresentation | null>(null);
  const [source, setSource] = useState('');

  const parsedSlideCount = useMemo(() => {
    const n = Number(slidesCount);
    if (!Number.isFinite(n) || n < 3) return 8;
    if (n > 20) return 20;
    return Math.floor(n);
  }, [slidesCount]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      Alert.alert(t('common.cancel'), t('presentations.enterTopic'));
      return;
    }
    try {
      setLoading(true);
      const response = await aiAPI.generatePresentation(topic.trim(), parsedSlideCount, style);
      if (response.data.success) {
        setResult(response.data.presentation);
        setSource(response.data.source || '');
      }
    } catch (error: any) {
      Alert.alert(t('common.cancel'), error.response?.data?.message || t('ai.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>📊 {t('presentations.title')}</Text>
      <TextInput
        style={styles.input}
        value={topic}
        onChangeText={setTopic}
        placeholder={t('presentations.topic')}
        placeholderTextColor="#778099"
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.inputSmall]}
          value={slidesCount}
          onChangeText={setSlidesCount}
          keyboardType="number-pad"
          placeholder={t('presentations.slides')}
          placeholderTextColor="#778099"
        />
        <View style={styles.stylesWrap}>
          {STYLES.map((variant) => (
            <Pressable
              key={variant.id}
              style={[styles.styleBtn, style === variant.id && styles.styleBtnActive]}
              onPress={() => setStyle(variant.id)}
            >
              <Text style={styles.styleText}>{variant.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Pressable style={styles.generateBtn} onPress={handleGenerate} disabled={loading}>
        <Text style={styles.generateText}>{loading ? t('common.loading') : t('presentations.generate')}</Text>
      </Pressable>

      {result && (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>{t('presentations.result')}: {result.title}</Text>
          <Text style={styles.resultMeta}>
            {t('presentations.source')}: {source || 'gemini'}
          </Text>
          {result.slides?.map((slide, idx) => (
            <View key={slide.id || idx} style={styles.slideCard}>
              <Text style={styles.slideMeta}>
                {idx + 1}. {slide.emoji ? `${slide.emoji} ` : ''}
                <Text style={styles.slideType}>{slide.type || 'slide'}</Text>
              </Text>
              <Text style={styles.slideTitle}>{slide.title}</Text>
              {slide.content ? <Text style={styles.slideContent}>{slide.content}</Text> : null}
              {slide.bullets?.map((bullet, bIdx) => (
                <Text key={bIdx} style={styles.bullet}>• {bullet}</Text>
              ))}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1115' },
  content: { padding: 14, gap: 10, paddingBottom: 30 },
  title: { color: '#f4f6fa', fontSize: 24, fontWeight: '700' },
  input: {
    backgroundColor: '#171a22',
    borderColor: '#2a3140',
    borderWidth: 1,
    borderRadius: 12,
    color: '#f2f4fb',
    padding: 12,
  },
  inputSmall: { width: 90 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  stylesWrap: { flexDirection: 'row', gap: 6, flex: 1, flexWrap: 'wrap' },
  styleBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a3140',
    backgroundColor: '#141924',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  styleBtnActive: {
    borderColor: '#4f74ff',
    backgroundColor: '#1a2c66',
  },
  styleText: { color: '#dce3ff' },
  generateBtn: {
    borderRadius: 12,
    backgroundColor: '#4066ff',
    paddingVertical: 12,
    alignItems: 'center',
  },
  generateText: { color: 'white', fontWeight: '700', fontSize: 16 },
  result: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#2d3447',
    borderRadius: 14,
    backgroundColor: '#151922',
    padding: 12,
    gap: 8,
  },
  resultTitle: { color: '#f2f4fb', fontWeight: '700', fontSize: 18 },
  resultMeta: { color: '#8f9ab8' },
  slideCard: { backgroundColor: '#1a2030', borderRadius: 10, padding: 10, gap: 4 },
  slideMeta: { color: '#8f9ab8', fontSize: 12 },
  slideType: { color: '#5ad4c4', fontSize: 12, textTransform: 'lowercase' as const },
  slideTitle: { color: '#eef3ff', fontWeight: '700' },
  slideContent: { color: '#b7c2dd' },
  bullet: { color: '#b7c2dd' },
});
