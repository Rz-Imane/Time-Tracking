// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Timetable from './components/Timetable';
import Timesheet from './components/Timesheet';
import { ThemeProvider, useTheme } from './context/ThemeContext';

const AppShell = () => {
  const { isDark } = useTheme();

  return (
    <div
      className={
        'min-h-screen transition-colors duration-300 ' +
        (isDark
          ? 'bg-slate-950 text-slate-50'
          : 'bg-slate-50 text-slate-900')
      }
    >
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/timetable" replace />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/timesheet" element={<Timesheet />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <ThemeProvider>
    <Router>
      <AppShell />
    </Router>
  </ThemeProvider>
);

export default App;
