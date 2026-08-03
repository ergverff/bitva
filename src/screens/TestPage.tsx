import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTestById, selectQuestions, calculateEstimatedTime } from '../utils/testUtils';
import { t } from '../utils/i18n';
import { soundManager } from '../utils/sound';

const DIFFICULTIES = [20, 40, 60];

export default function TestPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState(20);

  const test = testId ? getTestById(testId) : undefined;

  if (!test) {
    return (
      <div style={styles.container}>
        <h2>Тест не найден</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          На главную
        </button>
      </div>
    );
  }

  const actualQuestions = Math.min(selectedDifficulty, test.questions.length);
  const estimatedMinutes = calculateEstimatedTime(actualQuestions);

  const handleStart = () => {
    soundManager.play('click');
    const questions = selectQuestions(test, selectedDifficulty);
    navigate(`/quiz/${testId}`, { 
      state: { 
        questions,
        difficulty: selectedDifficulty,
      } 
    });
  };

  return (
    <div style={styles.container}>
      {/* Хедер с кнопкой назад */}
      <header style={styles.header}>
        <button onClick={() => navigate('/')} className="btn btn-ghost">
          ← Назад
        </button>
      </header>

      {/* Контент */}
      <main style={styles.main}>
        <h1 className="heading-xl" style={styles.title}>{test.title}</h1>
        <p style={styles.description}>{test.description}</p>

        {/* Выбор сложности */}
        <div style={styles.difficultySection}>
          <span className="caption">{t('difficulty')}</span>
          <div style={styles.difficultyButtons}>
            {DIFFICULTIES.map((diff) => {
              const available = diff <= test.questions.length;
              const qCount = Math.min(diff, test.questions.length);
              const time = calculateEstimatedTime(qCount);
              
              return (
                <button
                  key={diff}
                  onClick={() => {
                    soundManager.play('click');
                    setSelectedDifficulty(diff);
                  }}
                  className={`chip ${selectedDifficulty === diff ? 'chip-active' : ''}`}
                  style={{
                    ...styles.difficultyButton,
                    opacity: available ? 1 : 0.5,
                    cursor: available ? 'pointer' : 'not-allowed',
                  }}
                  disabled={!available}
                >
                  {diff} {t('questions')}
                  <span style={styles.estimatedTime}>
                    {t('estimated_time').replace('{{minutes}}', String(time))}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Кнопка старта */}
        <button 
          onClick={handleStart}
          className="btn btn-primary"
          style={styles.startButton}
        >
          {t('start_test')}
        </button>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: 'var(--space-6)',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 'var(--space-8) var(--space-6)',
    maxWidth: '800px',
    margin: '0 auto',
    width: '100%',
  },
  title: {
    textAlign: 'center',
    marginBottom: 'var(--space-4)',
  },
  description: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: 'var(--text-lg)',
    marginBottom: 'var(--space-12)',
    maxWidth: '600px',
  },
  difficultySection: {
    width: '100%',
    marginBottom: 'var(--space-12)',
  },
  difficultyButtons: {
    display: 'flex',
    gap: 'var(--space-3)',
    marginTop: 'var(--space-4)',
    flexWrap: 'wrap',
  },
  difficultyButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 'var(--space-1)',
  },
  estimatedTime: {
    fontSize: 'var(--text-xs)',
    opacity: 0.7,
  },
  startButton: {
    padding: 'var(--space-5) var(--space-12)',
    fontSize: 'var(--text-lg)',
  },
};
