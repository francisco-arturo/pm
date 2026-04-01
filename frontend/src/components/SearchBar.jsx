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
    <div className="relative">
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        defaultValue={value}
        onChange={handleChange}
        placeholder="Search by title or ID…"
        className="w-full max-w-xs rounded-lg border border-white/[0.08] bg-white/[0.05] pl-9 pr-3 py-2 text-sm text-gray-300 placeholder-gray-600 transition-all focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 focus:bg-white/[0.07]"
      />
    </div>
  );
}
