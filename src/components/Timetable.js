import React, { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import TimeTrackingCountdown from './TimeTrackingCountdown';
import { useTheme } from '../context/ThemeContext';

const ItemTypes = {
  TASK: 'task',
};

const Task = ({ task, onEditTask, onDeleteTask, isHovered, setHoveredTask }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.TASK,
    item: { id: task.id, originalHeight: task.height },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [height, setHeight] = useState(task.height || 20);
  const taskRef = useRef(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  useEffect(() => {
    if (!isDragging) {
      const [startHours, startMinutes] = task.start.split(':').map(Number);
      const [endHours, endMinutes] = task.end.split(':').map(Number);
      const durationMinutes =
        (endHours - startHours) * 60 + (endMinutes - startMinutes);

      const totalMinutes =
        durationMinutes +
        (Array.isArray(task.worklogs)
          ? task.worklogs.reduce((acc, log) => acc + (log.minutes || 0), 0)
          : 0);

      setHeight(Math.max(totalMinutes * 1.5, 20));
    }
  }, [task.start, task.end, task.worklogs, isDragging]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    startYRef.current = e.clientY;
    startHeightRef.current = height;

    const handleMouseMove = (moveEvent) => {
      const newHeight = Math.max(
        startHeightRef.current + (moveEvent.clientY - startYRef.current),
        20
      );
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={(node) => {
        drag(node);
        taskRef.current = node;
      }}
      className={`relative mt-1 rounded-xl bg-gradient-to-br from-indigo-500/90 via-indigo-500/80 to-sky-500/80 px-2 py-1 text-[11px] text-slate-50 shadow-md shadow-slate-950/50 ring-1 ring-indigo-400/40 backdrop-blur-sm transition-all duration-150 ${
        isDragging ? 'scale-[0.97] opacity-60' : 'hover:-translate-y-[1px] hover:shadow-lg'
      }`}
      style={{
        height: `${height}px`,
        position: 'relative',
        zIndex: 5, 
      }}
      onMouseEnter={() => setHoveredTask(task.id)}
      onMouseLeave={() => setHoveredTask(null)}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-semibold">{task.summary}</span>
        <span className="font-mono text-[10px] text-indigo-100/90">
          {task.start}–{task.end}
        </span>
      </div>

      {isHovered && (
        <div className="mt-1 flex justify-end gap-2 text-[10px]">
          <button
            onClick={() => onEditTask(task.id)}
            className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-emerald-200 hover:bg-emerald-500/25 hover:text-emerald-50 transition"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            onClick={() => onDeleteTask(task.id)}
            className="rounded-full bg-rose-500/15 px-1.5 py-0.5 text-rose-200 hover:bg-rose-500/25 hover:text-rose-50 transition"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      )}

      <div
        className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 cursor-ns-resize rounded-full bg-slate-950/95 ring-2 ring-indigo-300/80 shadow-sm shadow-slate-900/80"
        onMouseDown={handleMouseDown}
        style={{ zIndex: 30 }}
      />
    </div>
  );
};

const DayCell = ({
  date,
  hour,
  tasks,
  onDropTask,
  onAddTask,
  onEditTask,
  onDeleteTask,
  hoveredTask,
  setHoveredTask,
  showWeekends,
  isToday,
  isDark,
}) => {
  const [, drop] = useDrop({
    accept: ItemTypes.TASK,
    drop: (item) => onDropTask(item.id, date, hour),
  });

  const [hoveredSlot, setHoveredSlot] = useState(null);

  const handleMouseEnter = (slot) => setHoveredSlot(slot);
  const handleMouseLeave = () => setHoveredSlot(null);

  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; 

  return (
    <div
      ref={drop}
      className={`relative h-20 border-l ${
        isDark ? 'border-slate-800/60' : 'border-slate-200'
      } ${
        isToday
          ? isDark
            ? 'bg-slate-900/40'
            : 'bg-indigo-50'
          : isDark
          ? 'bg-slate-950/35'
          : 'bg-slate-50'
      } transition-colors duration-150`}
    >
      {tasks.map((task) => (
        <Task
          key={task.id}
          task={task}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          isHovered={hoveredTask === task.id}
          setHoveredTask={setHoveredTask}
        />
      ))}

      {(showWeekends || !isWeekend) &&
        ['00', '15', '30', '45'].map((slot) => {
          const slotTime = `${hour}:${slot}`;
          const slotOccupied = tasks.some((task) => task.start === slotTime);

          if (slotOccupied) return null;

          return (
            <div
              key={slot}
              className={`absolute left-0 right-0 flex items-center justify-center border-t ${
                isDark
                  ? 'border-slate-800/40 bg-slate-900/15 text-slate-500/70'
                  : 'border-slate-200 bg-slate-100 text-slate-500'
              } text-[10px] transition-all ${
                hoveredSlot === slot
                  ? isDark
                    ? 'bg-slate-900/35 text-slate-200'
                    : 'bg-slate-200 text-slate-900'
                  : ''
              }`}
              style={{
                top: `${(parseInt(slot, 10) / 60) * 100}%`,
                height: '25%',
                zIndex: 0,
              }}
              onMouseEnter={() => handleMouseEnter(slot)}
              onMouseLeave={handleMouseLeave}
            >
              {hoveredSlot === slot && (
                <button
                  onClick={() => {
                    onAddTask(date, slotTime);
                    setHoveredSlot(null);
                  }}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium shadow-sm ring-1 ${
                    isDark
                      ? 'bg-slate-950/90 text-slate-100 shadow-slate-950/80 ring-slate-700/80'
                      : 'bg-white text-slate-900 shadow-slate-300 ring-slate-300'
                  }`}
                  style={{ transform: 'translateY(-50%)' }}
                >
                  + {slotTime}
                </button>
              )}
            </div>
          );
        })}
    </div>
  );
};

const getWeekDaysMondayFirst = (referenceDate) => {
  const d = new Date(referenceDate);
  const day = d.getDay(); 
  const diffToMonday = day === 0 ? -6 : 1 - day; 
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);

  return Array.from({ length: 7 }, (_, idx) => {
    const current = new Date(monday);
    current.setDate(monday.getDate() + idx);
    return current;
  });
};

const Timetable = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const { isDark } = useTheme();

  const [date, setDate] = useState(new Date());
  const [entries, setEntries] = useState([
    {
      id: '1',
      summary: 'Task 1',
      worklogs: [],
      assignee: 'Imane',
      reporter: 'Hind',
      project: 'Project B',
      start: '01:00',
      end: '01:30',
      date: new Date(),
    },
    {
      id: '2',
      summary: 'Task 2',
      worklogs: [],
      assignee: 'John',
      reporter: 'Doe',
      project: 'Project A',
      start: '02:00',
      end: '02:15',
      date: tomorrow,
    },
    {
      id: '3',
      summary: 'Task 3',
      worklogs: [],
      assignee: 'Jane',
      reporter: 'Smith',
      project: 'Project C',
      start: '03:00',
      end: '03:45',
      date: new Date(),
    },
  ]);

  const [newEntry, setNewEntry] = useState({
    summary: '',
    start: '',
    end: '',
    date: null,
  });
  const [showForm, setShowForm] = useState(false);
  const [editEntryId, setEditEntryId] = useState(null);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [showWeekends, setShowWeekends] = useState(true);

  const handleAddEntry = () => {
    if (!newEntry.summary || !newEntry.start || !newEntry.end || !newEntry.date) {
      alert('Please fill in all fields.');
      return;
    }

    if (editEntryId) {
      const updatedEntries = entries.map((entry) =>
        entry.id === editEntryId ? { ...newEntry, id: editEntryId } : entry
      );
      setEntries(updatedEntries);
    } else {
      const updatedEntries = [
        ...entries,
        { ...newEntry, id: Date.now().toString() },
      ];
      setEntries(updatedEntries);
    }

    setNewEntry({ summary: '', start: '', end: '', date: null });
    setShowForm(false);
    setEditEntryId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTask = (cellDate, time) => {
    const existingTask = entries.find(
      (entry) =>
        entry.date.toDateString() === cellDate.toDateString() &&
        entry.start === time
    );

    if (!existingTask) {
      const [hour, minute] = time.split(':').map(Number);
      const endDate = new Date(cellDate);
      let endHour = hour;
      let endMinute = minute + 30;

      if (endMinute >= 60) {
        endHour += 1;
        endMinute -= 60;
      }

      const newEnd = `${endHour.toString().padStart(2, '0')}:${endMinute
        .toString()
        .padStart(2, '0')}`;

      setNewEntry({
        ...newEntry,
        date: cellDate,
        start: time,
        end: newEnd,
      });
      setShowForm(true);
    }
  };

  const handleEditTask = (id) => {
    const entryToEdit = entries.find((entry) => entry.id === id);
    if (!entryToEdit) return;
    setNewEntry(entryToEdit);
    setShowForm(true);
    setEditEntryId(id);
  };

  const handleDeleteTask = (id) => {
    const updatedEntries = entries.filter((entry) => entry.id !== id);
    setEntries(updatedEntries);
  };

  const handleCancelAdd = () => {
    setShowForm(false);
    setNewEntry({ summary: '', start: '', end: '', date: null });
    setEditEntryId(null);
  };

  const handleDropTask = (taskId, newDate, newHour) => {
    const taskToMove = entries.find((entry) => entry.id === taskId);
    if (!taskToMove) return;

    const newStart = `${newHour}:00`;

    const [startHour, startMinute] = taskToMove.start.split(':').map(Number);
    const [endHour, endMinute] = taskToMove.end.split(':').map(Number);
    const durationMinutes =
      (endHour - startHour) * 60 + (endMinute - startMinute);

    const newStartMinutes = parseInt(newHour, 10) * 60;
    const newEndMinutes = newStartMinutes + durationMinutes;
    const newEndHour = Math.floor(newEndMinutes / 60);
    const newEndMinute = newEndMinutes % 60;

    const newEnd = `${newEndHour.toString().padStart(2, '0')}:${newEndMinute
      .toString()
      .padStart(2, '0')}`;

    const updatedEntries = entries.map((entry) =>
      entry.id === taskId
        ? {
            ...entry,
            date: newDate,
            start: newStart,
            end: newEnd,
          }
        : entry
    );

    setEntries(updatedEntries);
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 7);
    setDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 7);
    setDate(newDate);
  };

  const weekDays = getWeekDaysMondayFirst(date); 

  const weekView = weekDays.map((d) => ({
    date: d,
    entries: entries.filter(
      (entry) => entry.date.toDateString() === d.toDateString()
    ),
  }));

  const visibleWeekView = weekView.filter(({ date: d }) =>
    showWeekends ? true : d.getDay() !== 0 && d.getDay() !== 6
  );

  const hours = Array.from({ length: 24 }, (_, i) =>
    `${i.toString().padStart(2, '0')}:00`
  );

  const handleSaveTimeEntry = (taskId, timeSpentSeconds) => {
    const minutes = Math.max(Math.round(timeSpentSeconds / 60), 1);
    const updatedEntries = entries.map((entry) =>
      entry.id === taskId
        ? {
            ...entry,
            worklogs: Array.isArray(entry.worklogs)
              ? [...entry.worklogs, { minutes }]
              : [{ minutes }],
          }
        : entry
    );
    setEntries(updatedEntries);
  };

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const weekStart = weekDays[0];
  const weekEnd = weekDays[weekDays.length - 1];
  const weekRangeLabel = `${weekStart.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  })} – ${weekEnd.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  })}`;

  const dayCount = visibleWeekView.length;
  const gridTemplate = {
    gridTemplateColumns: `80px repeat(${dayCount}, minmax(0, 1fr))`,
  };

  const outerCardClass =
    'rounded-3xl border p-[1px] shadow-2xl backdrop-blur-xl ' +
    (isDark
      ? 'border-slate-800/70 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/95 shadow-slate-950/70'
      : 'border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50 shadow-slate-200');

  const innerCardClass =
    'rounded-3xl ' + (isDark ? 'bg-slate-950/80' : 'bg-white');

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`space-y-6 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
        <TimeTrackingCountdown
          tasks={entries}
          onSaveTimeEntry={handleSaveTimeEntry}
        />

        <div className={outerCardClass}>
          <div className={innerCardClass}>
            <div
              className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 ${
                isDark ? 'border-slate-800/80' : 'border-slate-200'
              }`}
            >
              <div className="space-y-1">
                <h1
                  className={`text-sm font-semibold tracking-tight ${
                    isDark ? 'text-slate-50' : 'text-slate-900'
                  }`}
                >
                  Weekly Timetable
                </h1>
                <p className="text-[11px] flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[10px] font-medium ring-1 ${
                      isDark
                        ? 'bg-slate-900/80 text-slate-300 ring-slate-700/70'
                        : 'bg-slate-100 text-slate-700 ring-slate-300'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/90" />
                    This week · {weekRangeLabel}
                  </span>
                  <span
                    className={`hidden sm:inline ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Drag &amp; drop tasks, toggle weekends, and navigate weeks.
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowWeekends((prev) => !prev)}
                  className={`inline-flex itemsacenter gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ring-1 ${
                    showWeekends
                      ? isDark
                        ? 'bg-slate-900 text-slate-100 ring-slate-600'
                        : 'bg-slate-900 text-slate-100 ring-slate-600'
                      : isDark
                      ? 'bg-slate-950 text-slate-300 ring-slate-700'
                      : 'bg-white text-slate-700 ring-slate-300'
                  }`}
                >
                  <span
                    className={`inline-flex h-3.5 w-6 items-center rounded-full p-[2px] transition ${
                      isDark ? 'bg-slate-800' : 'bg-slate-300'
                    } ${showWeekends ? 'justify-end' : 'justify-start'}`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full transition ${
                        showWeekends ? 'bg-emerald-400' : 'bg-slate-500'
                      }`}
                    />
                  </span>
                  <span>Weekends</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={handlePreviousWeek}
                    className={`rounded-full border px-3 py-1 text-xs shadow-sm transition ${
                      isDark
                        ? 'border-slate-700/80 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:border-slate-500'
                        : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={handleNextWeek}
                    className="rounded-full bg-indigo-500/90 px-3 py-1 text-xs font-medium text-slate-950 shadow-sm shadow-indigo-500/40 hover:bg-indigo-400 transition"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>

            <div className="px-4 pb-4 pt-3">
              <div
                className={`overflow-x-auto scrollbar-thin ${
                  isDark
                    ? 'scrollbar-thumb-slate-700 scrollbar-track-slate-900/40'
                    : 'scrollbar-thumb-slate-300 scrollbar-track-slate-100'
                }`}
              >
                <div
                  className={`grid border-b text-xs ${
                    isDark
                      ? 'border-slate-800 text-slate-300'
                      : 'border-slate-200 text-slate-700'
                  }`}
                  style={gridTemplate}
                >
                  <div
                    className={`flex items-center justify-center text-[10px] uppercase tracking-[0.18em] ${
                      isDark
                        ? 'bg-slate-950/90 text-slate-500'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    Time
                  </div>
                  {visibleWeekView.map(({ date: d }) => {
                    const todayFlag = isSameDay(d, today);
                    return (
                      <div
                        key={d.toISOString()}
                        className={`border-l py-2 text-center transition ${
                          isDark ? 'border-slate-800/60' : 'border-slate-200'
                        } ${
                          todayFlag
                            ? isDark
                              ? 'bg-gradient-to-b from-indigo-900/50 via-slate-950 to-slate-950 text-indigo-100'
                              : 'bg-gradient-to-b from-indigo-100 via-white to-white text-indigo-900'
                            : isDark
                            ? 'bg-slate-950/85'
                            : 'bg-white'
                        }`}
                      >
                        <span className="block text-[10px] uppercase tracking-[0.18em] text-slate-500">
                          {d.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span
                          className={`mt-0.5 inline-flex items-center justify-center rounded-full px-2 py-[2px] text-[11px] font-medium ring-1 ${
                            isDark
                              ? 'bg-slate-900/80 text-slate-100 ring-slate-700/80'
                              : 'bg-slate-100 text-slate-800 ring-slate-300'
                          }`}
                        >
                          {d.toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                          })}
                          {todayFlag && (
                            <span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="grid text-[11px]" style={gridTemplate}>
                  {hours.map((hour) => (
                    <React.Fragment key={hour}>
                      <div
                        className={`border-b py-2 text-center font-mono text-[11px] ${
                          isDark
                            ? 'border-slate-800/60 bg-slate-950/90 text-slate-400'
                            : 'border-slate-200 bg-slate-100 text-slate-600'
                        }`}
                      >
                        {hour}
                      </div>
                      {visibleWeekView.map(({ date: d, entries: dayEntries }) => (
                        <DayCell
                          key={`${d.toDateString()}-${hour}`}
                          date={d}
                          hour={hour.slice(0, 2)}
                          tasks={dayEntries.filter((entry) =>
                            entry.start.startsWith(hour.slice(0, 2))
                          )}
                          onDropTask={handleDropTask}
                          onAddTask={handleAddTask}
                          onEditTask={handleEditTask}
                          onDeleteTask={handleDeleteTask}
                          hoveredTask={hoveredTask}
                          setHoveredTask={setHoveredTask}
                          showWeekends={showWeekends}
                          isToday={isSameDay(d, today)}
                          isDark={isDark}
                        />
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div
              className={`w-full max-w-sm rounded-2xl border p-5 shadow-2xl ${
                isDark
                  ? 'border-slate-800 bg-slate-950/95 shadow-slate-950/70'
                  : 'border-slate-200 bg-white shadow-slate-300'
              }`}
            >
              <h3
                className={`mb-4 text-sm font-semibold ${
                  isDark ? 'text-slate-50' : 'text-slate-900'
                }`}
              >
                {editEntryId ? 'Edit Task' : 'Add Task'}{' '}
                {newEntry.date && (
                  <span
                    className={`text-[11px] ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    · {newEntry.date.toDateString()}
                  </span>
                )}
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  name="summary"
                  placeholder="Task summary"
                  value={newEntry.summary}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ring-0 transition ${
                    isDark
                      ? 'border-slate-700 bg-slate-950 text-slate-100 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/70'
                      : 'border-slate-300 bg-white text-slate-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/70'
                  }`}
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label
                      className={`mb-1 block text-[10px] uppercase tracking-[0.16em] ${
                        isDark ? 'text-slate-500' : 'text-slate-500'
                      }`}
                    >
                      Start
                    </label>
                    <input
                      type="time"
                      name="start"
                      value={newEntry.start}
                      onChange={handleInputChange}
                      className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ring-0 transition ${
                        isDark
                          ? 'border-slate-700 bg-slate-950 text-slate-100 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/70'
                          : 'border-slate-300 bg-white text-slate-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/70'
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`mb-1 block text-[10px] uppercase tracking-[0.16em] ${
                        isDark ? 'text-slate-500' : 'text-slate-500'
                      }`}
                    >
                      End
                    </label>
                    <input
                      type="time"
                      name="end"
                      value={newEntry.end}
                      onChange={handleInputChange}
                      className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ring-0 transition ${
                        isDark
                          ? 'border-slate-700 bg-slate-950 text-slate-100 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/70'
                          : 'border-slate-300 bg-white text-slate-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/70'
                      }`}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={handleAddEntry}
                  className="flex-1 rounded-lg bg-indigo-500/90 px-3 py-2 text-xs font-medium text-slate-950 shadow-sm shadow-indigo-500/60 hover:bg-indigo-400 transition"
                >
                  {editEntryId ? 'Update Task' : 'Add Task'}
                </button>
                <button
                  onClick={handleCancelAdd}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    isDark
                      ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default Timetable;
