import { useRef, useEffect } from 'react';

export default function SearchBar({ value, onChange }) {
  const timerRef = useRef(null);

  function handleChange(e) {
    const val = e.target.value;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(val), 200);
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <input
      type="text"
      defaultValue={value}
      onChange={handleChange}
      placeholder="Search tasks..."
      className="w-full max-w-xs rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
    />
  );
}
