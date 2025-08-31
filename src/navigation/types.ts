import type { ImageSourcePropType } from 'react-native';

export type RootStackParamList = {
  Loader: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
};

export type MainTabParamList = {
  Menu: undefined;
  Tales: undefined;          // тут будет вложенный стек
  Achievements: undefined;
  Settings: undefined;
};

export type Category = 'lotus' | 'star' | 'grove' | 'moon' | 'wind';
export type TaleNodeId = string;

export type TaleNode = {
  text: string;
  choices?: { label: string; next: TaleNodeId }[];
  isEnding?: boolean;
};

export type TaleParam = {
  id: string;
  title: string;
  category: Category;
  thumb: ImageSourcePropType;
  start: TaleNodeId;
  nodes: Record<TaleNodeId, TaleNode>;
};

export type TalesStackParamList = {
  TalesList: undefined;
  TaleReader: { tale: TaleParam };
};
