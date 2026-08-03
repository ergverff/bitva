/**
 * TODO СЛОТ: Анимация раскрытия статистики
 * Разработчик подставит компонент с reactbits.dev
 */

interface StatsExpandSlotProps {
  expanded: boolean;
  onToggle: () => void;
  playerName: string;
  testsCompleted: number;
  achievementsCount: number;
}

export default function StatsExpandSlot({
  expanded,
  onToggle,
  playerName,
  testsCompleted,
  achievementsCount,
}: StatsExpandSlotProps) {
  // Заглушка: плавное раскрытие через CSS
  // После интеграции можно добавить более сложную анимацию
  
  return (
    <div style={styles.container}>
      <button onClick={onToggle} style={styles.toggleButton}>
        <span style={styles.playerName}>{playerName}</span>
        <span style={styles.chevron}>{expanded ? '▲' : '▼'}</span>
      </button>
      
      <div style={{
        ...styles.statsContent,
        maxHeight: expanded ? '200px' : '0',
        opacity: expanded ? 1 : 0,
      }}>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{testsCompleted}</span>
          <span style={styles.statLabel}>тестов пройдено</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{achievementsCount}</span>
          <span style={styles.statLabel}>ачивок</span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    bottom: 'var(--space-6)',
    right: 'var(--space-6)',
    zIndex: 50,
  },
  toggleButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-4) var(--space-5)',
    backgroundColor: 'var(--surface-elevated)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    transition: 'all var(--duration-fast) var(--easing-default)',
  },
  playerName: {
    fontWeight: 600,
    fontSize: 'var(--text-sm)',
  },
  chevron: {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-muted)',
  },
  statsContent: {
    overflow: 'hidden',
    marginTop: 'var(--space-2)',
    padding: 'var(--space-4)',
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    transition: 'all var(--duration-normal) var(--easing-default)',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 'var(--space-2) 0',
  },
  statValue: {
    fontSize: 'var(--text-2xl)',
    fontWeight: 700,
    fontFamily: 'var(--font-display)',
  },
  statLabel: {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: 'var(--tracking-wide)',
  },
};
