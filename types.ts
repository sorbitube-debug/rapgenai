
export enum RapStyle {
  Gangsta = "گنگ و خیابانی",
  Emotional = "احساسی و دپ",
  Social = "اجتماعی و اعتراضی",
  Party = "پارتی و فان",
  Motivational = "انگیزشی",
  OldSchool = "اولد اسکول"
}

export enum RapTone {
  Aggressive = "پرخاشگر (Aggressive)",
  Philosophical = "فلسفی و عمیق (Deep)",
  Humorous = "طنز و کنایه‌آمیز (Sarcastic)",
  Dark = "تاریک و سیاه (Dark)",
  Melodic = "ملودیک و نرم (Soft)"
}

export enum RhymeComplexity {
  Simple = "ساده (Monosyllabic)",
  Medium = "استاندارد",
  Complex = "پیچیده (Multisyllabic)"
}

export enum RapLength {
  Short = "کوتاه",
  Medium = "استاندارد",
  Long = "طولانی"
}

export enum RhymeScheme {
  Freestyle = "آزاد (Freestyle)",
  AABB = "جفت (AABB)",
  ABAB = "یک در میان (ABAB)",
  AAAA = "تک قافیه (AAAA)"
}

export interface RhymeMatch {
  word: string;
  lineIdx: number;
  wordIdx: number;
  color: string;
  isInternal: boolean;
}

export interface FlowCoachAdvice {
  type: 'rhythm' | 'rhyme' | 'delivery';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface LyricResponse {
  title: string;
  content: string;
  variant: 'Standard_Flow_v1' | 'Complex_Metric_v2';
  suggestedStyle?: string;
  suggestedBpm?: number;
}

// --- CLOUD & COLLABORATION TYPES ---

export interface UserComment {
  id: string;
  lineIdx: number;
  author: string;
  text: string;
  timestamp: number;
  avatarColor: string;
}

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  isOnline: boolean;
  activeLine?: number;
}

export interface CloudProject {
  id: string;
  title: string;
  ownerId: string;
  lastModified: number;
  lyrics: string;
  style: RapStyle;
  bpm: number;
  comments: UserComment[];
  collaborators: Collaborator[];
}

// --- PLUGIN SYSTEM TYPES ---

export type PluginCategory = 'beat' | 'flow' | 'effect' | 'visual';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  category: PluginCategory;
  icon?: string;
}

export interface BeatPlugin extends PluginManifest {
  category: 'beat';
  generateBuffer: (ctx: BaseAudioContext, bpm: number) => AudioBuffer;
}

export interface FlowPlugin extends PluginManifest {
  category: 'flow';
  transformLyrics: (lyrics: string) => string;
}

export interface EffectPlugin extends PluginManifest {
  category: 'effect';
  applyEffect: (ctx: AudioContext, source: AudioNode) => AudioNode;
}

export type Plugin = BeatPlugin | FlowPlugin | EffectPlugin;
