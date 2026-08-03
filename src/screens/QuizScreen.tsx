import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getTestById, checkAnswer } from '../utils/testUtils';
import { t } from '../utils/i18n';
import { soundManager } from '../utils/sound';
import { vibrateSuccess, vibrateError } from '../utils/vibration';
import { showRewarded } from '../utils/yandex';
import type { Question, Test } from '../data/types';

export default function QuizScreen() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | number[] | boolean | string)[]>([]);
  const [selectedSingle, setSelectedSingle] = useState<number | null>(null);
  const [selectedMultiple, setSelectedMultiple] = useState<number[]>([]);
  const [textAnswer, setTextAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [hintUsed, setHintUsed] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [showHintConfirm, setShowHintConfirm] = useState(false);

  const test = testId ? getTestById(testId) : undefined;
  const questions = (location.state as any)?.questions || [];
  const isPersonality = test?.type === 'personality';
  const timerEnabled = test?.timerEnabled && !isPersonality;

  // Таймер
  useEffect(() => {
    if (!timerEnabled || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerEnabled, currentIndex]);

  const handleTimeout = useCallback(() => {
    const behavior = test?.timeoutBehavior || 'wrong';
    
    if (behavior === 'skip') {
      handleNext(undefined);
    } else {
      handleNext(undefined); // засчитываем как ошибку
    }
  }, [test, currentIndex]);

  const currentQuestion = questions[currentIndex];

  const handleHint = async () => {
    if (!currentQuestion || currentQuestion.type !== 'single') return;
    
    setShowHintConfirm(true);
  };

  const confirmHint = async () => {
    setShowHintConfirm(false);
    
    const rewarded = await showRewarded(() => {
      setHintUsed(true);
      
      // Убираем 2 неверных варианта
      const correctIdx = (currentQuestion as any).correct;
      const allIndices = [0, 1, 2, 3].filter(i => i !== correctIdx);
      setHiddenOptions(allIndices.slice(0, 2));
    });
  };

  const handleSubmitSingle = () => {
    if (selectedSingle === null) return;
    handleNext(selectedSingle);
  };

  const handleSubmitMultiple = () => {
    if (selectedMultiple.length === 0) return;
    handleNext([...selectedMultiple]);
  };

  const handleSubmitBoolean = (value: boolean) => {
    handleNext(value);
  };

  const handleSubmitText = () => {
    if (!textAnswer.trim()) return;
    handleNext(textAnswer.trim());
  };

  const handleNext = (answer: typeof answers[0] | undefined) => {
    // Проверка ответа
    const isCorrect = answer !== undefined && checkAnswer(currentQuestion, answer);
    
    if (isCorrect) {
      soundManager.play('correct');
      vibrateSuccess();
    } else {
      soundManager.play('wrong');
      vibrateError();
    }

    const newAnswers = [...answers, answer ?? ''];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetQuestionState();
      setTimeLeft(30);
      setHintUsed(false);
      setHiddenOptions([]);
    } else {
      // Завершение теста
      finishTest(newAnswers);
    }
  };

  const resetQuestionState = () => {
    setSelectedSingle(null);
    setSelectedMultiple([]);
    setTextAnswer('');
  };

  const finishTest = (finalAnswers: typeof answers) => {
    navigate(`/results/${testId}`, {
      state: { answers: finalAnswers, questions },
    });
  };

  if (!test || !currentQuestion) {
    return <div>Загрузка...</div>;
  }

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const timerPercent = (timeLeft / 30) * 100;

  return (
    <div style={styles.container}>
      {/* Прогресс бар */}
      <div style={styles.progressContainer}>
        <div className="progress-bar" style={styles.progressBar}>
          <div 
            className="progress-bar-fill mono"
            style={{ 
              width: `${progressPercent}%`,
              transitionDuration: '300ms',
            }}
          />
        </div>
        <span className="mono caption" style={styles.questionCount}>
          {t('question_count')
            .replace('{{current}}', String(currentIndex + 1))
            .replace('{{total}}', String(questions.length))}
        </span>
      </div>

      {/* Таймер */}
      {timerEnabled && (
        <div style={styles.timerSection}>
          <div className="progress-bar" style={styles.timerBar}>
            <div 
              className="progress-bar-fill"
              style={{ 
                width: `${timerPercent}%`,
                transition: `width ${timeLeft}s linear`,
                backgroundColor: timeLeft < 10 ? '#ff4444' : 'var(--accent)',
              }}
            />
          </div>
          <span className="mono" style={styles.timerText}>{timeLeft} {t('time_left')}</span>
        </div>
      )}

      {/* Вопрос */}
      <main style={styles.main}>
        <h2 className="heading-md" style={styles.questionText}>
          {currentQuestion.text}
        </h2>

        {/* Варианты ответов */}
        <div style={styles.optionsContainer}>
          {currentQuestion.type === 'single' && (
            <>
              {(currentQuestion.options || []).map((option, idx) => (
                hiddenOptions.includes(idx) ? null : (
                  <button
                    key={idx}
                    onClick={() => setSelectedSingle(idx)}
                    className={`card ${selectedSingle === idx ? 'card-elevated' : ''}`}
                    style={{
                      ...styles.optionButton,
                      borderColor: selectedSingle === idx ? 'var(--accent)' : 'var(--line)',
                    }}
                  >
                    {option}
                  </button>
                )
              ))}
              
              {/* Кнопка подсказки */}
              {!hintUsed && (
                <button
                  onClick={handleHint}
                  className="btn btn-ghost"
                  style={styles.hintButton}
                >
                  💡 {t('hint')}
                </button>
              )}
            </>
          )}

          {currentQuestion.type === 'multiple' && (
            <>
              {(currentQuestion.options || []).map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedMultiple(prev => 
                      prev.includes(idx) 
                        ? prev.filter(i => i !== idx)
                        : [...prev, idx]
                    );
                  }}
                  className={`card ${selectedMultiple.includes(idx) ? 'card-elevated' : ''}`}
                  style={{
                    ...styles.optionButton,
                    borderColor: selectedMultiple.includes(idx) ? 'var(--accent)' : 'var(--line)',
                  }}
                >
                  {option}
                </button>
              ))}
            </>
          )}

          {currentQuestion.type === 'boolean' && (
            <div style={styles.booleanContainer}>
              <button
                onClick={() => handleSubmitBoolean(true)}
                className="card"
                style={styles.booleanButton}
              >
                ✓ Да
              </button>
              <button
                onClick={() => handleSubmitBoolean(false)}
                className="card"
                style={styles.booleanButton}
              >
                ✗ Нет
              </button>
            </div>
          )}

          {currentQuestion.type === 'text' && (
            <div style={styles.textContainer}>
              <input
                type="text"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Ваш ответ..."
                className="input"
                style={styles.textInput}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitText()}
              />
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div style={styles.actions}>
          {currentQuestion.type === 'single' && (
            <button
              onClick={handleSubmitSingle}
              disabled={selectedSingle === null}
              className="btn btn-primary"
              style={{
                ...styles.submitButton,
                opacity: selectedSingle === null ? 0.5 : 1,
              }}
            >
              {currentIndex < questions.length - 1 ? t('next') : t('finish')}
            </button>
          )}
          
          {currentQuestion.type === 'multiple' && (
            <button
              onClick={handleSubmitMultiple}
              disabled={selectedMultiple.length === 0}
              className="btn btn-primary"
              style={{
                ...styles.submitButton,
                opacity: selectedMultiple.length === 0 ? 0.5 : 1,
              }}
            >
              {currentIndex < questions.length - 1 ? t('next') : t('finish')}
            </button>
          )}
          
          {currentQuestion.type === 'text' && (
            <button
              onClick={handleSubmitText}
              disabled={!textAnswer.trim()}
              className="btn btn-primary"
              style={{
                ...styles.submitButton,
                opacity: !textAnswer.trim() ? 0.5 : 1,
              }}
            >
              {currentIndex < questions.length - 1 ? t('next') : t('finish')}
            </button>
          )}
        </div>
      </main>

      {/* Модалка подтверждения подсказки */}
      {showHintConfirm && (
        <div style={styles.modalOverlay}>
          <div className="card" style={styles.modal}>
            <h3>{t('hint_confirm')}</h3>
            <p style={styles.modalDesc}>{t('hint_description')}</p>
            <div style={styles.modalActions}>
              <button onClick={() => setShowHintConfirm(false)} className="btn btn-ghost">
                {t('cancel')}
              </button>
              <button onClick={confirmHint} className="btn btn-primary">
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: 'var(--space-6)',
  },
  progressContainer: {
    marginBottom: 'var(--space-4)',
  },
  progressBar: {
    marginBottom: 'var(--space-2)',
  },
  questionCount: {
    display: 'block',
    textAlign: 'right',
  },
  timerSection: {
    marginBottom: 'var(--space-6)',
  },
  timerBar: {
    height: '4px',
    marginBottom: 'var(--space-2)',
  },
  timerText: {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-muted)',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  questionText: {
    marginBottom: 'var(--space-8)',
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
    marginBottom: 'var(--space-8)',
  },
  optionButton: {
    padding: 'var(--space-4) var(--space-5)',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all var(--duration-fast) var(--easing-default)',
  },
  hintButton: {
    alignSelf: 'flex-start',
    marginTop: 'var(--space-2)',
  },
  booleanContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--space-4)',
  },
  booleanButton: {
    padding: 'var(--space-6)',
    fontSize: 'var(--text-lg)',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all var(--duration-fast)',
  },
  textContainer: {
    width: '100%',
  },
  textInput: {
    width: '100%',
    padding: 'var(--space-5)',
    fontSize: 'var(--text-lg)',
  },
  actions: {
    marginTop: 'auto',
  },
  submitButton: {
    width: '100%',
    padding: 'var(--space-5)',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    padding: 'var(--space-6)',
  },
  modal: {
    maxWidth: '400px',
    width: '100%',
  },
  modalDesc: {
    color: 'var(--text-muted)',
    margin: 'var(--space-4) 0',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'var(--space-3)',
    marginTop: 'var(--space-4)',
  },
};
