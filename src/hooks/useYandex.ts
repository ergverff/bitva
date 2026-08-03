import { useState, useEffect } from 'react';
import {
  initYandexSDK,
  getPlayerName,
  setPlayerName as setPlayerNameUtil,
  showInterstitial as showInterstitialUtil,
  showRewarded as showRewardedUtil,
  purchaseNoAds as purchaseNoAdsUtil,
  checkNoAds as checkNoAdsUtil,
  getAchievements as getAchievementsUtil,
  unlockAchievement as unlockAchievementUtil,
  isDev,
} from '../utils/yandex';
import type { Achievement } from '../data/types';

export interface UseYandexReturn {
  loading: boolean;
  playerName: string;
  noAds: boolean;
  achievements: Achievement[];
  isDevMode: boolean;
  setPlayerName: (name: string) => Promise<void>;
  showInterstitial: () => Promise<boolean>;
  showRewarded: (onReward: () => void) => Promise<boolean>;
  purchaseNoAds: () => Promise<boolean>;
  unlockAchievement: (id: string) => Promise<void>;
}

export function useYandex(): UseYandexReturn {
  const [loading, setLoading] = useState(true);
  const [playerName, setPlayerNameState] = useState('Игрок');
  const [noAds, setNoAds] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isDevMode, setIsDevMode] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        await initYandexSDK();
        setIsDevMode(isDev());
        
        // Получаем имя игрока
        const name = getPlayerName();
        setPlayerNameState(name);
        
        // Проверяем покупку noAds
        const hasNoAds = await checkNoAdsUtil();
        setNoAds(hasNoAds);
        
        // Получаем достижения
        const achs = await getAchievementsUtil();
        setAchievements(achs);
      } catch (error) {
        console.error('Failed to initialize Yandex SDK:', error);
        setIsDevMode(true);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  const setPlayerName = async (name: string) => {
    await setPlayerNameUtil(name);
    setPlayerNameState(name);
  };

  const showInterstitial = async () => {
    if (noAds) return false;
    return showInterstitialUtil();
  };

  const showRewarded = async (onReward: () => void) => {
    const success = await showRewardedUtil(onReward);
    return success;
  };

  const purchaseNoAdsAction = async () => {
    const success = await purchaseNoAdsUtil();
    if (success) {
      setNoAds(true);
    }
    return success;
  };

  const unlockAchievement = async (id: string) => {
    await unlockAchievementUtil(id);
    // Обновляем локальный список
    const updated = await getAchievementsUtil();
    setAchievements(updated);
  };

  return {
    loading,
    playerName,
    noAds,
    achievements,
    isDevMode,
    setPlayerName,
    showInterstitial,
    showRewarded,
    purchaseNoAds: purchaseNoAdsAction,
    unlockAchievement,
  };
}
