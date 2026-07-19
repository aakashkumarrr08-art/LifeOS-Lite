import useTheme from '../hooks/useTheme.js';

function ThemeToggleButton({ className = '' }) {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition duration-200 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 ${className}`.trim()}
      onClick={toggleTheme}
      type="button"
    >
      <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}

export default ThemeToggleButton;

