export enum ItemType {
  TASK = 'TASK',
  IDEA = 'IDEA',
  THOUGHT = 'THOUGHT',
  NOISE = 'NOISE'
}

export enum EnergyLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum Urgency {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum AppMode {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  BRAIN_DUMP = 'BRAIN_DUMP',
  TUNNEL = 'TUNNEL',
  SURVIVAL = 'SURVIVAL',
  SHARE = 'SHARE',
  IDEA_DETAIL = 'IDEA_DETAIL',
  CALENDAR = 'CALENDAR',
  IDEA_ECOSYSTEM = 'IDEA_ECOSYSTEM',
  SETTINGS = 'SETTINGS'
}

export type Language = 'en' | 'es' | 'pt' | 'ru';

export interface RamItem {
  id: string;
  originalText: string;
  processedText: string;
  type: ItemType;
  energy: EnergyLevel;
  urgency: Urgency;
  createdAt: number;
  completedAt?: number;
  isDiscarded: boolean;
  tags: string[];
  temporalCue?: string; // e.g. "tomorrow", "next friday"
  estimatedDate?: string; // ISO 8601 YYYY-MM-DD
}

export interface MentalLoop {
  id: string;
  theme: string;
  itemIds: string[];
  insight: string;
  frequency: number;
  timeSpan: string; // e.g., "over 3 days"
}

export interface IdeaCluster {
  id: string;
  name: string; // e.g. "Novel Concepts"
  description: string; // "Ideas related to your sci-fi book"
  itemIds: string[];
  tags: string[];
}

export interface UserPersona {
  type: string; // e.g., "The Dopamine Hunter"
  description: string;
  powerTrait: string;
  kryptonite: string;
}

export interface Interaction {
  taskId: string;
  action: 'COMPLETED' | 'SKIPPED';
  taskEnergy: EnergyLevel;
  timestamp: number;
}

export interface UserState {
  hasOnboarded: boolean;
  name: string;
  language: Language;
  persona: UserPersona | null;
  chaosLevel: number; // 0-100
  history: Interaction[];
}