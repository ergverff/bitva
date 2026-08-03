import { useTranslation } from '../hooks/useI18n';
import { useYandex } from '../hooks/useYandex';

interface AchievementsScreenProps {
  onBack: () => void;
}

export default function AchievementsScreen({ onBack }: AchievementsScreenProps) {
  const t = useTranslation();
  const yandex = useYandex();

  // Получаем список достижений из SDK (или заглушки)
  const achievements = yandex.achievements || [];

  return (
    <div className="screen achievements-screen">
      <header className="screen-header">
        <button className="btn-icon btn-back" onClick={onBack} aria-label={t('common.back')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="screen-title">{t('achievements.title')}</h1>
      </header>

      <div className="achievements-list">
        {achievements.length === 0 ? (
          <p className="achievements-empty">{t('achievements.empty')}</p>
        ) : (
          achievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="achievement-icon">
                {achievement.unlocked ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                )}
              </div>
              <div className="achievement-info">
                <h3 className="achievement-title">{achievement.title}</h3>
                <p className="achievement-description">{achievement.description}</p>
                {achievement.unlocked && achievement.unlockedDate && (
                  <p className="achievement-date">
                    {t('achievements.unlockedAt')} {new Date(achievement.unlockedDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
