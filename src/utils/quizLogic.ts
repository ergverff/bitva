import { Test, Question, Answer } from '../data/types';

export interface QuizResult {
  score: number;
  totalQuestions: number;
  percent: number;
  verdictText: string;
  isPersonality?: boolean;
  personalityType?: string;
  personalityTitle?: string;
  details: {
    questionIndex: number;
    userAnswer: Answer;
    correctAnswer?: Answer;
    isCorrect: boolean;
    questionText: string;
    userAnswerText?: string;
    correctAnswerText?: string;
  }[];
}

/**
 * Проверяет правильность ответа для одного вопроса
 */
export function checkAnswer(question: Question, userAnswer: Answer): boolean {
  if (question.type === 'personality') {
    return true; // В personality-тестах нет правильных/неправильных ответов
  }

  switch (question.type) {
    case 'single':
    case 'boolean':
      return userAnswer === question.correct;

    case 'multiple':
      if (!Array.isArray(userAnswer) || !Array.isArray(question.correct)) {
        return false;
      }
      // Точное совпадение множеств
      const userSet = new Set(userAnswer);
      const correctSet = new Set(question.correct);
      if (userSet.size !== correctSet.size) return false;
      for (const item of userSet) {
        if (!correctSet.has(item)) return false;
      }
      return true;

    case 'text':
      if (typeof userAnswer !== 'string' || !Array.isArray(question.answers)) {
        return false;
      }
      const normalizedUser = userAnswer.trim().toLowerCase();
      return question.answers.some(
        ans => ans.trim().toLowerCase() === normalizedUser
      );

    default:
      return false;
  }
}

/**
 * Получает текстовое представление ответа
 */
export function getAnswerText(question: Question, answer: Answer): string {
  if (answer === null || answer === undefined) {
    return 'Не отвечено';
  }

  if (question.type === 'personality') {
    // Для personality просто возвращаем текст выбранных опций
    if (Array.isArray(answer)) {
      return answer.map(i => question.options[i]?.text || '').join(', ');
    }
    return question.options[answer as number]?.text || '';
  }

  switch (question.type) {
    case 'single':
    case 'boolean':
      const singleIndex = answer as number;
      return question.options[singleIndex]?.text || String(answer);

    case 'multiple':
      const indices = answer as number[];
      if (!Array.isArray(indices)) return String(answer);
      return indices.map(i => question.options[i]?.text || '').join(', ');

    case 'text':
      return String(answer);

    default:
      return String(answer);
  }
}

/**
 * Подсчитывает результаты теста
 */
export function calculateQuizResult(test: Test, answers: Answer[]): QuizResult {
  // Personality-тесты
  if (test.type === 'personality') {
    const resultCounts: Record<string, number> = {};
    
    answers.forEach((answer, index) => {
      const question = test.questions[index];
      if (question.type === 'single' || question.type === 'multiple' || question.type === 'boolean' || question.type === 'personality') {
        const selectedOptions = Array.isArray(answer) ? answer : [answer];
        selectedOptions.forEach(optIndex => {
          if (optIndex !== null && optIndex !== undefined && question.options[optIndex]) {
            const option = question.options[optIndex];
            if (option.resultId) {
              resultCounts[option.resultId] = (resultCounts[option.resultId] || 0) + 1;
            }
          }
        });
      }
    });

    // Находим тип с максимальным количеством очков
    let maxCount = -1;
    let winnerId = 'unknown';
    
    for (const [id, count] of Object.entries(resultCounts)) {
      if (count > maxCount) {
        maxCount = count;
        winnerId = id;
      }
    }

    const verdict = test.verdictsPersonality?.[winnerId];
    
    return {
      score: maxCount,
      totalQuestions: test.questions.length,
      percent: test.questions.length > 0 ? Math.round((maxCount / test.questions.length) * 100) : 0,
      verdictText: verdict ? `${verdict.title}. ${verdict.text}` : 'Результат не определен',
      isPersonality: true,
      personalityType: winnerId,
      personalityTitle: verdict?.title,
      details: answers.map((ans, i) => ({
        questionIndex: i,
        userAnswer: ans,
        isCorrect: true,
        questionText: test.questions[i].text,
        userAnswerText: getAnswerText(test.questions[i], ans)
      }))
    };
  }

  // Quiz-тесты
  let correctCount = 0;
  const details = answers.map((ans, i) => {
    const question = test.questions[i];
    const isCorrect = checkAnswer(question, ans);
    if (isCorrect) correctCount++;
    
    return {
      questionIndex: i,
      userAnswer: ans,
      correctAnswer: question.correct,
      isCorrect,
      questionText: question.text,
      userAnswerText: getAnswerText(question, ans),
      correctAnswerText: question.type !== 'text' 
        ? (Array.isArray(question.correct) 
            ? (question.correct as number[]).map(idx => question.options[idx]?.text).join(', ')
            : question.type === 'boolean'
              ? (question.correct ? 'Верно' : 'Неверно')
              : question.options[question.correct as number]?.text)
        : Array.isArray(question.answers) ? question.answers.join(' / ') : ''
    };
  });

  const percent = test.questions.length > 0 
    ? Math.round((correctCount / test.questions.length) * 100) 
    : 0;

  // Находим вердикт по порогу процента
  let verdictText = 'Результат не определен';
  if (test.verdictsQuiz && test.verdictsQuiz.length > 0) {
    // Сортируем вердикты по убыванию minPercent и берем первый подходящий
    const sortedVerdicts = [...test.verdictsQuiz].sort((a, b) => b.minPercent - a.minPercent);
    const matchedVerdict = sortedVerdicts.find(v => percent >= v.minPercent);
    if (matchedVerdict) {
      verdictText = matchedVerdict.text;
    } else {
      // Если ни один порог не достигнут, берем вердикт с самым низким порогом
      verdictText = sortedVerdicts[sortedVerdicts.length - 1]?.text || verdictText;
    }
  }

  return {
    score: correctCount,
    totalQuestions: test.questions.length,
    percent,
    verdictText,
    isPersonality: false,
    details
  };
}
