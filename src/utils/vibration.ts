/**
 * ВИБРАЦИЯ ДЛЯ МОБИЛЬНЫХ УСТРОЙСТВ
 */

type VibrationPattern = number | number[];

/**
 * Проверяет поддержку вибрации
 */
export function isVibrationSupported(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

/**
 * Вибрирует по паттерну
 * @param pattern - длительность в мс или массив паттернов [вибро, пауза, вибро, ...]
 */
export function vibrate(pattern: VibrationPattern): void {
  if (!isVibrationSupported()) return;
  
  try {
    navigator.vibrate(pattern);
  } catch (e) {
    console.warn('Vibration failed:', e);
  }
}

/**
 * Короткая вибрация (успех)
 */
export function vibrateSuccess(): void {
  vibrate(50);
}

/**
 * Двойная вибрация (ошибка)
 */
export function vibrateError(): void {
  vibrate([100, 50, 100]);
}

/**
 * Длинная вибрация (финиш/достижение)
 */
export function vibrateFinish(): void {
  vibrate([200, 100, 200, 100, 300]);
}
