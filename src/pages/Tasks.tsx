import { useState, useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Check, Plus, Trash2, User, Flame, Users, Lock, CheckCircle, Zap, RefreshCw, ChevronDown } from 'lucide-react'
import { ConfirmDialog } from '../components/ConfirmDialog'

interface Option {
  value: string
  label: string
}

function CustomSelect({
  label,
  value,
  onChange,
  options
}: {
  label: string
  value: string
  onChange: (val: any) => void
  options: Option[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = options.find((o) => o.value === value)

  return (
    <div className="relative">
      <label className="block text-xs font-black text-brand-dark uppercase tracking-wider mb-2 select-none">
        {label}
      </label>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-purple/50 focus:border-brand-purple focus:outline-none transition-all duration-200 font-bold text-sm text-brand-dark text-left"
      >
        <span>{selectedOption?.label}</span>
        <ChevronDown 
          size={16} 
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-purple' : ''}`} 
        />
      </button>

      {/* Backdrop Close Handler */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Options Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl shadow-xl z-40 max-h-60 overflow-y-auto animate-fade-in p-1.5 space-y-0.5">
          {options.map((opt) => {
            const isSelected = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-black transition-all duration-150 ${
                  isSelected 
                    ? 'bg-brand-purple/10 text-brand-purple font-black' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={14} strokeWidth={3} className="text-brand-purple" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

const CATEGORY_OPTIONS = [
  { value: 'shared', label: 'Shared' },
  { value: 'personal', label: 'Personal' }
]

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'One-off' },
  { value: 'daily', label: 'Daily' },
  { value: '2_days', label: '2 days / week' },
  { value: '3_days', label: '3 days / week' },
  { value: '4_days', label: '4 days / week' },
  { value: '5_days', label: '5 days / week' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
]

export default function Tasks() {
  const { tasks, partnerName, addTask, toggleTask, deleteTask, fetchTasks } = useAppStore()
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchTasks().finally(() => setLoading(false))
  }, [fetchTasks])
  const [activeTab, setActiveTab] = useState<'shared' | 'personal'>('shared')
  
  // Form State
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<'shared' | 'personal'>('shared')
  const [recurrence, setRecurrence] = useState<string>('none')

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    
    addTask({
      title,
      category,
      recurrence,
      date: new Date().toISOString().split('T')[0]
    })
    
    setTitle('')
    setRecurrence('none')
    setIsAdding(false)
  }

  const filteredTasks = tasks.filter((t) => t.category === activeTab)
  const completedCount = filteredTasks.filter((t) => t.is_done).length
  const totalCount = filteredTasks.length
  
  // Calculate completion percentage for the current tab
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Calculate dynamic consecutive day completion streak for shared tasks
  const calculateStreak = () => {
    const sharedTasks = tasks.filter((t) => t.category === 'shared')
    if (sharedTasks.length === 0) return 0

    // Group tasks by date
    const tasksByDate: { [date: string]: typeof sharedTasks } = {}
    sharedTasks.forEach((t) => {
      if (!tasksByDate[t.date]) tasksByDate[t.date] = []
      tasksByDate[t.date].push(t)
    })

    const sortedDates = Object.keys(tasksByDate).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    )

    let streak = 0
    let checkDate = new Date()
    checkDate.setHours(0, 0, 0, 0)

    while (true) {
      const dateString = checkDate.toISOString().split('T')[0]
      const dayTasks = tasksByDate[dateString]

      if (dayTasks && dayTasks.length > 0) {
        const allCompleted = dayTasks.every((t) => t.is_done)
        if (allCompleted) {
          streak++
        } else {
          // If it's today and some tasks aren't done, the streak is not broken yet
          const isToday = dateString === new Date().toISOString().split('T')[0]
          if (!isToday) {
            break // Broken yesterday
          }
        }
      } else {
        // If there are no tasks today, check yesterday.
        // If it's not today and we hit a day with no tasks, check if there are older tasks at all.
        const isToday = dateString === new Date().toISOString().split('T')[0]
        if (!isToday) {
          const hasOlderTasks = sortedDates.some(
            (d) => new Date(d).getTime() < checkDate.getTime()
          )
          if (!hasOlderTasks) {
            break
          }
          break // Breaks the streak if empty day lies between task days
        }
      }

      checkDate.setDate(checkDate.getDate() - 1)
    }

    return streak
  }

  const realStreak = calculateStreak()

  return (
    <div className="relative pb-28 pt-14 px-6 min-h-screen animate-fade-in">
      {/* Header */}

      <header className="flex justify-between items-center mb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-brand-purple bg-brand-purple/10 border border-brand-purple/20 px-3.5 py-1.5 rounded-full select-none inline-flex items-center gap-1.5">
            <span>Cheer each other on</span>
            <Zap size={11} className="text-brand-purple" />
          </span>
          <h1 className="text-4xl font-extrabold text-brand-dark mt-3.5 tracking-tight">
            Daily Tasks
          </h1>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-brand-purple/5 border border-brand-purple/20 shadow-sm flex items-center justify-center relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-purple/10 to-pink-500/5 opacity-50" />
          <Flame className="text-brand-purple fill-brand-purple/10 relative z-10" size={20} strokeWidth={2.5} />
        </div>
      </header>

      {/* Streak Banner */}
      <section className="card-soft mb-6 bg-gradient-to-r from-brand-purple to-purple-600 text-white relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10">
          <Flame size={120} />
        </div>
        <div className="relative z-10 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Flame size={24} className="text-white fill-white" />
          </div>
          <div>
            <h4 className="font-bold text-lg">
              {realStreak > 0 ? `${realStreak}-Day Shared Streak!` : 'Start a Streak!'}
            </h4>
            <p className="text-white/80 text-xs font-medium">
              {realStreak > 0 
                ? `You and ${partnerName || 'your partner'} checked off all shared tasks!`
                : `Complete all shared tasks today to start your streak with ${partnerName || 'your partner'}!`
              }
            </p>
          </div>
        </div>
      </section>

      {/* Tab Switcher */}
      <div className="flex bg-slate-100/80 backdrop-blur-md p-1 rounded-2xl mb-6 border border-slate-200/50">
        <button
          onClick={() => setActiveTab('shared')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center active-pop ${
            activeTab === 'shared'
              ? 'bg-white text-brand-dark shadow-sm'
              : 'text-brand-gray hover:text-brand-dark'
          }`}
        >
          <Users size={16} className="mr-2" />
          Shared ({tasks.filter(t => t.category === 'shared').length})
        </button>
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center active-pop ${
            activeTab === 'personal'
              ? 'bg-white text-brand-dark shadow-sm'
              : 'text-brand-gray hover:text-brand-dark'
          }`}
        >

          <Lock size={16} className="mr-2" />
          Personal ({tasks.filter(t => t.category === 'personal').length})
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="card-soft mb-6 bg-white/95 backdrop-blur-md border border-slate-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-brand-dark">Progress today</span>
          <span className="text-sm font-bold text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded-full">
            {completedCount}/{totalCount} Done
          </span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-purple to-brand-cyan transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-soft bg-white/70 h-20 animate-pulse rounded-[24px] border border-white/50" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="card-soft py-14 text-center bg-white/80 border border-dashed border-slate-200 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-brand-purple/10 flex items-center justify-center">
              <Zap className="text-brand-purple" size={28} />
            </div>
            <div>
              <p className="font-black text-brand-dark text-sm">No {activeTab} tasks yet</p>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                {activeTab === 'shared' ? 'Add a shared task to tackle together!' : 'Add a personal task for yourself'}
              </p>
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-1 px-5 py-2.5 bg-brand-purple/10 text-brand-purple border border-brand-purple/20 rounded-full text-xs font-black uppercase tracking-wider active-pop"
            >
              + Add First Task
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`relative overflow-hidden card-soft bg-white/90 backdrop-blur-md border border-white/50 transition-all duration-300 flex items-center justify-between p-4.5 rounded-[24px] shadow-sm hover:shadow-soft active-pop group ${
                task.is_done 
                  ? 'border-emerald-500/20 bg-emerald-50/15 shadow-[0_8px_20px_-6px_rgba(16,185,129,0.08)] scale-[0.98]' 
                  : 'hover:scale-[1.01]'
              }`}
            >
              {/* Left visual accent bar */}
              <div 
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-r-xl transition-all duration-300 ${
                  task.is_done
                    ? 'bg-emerald-500'
                    : task.category === 'shared'
                      ? 'bg-brand-cyan shadow-[0_0_8px_rgba(0,188,212,0.4)]'
                      : 'bg-brand-purple shadow-[0_0_8px_rgba(139,92,246,0.4)]'
                }`}
              />

              <div className="flex items-center space-x-4 pl-2.5 flex-1">
                {/* Custom Checkbox */}
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-9 h-9 rounded-2xl border-2 transition-all flex items-center justify-center shrink-0 active-pop ${
                    task.is_done
                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)]'
                      : 'border-slate-200/80 bg-slate-50 hover:border-brand-purple hover:bg-white'
                  }`}
                >
                  {task.is_done ? (
                    <Check size={18} strokeWidth={3.5} className="animate-scale-in" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-slate-250 transition-colors" />
                  )}
                </button>

                {/* Task Details */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-black text-[15px] leading-snug transition-all duration-200 truncate ${
                      task.is_done ? 'line-through text-slate-450 font-bold' : 'text-slate-800'
                    }`}
                  >
                    {task.title}
                  </p>
                  
                  {/* Meta badges row */}
                  <div className="flex items-center space-x-2 mt-2 flex-wrap gap-y-1.5">
                    {task.recurrence !== 'none' && (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-brand-purple/10 text-brand-purple border border-brand-purple/10 px-2 py-1 rounded-lg inline-flex items-center gap-1 select-none">
                        <RefreshCw size={9} strokeWidth={2.5} className="animate-pulse" />
                        {task.recurrence === '2_days' ? '2 days/week' : 
                         task.recurrence === '3_days' ? '3 days/week' :
                         task.recurrence === '4_days' ? '4 days/week' :
                         task.recurrence === '5_days' ? '5 days/week' :
                         task.recurrence}
                      </span>
                    )}
                    
                    {task.category === 'shared' && (
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 bg-slate-100/80 border border-slate-200/40 px-2 py-1 rounded-lg inline-flex items-center gap-1 select-none">
                        <User size={9} strokeWidth={2.5} />
                        {task.created_by === 'you' ? 'Added by you' : `Added by ${partnerName.split(' ')[0]}`}
                      </span>
                    )}
                    
                    {task.is_done && task.done_by && (
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-500/10 border border-emerald-500/25 px-2 py-1 rounded-lg inline-flex items-center gap-1 select-none">
                        <CheckCircle size={9} strokeWidth={2.5} />
                        Done by {task.done_by === 'you' ? 'you' : partnerName.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Delete Button — opens confirm dialog */}
              <button
                onClick={() => setDeleteConfirmId(task.id)}
                className="text-slate-350 hover:text-rose-500 hover:bg-rose-50 p-2.5 rounded-2xl transition-all duration-200 active-pop hover:shadow-sm shrink-0 border border-transparent hover:border-rose-100"
              >
                <Trash2 size={16} strokeWidth={2} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        title="Delete this task?"
        message="This will permanently remove the task for both of you. This action can't be undone."
        confirmLabel="Delete Task"
        onConfirm={() => deleteConfirmId && deleteTask(deleteConfirmId)}
        onCancel={() => setDeleteConfirmId(null)}
      />

      {/* Expandable Float Form */}
      {isAdding ? (
        <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-white rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-slide-up border border-slate-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-extrabold text-xl text-brand-dark">Create New Task</h3>
              <button
                onClick={() => setIsAdding(false)}
                className="text-brand-gray font-bold text-sm bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Call Mariam before lunch"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-purple focus:outline-none font-semibold text-brand-dark"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <CustomSelect
                  label="Category"
                  value={category}
                  onChange={(val) => {
                    setCategory(val as 'shared' | 'personal')
                    setActiveTab(val as 'shared' | 'personal')
                  }}
                  options={CATEGORY_OPTIONS}
                />

                <CustomSelect
                  label="Repeat"
                  value={recurrence}
                  onChange={setRecurrence}
                  options={RECURRENCE_OPTIONS}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-brand-purple to-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-purple/30 hover:shadow-brand-purple/40 hover:scale-[0.99] active:scale-[0.97] transition-all"
              >
                Add Task
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="fixed bottom-24 right-8 w-14 h-14 bg-gradient-to-tr from-brand-purple to-purple-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-brand-purple/40 hover:scale-110 active:scale-95 transition-transform z-40 border border-white/20 active-pop"
        >
          <Plus size={28} strokeWidth={3} />
        </button>

      )}
    </div>
  )
}
