/**
 * Иконка настроек (минимальный SVG)
 */

export default function SettingsIcon() {
  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.364-6.364l-4.243 4.243m-4.242 0L3.636 5.636m12.728 12.728l-4.243-4.243m-4.242 0L3.636 18.364" />
    </svg>
  );
}
