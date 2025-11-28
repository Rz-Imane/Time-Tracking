import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const TimeTrackingCountdown = ({ tasks, onSaveTimeEntry }) => {
  const { isDark } = useTheme();

  const [selectedTask, setSelectedTask] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [showEntries, setShowEntries] = useState(false);
  const [timeEntries, setTimeEntries] = useState([]);

  useEffect(() => {
    let id;
    if (isTracking) {
      id = setInterval(
        () => setElapsedTime((prevTime) => prevTime + 1),
        1000
      );
    }
    return () => clearInterval(id);
  }, [isTracking]);

  const handleStartTracking = () => {
    if (!selectedTask) {
      alert('Please select a task to start tracking.');
      return;
    }
    setIsTracking(true);
  };

  const handlePauseTracking = () => {
    setIsTracking(false);
  };

  const handleStopTracking = () => {
    if (!selectedTask || elapsedTime === 0) {
      setIsTracking(false);
      setElapsedTime(0);
      return;
    }

    setIsTracking(false);

    const newEntry = {
      task: selectedTask,
      timeSpentSeconds: elapsedTime,
      date: new Date(),
    };

    setTimeEntries((prev) => [...prev, newEntry]);

    if (onSaveTimeEntry) {
      onSaveTimeEntry(selectedTask, elapsedTime);
    }

    setElapsedTime(0);
    setSelectedTask('');
  };

  const formatTime = (timeInSeconds) => {
    const minutes = String(Math.floor(timeInSeconds / 60)).padStart(2, '0');
    const seconds = String(timeInSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const getTaskSummary = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    return task ? task.summary : `Task #${taskId}`;
  };

  // Theming helpers
  const cardClasses =
    'rounded-2xl border p-4 shadow-lg transition-colors duration-200 ' +
    (isDark
      ? 'bg-slate-950/80 border-slate-800 shadow-slate-950/40'
      : 'bg-white border-slate-200 shadow-slate-200');

  const labelMuted =
    'text-[11px] ' + (isDark ? 'text-slate-400' : 'text-slate-500');

  const smallLabel =
    'text-[10px] uppercase tracking-[0.18em] ' +
    (isDark ? 'text-slate-500' : 'text-slate-500');

  const pillMuted =
    'inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[10px] font-medium ring-1 ' +
    (isDark
      ? 'bg-slate-900/80 text-slate-300 ring-slate-700/70'
      : 'bg-slate-100 text-slate-700 ring-slate-300');

  const entriesCard =
    'mt-3 rounded-xl border p-3 max-h-48 overflow-y-auto text-[11px] ' +
    (isDark
      ? 'bg-slate-950/80 border-slate-800 text-slate-300'
      : 'bg-slate-50 border-slate-200 text-slate-700');

  return (
    <div className={cardClasses}>
      {/* Header: title + timer */}
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h3
            className={
              'text-sm font-semibold ' +
              (isDark ? 'text-slate-50' : 'text-slate-900')
            }
          >
            Time Tracking
          </h3>
          <p className={labelMuted}>Pick a task and track your focus time.</p>
          <span className={pillMuted}>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {isTracking ? 'Session running' : 'Timer idle'}
          </span>
        </div>

        <div className="text-right">
          <div
            className={
              'text-3xl sm:text-4xl font-mono tabular-nums ' +
              (isDark ? 'text-slate-50' : 'text-slate-900')
            }
          >
            {formatTime(elapsedTime)}
          </div>
          <div className={smallLabel}>Elapsed time</div>
        </div>
      </div>

      {/* Controls: select + buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Prettier select */}
        <div className="w-full sm:flex-1">
          <label className={smallLabel}>Current task</label>
          <div
            className={
              'relative mt-1 inline-flex w-full items-center rounded-xl border px-3 py-1.5 text-sm shadow-sm transition ' +
              (isDark
                ? 'border-slate-700 bg-slate-950/80 text-slate-100 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/70'
                : 'border-slate-300 bg-slate-50 text-slate-900 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/50')
            }
          >
            <select
              className={
                'w-full appearance-none bg-transparent pr-6 text-sm outline-none ring-0 ' +
                (isDark ? 'text-slate-100' : 'text-slate-900')
              }
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
            >
              <option value="">Select a task</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.summary}
                </option>
              ))}
            </select>
            {/* Custom arrow */}
            <span
              className={
                'pointer-events-none absolute right-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] ' +
                (isDark
                  ? 'bg-slate-900 text-slate-300'
                  : 'bg-white text-slate-500 shadow-sm shadow-slate-300/70')
              }
            >
              ▼
            </span>
          </div>
        </div>

        {/* Prettier buttons group */}
        <div
          className={
            'flex w-full sm:w-auto gap-2 rounded-full p-1 ' +
            (isDark
              ? 'bg-slate-950/70 border border-slate-800/80'
              : 'bg-slate-100 border border-slate-200')
          }
        >
          <button
            onClick={handleStartTracking}
            disabled={isTracking}
            className={
              'flex-1 rounded-full px-3 py-2 text-xs font-medium transition-all ' +
              (isTracking
                ? 'bg-emerald-700/25 text-emerald-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 shadow-sm shadow-emerald-500/40 hover:from-emerald-400 hover:to-emerald-300 active:scale-[0.97]')
            }
          >
            Start
          </button>
          <button
            onClick={handlePauseTracking}
            disabled={!isTracking}
            className={
              'flex-1 rounded-full px-3 py-2 text-xs font-medium transition-all ' +
              (!isTracking
                ? isDark
                  ? 'bg-slate-900 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-sm shadow-amber-500/40 hover:from-amber-400 hover:to-amber-300 active:scale-[0.97]')
            }
          >
            Pause
          </button>
          <button
            onClick={handleStopTracking}
            className={
              'flex-1 rounded-full px-3 py-2 text-xs font-medium transition-all ' +
              'bg-gradient-to-r from-rose-500 to-rose-400 text-slate-950 shadow-sm shadow-rose-500/40 hover:from-rose-400 hover:to-rose-300 active:scale-[0.97]'
            }
          >
            Stop
          </button>
        </div>
      </div>

      {/* Footer: status + toggle */}
      <div className="mt-3 flex items-center justify-between text-[11px]">
        <span className={labelMuted}>
          {isTracking ? 'Tracking in progress…' : 'Timer idle.'}
        </span>
        <button
          onClick={() => setShowEntries((prev) => !prev)}
          className={
            'inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] transition ' +
            (isDark
              ? 'text-slate-300 hover:text-slate-100 hover:bg-slate-900/70'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
          }
        >
          <span className="text-[10px]">⏱</span>
          <span>{showEntries ? 'Hide entries' : 'Show entries'}</span>
        </button>
      </div>

      {/* Saved Entries */}
      {showEntries && timeEntries.length > 0 && (
        <div className={entriesCard}>
          <h4
            className={
              'mb-2 text-xs font-semibold ' +
              (isDark ? 'text-slate-100' : 'text-slate-800')
            }
          >
            Saved Entries
          </h4>
          <ul className="space-y-1">
            {timeEntries.map((entry, index) => (
              <li
                key={index}
                className={
                  'flex flex-col gap-0.5 border-b pb-1 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between ' +
                  (isDark ? 'border-slate-800/60' : 'border-slate-200')
                }
              >
                <span className="flex-1 truncate">
                  {getTaskSummary(entry.task)}
                </span>
                <span
                  className={
                    'font-mono text-[11px] ' +
                    (isDark ? 'text-slate-100' : 'text-slate-800')
                  }
                >
                  {formatTime(entry.timeSpentSeconds)}
                </span>
                <span
                  className={
                    'text-[10px] ' +
                    (isDark ? 'text-slate-500' : 'text-slate-500')
                  }
                >
                  {entry.date.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TimeTrackingCountdown;
