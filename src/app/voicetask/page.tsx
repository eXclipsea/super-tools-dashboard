'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, CheckCircle, Clock, ArrowLeft, Plus, Trash2, ChevronLeft, ChevronRight, Flag, CalendarDays, ListTodo, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { saveData, loadData } from '@/lib/data';

// Types
interface Task {
  id: string;
  text: string;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  color: string;
  createdAt: string;
}

const COLORS = [
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Cyan', value: '#06b6d4' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isToday(dateStr: string): boolean {
  return dateStr === formatDate(new Date());
}

export default function FlowMeet() {
  const [activeView, setActiveView] = useState<'calendar' | 'tasks'>('calendar');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));

  // Add task form
  const [showAddTask, setShowAddTask] = useState(false);
  const [newText, setNewText] = useState('');
  const [newDate, setNewDate] = useState(formatDate(new Date()));
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newColor, setNewColor] = useState(COLORS[0].value);

  // AI suggestions
  const [isGenerating, setIsGenerating] = useState(false);

  // Load saved tasks
  useEffect(() => {
    const init = async () => {
      const saved = await loadData('flowmeet_tasks_v2', []);
      if (saved && saved.length > 0) setTasks(saved);
      setIsInitialized(true);
    };
    init();
  }, []);

  // Persist tasks
  useEffect(() => {
    if (isInitialized) saveData('flowmeet_tasks_v2', tasks);
  }, [tasks, isInitialized]);

  // Calendar helpers
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const days: { date: string; day: number; isCurrentMonth: boolean }[] = [];

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = currentMonth === 0 ? 11 : currentMonth - 1;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      days.push({ date: formatDate(new Date(y, m, d)), day: d, isCurrentMonth: false });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ date: formatDate(new Date(currentYear, currentMonth, d)), day: d, isCurrentMonth: true });
    }

    // Next month leading days
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      days.push({ date: formatDate(new Date(y, m, d)), day: d, isCurrentMonth: false });
    }

    return days;
  }, [currentMonth, currentYear]);

  const getTasksForDate = (date: string) => tasks.filter(t => t.dueDate === date);
  const selectedTasks = getTasksForDate(selectedDate);
  const todayStr = formatDate(new Date());

  const pendingCount = tasks.filter(t => !t.completed).length;
  const todayCount = tasks.filter(t => t.dueDate === todayStr && !t.completed).length;
  const overdueCount = tasks.filter(t => t.dueDate < todayStr && !t.completed).length;

  // Task actions
  const addTask = () => {
    if (!newText.trim()) return;
    const task: Task = {
      id: `${Date.now()}-${Math.random()}`,
      text: newText,
      dueDate: newDate,
      completed: false,
      priority: newPriority,
      color: newColor,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [task, ...prev]);
    setNewText('');
    setNewDate(selectedDate);
    setNewPriority('medium');
    setShowAddTask(false);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const goToday = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
    setSelectedDate(formatDate(now));
  };

  // AI: Generate suggested tasks for selected date
  const generateSuggestions = async () => {
    setIsGenerating(true);
    try {
      const dayName = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
      const existingTasks = tasks.filter(t => !t.completed).map(t => t.text).join(', ');

      const res = await fetch('/api/flowmeet/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: [],
          tasks: tasks.filter(t => !t.completed).map(t => ({ text: t.text, dueDate: t.dueDate, priority: t.priority })),
          prompt: `Today is ${selectedDate} (${dayName}). The user already has these tasks: ${existingTasks || 'none'}. Suggest 3-4 useful, practical tasks for this day. Return JSON: {"suggestions": [{"text": "task description", "priority": "low|medium|high"}]}`,
        }),
      });
      const data = await res.json();
      const suggestions = data.suggestions || data.schedule?.suggestions || [];

      if (suggestions.length > 0) {
        const newTasks: Task[] = suggestions.map((s: { text: string; priority?: string }) => ({
          id: `ai-${Date.now()}-${Math.random()}`,
          text: s.text,
          dueDate: selectedDate,
          completed: false,
          priority: (s.priority as Task['priority']) || 'medium',
          color: '#8b5cf6',
          createdAt: new Date().toISOString(),
        }));
        setTasks(prev => [...newTasks, ...prev]);
      }
    } catch (err) {
      console.error('AI suggestion error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const priorityIcon = (p: string) => {
    if (p === 'high') return <Flag className="w-3 h-3 text-red-400" />;
    if (p === 'medium') return <Flag className="w-3 h-3 text-amber-400" />;
    return <Flag className="w-3 h-3 text-neutral-500" />;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-4 h-4 text-white/50" />
              <span className="text-[13px] text-white/50">Back</span>
            </Link>
            <div className="w-px h-6 bg-neutral-800" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight">FlowMeet</h1>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-neutral-900 rounded-lg p-1 border border-neutral-800">
            <button
              onClick={() => setActiveView('calendar')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeView === 'calendar' ? 'bg-violet-500 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Calendar
            </button>
            <button
              onClick={() => setActiveView('tasks')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeView === 'tasks' ? 'bg-violet-500 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ListTodo className="w-4 h-4" />
              All Tasks
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            <p className="text-neutral-500 text-xs mb-1">Today</p>
            <p className="text-2xl font-semibold text-violet-400">{todayCount}</p>
            <p className="text-neutral-600 text-xs mt-1">tasks due</p>
          </div>
          <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            <p className="text-neutral-500 text-xs mb-1">Pending</p>
            <p className="text-2xl font-semibold">{pendingCount}</p>
            <p className="text-neutral-600 text-xs mt-1">total open</p>
          </div>
          <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            <p className="text-neutral-500 text-xs mb-1">Overdue</p>
            <p className="text-2xl font-semibold text-red-400">{overdueCount}</p>
            <p className="text-neutral-600 text-xs mt-1">past due</p>
          </div>
        </div>

        {activeView === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar Grid */}
            <div className="lg:col-span-2">
              <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
                {/* Month Navigation */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                  <button onClick={prevMonth} className="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors">
                    <ChevronLeft className="w-5 h-5 text-neutral-400" />
                  </button>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">{MONTHS[currentMonth]} {currentYear}</h2>
                    <button onClick={goToday} className="text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 px-2 py-1 rounded">
                      Today
                    </button>
                  </div>
                  <button onClick={nextMonth} className="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors">
                    <ChevronRight className="w-5 h-5 text-neutral-400" />
                  </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b border-neutral-800">
                  {DAYS.map(day => (
                    <div key={day} className="p-2 text-center text-xs font-medium text-neutral-500">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Cells */}
                <div className="grid grid-cols-7">
                  {calendarDays.map((cell, i) => {
                    const dayTasks = getTasksForDate(cell.date);
                    const isSelected = cell.date === selectedDate;
                    const isTodayCell = cell.date === todayStr;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(cell.date)}
                        className={`relative p-2 min-h-[80px] border-b border-r border-neutral-800/50 text-left transition-colors ${
                          !cell.isCurrentMonth ? 'opacity-30' : ''
                        } ${isSelected ? 'bg-violet-500/10' : 'hover:bg-neutral-800/50'}`}
                      >
                        <span className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${
                          isTodayCell ? 'bg-violet-500 text-white' : 'text-neutral-300'
                        }`}>
                          {cell.day}
                        </span>
                        {dayTasks.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {dayTasks.slice(0, 3).map(t => (
                              <div
                                key={t.id}
                                className={`text-[10px] leading-tight px-1 py-0.5 rounded truncate ${
                                  t.completed ? 'line-through opacity-40' : ''
                                }`}
                                style={{ backgroundColor: `${t.color}20`, color: t.color }}
                              >
                                {t.text}
                              </div>
                            ))}
                            {dayTasks.length > 3 && (
                              <p className="text-[10px] text-neutral-500 px-1">+{dayTasks.length - 3} more</p>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected Day Sidebar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </h3>
                  <p className="text-xs text-neutral-500">{selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                  onClick={() => { setShowAddTask(true); setNewDate(selectedDate); }}
                  className="bg-violet-500 hover:bg-violet-600 text-white p-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add Task Form */}
              {showAddTask && (
                <div className="bg-neutral-900 rounded-xl p-4 border border-violet-500/30 space-y-3">
                  <input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    placeholder="What needs to be done?"
                    className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                    autoFocus
                  />
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                  />
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setNewPriority(p)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                          newPriority === p
                            ? p === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : p === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {COLORS.map(c => (
                      <button
                        key={c.value}
                        onClick={() => setNewColor(c.value)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          newColor === c.value ? 'border-white scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addTask} disabled={!newText.trim()} className="flex-1 bg-violet-500 hover:bg-violet-600 disabled:bg-neutral-800 text-white font-medium py-2 rounded-lg text-sm">
                      Add Task
                    </button>
                    <button onClick={() => setShowAddTask(false)} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-lg text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* AI Suggestions */}
              <button
                onClick={generateSuggestions}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 rounded-lg text-sm font-medium border border-violet-500/20 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'AI Suggest Tasks'}
              </button>

              {/* Tasks for selected day */}
              <div className="space-y-2">
                {selectedTasks.length === 0 ? (
                  <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800 text-center">
                    <Calendar className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
                    <p className="text-sm text-neutral-500">No tasks for this day</p>
                    <button
                      onClick={() => { setShowAddTask(true); setNewDate(selectedDate); }}
                      className="text-violet-400 hover:text-violet-300 text-sm mt-2"
                    >
                      + Add a task
                    </button>
                  </div>
                ) : (
                  selectedTasks.map(task => (
                    <div
                      key={task.id}
                      className="bg-neutral-900 rounded-xl p-3 border border-neutral-800 flex items-start gap-3"
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                          task.completed ? 'border-transparent' : ''
                        }`}
                        style={{
                          borderColor: task.completed ? task.color : task.color + '60',
                          backgroundColor: task.completed ? task.color : 'transparent',
                        }}
                      >
                        {task.completed && <CheckCircle className="w-3 h-3 text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-tight ${task.completed ? 'line-through text-neutral-500' : 'text-white'}`}>
                          {task.text}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {priorityIcon(task.priority)}
                          <span className="text-[11px] text-neutral-500 capitalize">{task.priority}</span>
                        </div>
                      </div>
                      <button onClick={() => deleteTask(task.id)} className="text-neutral-600 hover:text-red-400 shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* All Tasks View */}
        {activeView === 'tasks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">All Tasks</h2>
              <button
                onClick={() => { setShowAddTask(true); setNewDate(formatDate(new Date())); }}
                className="bg-violet-500 hover:bg-violet-600 text-white font-medium py-2 px-4 rounded-lg text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>

            {showAddTask && (
              <div className="bg-neutral-900 rounded-xl p-4 border border-violet-500/30 space-y-3 max-w-lg">
                <input
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                  placeholder="What needs to be done?"
                  className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                  autoFocus
                />
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                />
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setNewPriority(p)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                        newPriority === p
                          ? p === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : p === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setNewColor(c.value)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        newColor === c.value ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={addTask} disabled={!newText.trim()} className="flex-1 bg-violet-500 hover:bg-violet-600 disabled:bg-neutral-800 text-white font-medium py-2 rounded-lg text-sm">
                    Add Task
                  </button>
                  <button onClick={() => setShowAddTask(false)} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-lg text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Overdue */}
            {overdueCount > 0 && (
              <div>
                <h3 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Overdue ({overdueCount})
                </h3>
                <div className="space-y-2">
                  {tasks.filter(t => t.dueDate < todayStr && !t.completed).map(task => (
                    <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} priorityIcon={priorityIcon} />
                  ))}
                </div>
              </div>
            )}

            {/* Today */}
            <div>
              <h3 className="text-sm font-medium text-violet-400 mb-3 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Today ({todayCount})
              </h3>
              <div className="space-y-2">
                {tasks.filter(t => t.dueDate === todayStr && !t.completed).map(task => (
                  <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} priorityIcon={priorityIcon} />
                ))}
                {todayCount === 0 && (
                  <p className="text-sm text-neutral-500 bg-neutral-900 rounded-xl p-4 border border-neutral-800 text-center">
                    No tasks due today
                  </p>
                )}
              </div>
            </div>

            {/* Upcoming */}
            {tasks.filter(t => t.dueDate > todayStr && !t.completed).length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-neutral-400 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Upcoming
                </h3>
                <div className="space-y-2">
                  {tasks.filter(t => t.dueDate > todayStr && !t.completed)
                    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                    .map(task => (
                      <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} priorityIcon={priorityIcon} showDate />
                    ))}
                </div>
              </div>
            )}

            {/* Completed */}
            {tasks.filter(t => t.completed).length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-neutral-600 mb-3">
                  Completed ({tasks.filter(t => t.completed).length})
                </h3>
                <div className="space-y-2 opacity-60">
                  {tasks.filter(t => t.completed).slice(0, 10).map(task => (
                    <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} priorityIcon={priorityIcon} showDate />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Task row component
function TaskRow({ task, onToggle, onDelete, priorityIcon, showDate }: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  priorityIcon: (p: string) => React.ReactNode;
  showDate?: boolean;
}) {
  return (
    <div className="bg-neutral-900 rounded-xl p-3 border border-neutral-800 flex items-center gap-3">
      <button
        onClick={() => onToggle(task.id)}
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0"
        style={{
          borderColor: task.completed ? task.color : task.color + '60',
          backgroundColor: task.completed ? task.color : 'transparent',
        }}
      >
        {task.completed && <CheckCircle className="w-3 h-3 text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${task.completed ? 'line-through text-neutral-500' : 'text-white'}`}>{task.text}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {priorityIcon(task.priority)}
          <span className="text-[11px] text-neutral-500 capitalize">{task.priority}</span>
          {showDate && <span className="text-[11px] text-neutral-600">· {new Date(task.dueDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
        </div>
      </div>
      <button onClick={() => onDelete(task.id)} className="text-neutral-600 hover:text-red-400 shrink-0">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
