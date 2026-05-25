import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Check, Plus, Trash2, User, Flame, Users, Lock, CheckCircle, Sparkles, RefreshCw } from 'lucide-react'


export default function Tasks() {
  const { tasks, partnerName, addTask, toggleTask, deleteTask } = useAppStore()
  const [isAdding, setIsAdding] = useState(false)
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
          <span className="text-xs font-bold uppercase tracking-wider text-brand-purple bg-brand-purple/10 px-3 py-1 rounded-full">
            Cheer each other on
          </span>
          <h1 className="text-4xl font-extrabold text-brand-dark mt-2 tracking-tight">
            Daily Tasks
          </h1>
        </div>
        <div className="w-12 h-12 rounded-full bg-brand-amber/10 flex items-center justify-center">
          <Flame className="text-brand-amber fill-brand-amber" size={24} />
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
        {filteredTasks.length === 0 ? (
          <div className="card-soft py-12 text-center text-brand-gray bg-white/80 border border-dashed border-slate-200 flex flex-col items-center justify-center">
            <Sparkles className="text-slate-300 mb-3" size={32} />
            <p className="font-bold">No tasks here yet</p>
            <p className="text-xs text-brand-gray/80 mt-1">Tap the plus button below to add one!</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`card-soft bg-white/95 backdrop-blur-md border border-slate-100 transition-all duration-300 flex items-center justify-between group ${
                task.is_done ? 'opacity-80 scale-[0.98]' : 'hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center space-x-4 flex-1">
                {/* Custom Styled Checkbox */}
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center active-pop ${
                    task.is_done
                      ? 'bg-brand-green border-brand-green text-white scale-95 shadow-sm shadow-brand-green/30'
                      : 'border-slate-300 hover:border-brand-purple bg-slate-50'
                  }`}
                >
                  {task.is_done && <Check size={18} strokeWidth={3} />}
                </button>


                {/* Task Details */}
                <div className="flex-1">
                  <p
                    className={`font-bold text-base transition-all duration-200 ${
                      task.is_done ? 'line-through text-slate-400 font-medium' : 'text-brand-dark'
                    }`}
                  >
                    {task.title}
                  </p>
                  
                  {/* Meta Details */}
                  <div className="flex items-center space-x-2 mt-1.5 flex-wrap gap-y-1">
                    {task.recurrence !== 'none' && (
                      <span className="text-[10px] font-extrabold uppercase bg-brand-cyan/15 text-brand-cyan px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                        <RefreshCw size={10} />
                        {task.recurrence === '2_days' ? '2 days/week' : 
                         task.recurrence === '3_days' ? '3 days/week' :
                         task.recurrence === '4_days' ? '4 days/week' :
                         task.recurrence === '5_days' ? '5 days/week' :
                         task.recurrence}
                      </span>
                    )}
                    {task.category === 'shared' && (
                      <span className="text-[10px] font-semibold text-brand-gray flex items-center bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md">
                        <User size={10} className="mr-1" />
                        {task.created_by === 'you' ? 'Added by you' : `Added by ${partnerName}`}
                      </span>
                    )}
                    {task.is_done && task.done_by && (
                      <span className="text-[10px] font-semibold text-brand-green flex items-center bg-brand-green/10 px-1.5 py-0.5 rounded-md">
                        <CheckCircle size={10} className="mr-1" />
                        Done by {task.done_by === 'you' ? 'you' : partnerName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => deleteTask(task.id)}
                className="text-slate-300 hover:text-rose-500 p-2 rounded-xl hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 active-pop"
              >
                <Trash2 size={16} />
              </button>

            </div>
          ))
        )}
      </div>

      {/* Expandable Float Form */}
      {isAdding ? (
        <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-end justify-center px-4 pb-8 transition-all">
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
                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value as 'shared' | 'personal')
                      setActiveTab(e.target.value as 'shared' | 'personal')
                    }}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-purple focus:outline-none font-bold text-sm text-brand-dark"
                  >
                    <option value="shared">Shared</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">
                    Repeat
                  </label>
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-purple focus:outline-none font-bold text-sm text-brand-dark"
                  >
                    <option value="none">One-off</option>
                    <option value="daily">Daily</option>
                    <option value="2_days">2 days / week</option>
                    <option value="3_days">3 days / week</option>
                    <option value="4_days">4 days / week</option>
                    <option value="5_days">5 days / week</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
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
