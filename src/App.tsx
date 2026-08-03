import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { initYandexSDK, getPlayerName, isDev } from './utils/yandex';
import { loadSettings, saveSettings } from './utils/storage';
import { soundManager } from './utils/sound';
import { autoDetectLocale, setLocale } from './utils/i18n';
import MainScreen from './screens/MainScreen';
import TestPage from './screens/TestPage';
import QuizScreen from './screens/QuizScreen';
import ResultsScreen from './screens/ResultsScreen';
import SettingsScreen from './screens/SettingsScreen';
import AchievementsScreen from './screens/AchievementsScreen';

function App() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Инициализация при старте
    const init = async () => {
      // Яндекс SDK
      await initYandexSDK();
      
      // Настройки
      const settings = loadSettings();
      document.documentElement.setAttribute('data-theme', settings.theme);
      soundManager.setEnabled(settings.soundEnabled);
      
      // Локализация
      const locale = autoDetectLocale();
      setLocale(locale);
      
      setInitialized(true);
    };
    
    init();
  }, []);

  if (!initialized) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-xl)',
        color: 'var(--text-muted)'
      }}>
        Загрузка...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<MainScreen />} />
      <Route path="/test/:testId" element={<TestPage />} />
      <Route path="/quiz/:testId" element={<QuizScreen />} />
      <Route path="/results/:testId" element={<ResultsScreen />} />
      <Route path="/settings" element={<SettingsScreen />} />
      <Route path="/achievements" element={<AchievementsScreen />} />
    </Routes>
  );
}

export default App;
