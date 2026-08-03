import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '../utils/i18n';
import { soundManager } from '../utils/sound';
import { loadSettings, saveSettings, resetProgress } from '../utils/storage';
import { getPlayerName, setPlayerName, purchaseNoAds, checkNoAds } from '../utils/yandex';

export default function SettingsScreen() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(loadSettings());
  const [playerName, setLocalPlayerName] = useState(getPlayerName());
  const [editName, setEditName] = useState(false);
  const [noAds, setNoAds] = useState(false);

  const handleThemeToggle = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    const newSettings = { ...settings, theme: newTheme };
    setSettings(newSettings);
    saveSettings(newSettings);
    document.documentElement.setAttribute('data-theme', newTheme);
    soundManager.play('click');
  };

  const handleSoundToggle = () => {
    const newSettings = { ...settings, soundEnabled: !settings.soundEnabled };
    setSettings(newSettings);
    saveSettings(newSettings);
    soundManager.setEnabled(newSettings.soundEnabled);
    soundManager.play('click');
  };

  const handleSaveName = async () => {
    await setPlayerName(playerName);
    setEditName(false);
    soundManager.play('click');
  };

  const handlePurchaseNoAds = async () => {
    const success = await purchaseNoAds();
    if (success) {
      setNoAds(true);
      soundManager.play('correct');
    }
  };

  const handleResetProgress = () => {
    if (window.confirm(t('reset_confirm'))) {
      resetProgress();
      soundManager.play('click');
      navigate('/');
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={() => navigate('/')} className="btn btn-ghost">
          ← Назад
        </button>
        <h1 className="heading-lg">{t('settings')}</h1>
      </header>

      <main style={styles.main}>
        {/* Тема */}
        <div className="card" style={styles.settingItem}>
          <span>{t('theme')}</span>
          <button 
            onClick={handleThemeToggle}
            className="btn btn-secondary"
          >
            {settings.theme === 'dark' ? '🌙' : '☀️'} {settings.theme === 'dark' ? t('dark') : t('light')}
          </button>
        </div>

        {/* Звук */}
        <div className="card" style={styles.settingItem}>
          <span>{t('sound')}</span>
          <button 
            onClick={handleSoundToggle}
            className="btn btn-secondary"
          >
            {settings.soundEnabled ? '🔊' : '🔇'} {settings.soundEnabled ? t('on') : t('off')}
          </button>
        </div>

        {/* Имя игрока */}
        <div className="card" style={styles.settingItem}>
          <span>{t('player_name')}</span>
          {editName ? (
            <div style={styles.nameEdit}>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setLocalPlayerName(e.target.value)}
                className="input"
                style={styles.nameInput}
              />
              <button onClick={handleSaveName} className="btn btn-primary">
                {t('save')}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { setEditName(true); soundManager.play('click'); }}
              className="btn btn-secondary"
            >
              {playerName} ✏️
            </button>
          )}
        </div>

        {/* Убрать рекламу */}
        {!noAds && (
          <div className="card card-elevated" style={styles.adsCard}>
            <div>
              <strong>{t('remove_ads')}</strong>
              <p style={styles.adsDesc}>{t('remove_ads_desc')}</p>
            </div>
            <button onClick={handlePurchaseNoAds} className="btn btn-primary">
              {t('remove_ads_price')}
            </button>
          </div>
        )}

        {/* Предложить тест */}
        <div className="card" style={styles.suggestCard}>
          <strong>{t('suggest_test')}</strong>
          <p style={styles.suggestDesc}>{t('suggest_test_desc')}</p>
        </div>

        {/* Сброс прогресса */}
        <button onClick={handleResetProgress} className="btn btn-ghost" style={styles.resetButton}>
          {t('reset_progress')}
        </button>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  header: { padding: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' },
  main: { flex: 1, padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: '600px', margin: '0 auto', width: '100%' },
  settingItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' },
  nameEdit: { display: 'flex', gap: 'var(--space-2)' },
  nameInput: { width: '150px' },
  adsCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: 'var(--accent)' },
  adsDesc: { fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: 0 },
  suggestCard: { textAlign: 'center' },
  suggestDesc: { fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: 'var(--space-2) 0 0' },
  resetButton: { marginTop: 'var(--space-4)', color: '#ff4444' },
};
