'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, ArrowLeft, Sparkles, Check, ChevronLeft, ChevronRight, Target, Clock, Calendar, Zap } from 'lucide-react';
import Link from 'next/link';
import { saveData, loadData } from '@/lib/data';

interface HabitDay {
  day: number;
  task: string;
  duration: string;
  details: string;
  completed: boolean;
}

interface HabitPlan {
  goal: string;
  description: string;
  days: HabitDay[];
  currentDay: number;
  createdAt: string;
}

interface HabitForm {
  goal: string;
  currentLevel: string;
  targetLevel: string;
  timeOfDay: string;
  obstacles: string;
  motivation: string;
  timeframe: number;
}

export default function HabitRise() {
  const [form, setForm] = useState<HabitForm>({
    goal: '',
    currentLevel: '',
    targetLevel: '',
    timeOfDay: '',
    obstacles: '',
    motivation: '',
    timeframe: 30
  });
  const [plan, setPlan] = useState<HabitPlan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  // Load saved plan on mount
  useEffect(() => {
    const init = async () => {
      const saved = await loadData('habitrise_plan', null);
      if (saved) {
        setPlan(saved);
        setForm(prev => ({ ...prev, goal: saved.goal }));
      }
      setIsInitialized(true);
    };
    init();
  }, []);

  // Persist plan whenever it changes
  useEffect(() => {
    if (isInitialized && plan) {
      saveData('habitrise_plan', plan);
    }
  }, [plan, isInitialized]);

  const generatePlan = async () => {
    if (!form.goal) return;
    setGenerating(true);
    
    const t1 = setTimeout(() => setLoadingStep('Analyzing your goals...'), 100);
    const t2 = setTimeout(() => setLoadingStep('Creating personalized tasks...'), 1500);
    const t3 = setTimeout(() => setLoadingStep('Building your roadmap...'), 3000);

    try {
      const res = await fetch('/api/habitrise/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate plan');
      }

      setPlan({
        goal: form.goal,
        description: data.description,
        days: data.days,
        currentDay: 1,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to generate plan:', err);
      // Fallback to simple plan
      const fallbackDays: HabitDay[] = [];
      for (let i = 1; i <= form.timeframe; i++) {
        fallbackDays.push({
          day: i,
          task: `${form.goal} - Day ${i}`,
          duration: i <= 7 ? '5 minutes' : i <= 21 ? '15 minutes' : '30 minutes',
          details: 'Build your habit gradually',
          completed: false
        });
      }
      setPlan({
        goal: form.goal,
        description: `Custom plan for ${form.goal}`,
        days: fallbackDays,
        currentDay: 1,
        createdAt: new Date().toISOString()
      });
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setGenerating(false);
      setLoadingStep('');
    }
  };

  const toggleDay = (dayNumber: number) => {
    if (!plan) return;
    const newDays = plan.days.map(d => 
      d.day === dayNumber ? { ...d, completed: !d.completed } : d
    );
    setPlan({ ...plan, days: newDays });
  };

  const setCurrentDay = (day: number) => {
    if (!plan) return;
    setPlan({ ...plan, currentDay: day });
  };

  const resetPlan = () => {
    setPlan(null);
    setForm({
      goal: '',
      currentLevel: '',
      targetLevel: '',
      timeOfDay: '',
      obstacles: '',
      motivation: '',
      timeframe: 30
    });
    saveData('habitrise_plan', null);
  };

  const progress = plan ? (plan.days.filter(d => d.completed).length / plan.days.length) * 100 : 0;
  const currentDayData = plan?.days[plan.currentDay - 1];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-4 h-4 text-white/50" />
            <span className="text-[13px] text-white/50">Back</span>
          </Link>
          <div className="w-px h-6 bg-neutral-800" />
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h1 className="text-lg font-semibold tracking-tight">HabitRise</h1>
          </div>
        </div>

        {!plan ? (
          /* Goal Input Form */
          <div className="max-w-xl mx-auto">
            <div className="bg-neutral-900/50 rounded-3xl p-8 border border-neutral-800">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-semibold">Tell us about your habit goal</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-neutral-500 mb-2 block">What habit do you want to build?</label>
                  <input
                    type="text"
                    value={form.goal}
                    onChange={(e) => setForm({ ...form, goal: e.target.value })}
                    placeholder="e.g., Daily meditation, Reading, Exercise..."
                    className="w-full bg-black border border-neutral-800 text-white rounded-xl px-4 py-3 focus:border-emerald-400/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-neutral-500 mb-2 block">Where are you starting from?</label>
                  <input
                    type="text"
                    value={form.currentLevel}
                    onChange={(e) => setForm({ ...form, currentLevel: e.target.value })}
                    placeholder="e.g., Never done it, Used to do it occasionally..."
                    className="w-full bg-black border border-neutral-800 text-white rounded-xl px-4 py-3 focus:border-emerald-400/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-neutral-500 mb-2 block">What's your target?</label>
                  <input
                    type="text"
                    value={form.targetLevel}
                    onChange={(e) => setForm({ ...form, targetLevel: e.target.value })}
                    placeholder="e.g., 30 minutes daily, Read 2 books per month..."
                    className="w-full bg-black border border-neutral-800 text-white rounded-xl px-4 py-3 focus:border-emerald-400/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-neutral-500 mb-2 block">Best time of day for you?</label>
                  <select
                    value={form.timeOfDay}
                    onChange={(e) => setForm({ ...form, timeOfDay: e.target.value })}
                    className="w-full bg-black border border-neutral-800 text-white rounded-xl px-4 py-3 focus:border-emerald-400/50 focus:outline-none"
                  >
                    <option value="">Select a time...</option>
                    <option value="morning">Morning (before work/school)</option>
                    <option value="midday">Midday (lunch break)</option>
                    <option value="evening">Evening (after work)</option>
                    <option value="night">Night (before bed)</option>
                    <option value="flexible">Flexible / varies</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-neutral-500 mb-2 block">What obstacles might you face?</label>
                  <textarea
                    value={form.obstacles}
                    onChange={(e) => setForm({ ...form, obstacles: e.target.value })}
                    placeholder="e.g., Busy schedule, Lack of motivation, Distractions at home..."
                    className="w-full bg-black border border-neutral-800 text-white rounded-xl px-4 py-3 focus:border-emerald-400/50 focus:outline-none h-20 resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-neutral-500 mb-2 block">Why is this important to you?</label>
                  <textarea
                    value={form.motivation}
                    onChange={(e) => setForm({ ...form, motivation: e.target.value })}
                    placeholder="e.g., Want to reduce stress, Improve health, Learn new skill..."
                    className="w-full bg-black border border-neutral-800 text-white rounded-xl px-4 py-3 focus:border-emerald-400/50 focus:outline-none h-20 resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-neutral-500 mb-2 block">Plan duration: {form.timeframe} days</label>
                  <input
                    type="range"
                    min="7"
                    max="90"
                    value={form.timeframe}
                    onChange={(e) => setForm({ ...form, timeframe: parseInt(e.target.value) })}
                    className="w-full accent-emerald-400"
                  />
                  <div className="flex justify-between text-xs text-neutral-600 mt-1">
                    <span>1 week</span>
                    <span>3 months</span>
                  </div>
                </div>
              </div>

              <button
                onClick={generatePlan}
                disabled={!form.goal || generating}
                className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    {loadingStep || 'Creating your plan...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Custom Plan
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Habit Tracker */
          <div className="space-y-8">
            {/* Plan Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-emerald-300">{plan.goal}</h2>
                {plan.description && <p className="text-neutral-500 text-sm mt-1 max-w-lg">{plan.description}</p>}
                <p className="text-neutral-600 text-xs mt-1">Day {plan.currentDay} of {plan.days.length}</p>
              </div>
              <button
                onClick={resetPlan}
                className="text-neutral-500 hover:text-white text-sm border border-neutral-800 hover:border-neutral-600 px-3 py-1.5 rounded-lg transition-all"
              >
                New Plan
              </button>
            </div>

            {/* Progress Bar */}
            <div className="bg-neutral-900/50 rounded-2xl p-4 border border-neutral-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-500">Overall Progress</span>
                <span className="text-emerald-400 font-medium">{progress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-3">
                <div
                  className="bg-emerald-400 h-3 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Current Day Card */}
            {currentDayData && (
              <div className="bg-emerald-500/10 rounded-3xl p-8 border border-emerald-500/20">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <p className="text-sm text-emerald-400">Day {plan.currentDay}</p>
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">{currentDayData.task}</h3>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <span className="flex items-center gap-1 text-neutral-400">
                      <Clock className="w-4 h-4" />
                      {currentDayData.duration}
                    </span>
                    <span className="flex items-center gap-1 text-neutral-400">
                      <Zap className="w-4 h-4" />
                      {plan.days.filter(d => d.completed).length} of {plan.days.length} done
                    </span>
                  </div>
                  <p className="text-neutral-400 mb-6 max-w-md mx-auto">{currentDayData.details}</p>
                  
                  <button
                    onClick={() => toggleDay(plan.currentDay)}
                    className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      currentDayData.completed
                        ? 'bg-emerald-500 text-black'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                  >
                    {currentDayData.completed ? (
                      <>
                        <Check className="w-5 h-5" />
                        Completed!
                      </>
                    ) : (
                      'Mark Complete'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Day Navigation */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setCurrentDay(Math.max(1, plan.currentDay - 1))}
                disabled={plan.currentDay === 1}
                className="p-3 rounded-full bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {/* Day Beads - Scrollable */}
              <div className="flex items-center gap-1 overflow-x-auto max-w-md px-2">
                {plan.days.slice(0, 30).map((day) => (
                  <button
                    key={day.day}
                    onClick={() => setCurrentDay(day.day)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all flex-shrink-0 ${
                      day.day === plan.currentDay
                        ? 'bg-white text-black'
                        : day.completed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-neutral-800 text-neutral-500 hover:bg-neutral-700'
                    }`}
                  >
                    {day.completed ? <Check className="w-4 h-4" /> : day.day}
                  </button>
                ))}
                {plan.days.length > 30 && (
                  <span className="text-neutral-600 text-xs">+{plan.days.length - 30} more</span>
                )}
              </div>

              <button
                onClick={() => setCurrentDay(Math.min(plan.days.length, plan.currentDay + 1))}
                disabled={plan.currentDay === plan.days.length}
                className="p-3 rounded-full bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* All Days List */}
            <div className="bg-neutral-900/50 rounded-2xl p-6 border border-neutral-800">
              <h3 className="text-sm font-medium text-neutral-500 mb-4">Your {plan.days.length}-Day Journey</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {plan.days.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => setCurrentDay(day.day)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                      day.day === plan.currentDay
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : day.completed
                          ? 'bg-neutral-800/50 border-neutral-700 opacity-60'
                          : 'bg-neutral-800/30 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      day.completed ? 'bg-emerald-500 text-black' : 'bg-neutral-700 text-neutral-400'
                    }`}>
                      {day.completed ? <Check className="w-3 h-3" /> : day.day}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${day.completed ? 'line-through text-neutral-500' : 'text-white'}`}>
                        {day.task}
                      </p>
                      <p className="text-xs text-neutral-500">{day.duration}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Completion Message */}
            {progress === 100 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-medium text-emerald-300 mb-2">Journey Complete!</h3>
                <p className="text-neutral-500">You&apos;ve completed all {plan.days.length} days. Amazing work!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
