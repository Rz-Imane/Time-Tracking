// src/components/Navbar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const navLinkClass = (isDark) => ({ isActive }) =>
  [
    'px-3 py-1.5 rounded-full text-sm font-medium transition',
    isActive
      ? isDark
        ? 'bg-white text-slate-900 shadow-sm'
        : 'bg-slate-900 text-white shadow-sm'
      : isDark
      ? 'text-slate-200 hover:bg-slate-700/60'
      : 'text-slate-600 hover:bg-slate-100',
  ].join(' ');

const Navbar = () => {
  const { isDark, theme, toggleTheme } = useTheme();
  const linkClass = navLinkClass(isDark);

  return (
    <header
      className={`sticky top-0 z-20 border-b backdrop-blur ${
        isDark
          ? 'border-slate-800 bg-slate-950/80'
          : 'border-slate-200 bg-white/80'
      }`}
    >
      <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        {/* Left: logo / brand */}
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${
              isDark ? 'bg-indigo-500 text-slate-950' : 'bg-indigo-600 text-white'
            }`}
          >
            TT
          </div>
          <div className="flex flex-col leading-tight">
            <span
              className={`text-sm font-semibold ${
                isDark ? 'text-slate-50' : 'text-slate-900'
              }`}
            >
              Time Tracking
            </span>
            <span
              className={`text-[11px] ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Plan · Track · Analyze
            </span>
          </div>
        </div>

        {/* Center: navigation */}
        <div
          className={`flex items-center gap-2 rounded-full px-2 py-1 ${
            isDark ? 'bg-slate-900/80' : 'bg-slate-100'
          }`}
        >
          <NavLink to="/timetable" className={linkClass}>
            Timetable
          </NavLink>
          <NavLink to="/timesheet" className={linkClass}>
            Timesheet
          </NavLink>
        </div>

        {/* Right: theme toggle + avatar */}
        <div className="flex items-center gap-3 text-xs">
          {/* Theme toggle pill */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium transition ${
              isDark
                ? 'border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span
              className={`inline-flex h-3.5 w-6 items-center rounded-full p-[2px] transition ${
                isDark ? 'bg-slate-800 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            </span>
            <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
          </button>

          <div
            className={`hidden sm:flex items-center gap-2 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            <span>Imane</span>
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] ${
                isDark ? 'bg-slate-800 text-slate-100' : 'bg-slate-200 text-slate-800'
              }`}
            >
              IR
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
