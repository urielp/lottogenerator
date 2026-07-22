import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, parse, isValid, parseISO } from "date-fns";

// Unified saved-items storage.
// One list per game, each item carries its source. Legacy keys
// (lottoDraws / savedLottoPredictions / chanceDraws / savedChancePredictions)
// are migrated into the unified list on every load, so screens that still
// write to legacy keys (e.g. PredictionsScreen) keep working.

export type SavedSource = "generated" | "prediction" | "manual";

export interface SavedLottoItem {
  id: string;
  numbers: number[];
  strongNumber: number;
  source: SavedSource;
  date: string; // display string dd/MM/yyyy HH:mm
  createdAt: number; // ms epoch, for sorting
}

export interface SavedChanceItem {
  id: string;
  hearts: string;
  diamonds: string;
  clubs: string;
  spades: string;
  source: SavedSource;
  date: string;
  createdAt: number;
}

const LOTTO_KEY = "lottoSavedV2";
const CHANCE_KEY = "chanceSavedV2";

const LEGACY_LOTTO_KEY = "lottoDraws";
const LEGACY_LOTTO_PREDICTIONS_KEY = "savedLottoPredictions";
const LEGACY_CHANCE_KEY = "chanceDraws";
const LEGACY_CHANCE_PREDICTIONS_KEY = "savedChancePredictions";

const DISPLAY_FORMAT = "dd/MM/yyyy HH:mm";

const makeId = (): string =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

export const nowDisplayDate = (): string => format(new Date(), DISPLAY_FORMAT);

// Normalize the various legacy date formats to a display string + timestamp
const normalizeDate = (raw: unknown): { date: string; createdAt: number } => {
  if (typeof raw === "string" && raw.length > 0) {
    const candidates = [
      parse(raw, DISPLAY_FORMAT, new Date()),
      parse(raw, "dd.MM.yyyy, HH:mm", new Date()),
      parseISO(raw),
      new Date(raw),
    ];
    for (const parsed of candidates) {
      if (isValid(parsed)) {
        return { date: format(parsed, DISPLAY_FORMAT), createdAt: parsed.getTime() };
      }
    }
  }
  return { date: "תאריך לא תקין", createdAt: 0 };
};

const readJson = async (key: string): Promise<any[]> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const sortByNewest = <T extends { createdAt: number }>(items: T[]): T[] =>
  [...items].sort((a, b) => b.createdAt - a.createdAt);

// ---------- Lotto ----------

const migrateLegacyLotto = async (): Promise<SavedLottoItem[]> => {
  const [regular, predictions] = await Promise.all([
    readJson(LEGACY_LOTTO_KEY),
    readJson(LEGACY_LOTTO_PREDICTIONS_KEY),
  ]);
  if (!regular.length && !predictions.length) return [];

  const migrated: SavedLottoItem[] = [
    ...regular
      .filter((d: any) => Array.isArray(d?.numbers))
      .map((d: any) => ({
        id: d.uniqueId || makeId(),
        numbers: d.numbers,
        strongNumber: d.strongNumber,
        source: (d.isPredicted ? "prediction" : "generated") as SavedSource,
        ...normalizeDate(d.date),
      })),
    ...predictions
      .filter((p: any) => Array.isArray(p?.numbers))
      .map((p: any) => ({
        id: makeId(),
        numbers: p.numbers,
        strongNumber: p.strongNumber,
        source: "prediction" as SavedSource,
        ...normalizeDate(p.date),
      })),
  ];

  await AsyncStorage.multiRemove([
    LEGACY_LOTTO_KEY,
    LEGACY_LOTTO_PREDICTIONS_KEY,
  ]);
  return migrated;
};

export const loadSavedLotto = async (): Promise<SavedLottoItem[]> => {
  const [current, migrated] = await Promise.all([
    readJson(LOTTO_KEY) as Promise<SavedLottoItem[]>,
    migrateLegacyLotto(),
  ]);
  const all = sortByNewest([...current, ...migrated]);
  if (migrated.length) {
    await AsyncStorage.setItem(LOTTO_KEY, JSON.stringify(all));
  }
  return all;
};

export const addSavedLotto = async (
  item: Omit<SavedLottoItem, "id" | "date" | "createdAt">
): Promise<SavedLottoItem[]> => {
  const current = await loadSavedLotto();
  const newItem: SavedLottoItem = {
    ...item,
    id: makeId(),
    date: nowDisplayDate(),
    createdAt: Date.now(),
  };
  const updated = sortByNewest([newItem, ...current]);
  await AsyncStorage.setItem(LOTTO_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteSavedLotto = async (
  id: string
): Promise<SavedLottoItem[]> => {
  const current = await loadSavedLotto();
  const updated = current.filter((item) => item.id !== id);
  await AsyncStorage.setItem(LOTTO_KEY, JSON.stringify(updated));
  return updated;
};

// ---------- Chance ----------

const migrateLegacyChance = async (): Promise<SavedChanceItem[]> => {
  const [regular, predictions] = await Promise.all([
    readJson(LEGACY_CHANCE_KEY),
    readJson(LEGACY_CHANCE_PREDICTIONS_KEY),
  ]);
  if (!regular.length && !predictions.length) return [];

  const toItem = (d: any, source: SavedSource): SavedChanceItem => ({
    id: makeId(),
    hearts: String(d.hearts),
    diamonds: String(d.diamonds),
    clubs: String(d.clubs),
    spades: String(d.spades),
    source: d.isPredicted ? "prediction" : source,
    ...normalizeDate(d.date),
  });

  const migrated: SavedChanceItem[] = [
    ...regular.filter((d: any) => d?.hearts != null).map((d: any) => toItem(d, "generated")),
    ...predictions.filter((d: any) => d?.hearts != null).map((d: any) => toItem(d, "prediction")),
  ];

  await AsyncStorage.multiRemove([
    LEGACY_CHANCE_KEY,
    LEGACY_CHANCE_PREDICTIONS_KEY,
  ]);
  return migrated;
};

export const loadSavedChance = async (): Promise<SavedChanceItem[]> => {
  const [current, migrated] = await Promise.all([
    readJson(CHANCE_KEY) as Promise<SavedChanceItem[]>,
    migrateLegacyChance(),
  ]);
  const all = sortByNewest([...current, ...migrated]);
  if (migrated.length) {
    await AsyncStorage.setItem(CHANCE_KEY, JSON.stringify(all));
  }
  return all;
};

export const addSavedChance = async (
  item: Omit<SavedChanceItem, "id" | "date" | "createdAt">
): Promise<SavedChanceItem[]> => {
  const current = await loadSavedChance();
  const newItem: SavedChanceItem = {
    ...item,
    id: makeId(),
    date: nowDisplayDate(),
    createdAt: Date.now(),
  };
  const updated = sortByNewest([newItem, ...current]);
  await AsyncStorage.setItem(CHANCE_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteSavedChance = async (
  id: string
): Promise<SavedChanceItem[]> => {
  const current = await loadSavedChance();
  const updated = current.filter((item) => item.id !== id);
  await AsyncStorage.setItem(CHANCE_KEY, JSON.stringify(updated));
  return updated;
};
