/**
 * ХРАНИЛИЩЕ (LOCALSTORAGE)
 */

import { PlayerStats, PlayerSettings, TestResult } from '../data/types';

const STORAGE_KEYS = {
  STATS: 'bitva_stats',
  SETTINGS: 'bitva_settings',
  RESULTS: 'bitva_results',
};

// Дефолтная статистика
const defaultStats: PlayerStats = {
  testsCompleted: 0,
  achievementsUnlocked: [],
  bestScores: {},
  streak: 0,
  maxStreak: 0,
};

// Дефолтные настройки
const defaultSettings: PlayerSettings = {
  theme: 'dark',
  soundEnabled: true,
  playerName: 'Игрок',
  noAds: false,
};

/**
 * Загружает статистику игрока
 */
export function loadStats(): PlayerStats {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
    if (data) {
      return { ...defaultStats, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Failed to load stats:', e);
  }
  return defaultStats;
}

/**
 * Сохраняет статистику игрока
 */
export function saveStats(stats: PlayerStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats:', e);
  }
}

/**
 * Загружает настройки игрока
 */
export function loadSettings(): PlayerSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return defaultSettings;
}

/**
 * Сохраняет настройки игрока
 */
export function saveSettings(settings: PlayerSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

/**
 * Добавляет результат теста в историю
 */
export function addTestResult(result: TestResult): void {
  try {
    const results = getTestResults();
    results.push(result);
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
  } catch (e) {
    console.error('Failed to add test result:', e);
  }
}

/**
 * Получает все результаты тестов
 */
export function getTestResults(): TestResult[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RESULTS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load test results:', e);
  }
  return [];
}

/**
 * Получает лучший результат для теста
 */
export function getBestScore(testId: string): number {
  const stats = loadStats();
  return stats.bestScores[testId] || 0;
}

/**
 * Обновляет лучший результат для теста
 */
export function updateBestScore(testId: string, percent: number): void {
  const stats = loadStats();
  const currentBest = stats.bestScores[testId] || 0;
  
  if (percent > currentBest) {
    stats.bestScores[testId] = percent;
    saveStats(stats);
  }
}

/**
 * Сбрасывает весь прогресс
 */
export function resetProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.STATS);
    localStorage.removeItem(STORAGE_KEYS.RESULTS);
    // Настройки не сбрасываем
  } catch (e) {
    console.error('Failed to reset progress:', e);
  }
}
