import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { aiAPI } from '../services/api';
import { GeneratedProject } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

type Props = {
  onNeedAuth: () => void;
};

export default function AIProjectScreen({ onNeedAuth }: Props) {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [description, setDescription] = useState('');
  const [preferences, setPreferences] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedProject | null>(null);

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      Alert.alert(t('common.login'), t('project.reloginNeeded'));
      onNeedAuth();
      return;
    }
    if (!description.trim()) {
      Alert.alert(t('common.cancel'), t('project.emptyDescription'));
      return;
    }
    try {
      setLoading(true);
      const response = await aiAPI.generateProject(description.trim(), preferences.trim());
      if (response.data.success) {
        setResult(response.data.project);
      }
    } catch (error: any) {
      Alert.alert(t('common.cancel'), error.response?.data?.message || t('ai.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!result) return;
    try {
      setLoading(true);
      const response = await aiAPI.createProjectFromAI(result);
      if (response.data.success) {
        Alert.alert(t('auth.success'), `${response.data.board?.name || ''}`);
      }
    } catch (error: any) {
      Alert.alert(t('common.cancel'), error.response?.data?.message || t('ai.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>✨ {t('project.title')}</Text>
      <TextInput
        style={styles.textArea}
        value={description}
        onChangeText={setDescription}
        placeholder={t('project.description')}
        placeholderTextColor="#778099"
        multiline
      />
      <TextInput
        style={styles.textAreaSmall}
        value={preferences}
        onChangeText={setPreferences}
        placeholder={t('project.prefs')}
        placeholderTextColor="#778099"
        multiline
      />
      <Pressable style={styles.primaryBtn} onPress={handleGenerate} disabled={loading}>
        <Text style={styles.primaryText}>{loading ? t('common.loading') : t('project.generate')}</Text>
      </Pressable>

      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.projectName}>{result.projectName}</Text>
          <Text style={styles.desc}>{result.description}</Text>
          <Text style={styles.sectionTitle}>{t('project.tasks')} ({result.tasks?.length || 0})</Text>
          {result.tasks?.map((task, idx) => (
            <View key={idx} style={styles.taskItem}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskDesc}>{task.description}</Text>
            </View>
          ))}
          {result.recommendations && result.recommendations.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>{t('project.recommendations')}</Text>
              {result.recommendations.map((item, idx) => (
                <Text key={idx} style={styles.recItem}>• {item}</Text>
              ))}
            </>
          )}

          <Pressable style={styles.primaryBtn} onPress={handleCreate} disabled={loading}>
            <Text style={styles.primaryText}>{t('project.create')}</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1115' },
  content: { padding: 14, paddingBottom: 30, gap: 10 },
  title: { color: '#f4f6fa', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  textArea: {
    minHeight: 110,
    backgroundColor: '#171a22',
    borderColor: '#2a3140',
    borderWidth: 1,
    borderRadius: 12,
    color: '#f2f4fb',
    padding: 12,
    textAlignVertical: 'top',
  },
  textAreaSmall: {
    minHeight: 74,
    backgroundColor: '#171a22',
    borderColor: '#2a3140',
    borderWidth: 1,
    borderRadius: 12,
    color: '#f2f4fb',
    padding: 12,
    textAlignVertical: 'top',
  },
  primaryBtn: {
    backgroundColor: '#4066ff',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryText: { color: 'white', fontSize: 16, fontWeight: '700' },
  resultBox: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#2d3447',
    backgroundColor: '#151922',
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  projectName: { color: '#f2f4fb', fontSize: 20, fontWeight: '700' },
  desc: { color: '#adb6cb', lineHeight: 20 },
  sectionTitle: { color: '#dbe3ff', fontSize: 16, fontWeight: '700', marginTop: 4 },
  taskItem: { backgroundColor: '#1a2030', borderRadius: 10, padding: 10 },
  taskTitle: { color: '#f0f4ff', fontWeight: '700' },
  taskDesc: { color: '#a7b2cf', marginTop: 4, lineHeight: 18 },
  recItem: { color: '#aeb8d4', lineHeight: 20 },
});
