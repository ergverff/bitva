/**
 * YANDEX GAMES SDK WRAPPER
 * Безопасные заглушки (stubs) для работы без SDK в режиме разработки
 */

import { PlayerSettings, Achievement } from '../data/types';

// ============================================================================
// КОНФИГУРАЦИЯ
// ============================================================================

export const ADS_EVERY_N_TESTS = 1; // Раз в N тестов показывать interstitial

// ============================================================================
// ТИПЫ
// ============================================================================

declare global {
  interface Window {
    YaGames?: {
      init: () => Promise<YandexSDK>;
    };
  }
}

interface YandexSDK {
  getPlayer(): Promise<Player | null>;
  showAd(params?: AdParams): Promise<void>;
  features?: {
    Leaderboards?: any;
  };
}

interface Player {
  getName(): string;
  getPhoto(): string;
  setData(data: object): Promise<void>;
  getData(): Promise<object>;
  setStats(stats: object): Promise<void>;
  getStats(): Promise<object>;
}

interface AdParams {
  callbacks?: {
    onOpen?: () => void;
    onClose?: () => void;
    onReward?: () => void;
  };
}

// ============================================================================
// STATE
// ============================================================================

let sdkInitialized = false;
let yandexSDK: YandexSDK | null = null;
let player: Player | null = null;
let isDevMode = true;

// Локальное хранилище для dev-режима
const devStorage = {
  playerName: 'Игрок',
  playerData: {} as Record<string, any>,
  playerStats: {} as Record<string, any>,
};

// ============================================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================================

/**
 * Инициализирует Яндекс SDK
 * Если SDK недоступен — работает в dev-режиме с заглушками
 */
export async function initYandexSDK(): Promise<void> {
  if (sdkInitialized) return;

  try {
    // Проверяем наличие SDK
    if (window.YaGames) {
      yandexSDK = await window.YaGames.init();
      sdkInitialized = true;
      isDevMode = false;

      // Получаем игрока
      try {
        player = await yandexSDK.getPlayer();
        if (player) {
          devStorage.playerName = player.getName();
        }
      } catch (e) {
        console.log('Player not available:', e);
      }
    } else {
      console.log('Yandex SDK not found, running in dev mode');
      sdkInitialized = true;
      isDevMode = true;
    }
  } catch (error) {
    console.error('Failed to initialize Yandex SDK:', error);
    sdkInitialized = true;
    isDevMode = true;
  }
}

/**
 * Проверяет, работает ли в dev-режиме
 */
export function isDev(): boolean {
  return isDevMode;
}

// ============================================================================
// ИГРОК
// ============================================================================

/**
 * Получает имя игрока
 */
export function getPlayerName(): string {
  return devStorage.playerName;
}

/**
 * Устанавливает имя игрока
 */
export async function setPlayerName(name: string): Promise<void> {
  devStorage.playerName = name;
  
  if (!isDevMode && player) {
    try {
      await player.setData({ ...devStorage.playerData, playerName: name });
    } catch (e) {
      console.error('Failed to set player name:', e);
    }
  }
}

/**
 * Получает данные игрока
 */
export async function getPlayerData(): Promise<Record<string, any>> {
  if (isDevMode) {
    return devStorage.playerData;
  }
  
  if (player) {
    try {
      devStorage.playerData = await player.getData();
      return devStorage.playerData;
    } catch (e) {
      console.error('Failed to get player data:', e);
    }
  }
  
  return devStorage.playerData;
}

/**
 * Сохраняет данные игрока
 */
export async function savePlayerData(data: Record<string, any>): Promise<void> {
  devStorage.playerData = data;
  
  if (!isDevMode && player) {
    try {
      await player.setData(data);
    } catch (e) {
      console.error('Failed to save player data:', e);
    }
  }
}

// ============================================================================
// РЕКЛАМА
// ============================================================================

let lastInterstitialTime = 0;
let testsSinceLastAd = 0;

/**
 * Показывает interstitial рекламу
 * Не чаще чем раз в 60 секунд и раз в N тестов
 */
export async function showInterstitial(): Promise<boolean> {
  const now = Date.now();
  const timeSinceLastAd = now - lastInterstitialTime;
  
  // Проверка частоты
  if (timeSinceLastAd < 60000) {
    console.log('Interstitial skipped: too soon');
    return false;
  }
  
  if (testsSinceLastAd < ADS_EVERY_N_TESTS) {
    testsSinceLastAd++;
    console.log('Interstitial skipped: not enough tests');
    return false;
  }
  
  // Проверка покупки "без рекламы"
  const data = await getPlayerData();
  if (data.noAds) {
    console.log('Interstitial skipped: noAds purchased');
    return false;
  }
  
  lastInterstitialTime = now;
  testsSinceLastAd = 0;
  
  if (isDevMode || !yandexSDK) {
    console.log('[DEV] Interstitial ad would be shown');
    return true;
  }
  
  try {
    await yandexSDK.showAd({
      callbacks: {
        onOpen: () => console.log('Interstitial opened'),
        onClose: () => console.log('Interstitial closed'),
      },
    });
    return true;
  } catch (e) {
    console.error('Failed to show interstitial:', e);
    return false;
  }
}

/**
 * Показывает rewarded рекламу
 */
