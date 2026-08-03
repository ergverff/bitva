import { useState, useEffect } from 'react';
import { loadStats, saveStats, loadSettings, saveSettings, loadResults, saveResult as saveResultUtil } from '../utils/storage';
import type { PlayerStats, PlayerSettings, TestResult } from '../data/types';

export interface UseStorageReturn {
  stats: PlayerStats;
  settings: PlayerSettings;
  updateStats: (updates: Partial<PlayerStats>) => void;
  updateSettings: (updates: Partial<PlayerSettings>) => void;
  saveTestResult: (result: TestResult) => void;
  resetAll: () => void;
}

export function useStorage(): UseStorageReturn {
  const [stats, setStats] = useState<PlayerStats>(loadStats());
  const [settings, setSettings] = useState<PlayerSettings>(loadSettings());

  // Сохраняем статистику при изменении
  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  // Сохраняем настройки при изменении
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateStats = (updates: Partial<PlayerStats>) => {
    setStats(prev => ({ ...prev, ...updates }));
  };

  const updateSettings = (updates: Partial<PlayerSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const saveTestResult = (result: TestResult) => {
    saveResultUtil(result);
    // Обновляем статистику
    updateStats({
      testsCompleted: stats.testsCompleted + 1,
    });
  };

  const resetAll = () => {
    localStorage.clear();
    setStats(loadStats());
    setSettings(loadSettings());
  };

  return {
    stats,
    settings,
    updateStats,
    updateSettings,
    saveTestResult,
    resetAll,
  };
}
