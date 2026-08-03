/**
 * ТИПЫ ДАННЫХ ДЛЯ "БИТВА УМНИКОВ"
 */

// Типы вопросов
export type QuestionType = 'single' | 'multiple' | 'boolean' | 'text';

// Базовый вопрос
export interface BaseQuestion {
  type: QuestionType;
  text: string;
}

// Вопрос с одним правильным ответом
export interface SingleQuestion extends BaseQuestion {
  type: 'single';
  options: string[] | PersonalityOption[]; // для quiz - строки, для personality - объекты
  correct: number; // индекс правильного ответа
}

// Вопрос с несколькими правильными ответами
export interface MultipleQuestion extends BaseQuestion {
  type: 'multiple';
  options: string[] | PersonalityOption[]; // для quiz - строки, для personality - объекты
  correct: number[]; // индексы правильных ответов
}

// Вопрос да/нет
export interface BooleanQuestion extends BaseQuestion {
  type: 'boolean';
  correct: boolean;
}

// Вопрос с текстовым ответом
export interface TextQuestion extends BaseQuestion {
  type: 'text';
  answers: string[]; // варианты правильных ответов
}

// Вариант ответа для personality-теста
export interface PersonalityOption {
  text: string;
  resultId: string;
}

// Вопрос для personality-теста
export interface PersonalityQuestion extends BaseQuestion {
  type: 'single' | 'multiple';
  options: PersonalityOption[]; // массив объектов с text и resultId
}

// Объединённый тип вопроса
export type Question = 
  | SingleQuestion 
  | MultipleQuestion 
  | BooleanQuestion 
  | TextQuestion 
  | PersonalityQuestion;

// Тип теста
export type TestType = 'quiz' | 'personality';

// Поведение при таймауте
export type TimeoutBehavior = 'wrong' | 'skip';

// Вердикт для quiz-теста
export interface QuizVerdict {
  minPercent: number;
  text: string;
}

// Результат для personality-теста
export interface PersonalityResult {
  title: string;
  text: string;
}

// Данные теста
export interface Test {
  id: string;
  title: string; // короткое название-тэг
  description: string;
  type: TestType;
  timerEnabled: boolean;
  timeoutBehavior: TimeoutBehavior;
  questions: Question[];
  verdictsQuiz?: QuizVerdict[]; // для quiz
  verdictsPersonality?: Record<string, PersonalityResult>; // для personality
}

// Статистика игрока
export interface PlayerStats {
  testsCompleted: number;
  achievementsUnlocked: string[];
  bestScores: Record<string, number>; // testId -> percent
  streak: number; // текущая серия
  maxStreak: number;
}

// Прогресс прохождения теста
export interface QuizProgress {
  testId: string;
  currentQuestionIndex: number;
  answers: (number[] | boolean | string)[]; // ответы игрока
  correctCount: number;
  skippedCount: number;
  timeSpent: number; // секунды
  hintsUsed: number;
}

// Результат теста
export interface TestResult {
  testId: string;
  timestamp: number;
  totalQuestions: number;
  correctAnswers: number;
  percent: number;
  verdict?: string;
  personalityResult?: string; // resultId победившего типа
  answers: (number[] | boolean | string)[];
  correctAnswersMap: Record<number, number[] | boolean | string>; // вопрос -> правильные ответы
}

// Настройки игрока
export interface PlayerSettings {
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  playerName: string;
  noAds: boolean;
}

// Достижение
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

// Тип ответа игрока
export type Answer = number | number[] | boolean | string | null;

// Конфигурация рекламы
export interface AdsConfig {
  everyNTests: number; // показывать interstitial раз в N тестов
  rewardedForHint: boolean;
  rewardedForDetails: boolean;
}