export async function showRewarded(
  onReward: () => void
): Promise<boolean> {
  if (isDevMode || !yandexSDK) {
    console.log('[DEV] Rewarded ad would be shown');
    // В dev-режиме сразу выдаём награду
    setTimeout(onReward, 500);
    return true;
  }
  
  try {
    await yandexSDK.showAd({
      callbacks: {
        onOpen: () => console.log('Rewarded ad opened'),
        onClose: () => console.log('Rewarded ad closed'),
        onReward: () => {
          console.log('Reward received');
          onReward();
        },
      },
    });
    return true;
  } catch (e) {
    console.error('Failed to show rewarded ad:', e);
    return false;
  }
}

/**
 * Сбрасывает счётчик тестов для рекламы
 */
export function resetAdCounter(): void {
  testsSinceLastAd++;
}

// ============================================================================
// ПОКУПКИ (IAP)
// ============================================================================

/**
 * Покупка "Убрать рекламу" — 99₽
 */
export async function purchaseNoAds(): Promise<boolean> {
  if (isDevMode) {
    console.log('[DEV] Purchase "No Ads" for 99₽');
    const data = await getPlayerData();
    await savePlayerData({ ...data, noAds: true });
    return true;
  }
  
  // TODO: Реализовать через Yandex Payments
  console.log('IAP not implemented yet');
  return false;
}

/**
 * Проверяет, куплено ли "Убрать рекламу"
 */
export async function checkNoAds(): Promise<boolean> {
  const data = await getPlayerData();
  return !!data.noAds;
}

// ============================================================================
// ДОСТИЖЕНИЯ
// ============================================================================

const defaultAchievements: Achievement[] = [
  { id: 'first_test', title: 'Первый шаг', description: 'Пройти первый тест', icon: '🏆', unlocked: false },
  { id: 'ten_tests', title: 'Опытный', description: 'Пройти 10 тестов', icon: '🎯', unlocked: false },
  { id: 'fifty_tests', title: 'Эксперт', description: 'Пройти 50 тестов', icon: '⭐', unlocked: false },
  { id: 'hundred_tests', title: 'Легенда', description: 'Пройти 100 тестов', icon: '👑', unlocked: false },
  { id: 'perfect_score', title: 'Без ошибок', description: '100% на тесте от 20 вопросов', icon: '💯', unlocked: false },
  { id: 'streak_five', title: 'Серия', description: 'Серия из 5 тестов', icon: '🔥', unlocked: false },
  { id: 'all_categories', title: 'Разносторонний', description: 'Пройти все категории', icon: '🌟', unlocked: false },
  { id: 'first_share', title: 'Делитель', description: 'Первый репост', icon: '📤', unlocked: false },
  { id: 'name_set', title: 'Знакомство', description: 'Установить имя', icon: '📛', unlocked: false },
];

/**
 * Получает список достижений
 */
export async function getAchievements(): Promise<Achievement[]> {
  if (isDevMode) {
    const data = await getPlayerData();
    const unlockedIds = data.achievements || [];
    return defaultAchievements.map(a => ({
      ...a,
      unlocked: unlockedIds.includes(a.id),
      unlockedAt: unlockedIds.includes(a.id) ? data[`achievement_${a.id}`] : undefined,
    }));
  }
  
  // TODO: Интеграция с Yandex Achievements
  return defaultAchievements;
}

/**
 * Разблокирует достижение
 */
export async function unlockAchievement(achievementId: string): Promise<void> {
  const data = await getPlayerData();
  const unlockedIds = data.achievements || [];
  
  if (!unlockedIds.includes(achievementId)) {
    unlockedIds.push(achievementId);
    await savePlayerData({
      ...data,
      achievements: unlockedIds,
      [`achievement_${achievementId}`]: Date.now(),
    });
    
    console.log(`Achievement unlocked: ${achievementId}`);
    
    if (!isDevMode && yandexSDK) {
      // TODO: Отправить в Yandex SDK
    }
  }
}

/**
 * Проверяет и разблокирует достижения на основе статистики
 */
export async function checkAchievements(stats: {
  testsCompleted: number;
  categoriesCompleted: Set<string>;
  hasPerfectScore: boolean;
  streak: number;
}): Promise<string[]> {
  const unlocked: string[] = [];
  
  if (stats.testsCompleted >= 1) {
    await unlockAchievement('first_test');
    unlocked.push('first_test');
  }
  
  if (stats.testsCompleted >= 10) {
    await unlockAchievement('ten_tests');
    unlocked.push('ten_tests');
  }
  
  if (stats.testsCompleted >= 50) {
    await unlockAchievement('fifty_tests');
    unlocked.push('fifty_tests');
  }
  
  if (stats.testsCompleted >= 100) {
    await unlockAchievement('hundred_tests');
    unlocked.push('hundred_tests');
  }
  
  if (stats.hasPerfectScore) {
    await unlockAchievement('perfect_score');
    unlocked.push('perfect_score');
  }
  
  if (stats.streak >= 5) {
    await unlockAchievement('streak_five');
    unlocked.push('streak_five');
  }
  
  // Все категории пройдены
  if (stats.categoriesCompleted.size > 0) {
    // TODO: Проверить все ли категории
  }
  
  return unlocked;
}

// ============================================================================
// ЭКСПОРТ ДЛЯ DEBUG
// ============================================================================

if (typeof window !== 'undefined') {
  (window as any).__YANDEX_DEBUG__ = {
    isDevMode,
    getPlayerName,
    setPlayerName,
    getPlayerData,
    savePlayerData,
    showInterstitial,
    showRewarded,
    purchaseNoAds,
    getAchievements,
    unlockAchievement,
  };
}
