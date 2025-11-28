import React, { useState } from 'react';
import Modal from 'react-modal';
import { useTheme } from '../context/ThemeContext';

const initialTasks = [
  {
    id: 1,
    summary: 'Task 1',
    worklogs: [],
    assignee: 'Imane',
    reporter: 'Hind',
    project: 'Project B',
  },
  {
    id: 2,
    summary: 'Task 2',
    worklogs: [],
    assignee: 'Malika',
    reporter: 'Dana',
    project: 'Project A',
  },
  {
    id: 3,
    summary: 'Task 3',
    worklogs: [],
    assignee: 'Imane',
    reporter: 'Dana',
    project: 'Project B',
  },
  {
    id: 4,
    summary: 'Task 4',
    worklogs: [],
    assignee: 'Malika',
    reporter: 'Hind',
    project: 'Project B',
  },
];

const Timesheet = () => {
  const { isDark } = useTheme();
  const [tasks, setTasks] = useState(initialTasks);

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [startDate, setStartDate] = useState(
    firstDayOfMonth.toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    lastDayOfMonth.toISOString().split('T')[0]
  );
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [worklog, setWorklog] = useState({
    start: '',
    timeSpent: '',
    comment: '',
    date: '',
  });
  const [groupBy, setGroupBy] = useState([]);
  const [showWeekends, setShowWeekends] = useState(true);

  const parseDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const generateDateRange = () => {
    const dates = [];
    let currentDate = parseDate(startDate);
    const end = parseDate(endDate);

    while (currentDate <= end) {
      if (
        showWeekends ||
        (currentDate.getDay() !== 0 && currentDate.getDay() !== 6)
      ) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const dateRange = generateDateRange();

  const openModal = (taskId, date) => {
    const task = tasks.find((t) => t.id === taskId);
    const existingWorklog = task.worklogs.find((log) => log.date === date);

    setCurrentTaskId(taskId);
    setWorklog(
      existingWorklog
        ? { ...existingWorklog, date }
        : { start: '', timeSpent: '', comment: '', date }
    );
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWorklog((prev) => ({ ...prev, [name]: value }));
  };

  const parseTimeToSeconds = (time) => {
    const timeParts = time.split(' ').map((part) => part.trim());
    let totalSeconds = 0;

    timeParts.forEach((part) => {
      if (part.endsWith('h')) {
        const hours = parseInt(part, 10) || 0;
        totalSeconds += hours * 3600;
      } else if (part.endsWith('m')) {
        const minutes = parseInt(part, 10) || 0;
        totalSeconds += minutes * 60;
      }
    });

    return totalSeconds;
  };

  const handleSave = () => {
    if (!/^(\d+h\s*)?(\d+m)?$/.test(worklog.timeSpent)) {
      alert(
        'Invalid time format. Please use "Xh Xm", "Xh", or "Xm" where X is a number.'
      );
      return;
    }

    const updatedTasks = tasks.map((task) => {
      if (task.id === currentTaskId) {
        const newWorklog = {
          ...worklog,
          id: new Date().getTime(),
          timeSpentSeconds: parseTimeToSeconds(worklog.timeSpent),
        };

        return {
          ...task,
          worklogs: [
            ...task.worklogs.filter((log) => log.date !== worklog.date),
            newWorklog,
          ],
        };
      }
      return task;
    });

    setTasks(updatedTasks);
    closeModal();
  };

  const toggleTaskDetails = (taskId) => {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId));
  };

  const calculateTotalTimeSpent = (task) => {
    return (
      task.worklogs.reduce(
        (sum, log) => sum + (log.timeSpentSeconds || 0),
        0
      ) /
        3600 || 0
    );
  };

  const calculateGroupTotalTime = (groupTasks) => {
    return groupTasks.reduce(
      (sum, task) => sum + calculateTotalTimeSpent(task),
      0
    );
  };

  const calculateDailyTotalTime = (groupTasks, date) => {
    return (
      groupTasks.reduce((sum, task) => {
        const worklogForDate = task.worklogs.find(
          (log) => log.date === date
        );
        return sum + (worklogForDate ? worklogForDate.timeSpentSeconds : 0);
      }, 0) /
        3600 || 0
    );
  };

  const groupTasksByCriteria = (tasksList, criteria) => {
    if (!criteria || criteria.length === 0) {
      return { 'All Tasks': tasksList };
    }

    return tasksList.reduce((acc, task) => {
      const key = criteria.map((criterion) => task[criterion]).join(' · ');
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(task);
      return acc;
    }, {});
  };

  const groupedTasks = groupTasksByCriteria(tasks, groupBy);

  // New: group-by chip toggle helper
  const toggleGroupBy = (value) => {
    setGroupBy((prev) =>
      prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value]
    );
  };

  // Theming helpers
  const outerCardClass =
    'rounded-3xl border p-[1px] shadow-2xl backdrop-blur-xl ' +
    (isDark
      ? 'border-slate-800/70 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-slate-950/70'
      : 'border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50 shadow-slate-200');

  const innerCardClass =
    'rounded-3xl p-5 space-y-4 ' + (isDark ? 'bg-slate-950/85' : 'bg-white');

  const inputBase =
    'rounded-lg border px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ' +
    (isDark
      ? 'border-slate-700 bg-slate-950 text-slate-100'
      : 'border-slate-300 bg-white text-slate-900');

  const checkboxBase =
    'h-3 w-3 rounded border text-indigo-500 focus:ring-indigo-500 ' +
    (isDark
      ? 'border-slate-600 bg-slate-900'
      : 'border-slate-300 bg-white');

  const labelMuted =
    'text-[11px] ' + (isDark ? 'text-slate-400' : 'text-slate-500');

  const smallLabel =
    'text-[10px] uppercase tracking-[0.16em] ' +
    (isDark ? 'text-slate-500' : 'text-slate-500');

  const pillMuted =
    'inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[10px] font-medium ring-1 ' +
    (isDark
      ? 'bg-slate-900/80 text-slate-300 ring-slate-700/70'
      : 'bg-slate-100 text-slate-700 ring-slate-300');

  const tableWrapperClass =
    'overflow-x-auto rounded-2xl border ' +
    (isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50');

  const modalClass =
    'max-w-md mx-auto rounded-2xl border p-6 text-xs shadow-xl focus:outline-none ' +
    (isDark
      ? 'border-slate-800 bg-slate-950 text-slate-100 shadow-slate-950/50'
      : 'border-slate-200 bg-white text-slate-900 shadow-slate-300');

  const modalOverlayClass =
    'fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm';

  const chipBase =
    'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium transition-all border ';

  const chipActive =
    isDark
      ? 'bg-indigo-500/90 border-indigo-400 text-slate-950 shadow-sm shadow-indigo-500/40'
      : 'bg-indigo-500 text-white border-indigo-500 shadow-sm shadow-indigo-400/50';

  const chipInactive =
    isDark
      ? 'bg-slate-950 border-slate-700 text-slate-300 hover:bg-slate-900'
      : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100';

  // Friendly range label
  const rangeLabel = `${parseDate(startDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  })} – ${parseDate(endDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  })}`;

  return (
    <div className={outerCardClass}>
      <div className={innerCardClass}>
        {/* Header / filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1
              className={
                'text-sm font-semibold ' +
                (isDark ? 'text-slate-50' : 'text-slate-900')
              }
            >
              Timesheet
            </h1>
            <p className={labelMuted}>
              Log work by day and see totals by group and date.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className={pillMuted}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Current period · {rangeLabel}
              </span>
              <span className={labelMuted}>
                {dateRange.length} working day{dateRange.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs items-stretch">
            {/* Date range with prettier controls */}
            <div className="space-y-1">
              <span className={smallLabel}>Start date</span>
              <div
                className={
                  'relative inline-flex items-center rounded-xl px-3 py-1.5 text-xs shadow-sm transition ' +
                  (isDark
                    ? 'border border-slate-700 bg-slate-950/80 text-slate-100 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/70'
                    : 'border border-slate-300 bg-slate-50 text-slate-900 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/40')
                }
              >
                <span
                  className={
                    'mr-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] ' +
                    (isDark
                      ? 'bg-slate-900 text-slate-300'
                      : 'bg-white text-slate-500 shadow-sm shadow-slate-200/80')
                  }
                >
                  📅
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={
                    'w-full bg-transparent outline-none border-none text-xs ' +
                    (isDark ? 'text-slate-100' : 'text-slate-900')
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className={smallLabel}>End date</span>
              <div
                className={
                  'relative inline-flex items-center rounded-xl px-3 py-1.5 text-xs shadow-sm transition ' +
                  (isDark
                    ? 'border border-slate-700 bg-slate-950/80 text-slate-100 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/70'
                    : 'border border-slate-300 bg-slate-50 text-slate-900 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/40')
                }
              >
                <span
                  className={
                    'mr-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] ' +
                    (isDark
                      ? 'bg-slate-900 text-slate-300'
                      : 'bg-white text-slate-500 shadow-sm shadow-slate-200/80')
                  }
                >
                  ⏱
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={
                    'w-full bg-transparent outline-none border-none text-xs ' +
                    (isDark ? 'text-slate-100' : 'text-slate-900')
                  }
                />
              </div>
            </div>

            {/* Group by as pretty chips */}
            <div className="space-y-1">
              <span className={smallLabel}>Group by</span>
              <div
                className={
                  'flex flex-wrap gap-1.5 rounded-2xl px-2.5 py-1.5 text-[11px] ' +
                  (isDark
                    ? 'border border-slate-700 bg-slate-950'
                    : 'border border-slate-300 bg-slate-50')
                }
              >
                <button
                  type="button"
                  onClick={() => toggleGroupBy('project')}
                  className={
                    chipBase +
                    (groupBy.includes('project') ? chipActive : chipInactive)
                  }
                >
                  Project
                </button>
                <button
                  type="button"
                  onClick={() => toggleGroupBy('assignee')}
                  className={
                    chipBase +
                    (groupBy.includes('assignee') ? chipActive : chipInactive)
                  }
                >
                  Assignee
                </button>
                <button
                  type="button"
                  onClick={() => toggleGroupBy('reporter')}
                  className={
                    chipBase +
                    (groupBy.includes('reporter') ? chipActive : chipInactive)
                  }
                >
                  Reporter
                </button>
              </div>
            </div>

            {/* Show weekends as a toggle switch */}
            <div className="space-y-1">
              <span className={smallLabel}>Options</span>
              <button
                type="button"
                onClick={() => setShowWeekends((prev) => !prev)}
                className={
                  'inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium transition ' +
                  (isDark
                    ? 'bg-slate-950 border border-slate-700 text-slate-200 hover:bg-slate-900'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100')
                }
              >
                <span
                  className={
                    'inline-flex h-3.5 w-6 items-center rounded-full p-[2px] transition ' +
                    (isDark ? 'bg-slate-700' : 'bg-slate-300') +
                    ' ' +
                    (showWeekends ? 'justify-end' : 'justify-start')
                  }
                >
                  <span
                    className={
                      'h-2.5 w-2.5 rounded-full transition ' +
                      (showWeekends
                        ? 'bg-emerald-400'
                        : 'bg-slate-500')
                    }
                  />
                </span>
                <span>Show weekends</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className={tableWrapperClass}>
          <table className="min-w-full text-xs">
            <thead
              className={
                'text-[11px] uppercase tracking-[0.12em] ' +
                (isDark
                  ? 'bg-slate-950/90 text-slate-400'
                  : 'bg-slate-100 text-slate-500')
              }
            >
              <tr>
                <th
                  className={
                    'px-4 py-3 text-left ' +
                    (isDark ? 'border-b border-slate-800' : 'border-b border-slate-200')
                  }
                >
                  Task / Group
                </th>
                <th
                  className={
                    'px-4 py-3 text-center ' +
                    (isDark ? 'border-b border-slate-800' : 'border-b border-slate-200')
                  }
                >
                  Total hours
                </th>
                {dateRange.map((date) => (
                  <th
                    key={date.toISOString()}
                    className={
                      'px-2 py-3 text-center ' +
                      (isDark
                        ? 'border-b border-slate-800'
                        : 'border-b border-slate-200')
                    }
                  >
                    {date.getDate()}/{date.getMonth() + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedTasks).map(([key, groupTasks]) => (
                <React.Fragment key={key}>
                  {/* Group row */}
                  <tr
                    className={
                      isDark ? 'bg-slate-900/70' : 'bg-slate-100/80'
                    }
                  >
                    <td
                      className={
                        'px-4 py-3 text-left text-[11px] font-semibold ' +
                        (isDark
                          ? 'border-b border-slate-800 text-slate-100'
                          : 'border-b border-slate-200 text-slate-900')
                      }
                    >
                      {key}
                    </td>
                    <td
                      className={
                        'px-4 py-3 text-center font-semibold ' +
                        (isDark
                          ? 'border-b border-slate-800 text-indigo-300'
                          : 'border-b border-slate-200 text-indigo-600')
                      }
                    >
                      {calculateGroupTotalTime(groupTasks).toFixed(2)} h
                    </td>
                    {dateRange.map((date) => (
                      <td
                        key={date.toISOString()}
                        className={
                          'px-2 py-3 text-center text-[11px] ' +
                          (isDark
                            ? 'border-b border-slate-800 text-slate-200'
                            : 'border-b border-slate-200 text-slate-700')
                        }
                      >
                        {calculateDailyTotalTime(
                          groupTasks,
                          date.toISOString().split('T')[0]
                        ).toFixed(2)}{' '}
                        h
                      </td>
                    ))}
                  </tr>

                  {/* Task rows */}
                  {groupTasks.map((task) => (
                    <React.Fragment key={task.id}>
                      <tr
                        className={
                          'cursor-pointer transition ' +
                          (isDark
                            ? 'hover:bg-slate-900/70'
                            : 'hover:bg-slate-100')
                        }
                        onClick={() => toggleTaskDetails(task.id)}
                      >
                        <td
                          className={
                            'px-4 py-3 text-left text-[11px] ' +
                            (isDark
                              ? 'border-b border-slate-800 text-slate-200'
                              : 'border-b border-slate-200 text-slate-800')
                          }
                        >
                          {task.summary}
                        </td>
                        <td
                          className={
                            'px-4 py-3 text-center text-[11px] ' +
                            (isDark
                              ? 'border-b border-slate-800 text-slate-100'
                              : 'border-b border-slate-200 text-slate-900')
                          }
                        >
                          {calculateTotalTimeSpent(task).toFixed(2)} h
                        </td>
                        {dateRange.map((date) => {
                          const keyDate = date.toISOString().split('T')[0];
                          const worklogForDate = task.worklogs.find(
                            (log) => log.date === keyDate
                          );
                          return (
                            <td
                              key={keyDate}
                              className={
                                'px-2 py-3 text-center text-[11px] ' +
                                (isDark
                                  ? 'border-b border-slate-800'
                                  : 'border-b border-slate-200')
                              }
                            >
                              {worklogForDate ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openModal(task.id, keyDate);
                                  }}
                                  className={
                                    'rounded-full px-2 py-0.5 text-[10px] font-mono transition ' +
                                    (isDark
                                      ? 'bg-indigo-500/80 text-slate-950 hover:bg-indigo-400'
                                      : 'bg-indigo-500 text-white hover:bg-indigo-400')
                                  }
                                >
                                  {worklogForDate.timeSpent}
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openModal(task.id, keyDate);
                                  }}
                                  className={
                                    'rounded-full px-2 py-0.5 text-[10px] transition ' +
                                    (isDark
                                      ? 'border border-slate-700 text-slate-300 hover:bg-slate-800'
                                      : 'border border-slate-300 text-slate-600 hover:bg-slate-100')
                                  }
                                >
                                  +
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                      {expandedTaskId === task.id && (
                        <tr>
                          <td
                            colSpan={dateRange.length + 2}
                            className={
                              'px-4 py-2 text-[11px] ' +
                              (isDark
                                ? 'border-b border-slate-800 bg-slate-950/80 text-slate-300'
                                : 'border-b border-slate-200 bg-slate-50 text-slate-700')
                            }
                          >
                            <ul className="space-y-1">
                              {task.worklogs.map((log) => (
                                <li key={log.id}>
                                  <span
                                    className={
                                      'font-mono ' +
                                      (isDark
                                        ? 'text-slate-200'
                                        : 'text-slate-800')
                                    }
                                  >
                                    {log.date}{' '}
                                    {log.start ? `· ${log.start}` : ''}
                                  </span>{' '}
                                  — {log.timeSpent}
                                  {log.comment ? ` · ${log.comment}` : ''}
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Worklog Entry"
          className={modalClass}
          overlayClassName={modalOverlayClass}
        >
          <h2
            className={
              'mb-4 text-sm font-semibold ' +
              (isDark ? 'text-slate-50' : 'text-slate-900')
            }
          >
            Add worklog
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <label className={labelMuted.replace('11px', '10px')}>
                Start time
              </label>
              <input
                type="time"
                name="start"
                value={worklog.start}
                onChange={handleInputChange}
                className={
                  'mt-1 w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ' +
                  (isDark
                    ? 'border-slate-700 bg-slate-950 text-slate-100'
                    : 'border-slate-300 bg-white text-slate-900')
                }
              />
            </div>
            <div>
              <label className={labelMuted.replace('11px', '10px')}>
                Time spent
              </label>
              <input
                type="text"
                name="timeSpent"
                value={worklog.timeSpent}
                onChange={handleInputChange}
                className={
                  'mt-1 w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ' +
                  (isDark
                    ? 'border-slate-700 bg-slate-950 text-slate-100'
                    : 'border-slate-300 bg-white text-slate-900')
                }
                placeholder='e.g. "2h 30m", "1h", "45m"'
              />
            </div>
            <div>
              <label className={labelMuted.replace('11px', '10px')}>
                Comment
              </label>
              <input
                type="text"
                name="comment"
                value={worklog.comment}
                onChange={handleInputChange}
                className={
                  'mt-1 w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ' +
                  (isDark
                    ? 'border-slate-700 bg-slate-950 text-slate-100'
                    : 'border-slate-300 bg-white text-slate-900')
                }
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2 text-xs">
            <button
              onClick={handleSave}
              className={
                'flex-1 rounded-lg px-3 py-2 font-medium transition ' +
                (isDark
                  ? 'bg-indigo-500 text-slate-950 hover:bg-indigo-400'
                  : 'bg-indigo-500 text-white hover:bg-indigo-400')
              }
            >
              Save
            </button>
            <button
              onClick={closeModal}
              className={
                'flex-1 rounded-lg border px-3 py-2 font-medium transition ' +
                (isDark
                  ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100')
              }
            >
              Cancel
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Timesheet;
