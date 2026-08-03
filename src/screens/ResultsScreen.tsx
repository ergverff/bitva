import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getTestById, getQuizVerdict, getPersonalityResult, checkAnswer } from '../utils/testUtils';
import { t } from '../utils/i18n';
import { soundManager } from '../utils/sound';
import { vibrateFinish } from '../utils/vibration';
import { shareResult } from '../utils/share';
import { showInterstitial, showRewarded, resetAdCounter, unlockAchievement } from '../utils/yandex';
import { addTestResult, updateBestScore, loadStats, saveStats } from '../utils/storage';
import type { TestResult } from '../data/types';

export default function ResultsScreen() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showDetails, setShowDetails] = useState(false);
  const [detailsUnlocked, setDetailsUnlocked] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const test = testId ? getTestById(testId) : undefined;
  const answers = (location.state as any)?.answers || [];
  const questions = (location.state as any)?.questions || [];

  useEffect(() => {
    if (test) {
      // Звук и вибрация финиша
      soundManager.play('finish');
      vibrateFinish();
      
      // Считаем результаты
      let correctCount = 0;
      answers.forEach((answer: any, idx: number) => {
        if (answer && checkAnswer(questions[idx], answer)) {
          correctCount++;
        }
      });
      
      const percent = Math.round((correctCount / questions.length) * 100);
      
      // Сохраняем результат
      const result: TestResult = {
        testId: test.id,
        timestamp: Date.now(),
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        percent,
        answers,
        correctAnswersMap: {},
      };
      
      addTestResult(result);
      updateBestScore(test.id, percent);
      
      // Обновляем статистику
      const stats = loadStats();
      stats.testsCompleted++;
      saveStats(stats);
      resetAdCounter();
      
      // Проверяем ачивки
      unlockAchievement('first_test');
      if (percent === 100 && questions.length >= 20) {
        unlockAchievement('perfect_score');
      }
    }
  }, [test]);

  if (!test) {
    return <div>Загрузка...</div>;
  }

  // Подсчёт результатов
  let correctCount = 0;
  answers.forEach((answer: any, idx: number) => {
    if (answer && checkAnswer(questions[idx], answer)) {
      correctCount++;
    }
  });
  
  const percent = Math.round((correctCount / questions.length) * 100);
  
  // Вердикт
  let verdictText = '';
  let personalityResultTitle = '';
  
  if (test.type === 'quiz') {
    verdictText = getQuizVerdict(test, percent);
  } else {
    const pr = getPersonalityResult(test, answers);
    if (pr) {
      personalityResultTitle = pr.title;
      verdictText = pr.text;
    }
  }

  const handleShare = async () => {
    const result = await shareResult(test, {
      testId: test.id,
      timestamp: Date.now(),
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      percent,
      answers,
      correctAnswersMap: {},
    }, verdictText);
    
    if (result.success) {
      setToast(t('copied'));
      setTimeout(() => setToast(null), 2000);
      
      if (result.method === 'native') {
        unlockAchievement('first_share');
      }
    }
  };

  const handleRetry = async () => {
    await showInterstitial();
    navigate(`/test/${testId}`);
  };

  const handleMainMenu = async () => {
    await showInterstitial();
    navigate('/');
  };

  const handleUnlockDetails = async () => {
    const rewarded = await showRewarded(() => {
      setDetailsUnlocked(true);
      setShowDetails(true);
    });
  };

  // Ошибки для расшифровки
  const wrongAnswers = questions.map((q: any, idx: number) => ({
    question: q,
    userAnswer: answers[idx],
    isCorrect: answers[idx] && checkAnswer(q, answers[idx]),
  })).filter(item => !item.isCorrect);

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        {/* Кто прошёл */}
        <span className="caption">{t('player_name')}</span>
        <h2 className="heading-lg" style={styles.playerName}>Игрок</h2>

        {/* Название теста */}
        <h1 className="display-text" style={styles.testTitle}>{test.title}</h1>

        {/* Вердикт */}
        <div className="card card-elevated" style={styles.verdictCard}>
          {test.type === 'personality' && personalityResultTitle && (
            <span className="caption" style={styles.personalityType}>{personalityResultTitle}</span>
          )}
          <p style={styles.verdictText}>{verdictText}</p>
        </div>

        {/* Процент */}
        {test.type === 'quiz' && (
          <div style={styles.percentContainer}>
            <span className="mono heading-xl" style={styles.percentValue}>{percent}%</span>
            <span className="caption">{t('correct_percent')}</span>
          </div>
        )}

        {/* Кнопки действий */}
        <div style={styles.actions}>
          <button onClick={handleShare} className="btn btn-secondary" style={styles.actionButton}>
            📤 {t('share')}
          </button>
          
          <button onClick={handleRetry} className="btn btn-primary" style={styles.actionButton}>
            🔄 {t('retry')}
          </button>
          
          <button onClick={handleMainMenu} className="btn btn-ghost" style={styles.actionButton}>
            🏠 {t('main_menu')}
          </button>
        </div>

        {/* Расшифровка */}
        <div style={styles.detailsSection}>
          {detailsUnlocked ? (
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="btn btn-ghost"
              style={styles.detailsToggle}
            >
              {showDetails ? '▲' : '▼'} {t('show_details')}
            </button>
          ) : (
            <button 
              onClick={handleUnlockDetails}
              className="btn btn-secondary"
              style={styles.unlockButton}
            >
              🔓 {t('unlock_details')}
            </button>
          )}
          
          {showDetails && detailsUnlocked && (
            <div style={styles.detailsContent}>
              {wrongAnswers.length === 0 ? (
                <p>Идеально! Нет ошибок.</p>
              ) : (
                wrongAnswers.map((item, idx) => (
                  <div key={idx} className="card" style={styles.errorItem}>
                    <p style={styles.errorQuestion}>{item.question.text}</p>
                    <p style={styles.errorAnswer}>
                      Ваш ответ: {formatAnswer(item.userAnswer, item.question)}
                    </p>
                    <p style={styles.errorCorrect}>
                      Правильно: {formatAnswer(getCorrectAnswer(item.question), item.question)}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* Тост */}
      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}
    </div>
  );
}

function formatAnswer(answer: any, question: any): string {
  if (!answer) return 'Не ответил';
  
  switch (question.type) {
    case 'single':
      return question.options[answer];
    case 'multiple':
      return Array.isArray(answer) 
        ? answer.map((i: number) => question.options[i]).join(', ')
        : '—';
    case 'boolean':
      return answer ? 'Да' : 'Нет';
    case 'text':
      return String(answer);
    default:
      return String(answer);
  }
}

function getCorrectAnswer(question: any): any {
  switch (question.type) {
    case 'single':
      return question.correct;
    case 'multiple':
      return question.correct;
    case 'boolean':
      return question.correct;
    case 'text':
      return question.answers[0];
    default:
      return null;
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: 'var(--space-6)',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '600px',
    margin: '0 auto',
    width: '100%',
  },
  playerName: {
    textAlign: 'center',
    marginBottom: 'var(--space-2)',
  },
  testTitle: {
    textAlign: 'center',
    marginBottom: 'var(--space-8)',
  },
  verdictCard: {
    width: '100%',
    marginBottom: 'var(--space-8)',
    textAlign: 'center',
  },
  personalityType: {
    display: 'block',
    marginBottom: 'var(--space-3)',
    color: 'var(--accent)',
  },
  verdictText: {
    fontSize: 'var(--text-lg)',
    lineHeight: 1.6,
  },
  percentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 'var(--space-8)',
  },
  percentValue: {
    fontSize: 'var(--text-4xl)',
    color: 'var(--accent)',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
    width: '100%',
    marginBottom: 'var(--space-8)',
  },
  actionButton: {
    width: '100%',
    padding: 'var(--space-4)',
  },
  detailsSection: {
    width: '100%',
    borderTop: '1px solid var(--line)',
    paddingTop: 'var(--space-6)',
  },
  detailsToggle: {
    width: '100%',
    justifyContent: 'center',
  },
  unlockButton: {
    width: '100%',
    padding: 'var(--space-4)',
  },
  detailsContent: {
    marginTop: 'var(--space-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
  },
  errorItem: {
    padding: 'var(--space-4)',
  },
  errorQuestion: {
    fontWeight: 600,
    marginBottom: 'var(--space-2)',
  },
  errorAnswer: {
    fontSize: 'var(--text-sm)',
    color: '#ff4444',
    marginBottom: 'var(--space-1)',
  },
  errorCorrect: {
    fontSize: 'var(--text-sm)',
    color: '#44ff44',
  },
};
