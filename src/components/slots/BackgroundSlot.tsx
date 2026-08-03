/**
 * TODO СЛОТ: Анимированный фон главного экрана
 * Разработчик подставит компонент с reactbits.dev
 */

export default function BackgroundSlot() {
  // Заглушка: спокойный однотонный фон
  // После интеграции заменить на анимированный компонент
  return (
    <div style={styles.background} />
  );
}

const styles: Record<string, React.CSSProperties> = {
  background: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'var(--bg)',
    // Здесь будет анимация из reactbits.dev
    // Например: <Particles />, <FadeIn />, или другой фон
    zIndex: 0,
  },
};
