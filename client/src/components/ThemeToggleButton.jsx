import useTheme from '../hooks/useTheme.js';

function ThemeToggleButton({ className = '' }) {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      className={`inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition duration-200 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 sm:px-4 ${className}`.trim()}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      aria-pressed={isDarkMode}
      onClick={toggleTheme}
      type="button"
    >
      <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
      <span className="hidden sm:inline">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
      <span className="sm:hidden">Theme</span>
    </button>
  );
}

export default ThemeToggleButton;
