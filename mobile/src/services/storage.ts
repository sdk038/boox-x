import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppLanguage, User } from '../types';
import { DEFAULT_LANGUAGE } from '../i18n/translations';

const TOKEN_KEY = 'token';
const USER_KEY = 'currentUser';
const LANG_KEY = 'language';

export const secureStorage = {
  async getToken() {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async setToken(token: string) {
    return SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async removeToken() {
    return SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};

export const appStorage = {
  async getUser(): Promise<User | null> {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },
  async setUser(user: User) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  async removeUser() {
    await AsyncStorage.removeItem(USER_KEY);
  },
  async getLanguage(): Promise<AppLanguage> {
    const lang = await AsyncStorage.getItem(LANG_KEY);
    return lang === 'en' ? 'en' : DEFAULT_LANGUAGE;
  },
  async setLanguage(language: AppLanguage) {
    await AsyncStorage.setItem(LANG_KEY, language);
  },
};
