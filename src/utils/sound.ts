/**
 * ЗВУКОВЫЕ ЭФФЕКТЫ ЧЕРЕЗ WEB AUDIO API
 * Без внешних файлов — синтез на лету
 */

type SoundType = 'click' | 'correct' | 'wrong' | 'finish' | 'achievement';

interface AudioConfig {
  enabled: boolean;
  volume: number;
}

class SoundManager {
  private audioContext: AudioContext | null = null;
  private config: AudioConfig = { enabled: true, volume: 0.5 };

  /**
   * Инициализирует AudioContext (должен быть вызван после действия пользователя)
   */
  private initAudio(): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Включает/выключает звук
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Устанавливает громкость (0-1)
   */
  setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Проигрывает звук по типу
   */
  play(type: SoundType): void {
    if (!this.config.enabled) return;
    
    this.initAudio();
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    switch (type) {
      case 'click':
        // Короткий высокий клик
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(this.config.volume * 0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        oscillator.start(now);
        oscillator.stop(now + 0.05);
        break;

      case 'correct':
        // Приятный мажорный аккорд
        this.playTone(523.25, now, 0.1); // C5
        this.playTone(659.25, now + 0.05, 0.1); // E5
        this.playTone(783.99, now + 0.1, 0.15); // G5
        break;

      case 'wrong':
        // Низкий неприятный звук
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(this.config.volume * 0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
        break;

      case 'finish':
        // Фанфары завершения
        this.playTone(523.25, now, 0.15);
        this.playTone(659.25, now + 0.1, 0.15);
        this.playTone(783.99, now + 0.2, 0.2);
        this.playTone(1046.50, now + 0.3, 0.3);
        break;

      case 'achievement':
        // Звук достижения (арпеджио)
        this.playTone(523.25, now, 0.1);
        this.playTone(659.25, now + 0.08, 0.1);
        this.playTone(783.99, now + 0.16, 0.1);
        this.playTone(1046.50, now + 0.24, 0.2);
        break;
    }
  }

  /**
   * Проигрывает одиночный тон
   */
  private playTone(frequency: number, time: number, duration: number): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, time);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(this.config.volume * 0.3, time);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + duration);

    oscillator.start(time);
    oscillator.stop(time + duration);
  }
}

// Singleton
export const soundManager = new SoundManager();

/**
 * Хук для управления звуком в React
 */
export function useSound() {
  return {
    play: (type: SoundType) => soundManager.play(type),
    setEnabled: (enabled: boolean) => soundManager.setEnabled(enabled),
    setVolume: (volume: number) => soundManager.setVolume(volume),
  };
}
