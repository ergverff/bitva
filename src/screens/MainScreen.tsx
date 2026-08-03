import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadTests, searchTests, getAllTestTags } from '../utils/testUtils';
import { getPlayerName } from '../utils/yandex';
import { loadStats } from '../utils/storage';
import { t } from '../utils/i18n';
import { soundManager } from '../utils/sound';
import SettingsIcon from '../components/icons/SettingsIcon';
import AchievementsIcon from '../components/icons/AchievementsIcon';
import BackgroundSlot from '../components/slots/BackgroundSlot';
import TagCloudSlot from '../components/slots/TagCloudSlot';
import StatsExpandSlot from '../components/slots/StatsExpandSlot';

export default function MainScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof import('../data/types').Test[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [stats, setStats] = useState({ testsCompleted: 0, achievementsCount: 0 });
  const [statsExpanded, setStatsExpanded] = useState(false);

  useEffect(() => {
    setPlayerName(getPlayerName());
    const s = loadStats();
    setStats({
      testsCompleted: s.testsCompleted,
      achievementsCount: s.achievementsUnlocked.length,
    });
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchTests(searchQuery);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  const handleTestSelect = (testId: string) => {
    soundManager.play('click');
    setShowSearchResults(false);
    setSearchQuery('');
    navigate(`/test/${testId}`);
  };

  const tags = getAllTestTags();

  return (
    <div style={styles.container}>
      {/* Фон - TODO СЛОТ */}
      <BackgroundSlot />

      {/* Хедер с кнопками */}
      <header style={styles.header}>
        <button 
          onClick={() => { soundManager.play('click'); navigate('/settings'); }}
          style={styles.iconButton}
          aria-label={t('settings')}
        >
          <SettingsIcon />
        </button>
        <button 
          onClick={() => { soundManager.play('click'); navigate('/achievements'); }}
          style={styles.iconButton}
          aria-label={t('achievements')}
        >
          <AchievementsIcon />
        </button>
      </header>

      {/* Основной контент */}
      <main style={styles.main}>
        {/* Заголовок */}
        <h1 className="display-text" style={styles.title}>
          {t('app_title')}
        </h1>

        {/* Облако тегов - TODO СЛОТ */}
        <div style={styles.tagCloudContainer}>
          <TagCloudSlot tags={tags} onTagClick={handleTestSelect} />
        </div>

        {/* Поиск */}
        <div style={styles.searchContainer}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setShowSearchResults(true)}
            onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
            placeholder={t('search_placeholder')}
            className="input"
            style={styles.searchInput}
          />
          
          {showSearchResults && searchResults.length > 0 && (
            <div style={styles.searchDropdown}>
              {searchResults.map((test) => (
                <button
                  key={test.id}
                  onClick={() => handleTestSelect(test.id)}
                  style={styles.searchResultItem}
                >
                  <span style={styles.searchResultTitle}>{test.title}</span>
                  <span style={styles.searchResultDesc}>{test.description}</span>
                </button>
              ))}
            </div>
          )}
          
          {showSearchResults && searchResults.length === 0 && searchQuery.trim() && (
            <div style={styles.searchDropdown}>
              <div style={styles.noResults}>{t('no_results')}</div>
            </div>
          )}
        </div>
      </main>

      {/* Статистика игрока - TODO СЛОТ для анимации раскрытия */}
      <StatsExpandSlot 
        expanded={statsExpanded}
        onToggle={() => setStatsExpanded(!statsExpanded)}
        playerName={playerName}
        testsCompleted={stats.testsCompleted}
        achievementsCount={stats.achievementsCount}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: 'var(--space-6)',
    position: 'relative',
    zIndex: 10,
  },
  iconButton: {
    padding: 'var(--space-3)',
    background: 'var(--surface-elevated)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--duration-fast) var(--easing-default)',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--space-8) var(--space-6)',
    position: 'relative',
    zIndex: 10,
  },
  title: {
    textAlign: 'center',
    marginBottom: 'var(--space-12)',
    width: '100%',
    maxWidth: '90vw',
  },
  tagCloudContainer: {
    width: '100%',
    maxWidth: '800px',
    marginBottom: 'var(--space-12)',
    minHeight: '200px',
  },
  searchContainer: {
    width: '100%',
    maxWidth: '600px',
    position: 'relative',
  },
  searchInput: {
    width: '100%',
    padding: 'var(--space-5) var(--space-6)',
    fontSize: 'var(--text-base)',
  },
  searchDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 'var(--space-2)',
    backgroundColor: 'var(--surface-elevated)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    maxHeight: '300px',
    overflowY: 'auto',
    zIndex: 100,
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  searchResultItem: {
    display: 'block',
    width: '100%',
    padding: 'var(--space-4) var(--space-5)',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    borderBottom: '1px solid var(--line)',
    cursor: 'pointer',
    transition: 'background var(--duration-fast)',
  },
  searchResultTitle: {
    display: 'block',
    fontWeight: 600,
    marginBottom: 'var(--space-1)',
  },
  searchResultDesc: {
    display: 'block',
    fontSize: 'var(--text-sm)',
    color: 'var(--text-muted)',
  },
  noResults: {
    padding: 'var(--space-5)',
    color: 'var(--text-muted)',
    textAlign: 'center',
  },
};
