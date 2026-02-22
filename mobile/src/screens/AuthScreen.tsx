import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

export default function AuthScreen({ navigation }: Props) {
  const { login, register } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const title = useMemo(
    () => (mode === 'login' ? t('auth.titleLogin') : t('auth.titleRegister')),
    [mode, t]
  );

  const onSubmit = async () => {
    if (!email.trim() || !password.trim() || (mode === 'register' && !name.trim())) {
      Alert.alert(t('common.cancel'), t('auth.fillAllFields'));
      return;
    }
    if (mode === 'register' && password.length < 6) {
      Alert.alert(t('common.cancel'), t('auth.passwordMin'));
      return;
    }

    setLoading(true);
    const result =
      mode === 'login'
        ? await login(email.trim(), password)
        : await register({ name: name.trim(), email: email.trim(), password });
    setLoading(false);

    if (!result.success) {
      Alert.alert(t('common.cancel'), result.message || 'Error');
      return;
    }

    Alert.alert(t('auth.success'));
    navigation.replace('Main');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {mode === 'register' && (
        <TextInput
          style={styles.input}
          placeholder={t('auth.name')}
          placeholderTextColor="#7f8796"
          value={name}
          onChangeText={setName}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder={t('auth.email')}
        placeholderTextColor="#7f8796"
        value={email}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder={t('auth.password')}
        placeholderTextColor="#7f8796"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      <Pressable style={[styles.submit, loading && styles.disabled]} onPress={onSubmit} disabled={loading}>
        <Text style={styles.submitText}>{loading ? t('common.loading') : mode === 'login' ? t('common.login') : t('common.register')}</Text>
      </Pressable>

      <Pressable onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
        <Text style={styles.link}>
          {mode === 'login' ? t('auth.switchToRegister') : t('auth.switchToLogin')}
        </Text>
      </Pressable>

      <Pressable onPress={() => navigation.replace('Main')}>
        <Text style={styles.guest}>{t('auth.continueGuest')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1115',
    padding: 20,
    justifyContent: 'center',
    gap: 10,
  },
  title: {
    color: '#f5f7fb',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#171a22',
    borderWidth: 1,
    borderColor: '#2a3140',
    borderRadius: 12,
    color: '#f5f7fb',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  submit: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#4066ff',
  },
  submitText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.7,
  },
  link: {
    color: '#9db2ff',
    textAlign: 'center',
    marginTop: 8,
  },
  guest: {
    color: '#98a1b3',
    textAlign: 'center',
    marginTop: 6,
  },
});
