
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

export const EVENTS = {
  STORY_RATED: 'story:rated',
  STORY_READ: 'story:read',
  CLEARED: 'achievements:cleared',
} as const;

const ratingKey = (id: string) => `ratings:${id}`;
const readKey = (id: string) => `story:read:${id}`;
const dayKey = (d: Date) => `activities:${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const loginKey = (d: Date) => `login:${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

export async function getRating(id: string): Promise<number> {
  const v = await AsyncStorage.getItem(ratingKey(id));
  return v ? Number(v) : 0;
}

export async function getRatings(ids: string[]): Promise<Record<string, number>> {
  if (!ids.length) return {};
  const pairs = await AsyncStorage.multiGet(ids.map(ratingKey));
  const out: Record<string, number> = {};
  pairs.forEach(([k, v]) => {
    const id = k.replace(/^ratings:/, '');
    out[id] = v ? Number(v) : 0;
  });
  return out;
}

export async function setRating(id: string, stars: number): Promise<void> {
  await AsyncStorage.setItem(ratingKey(id), String(stars));
  DeviceEventEmitter.emit(EVENTS.STORY_RATED, { id, stars });
}

export async function markStoryReadToday(taleId: string): Promise<void> {
  const now = new Date();
  await AsyncStorage.setItem(readKey(taleId), '1');

  const k = dayKey(now);
  try {
    const existing = await AsyncStorage.getItem(k);
    const obj = existing ? JSON.parse(existing) : {};
    const next = { ...obj, read: true };
    await AsyncStorage.setItem(k, JSON.stringify(next));
  } catch {
    await AsyncStorage.setItem(k, JSON.stringify({ read: true }));
  }

  await AsyncStorage.setItem(loginKey(now), '1');

  DeviceEventEmitter.emit(EVENTS.STORY_READ, { id: taleId });
}

export async function clearAllProgress(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const toRemove = keys.filter(
    (k) =>
      k.startsWith('ratings:') ||
      k.startsWith('activities:') ||
      k.startsWith('login:') ||
      k.startsWith('story:read:')
  );
  if (toRemove.length) await AsyncStorage.multiRemove(toRemove);
  DeviceEventEmitter.emit(EVENTS.CLEARED);
}
