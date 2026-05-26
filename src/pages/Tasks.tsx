import { useState, useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import type { Task, TaskCompletion } from '../store/useAppStore'
import {
  Check, Plus, Trash2, Users, Lock, Flame,
  RefreshCw, ChevronDown, X, Star, Zap, User, Bell
} from 'lucide-react'
import { ConfirmDialog } from '../components/ConfirmDialog'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWeeklyTarget(recurrence: string): number {
  const map: Record<string, number> = {
    daily: 7, '2_days': 2, '3_days': 3,
    '4_days': 4, '5_days': 5, weekly: 1,
  }
  return map[recurrence] ?? 0
}

function getRecurrenceLabel(r: string): string {
  const map: Record<string, string> = {
    daily: 'Daily', '2_days': '2×/wk', '3_days': '3×/wk',
    '4_days': '4×/wk', '5_days': '5×/wk', weekly: 'Weekly', monthly: 'Monthly',
  }
  return map[r] ?? 'One-off'
}

// ─── Custom Select ────────────────────────────────────────────────────────────

interface Option { value: string; label: string }

function CustomSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: Option[]
}) {
  const [open, setOpen] = useState(false)
  const sel = options.find(o => o.value === value)
  return (
    <div className="relative">
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-purple/40 transition-all text-sm font-bold text-slate-800 text-left focus:outline-none">
        <span>{sel?.label}</span>
        <ChevronDown size={15} className={`text-slate-400 transition-transform ${open ? 'rotate-180 text-brand-purple' : ''}`} />
      </button>
      {open && <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />}
      {open && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-100 rounded-2xl shadow-xl z-40 p-1.5 space-y-0.5 max-h-52 overflow-y-auto animate-fade-in">
          {options.map(o => {
            const isSel = o.value === value
            return (
              <button key={o.value} type="button"
                onClick={() => { onChange(o.value); setOpen(false) }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-black transition-all ${isSel ? 'bg-brand-purple/10 text-brand-purple' : 'text-slate-600 hover:bg-slate-50'}`}>
                <span>{o.label}</span>
                {isSel && <Check size={12} strokeWidth={3} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Recurring Dots Row ───────────────────────────────────────────────────────
// Shows MY dots (interactive) and PARTNER's dots (read-only) side-by-side

function RecurringDotsSection({
  task, target, myCompletions, partnerCompletions, partnerName, pairStatus,
  onAdd, onRemove
}: {
  task: Task
  target: number
  myCompletions: TaskCompletion[]
  partnerCompletions: TaskCompletion[]
  partnerName: string
  pairStatus: string
  onAdd: () => void
  onRemove: (id: string) => void
}) {
  const myCount      = myCompletions.length
  const partnerCount = partnerCompletions.length
  const myDone       = myCount >= target
  const partnerDone  = partnerCount >= target

  return (
    <div className="mt-3 space-y-2">
      {/* MY dots */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider w-[28px] shrink-0">You</span>
        <div className="flex items-center gap-1.5 flex-1">
          {Array.from({ length: target }).map((_, i) => {
            const filled = i < myCount
            const completion = myCompletions[i]
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (filled && completion) {
                    onRemove(completion.id)
                  } else if (!filled && myCount <= i) {
                    onAdd()
                  }
                }}
                className={`transition-all duration-200 active-pop ${filled ? 'scale-105' : 'hover:scale-105'}`}
                title={filled ? 'Tap to undo' : 'Mark done'}
              >
                {filled ? (
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-emerald-300 flex items-center justify-center shadow-[0_2px_8px_rgba(16,185,129,0.4)]">
                    <Check size={12} strokeWidth={3.5} className="text-white" />
                  </span>
                ) : (
                  <span className="w-7 h-7 rounded-full border-2 border-dashed border-slate-200 bg-white flex items-center justify-center hover:border-emerald-400 hover:bg-emerald-50 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-slate-200" />
                  </span>
                )}
              </button>
            )
          })}
          {myDone && (
            <span className="ml-1 text-[10px] font-black text-emerald-600 animate-fade-in">✓ Done!</span>
          )}
          {!myDone && (
            <span className="ml-1 text-[10px] font-black text-slate-400 tabular-nums">{myCount}/{target}</span>
          )}
        </div>
      </div>

      {/* PARTNER dots (shared tasks only) */}
      {task.category === 'shared' && pairStatus === 'active' && (
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider w-[28px] shrink-0 truncate">
            {(partnerName || 'Partner').split(' ')[0].slice(0, 3)}
          </span>
          <div className="flex items-center gap-1.5 flex-1">
            {Array.from({ length: target }).map((_, i) => {
              const filled = i < partnerCount
              return (
                <span key={i} className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  filled
                    ? 'bg-gradient-to-br from-brand-cyan to-teal-500 border-2 border-brand-cyan/50 shadow-[0_2px_8px_rgba(0,188,212,0.35)]'
                    : 'border-2 border-dashed border-slate-200 bg-white'
                }`}>
                  {filled
                    ? <Check size={12} strokeWidth={3.5} className="text-white" />
                    : <span className="w-2 h-2 rounded-full bg-slate-200" />
                  }
                </span>
              )
            })}
            {partnerDone && (
              <span className="ml-1 text-[10px] font-black text-brand-cyan animate-fade-in">✓ Done!</span>
            )}
            {!partnerDone && (
              <span className="ml-1 text-[10px] font-black text-slate-400 tabular-nums">{partnerCount}/{target}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS: Option[] = [
  { value: 'shared', label: '🤝 Shared' },
  { value: 'personal', label: '🔒 Personal' },
]
const RECURRENCE_OPTIONS: Option[] = [
  { value: 'none', label: 'One-off' },
  { value: 'daily', label: 'Daily (7×/wk)' },
  { value: '2_days', label: '2 days / week' },
  { value: '3_days', label: '3 days / week' },
  { value: '4_days', label: '4 days / week' },
  { value: '5_days', label: '5 days / week' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Tasks() {
  const {
    tasks, taskCompletions, partnerName, pairStatus,
    addTask, toggleTask, deleteTask, fetchTasks, fetchTaskCompletions,
    addTaskCompletion, removeTaskCompletion, sendTaskReminder
  } = useAppStore()

  const [loading, setLoading]               = useState(true)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [activeTab, setActiveTab]           = useState<'shared' | 'personal'>('shared')
  const [isAdding, setIsAdding]             = useState(false)

  const [notifPermission, setNotifPermission] = useState<string>(
    'Notification' in window ? Notification.permission : 'default'
  )

  const requestNotifPermission = async () => {
    if ('Notification' in window) {
      const res = await Notification.requestPermission()
      setNotifPermission(res)
    }
  }

  // Form
  const [title, setTitle]         = useState('')
  const [category, setCategory]   = useState<'shared' | 'personal'>('shared')
  const [recurrence, setRecurrence] = useState('none')

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchTasks(), fetchTaskCompletions()]).finally(() => setLoading(false))
  }, [fetchTasks, fetchTaskCompletions])

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    addTask({ title, category, recurrence, date: new Date().toISOString().split('T')[0] })
    setTitle(''); setRecurrence('none'); setIsAdding(false)
  }

  // ── Per-task completion helpers ────────────────────────────────────────────
  const myCompletionsFor = (taskId: string) =>
    taskCompletions.filter(c => c.task_id === taskId && c.completed_by === 'you')
  const partnerCompletionsFor = (taskId: string) =>
    taskCompletions.filter(c => c.task_id === taskId && c.completed_by === 'partner')

  // Is a task "done" this week?
  const isEffectivelyDone = (t: Task) => {
    const target = getWeeklyTarget(t.recurrence)
    if (target > 0) return myCompletionsFor(t.id).length >= target
    return t.is_done
  }

  const isPartnerEffectivelyDone = (t: Task) => {
    const target = getWeeklyTarget(t.recurrence)
    if (target > 0) return partnerCompletionsFor(t.id).length >= target
    return t.is_done
  }

  const filteredTasks = tasks.filter(t => t.category === activeTab)
  const totalCount = filteredTasks.length

  // You
  const myCompletedCount = filteredTasks.filter(t => isEffectivelyDone(t)).length
  const myProgress = totalCount > 0 ? Math.round((myCompletedCount / totalCount) * 100) : 0
  const myAllDone = totalCount > 0 && myCompletedCount === totalCount

  // Partner
  const partnerCompletedCount = filteredTasks.filter(t => isPartnerEffectivelyDone(t)).length
  const partnerProgress = totalCount > 0 ? Math.round((partnerCompletedCount / totalCount) * 100) : 0
  const partnerAllDone = totalCount > 0 && partnerCompletedCount === totalCount

  // Overall Combined Done (both have done everything)
  const bothAllDone = totalCount > 0 && myAllDone && partnerAllDone

  // Streak
  const calculateStreak = () => {
    const shared = tasks.filter(t => t.category === 'shared')
    if (!shared.length) return 0
    const byDate: Record<string, Task[]> = {}
    shared.forEach(t => { (byDate[t.date] = byDate[t.date] || []).push(t) })
    const dates = Object.keys(byDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    let streak = 0
    let d = new Date(); d.setHours(0, 0, 0, 0)
    while (true) {
      const key = d.toISOString().split('T')[0]
      const day = byDate[key]
      const isToday = key === new Date().toISOString().split('T')[0]
      if (day?.length) {
        if (day.every(t => isEffectivelyDone(t))) streak++
        else if (!isToday) break
      } else {
        if (!isToday) {
          const hasOlder = dates.some(dd => new Date(dd).getTime() < d.getTime())
          if (!hasOlder || !isToday) break
        }
      }
      d.setDate(d.getDate() - 1)
    }
    return streak
  }
  const streak = calculateStreak()

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen pb-32 animate-fade-in">

      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden pt-14 pb-6 px-5">
        {/* ambient glows */}
        <div className="absolute top-0 left-[-20%] w-64 h-64 rounded-full bg-brand-purple/12 blur-3xl pointer-events-none" />
        <div className="absolute top-[-10%] right-[-10%] w-48 h-48 rounded-full bg-brand-cyan/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between">
          <div>

            <h1 className="text-[32px] font-black text-slate-800 tracking-tight leading-none">Daily Tasks</h1>
            <p className="text-[11px] font-bold text-slate-400 mt-1">
              {new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Streak Badge */}
          <div className={`flex flex-col items-center justify-center rounded-[18px] px-3 py-2.5 shrink-0 border transition-all ${
            streak > 0
              ? 'bg-gradient-to-br from-orange-500 to-brand-purple border-orange-400/30 shadow-lg shadow-orange-500/20'
              : 'bg-slate-100 border-slate-200'
          }`}>
            <Flame size={16} className={streak > 0 ? 'text-white fill-white/80' : 'text-slate-400'} />
            <span className={`text-base font-black leading-none mt-0.5 ${streak > 0 ? 'text-white' : 'text-slate-400'}`}>{streak}</span>
            <span className={`text-[8px] font-black uppercase tracking-wide ${streak > 0 ? 'text-white/70' : 'text-slate-400'}`}>streak</span>
          </div>
        </div>

        {/* Progress Section */}
        <div className="relative z-10 mt-5 bg-white/40 backdrop-blur-md rounded-[24px] border border-white/60 p-4 shadow-sm">
          {activeTab === 'shared' ? (
            <div className="space-y-3">
              {/* Header / Title */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Users size={11} className="text-brand-purple" />
                  Shared Progress
                </span>
                {bothAllDone && totalCount > 0 && (
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <Star size={8} className="fill-emerald-500 text-emerald-500" /> Perfect Match
                  </span>
                )}
              </div>

              {/* Progress Bars */}
              <div className="grid grid-cols-2 gap-4">
                {/* My Progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-600 truncate max-w-[70px]">You</span>
                    <span className="text-brand-purple font-black">{myCompletedCount}/{totalCount}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        myAllDone
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                          : 'bg-gradient-to-r from-brand-purple to-violet-500'
                      }`}
                      style={{ width: `${myProgress}%` }}
                    />
                  </div>
                </div>

                {/* Partner Progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-600 truncate max-w-[70px]">{partnerName || 'Partner'}</span>
                    <span className="text-brand-cyan font-black">{partnerCompletedCount}/{totalCount}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        partnerAllDone
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                          : 'bg-gradient-to-r from-brand-cyan to-teal-400'
                      }`}
                      style={{ width: `${partnerProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {bothAllDone && totalCount > 0 ? (
                <p className="flex items-center gap-1 text-[10px] font-black text-emerald-600 animate-fade-in pt-0.5 border-t border-slate-100/50">
                  <Star size={9} className="fill-emerald-500" /> Both of you completed all tasks! Crushing it 🎉
                </p>
              ) : (
                <p className="text-[9px] text-slate-400 font-bold leading-normal">
                  Complete your tasks to fill your bar. Shared tasks are done individually!
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Lock size={11} className="text-brand-purple" />
                  Personal Progress
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                  myAllDone
                    ? 'text-emerald-600 bg-emerald-50 border-emerald-250'
                    : 'text-brand-purple bg-brand-purple/8 border-brand-purple/15'
                }`}>
                  {myCompletedCount}/{totalCount}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    myAllDone
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                      : 'bg-gradient-to-r from-brand-purple via-violet-500 to-brand-cyan'
                  }`}
                  style={{ width: `${myProgress}%` }}
                />
              </div>
              {myAllDone && totalCount > 0 && (
                <p className="flex items-center gap-1 text-[10px] font-black text-emerald-600 animate-fade-in">
                  <Star size={9} className="fill-emerald-500" /> All done! Keep it up!
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Notification permission promo ────────────────────────────── */}
      {notifPermission === 'default' && (
        <div className="mx-5 mb-4 bg-gradient-to-r from-amber-500/10 to-brand-purple/10 border border-brand-purple/20 rounded-[20px] p-3.5 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <Bell size={16} className="text-amber-600 animate-bounce" />
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-800 leading-tight">Enable Reminders</p>
              <p className="text-[9px] text-slate-400 font-bold mt-0.5">Receive real-time alerts from your partner!</p>
            </div>
          </div>
          <button onClick={requestNotifPermission}
            className="px-3.5 py-1.5 bg-brand-purple text-white text-[10px] font-black rounded-lg active-pop shadow-md shadow-brand-purple/25">
            Allow
          </button>
        </div>
      )}

      {/* ── Tab Switcher ─────────────────────────────────────────────────── */}
      <div className="px-5 mb-4">
        <div className="flex bg-white/70 backdrop-blur-md border border-white/70 rounded-[18px] p-1.5 gap-1.5 shadow-sm">
          {(['shared', 'personal'] as const).map(tab => {
            const isActive = activeTab === tab
            const count = tasks.filter(t => t.category === tab).length
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[13px] text-[11px] font-black uppercase tracking-wider transition-all duration-200 active-pop ${
                  isActive
                    ? 'bg-white shadow-sm border border-slate-100/80 text-slate-800'
                    : 'text-slate-400 hover:text-slate-600'
                }`}>
                {tab === 'shared'
                  ? <Users size={12} className={isActive ? 'text-brand-cyan' : ''} />
                  : <Lock size={12} className={isActive ? 'text-brand-purple' : ''} />}
                {tab === 'shared' ? 'Shared' : 'Personal'}
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                  isActive ? 'bg-brand-purple/10 text-brand-purple' : 'bg-slate-200/60 text-slate-400'
                }`}>{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Task List ────────────────────────────────────────────────────── */}
      <div className="px-5 space-y-3">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-[22px] bg-white/60 border border-slate-100 animate-pulse" />
          ))
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-16 h-16 rounded-[22px] bg-brand-purple/8 border border-brand-purple/15 flex items-center justify-center">
              <Zap className="text-brand-purple" size={24} />
            </div>
            <div>
              <p className="font-black text-slate-700 text-sm">No {activeTab} tasks yet</p>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                {activeTab === 'shared' ? 'Add a shared goal to tackle together!' : 'Add a personal task for yourself'}
              </p>
            </div>
            <button onClick={() => setIsAdding(true)}
              className="mt-1 px-5 py-2.5 bg-brand-purple/10 text-brand-purple border border-brand-purple/20 rounded-full text-xs font-black uppercase tracking-wider active-pop">
              + Add First Task
            </button>
          </div>
        ) : (
          filteredTasks.map(task => {
            const target       = getWeeklyTarget(task.recurrence)
            const isRecurring  = target > 0
            const myC          = myCompletionsFor(task.id)
            const partnerC     = partnerCompletionsFor(task.id)
            const done         = isEffectivelyDone(task)
            const partnerDone  = isPartnerEffectivelyDone(task)

            const accentGrad = done
              ? 'from-emerald-400 to-teal-500'
              : task.category === 'shared'
                ? 'from-brand-cyan to-violet-500'
                : 'from-brand-purple to-pink-500'

            return (
              <div key={task.id}
                className={`relative overflow-hidden rounded-[22px] border transition-all duration-300 group ${
                  done
                    ? 'bg-emerald-50/50 border-emerald-200/50 shadow-[0_4px_16px_rgba(16,185,129,0.07)]'
                    : 'bg-white/85 backdrop-blur-sm border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.09)] hover:scale-[1.005]'
                }`}
              >
                {/* Top gradient accent line */}
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${accentGrad} opacity-80`} />

                <div className="flex items-start gap-3 px-4 pt-5 pb-4">
                  {/* Checkbox / count bubble */}
                  {!isRecurring ? (
                    <button onClick={() => toggleTask(task.id)}
                      className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 active-pop transition-all mt-0.5 ${
                        done
                          ? 'bg-emerald-500 border-emerald-400 shadow-[0_4px_12px_rgba(16,185,129,0.3)]'
                          : 'border-slate-200 bg-white hover:border-brand-purple/50'
                      }`}>
                      {done
                        ? <Check size={15} strokeWidth={3.5} className="text-white" />
                        : <div className="w-2 h-2 rounded-full bg-slate-100 group-hover:bg-slate-200 transition-colors" />}
                    </button>
                  ) : (
                    /* Recurring — show numeric count bubble */
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border-2 mt-0.5 transition-all ${
                      done
                        ? 'bg-emerald-500 border-emerald-400 shadow-[0_4px_12px_rgba(16,185,129,0.3)]'
                        : 'bg-white border-slate-200'
                    }`}>
                      {done
                        ? <Check size={15} strokeWidth={3.5} className="text-white" />
                        : <span className="text-[11px] font-black text-brand-purple leading-none">{myC.length}</span>
                      }
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-black text-[14px] leading-tight transition-all ${
                      done ? 'line-through text-slate-400' : 'text-slate-800'
                    }`}>
                      {task.title}
                    </p>

                    {/* Badges */}
                    <div className="flex items-center flex-wrap gap-1.5 mt-2">
                      {isRecurring && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-brand-purple/8 text-brand-purple border border-brand-purple/12 px-2 py-0.5 rounded-lg select-none">
                          <RefreshCw size={8} strokeWidth={2.5} />
                          {getRecurrenceLabel(task.recurrence)}
                        </span>
                      )}
                      {task.category === 'shared' && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-slate-400 bg-slate-100/70 border border-slate-200/50 px-2 py-0.5 rounded-lg select-none">
                          <User size={8} strokeWidth={2.5} />
                          {task.created_by === 'you' ? 'You' : (partnerName?.split(' ')[0] || 'Partner')}
                        </span>
                      )}
                      {!isRecurring && done && task.done_by && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-lg select-none">
                          <Check size={8} strokeWidth={3} />
                          {task.done_by === 'you' ? 'You' : partnerName?.split(' ')[0] || 'Partner'}
                        </span>
                      )}
                    </div>

                    {/* ── Recurring dots ──────────────────────────────── */}
                    {isRecurring && (
                      <RecurringDotsSection
                        task={task}
                        target={target}
                        myCompletions={myC}
                        partnerCompletions={partnerC}
                        partnerName={partnerName}
                        pairStatus={pairStatus}
                        onAdd={() => {
                          if (myC.length < target) addTaskCompletion(task.id)
                        }}
                        onRemove={(id) => removeTaskCompletion(id)}
                      />
                    )}
                  </div>

                  {/* Actions (Remind & Delete) */}
                  <div className="flex items-center gap-1 shrink-0 mt-0.5">
                    {task.category === 'shared' && !partnerDone && (
                      <button onClick={() => sendTaskReminder(task.title)}
                        className="text-slate-300 hover:text-amber-500 hover:bg-amber-50 p-1.5 rounded-xl transition-all active-pop border border-transparent hover:border-amber-100"
                        title={`Remind ${partnerName || 'partner'}`}
                      >
                        <Bell size={14} strokeWidth={2} />
                      </button>
                    )}
                    <button onClick={() => setDeleteConfirmId(task.id)}
                      className="text-slate-200 hover:text-rose-400 hover:bg-rose-50 p-1.5 rounded-xl transition-all active-pop border border-transparent hover:border-rose-100"
                      title="Delete task"
                    >
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Confirm Delete ────────────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        title="Delete this task?"
        message="This will permanently remove the task for both of you."
        confirmLabel="Delete Task"
        onConfirm={() => deleteConfirmId && deleteTask(deleteConfirmId)}
        onCancel={() => setDeleteConfirmId(null)}
      />

      {/* ── Add Task Modal ────────────────────────────────────────────────── */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl border border-slate-100/80 animate-slide-up overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100/60">
              <div>
                <h3 className="font-black text-xl text-slate-800">New Task</h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Add something to tackle this week</p>
              </div>
              <button onClick={() => setIsAdding(false)}
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors active-pop">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="px-6 pt-5 pb-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Task title</label>
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. Read 10 pages, Drink 8 glasses…"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-purple focus:outline-none font-semibold text-slate-800 text-sm placeholder:text-slate-300 transition-colors"
                />
              </div>

              {/* Category + Recurrence */}
              <div className="grid grid-cols-2 gap-3">
                <CustomSelect label="Category" value={category}
                  onChange={v => { setCategory(v as any); setActiveTab(v as any) }}
                  options={CATEGORY_OPTIONS}
                />
                <CustomSelect label="Repeat" value={recurrence}
                  onChange={setRecurrence}
                  options={RECURRENCE_OPTIONS}
                />
              </div>

              {/* Recurrence preview dots */}
              {getWeeklyTarget(recurrence) > 0 && (
                <div className="bg-gradient-to-r from-brand-purple/5 to-brand-cyan/5 border border-brand-purple/15 rounded-2xl px-4 py-3.5 animate-fade-in">
                  <p className="text-[9px] font-black text-brand-purple uppercase tracking-widest mb-2.5">
                    Weekly tracker — each person checks their own {getWeeklyTarget(recurrence)} dots
                  </p>
                  <div className="space-y-2">
                    {(['You', category === 'shared' ? (partnerName?.split(' ')[0] || 'Partner') : null]).filter(Boolean).map((person, pi) => (
                      <div key={pi} className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase w-[28px]">{person}</span>
                        <div className="flex gap-1.5">
                          {Array.from({ length: getWeeklyTarget(recurrence) }).map((_, i) => (
                            <span key={i} className={`w-6 h-6 rounded-full border-2 border-dashed flex items-center justify-center ${
                              pi === 0 ? 'border-emerald-300 bg-white' : 'border-brand-cyan/40 bg-white'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${pi === 0 ? 'bg-emerald-200' : 'bg-brand-cyan/20'}`} />
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button type="submit" disabled={!title.trim()}
                className="w-full py-4 bg-gradient-to-r from-brand-purple to-violet-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-brand-purple/25 hover:shadow-brand-purple/35 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                Add Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── FAB ──────────────────────────────────────────────────────────── */}
      {!isAdding && (
        <button onClick={() => setIsAdding(true)}
          className="fixed bottom-24 right-5 w-14 h-14 bg-gradient-to-tr from-brand-purple to-violet-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-brand-purple/40 hover:scale-110 active:scale-95 transition-transform z-40 border-2 border-white/20">
          <Plus size={26} strokeWidth={2.5} />
        </button>
      )}
    </div>
  )
}
