/**
 * УТИЛИТА ДЛЯ ЗАГРУЗКИ ТЕСТОВ
 */

import { Test } from '../data/types';
import testsData from '../data/tests.json';

/**
 * Загружает все тесты из JSON-файла
 */
export function loadTests(): Test[] {
  return (testsData as { tests: Test[] }).tests;
}

/**
 * Находит тест по ID
 */
export function getTestById(id: string): Test | undefined {
  const tests = loadTests();
  return tests.find(t => t.id === id);
}

/**
 * Получает уникальные теги (названия) всех тестов
 */
export function getAllTestTags(): string[] {
  const tests = loadTests();
  return tests.map(t => t.title);
}

/**
 * Ищет тесты по запросу (по названию или описанию)
 */
export function searchTests(query: string): Test[] {
  if (!query.trim()) return [];
  
  const tests = loadTests();
  const q = query.toLowerCase().trim();
  
  return tests.filter(t => 
    t.title.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q)
  );
}

/**
 * Перемешивает массив (алгоритм Фишера-Йетса)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Выбирает случайные вопросы из теста
 */
export function selectQuestions(test: Test, count: number): typeof test.questions {
  if (count >= test.questions.length) {
    return [...test.questions];
  }
  
  const shuffled = shuffleArray(test.questions);
  return shuffled.slice(0, count);
}

/**
 * Рассчитывает примерное время прохождения теста
 * Формула: вопросы × 30 сек × 0.8, округлить до минут
 */
export function calculateEstimatedTime(questionCount: number): number {
  const seconds = questionCount * 30 * 0.8;
  return Math.round(seconds / 60);
}

/**
 * Проверяет правильность ответа
 */
export function checkAnswer(
  question: Test['questions'][number],
  userAnswer: number | number[] | boolean | string
): boolean {
  switch (question.type) {
    case 'single':
      return userAnswer === question.correct;
    
    case 'multiple':
      if (!Array.isArray(userAnswer)) return false;
      const sortedUser = [...userAnswer].sort((a, b) => a - b);
      const sortedCorrect = [...question.correct].sort((a, b) => a - b);
      return JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect);
    
    case 'boolean':
      return userAnswer === question.correct;
    
    case 'text':
      if (typeof userAnswer !== 'string') return false;
      const normalizedUser = userAnswer.toLowerCase().trim();
      return question.answers.some(a => a.toLowerCase().trim() === normalizedUser);
    
    default:
      return false;
  }
}

/**
 * Получает вердикт для quiz-теста по проценту
 */
export function getQuizVerdict(test: Test, percent: number): string {
  if (!test.verdictsQuiz || test.verdictsQuiz.length === 0) {
    return 'Тест завершён!';
  }
  
  // Сортируем по убыванию minPercent и берём первый подходящий
  const sorted = [...test.verdictsQuiz].sort((a, b) => b.minPercent - a.minPercent);
  
  for (const verdict of sorted) {
    if (percent >= verdict.minPercent) {
      return verdict.text;
    }
  }
  
  return sorted[sorted.length - 1]?.text || 'Тест завершён!';
}

/**
 * Определяет победивший тип в personality-тесте
 */
export function getPersonalityResult(
  test: Test,
  answers: (number | number[] | boolean | string)[]
): { resultId: string; title: string; text: string } | null {
  if (!test.verdictsPersonality) {
    return null;
  }
  
  // Подсчитываем resultId для каждого ответа
  const resultCounts: Record<string, number> = {};
  
  answers.forEach((answer, index) => {
    const question = test.questions[index] as any;
    if (!question.optionResults) return;
    
    const resultIds = Array.isArray(answer)
      ? answer.flatMap(a => {
          const r = question.optionResults[a];
          return Array.isArray(r) ? r : [r];
        })
      : (() => {
          const r = question.optionResults[answer as number];
          return Array.isArray(r) ? r : [r];
        })();
    
    resultIds.forEach((rid: string) => {
      resultCounts[rid] = (resultCounts[rid] || 0) + 1;
    });
  });
  
  // Находим максимум
  let maxCount = 0;
  let winnerId = '';
  
  for (const [id, count] of Object.entries(resultCounts)) {
    if (count > maxCount) {
      maxCount = count;
      winnerId = id;
    }
  }
  
  if (!winnerId || !test.verdictsPersonality[winnerId]) {
    return null;
  }
  
  const result = test.verdictsPersonality[winnerId];
  return {
    resultId: winnerId,
    title: result.title,
    text: result.text
  };
}
