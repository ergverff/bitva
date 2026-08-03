/**
 * ШАРИНГ (ПОДЕЛИТЬСЯ РЕЗУЛЬТАТОМ)
 */

import { Test, TestResult } from '../data/types';
import { getPlayerName } from './yandex';

/**
 * Формирует текст для шаринга
 */
export function createShareText(
  test: Test,
  result: TestResult,
  verdict: string
): string {
  const playerName = getPlayerName();
  const gameUrl = window.location.origin; // Ссылка на игру (обязательно для Яндекс Игр)
  
  return `${test.title}
${playerName}
${verdict}
${result.percent}% правильных
Сможешь больше?
${gameUrl}`;
}

/**
 * Делится результатом через нативный share API или копирует в буфер
 */
export async function shareResult(
  test: Test,
  result: TestResult,
  verdict: string
): Promise<{ success: boolean; method: 'native' | 'clipboard' }> {
  const text = createShareText(test, result, verdict);
  
  // Пробуем нативный share
  if (navigator.share) {
    try {
      await navigator.share({
        title: test.title,
        text: text,
      });
      return { success: true, method: 'native' };
    } catch (e) {
      // Пользователь отменил или ошибка
      if ((e as any).name !== 'AbortError') {
        console.warn('Native share failed:', e);
      }
    }
  }
  
  // Фолбэк: копирование в буфер
  try {
    await navigator.clipboard.writeText(text);
    return { success: true, method: 'clipboard' };
  } catch (e) {
    console.error('Clipboard copy failed:', e);
    return { success: false, method: 'clipboard' };
  }
}
