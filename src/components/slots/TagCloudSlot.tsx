/**
 * TODO СЛОТ: Физика/анимация облака тэгов
 * Разработчик подставит компонент с reactbits.dev
 */

interface TagCloudSlotProps {
  tags: string[];
  onTagClick: (tag: string) => void;
}

export default function TagCloudSlot({ tags, onTagClick }: TagCloudSlotProps) {
  // Заглушка: статичная раскладка тегов в сетке
  // После интеграции заменить на анимированное облако с физикой
  
  return (
    <div style={styles.container}>
      {tags.map((tag, index) => (
        <button
          key={index}
          onClick={() => onTagClick(tag)}
          className="chip"
          style={styles.tag}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tag: {
    // Стили чипа уже заданы в global.css через .chip
  },
};
