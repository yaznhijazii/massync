import React, { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Calendar as CalendarIcon, MapPin, Clock, Plus, Smile, Compass, Camera, History, Map, Zap, Heart, Pizza, Coffee, Globe, Upload, X, User, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '../components/ConfirmDialog'

function getVibeDetails(vibeStr: string) {
  const v = vibeStr.toLowerCase()
  if (v.includes('breakfast') || v.includes('food') || v.includes('eat') || v.includes('brunch') || v.includes('dinner') || v.includes('lunch') || v.includes('tasheh')) {
    return { emoji: '🥞', color: 'from-amber-400 to-orange-500', bgLight: 'bg-amber-50 text-amber-600 border-amber-100' }
  }
  if (v.includes('coffee') || v.includes('cafe') || v.includes('chat') || v.includes('rumi') || v.includes('talk')) {
    return { emoji: '☕', color: 'from-amber-700 to-amber-900', bgLight: 'bg-amber-100 text-amber-800 border-amber-250' }
  }
  if (v.includes('movie') || v.includes('cinema') || v.includes('show') || v.includes('watch')) {
    return { emoji: '🍿', color: 'from-rose-500 to-red-600', bgLight: 'bg-rose-50 text-rose-600 border-rose-100' }
  }
  if (v.includes('study') || v.includes('read') || v.includes('work') || v.includes('book')) {
    return { emoji: '📚', color: 'from-violet-500 to-purple-600', bgLight: 'bg-violet-50 text-violet-600 border-violet-100' }
  }
  if (v.includes('walk') || v.includes('run') || v.includes('sport') || v.includes('hike') || v.includes('gym')) {
    return { emoji: '👟', color: 'from-emerald-400 to-teal-500', bgLight: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
  }
  return { emoji: '✨', color: 'from-brand-cyan to-blue-500', bgLight: 'bg-cyan-50 text-cyan-600 border-cyan-100' }
}

export default function Memories() {
  const { memories, partnerName, addMemory, addOuting, uploadMemoryPhoto, fetchMemories, deleteMemory } = useAppStore()
  
  React.useEffect(() => {
    fetchMemories()
  }, [fetchMemories])

  const [activeTab, setActiveTab] = useState<'scrapbook' | 'planner'>('scrapbook')
  const [isAddingMemory, setIsAddingMemory] = useState(false)
  const [isAddingOuting, setIsAddingOuting] = useState(false)
  
  // Memory Form state
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [moodEmoji, setMoodEmoji] = useState('happy')
  const [tagInput, setTagInput] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  
  // File upload states
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file')

  // Outing Form state
  const [outingTitle, setOutingTitle] = useState('')
  const [outingDate, setOutingDate] = useState('')
  const [outingTime, setOutingTime] = useState('')
  const [outingPlace, setOutingPlace] = useState('')
  const [outingVibe, setOutingVibe] = useState('')
  const [outingLocationUrl, setOutingLocationUrl] = useState('')
  const [outingPageUrl, setOutingPageUrl] = useState('')

  // Selection states for enhanced list UI/UX
  const [selectedOutingId, setSelectedOutingId] = useState<string | null>(null)
  const [selectedMemory, setSelectedMemory] = useState<any | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'happy':
        return <Smile className="text-emerald-500" size={16} />
      case 'loved':
        return <Heart className="text-rose-500 fill-rose-500" size={16} />
      case 'funny':
        return <Smile className="text-amber-500" size={16} />
      case 'excited':
        return <Zap className="text-purple-500" size={16} />
      case 'hungry':
        return <Pizza className="text-orange-500" size={16} />
      case 'chill':
        return <Coffee className="text-blue-500" size={16} />
      default:
        return <Smile className="text-slate-400" size={16} />
    }
  }

  // Calendar State (Hardcoded May 2026 for simplicity and elegance)
  const [currentYear] = useState(2026)
  const [currentMonth] = useState(4) // May is 4 (0-indexed)
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay() // 0 is Sunday, 1 is Monday...
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
  
  // Build calendar days array
  const calendarDays = []
  // Empty spaces for padding
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d)
  }

  // Filter memories and outings
  const scrapbookItems = memories.filter((m) => m.type === 'memory')
  const outings = memories.filter((m) => m.type === 'outing')
  
  // Helper to check if a specific calendar day has a memory or outing
  const getDayStatus = (day: number | null) => {
    if (!day) return null
    const dateString = `2026-05-${day.toString().padStart(2, '0')}`
    const hasMemory = scrapbookItems.some((m) => m.date === dateString)
    const hasOuting = outings.some((o) => o.date === dateString)
    
    if (hasMemory && hasOuting) return 'both'
    if (hasMemory) return 'memory'
    if (hasOuting) return 'outing'
    return null
  }

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClearPhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    setPhotoUrl('')
  }

  // Handler for adding memory
  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !note.trim()) return
    
    setIsUploading(true)
    try {
      let finalPhotoUrl = ''
      
      if (uploadMode === 'file') {
        if (photoFile) {
          finalPhotoUrl = await uploadMemoryPhoto(photoFile)
        }
      } else {
        finalPhotoUrl = photoUrl
      }
      
      const tags = tagInput.split(',').map((t) => t.trim()).filter(Boolean)
      
      addMemory({
        date,
        title,
        note,
        mood_emoji: moodEmoji,
        tags,
        photo: finalPhotoUrl || undefined,
      })
      
      setTitle('')
      setNote('')
      setMoodEmoji('happy')
      setTagInput('')
      setPhotoUrl('')
      setPhotoFile(null)
      setPhotoPreview(null)
      setIsAddingMemory(false)
    } catch (err) {
      console.error('[MasSync] Failed to save memory photo:', err)
    } finally {
      setIsUploading(false)
    }
  }

  // Handler for adding outing
  const handleAddOuting = (e: React.FormEvent) => {
    e.preventDefault()
    if (!outingTitle.trim() || !outingDate) return
    
    addOuting({
      date: outingDate,
      time: outingTime,
      title: outingTitle,
      place: outingPlace,
      vibe: outingVibe,
      mood_emoji: 'coffee',
      tags: ['outing'],
      location_url: outingLocationUrl || undefined,
      page_url: outingPageUrl || undefined,
    })
    
    setOutingTitle('')
    setOutingDate('')
    setOutingTime('')
    setOutingPlace('')
    setOutingVibe('')
    setOutingLocationUrl('')
    setOutingPageUrl('')
    setIsAddingOuting(false)
  }

  // Next upcoming outing
  const nextOuting = outings
    .filter((o) => new Date(o.date) >= new Date(new Date().setHours(0,0,0,0)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

  const deleteConfirmItem = memories.find((m) => m.id === deleteConfirmId)
  const isOuting = deleteConfirmItem?.type === 'outing'

  return (
    <div className="relative pb-28 pt-14 px-6 min-h-screen animate-fade-in">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-brand-dark mt-3.5 tracking-tight">
            Memories
          </h1>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-brand-cyan/5 border border-brand-cyan/20 shadow-sm flex items-center justify-center relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-cyan/10 to-teal-500/5 opacity-50" />
          <Compass className="text-brand-cyan relative z-10" size={22} strokeWidth={2.5} />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex bg-slate-100/60 backdrop-blur-md p-1 rounded-2xl mb-6 border border-slate-200/50">
        <button
          onClick={() => setActiveTab('scrapbook')}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wide transition-all duration-200 active-pop flex items-center justify-center gap-1.5 ${
            activeTab === 'scrapbook'
              ? 'bg-white text-brand-dark shadow-sm border border-slate-100/50'
              : 'text-slate-400 hover:text-slate-655'
          }`}
        >
          <Camera size={13} />
          Scrapbook
        </button>
        <button
          onClick={() => setActiveTab('planner')}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wide transition-all duration-200 active-pop flex items-center justify-center gap-1.5 ${
            activeTab === 'planner'
              ? 'bg-white text-brand-dark shadow-sm border border-slate-100/50'
              : 'text-slate-400 hover:text-slate-655'
          }`}
        >
          <CalendarIcon size={13} />
          Outing Planner
        </button>
      </div>

      {activeTab === 'scrapbook' && (
        <div className="space-y-6">
          {/* Calendar Widget in Scrapbook */}
          <section className="card-soft bg-white/70 border border-white/50 shadow-soft">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100/50">
              <h3 className="font-black text-base text-brand-dark">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <div className="flex space-x-1.5 select-none">
                <span className="text-[9px] font-extrabold text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded-full border border-brand-cyan/15">Memories</span>
                <span className="text-[9px] font-extrabold text-brand-amber bg-brand-amber/10 px-2 py-0.5 rounded-full border border-brand-amber/15">Outings</span>
              </div>
            </div>
            
            {/* Days names */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400 mb-2 uppercase select-none">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => {
                const status = getDayStatus(day)
                return (
                  <div
                    key={idx}
                    className={`h-9 flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all relative ${
                      !day
                        ? 'bg-transparent text-transparent'
                        : 'bg-slate-50/50 text-brand-dark border border-slate-100/30'
                    }`}
                  >
                    <span>{day}</span>
                    
                    {/* Glowing status dots */}
                    {status && (
                      <div className="absolute bottom-1.5 flex space-x-0.5">
                        {(status === 'memory' || status === 'both') && (
                          <span className="w-1 h-1 rounded-full bg-brand-cyan shadow-sm shadow-brand-cyan" />
                        )}
                        {(status === 'outing' || status === 'both') && (
                          <span className="w-1 h-1 rounded-full bg-brand-amber shadow-sm shadow-brand-amber" />
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* On This Day (Real Data) */}
          {(() => {
            const today = new Date()
            const todayMonth = today.getMonth()
            const todayDay = today.getDate()

            // Filter scrapbook items from previous years on this day
            const otdMemories = scrapbookItems.filter((m) => {
              const mDate = new Date(m.date)
              if (isNaN(mDate.getTime())) return false
              return (
                mDate.getMonth() === todayMonth &&
                mDate.getDate() === todayDay &&
                mDate.getFullYear() < today.getFullYear()
              )
            })

            // Sort so most recent is first
            const sortedOtd = [...otdMemories].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            const otd = sortedOtd[0]

            if (otd) {
              const yearsAgo = today.getFullYear() - new Date(otd.date).getFullYear()
              return (
                <section 
                  onClick={() => setSelectedMemory(otd)}
                  className="card-soft bg-gradient-to-tr from-brand-cyan/10 to-teal-500/5 border border-brand-cyan/20 p-5 flex items-start space-x-4 shadow-[0_12px_24px_rgba(0,188,212,0.02)] hover:scale-[1.01] hover:shadow-[0_16px_36px_rgba(0,0,0,0.06)] transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-brand-cyan/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <History size={18} className="text-brand-cyan animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-black text-brand-cyan uppercase tracking-wider bg-brand-cyan/15 px-2.5 py-1 rounded-full border border-brand-cyan/20">
                      On This Day ({yearsAgo} Year{yearsAgo > 1 ? 's' : ''} Ago)
                    </span>
                    <h4 className="font-black text-brand-dark text-sm mt-3">{otd.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-bold line-clamp-2">
                      {otd.note}
                    </p>
                    {otd.photo && (
                      <div className="mt-3 rounded-xl overflow-hidden aspect-[16/9] max-h-32 border border-slate-100 shadow-inner">
                        <img src={otd.photo} alt={otd.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </section>
              )
            }

            // Fallback when there are no memories on this day
            return (
              <section className="card-soft bg-slate-50/50 border border-slate-200/50 p-5 flex items-start space-x-4 shadow-sm">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Camera size={18} className="text-slate-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-brand-dark text-sm">On This Day</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-bold">
                    No memories recorded on this day yet. Capture a new memory today to look back on it next year!
                  </p>
                  <button
                    onClick={() => {
                      setDate(new Date().toISOString().split('T')[0])
                      setIsAddingMemory(true)
                    }}
                    className="mt-3 text-[10px] font-black text-brand-cyan uppercase tracking-wider bg-brand-cyan/5 hover:bg-brand-cyan/10 px-3 py-1.5 rounded-xl border border-brand-cyan/10 transition-all flex items-center gap-1 active-pop"
                  >
                    <Plus size={10} strokeWidth={3} />
                    Capture Today's Memory
                  </button>
                </div>
              </section>
            )
          })()}

          {/* Memory List Feed */}
          <div className="space-y-6">
            <h3 className="font-black text-lg text-brand-dark px-1">Recent Memories</h3>
            
            {scrapbookItems.length === 0 ? (
              <p className="text-center py-8 text-[11px] font-bold text-slate-400 select-none">No memories posted yet. Create the first one! 📸</p>
            ) : (
              scrapbookItems.map((item, index) => {
                // Alternating physical polaroid tilts
                const tiltClass = index % 2 === 0 ? 'rotate-1 hover:rotate-0' : '-rotate-1 hover:rotate-0'
                
                return (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedMemory(item)}
                    className={`bg-white border border-slate-150 p-4 pb-8 rounded-2xl shadow-[0_12px_28px_rgba(0,0,0,0.04)] hover:scale-[1.015] hover:shadow-[0_16px_36px_rgba(0,188,212,0.06)] cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 hover:border-brand-cyan/30 ${tiltClass} border-b-[28px] border-b-slate-50/80`}
                  >
                    {item.photo && (
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-inner border border-slate-50">
                        <img src={item.photo} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-md">
                          {getMoodIcon(item.mood_emoji)}
                        </div>
                      </div>
                    )}
                    
                    <div className="px-2 pb-2">
                      <span className="text-[10px] font-black text-brand-cyan uppercase tracking-wider bg-brand-cyan/5 px-2 py-0.5 rounded-md border border-brand-cyan/10 select-none">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <h4 className="font-black text-lg text-brand-dark mt-2.5 leading-tight">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed font-bold line-clamp-3">{item.note}</p>
                      
                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex gap-1.5 mt-4 flex-wrap">
                          {item.tags.map((tag) => (
                            <span key={tag} className="text-[9px] font-extrabold text-slate-400 bg-slate-50 border border-slate-100/50 rounded-md px-2 py-0.5 select-none">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'planner' && (
        <div className="space-y-6">
          {/* Outing Countdown Card */}
          {nextOuting ? (
            (() => {
              const vibeInfo = getVibeDetails(nextOuting.vibe || '')
              const daysLeft = Math.ceil((new Date(nextOuting.date).getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24))
              return (
                <div className="relative bg-white/80 backdrop-blur-md rounded-[28px] border border-slate-100/80 shadow-xl overflow-hidden animate-slide-up">
                  {/* Top vibe color band */}
                  <div className={`h-2.5 w-full bg-gradient-to-r ${vibeInfo.color}`} />
                  
                  {/* Card Body */}
                  <div className="p-6 relative">
                    {/* Header Row */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1 min-w-0 pr-3">
                        <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border ${vibeInfo.bgLight}`}>
                          <span>{vibeInfo.emoji}</span>
                          <span>{nextOuting.vibe || 'Outing'}</span>
                        </span>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none pt-1 truncate">
                          {nextOuting.title}
                        </h3>
                      </div>
                      
                      {/* Days Left badge */}
                      <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl px-3 py-2 shrink-0">
                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">In</span>
                        <span className={`text-lg font-black leading-none my-0.5 bg-gradient-to-br ${vibeInfo.color} bg-clip-text text-transparent`}>
                          {daysLeft}
                        </span>
                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Days</span>
                      </div>
                    </div>

                    {/* Date and Time block */}
                    <div className="mt-5 grid grid-cols-2 gap-3.5">
                      <div className="bg-slate-50/50 border border-slate-100/60 p-3.5 rounded-2xl flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${vibeInfo.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                          <CalendarIcon size={16} strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Date</p>
                          <p className="text-[11px] font-black text-slate-700 leading-tight mt-0.5 truncate">
                            {new Date(nextOuting.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-50/50 border border-slate-100/60 p-3.5 rounded-2xl flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${vibeInfo.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                          <Clock size={16} strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Time</p>
                          <p className="text-[11px] font-black text-slate-700 leading-tight mt-0.5 truncate">
                            {nextOuting.time || 'TBD'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Dashed ticket separator line */}
                    <div className="relative my-6">
                      <div className="absolute -left-[37px] -top-3 w-6 h-6 rounded-full bg-gradient-to-tr from-[#E0F2FE] to-[#F0F9FF] border border-slate-200/40 z-10 shadow-inner" />
                      <div className="absolute -right-[37px] -top-3 w-6 h-6 rounded-full bg-gradient-to-tr from-[#E0F7FA] to-[#F0F9FF] border border-slate-200/40 z-10 shadow-inner" />
                      <div className="border-t border-dashed border-slate-200/80 w-full" />
                    </div>

                    {/* Location & Details */}
                    {nextOuting.place && (
                      <div className="flex items-start gap-3 bg-slate-50/40 border border-slate-100/40 p-4 rounded-2xl">
                        <div className="w-8 h-8 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shrink-0 mt-0.5">
                          <MapPin size={15} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Destination</p>
                          <p className="text-xs font-black text-slate-700 leading-snug mt-0.5 truncate">{nextOuting.place}</p>
                        </div>
                      </div>
                    )}

                    {/* Ticket links */}
                    <div className="flex gap-2.5 mt-5">
                      {nextOuting.location_url && (
                        <a 
                          href={nextOuting.location_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 bg-gradient-to-r ${vibeInfo.color} text-white rounded-2xl font-black text-[10px] uppercase tracking-wider shadow-md active:scale-[0.98] transition-all cursor-pointer`}
                        >
                          <MapPin size={12} strokeWidth={2.5} />
                          Location Map
                        </a>
                      )}
                      {nextOuting.page_url && (
                        <a 
                          href={nextOuting.page_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-3.5 bg-slate-100 hover:bg-slate-150 text-slate-600 border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer"
                        >
                          <Globe size={12} strokeWidth={2.5} />
                          Page details
                        </a>
                      )}
                      <button 
                        onClick={() => setDeleteConfirmId(nextOuting.id)}
                        className="px-4 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-100 rounded-2xl font-black text-[10px] uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        title="Delete Outing"
                      >
                        <Trash2 size={13} strokeWidth={2.5} />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )
            })()
          ) : (
            <div className="card-soft py-10 text-center text-brand-gray border border-dashed border-slate-200 bg-white/40 flex flex-col items-center justify-center select-none">
              <Map className="text-slate-300 mb-2 animate-bounce" size={28} />
              <p className="font-bold text-sm">No upcoming hangouts planned</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">Use the Outing form below to plan your next hangout details!</p>
            </div>
          )}
 
          {/* Outing list feed */}
          <div className="space-y-4">
            <h3 className="font-black text-lg text-brand-dark px-1">Planned Outings</h3>
            
            {outings.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-400 font-semibold select-none">No outings scheduled yet.</p>
            ) : (
              outings.map((o) => {
                const isSelected = selectedOutingId === o.id
                return (
                  <div 
                    key={o.id} 
                    onClick={() => setSelectedOutingId(isSelected ? null : o.id)}
                    className={`card-soft bg-white/70 border flex flex-col p-4 shadow-sm hover:scale-[1.01] hover:shadow-soft cursor-pointer transition-all duration-300 ${
                      isSelected 
                        ? 'border-brand-amber/40 bg-amber-50/10 shadow-[0_8px_20px_rgba(245,158,11,0.06)]' 
                        : 'border-white/50 bg-white/70'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <div>
                        <h4 className="font-black text-sm text-brand-dark">{o.title}</h4>
                        <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-1 font-bold">
                          <span className="flex items-center gap-0.5"><CalendarIcon size={10} /> {new Date(o.date).toLocaleDateString()}</span>
                          {o.place && <span className="flex items-center gap-0.5"><MapPin size={10} /> {o.place}</span>}
                        </div>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full select-none border transition-colors ${
                        isSelected 
                          ? 'text-brand-amber bg-brand-amber/15 border-brand-amber/25' 
                          : 'text-slate-400 bg-slate-100 border-slate-200/50'
                      }`}>
                        {isSelected ? 'Viewing' : 'Planned'}
                      </span>
                    </div>

                    {/* Expandable Details Container */}
                    <div className={`overflow-hidden transition-all duration-300 ${isSelected ? 'max-h-60 mt-4 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                      <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2.5 text-xs font-bold text-slate-500">
                        {o.time && (
                          <div className="flex items-center gap-2">
                            <Clock size={12} className="text-brand-amber shrink-0" />
                            <span>Time: {o.time}</span>
                          </div>
                        )}
                        {o.vibe && (
                          <div className="flex items-center gap-2">
                            <Smile size={12} className="text-brand-amber shrink-0" />
                            <span>Vibe: {o.vibe}</span>
                          </div>
                        )}
                        
                        {/* Links Row */}
                        <div className="flex gap-2.5 pt-2">
                          {o.location_url && (
                            <a 
                              href={o.location_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-amber/10 hover:bg-brand-amber/15 text-brand-amber border border-brand-amber/25 rounded-xl transition-all font-black text-[10px] uppercase tracking-wide active-pop cursor-pointer"
                            >
                              <MapPin size={11} />
                              Open Location
                            </a>
                          )}
                          {o.page_url && (
                            <a 
                              href={o.page_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-655 border border-slate-200 rounded-xl transition-all font-black text-[10px] uppercase tracking-wide active-pop cursor-pointer"
                            >
                              <Globe size={11} />
                              Website Page
                            </a>
                          )}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteConfirmId(o.id)
                            }}
                            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-150 rounded-xl transition-all font-black text-[10px] uppercase tracking-wide active-pop cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Trash2 size={11} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Floating Add Trigger based on Active Tab */}
      {activeTab === 'scrapbook' ? (
        isAddingMemory ? (
          <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
            <div className="bg-white rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-slide-up border border-slate-100 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-extrabold text-xl text-brand-dark">Capture a Memory</h3>
                <button onClick={() => setIsAddingMemory(false)} className="text-brand-gray font-bold text-sm bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200">
                  Cancel
                </button>
              </div>

              <form onSubmit={handleAddMemory} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Memory Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Best Pizza in Amman!"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-cyan focus:outline-none font-semibold text-brand-dark text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-cyan focus:outline-none font-semibold text-brand-dark text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Note / Caption</label>
                  <textarea
                    rows={3}
                    placeholder="Write a sweet details memory here..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-cyan focus:outline-none font-semibold text-brand-dark text-sm resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Mood</label>
                    <select
                      value={moodEmoji}
                      onChange={(e) => setMoodEmoji(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-cyan focus:outline-none font-bold text-sm text-brand-dark"
                    >
                      <option value="happy">Happy</option>
                      <option value="loved">Warm / Loved</option>
                      <option value="funny">Funny</option>
                      <option value="excited">Excited</option>
                      <option value="hungry">Hungry</option>
                      <option value="chill">Chill</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Tags (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="cafe, fun, study"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-cyan focus:outline-none font-semibold text-brand-dark text-sm"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider">Memory Photo (Optional)</label>
                    <div className="flex space-x-2 text-[10px] font-black uppercase">
                      <button
                        type="button"
                        onClick={() => setUploadMode('file')}
                        className={`px-2 py-0.5 rounded transition-all ${uploadMode === 'file' ? 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/20' : 'text-slate-400'}`}
                      >
                        From Album
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMode('url')}
                        className={`px-2 py-0.5 rounded transition-all ${uploadMode === 'url' ? 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/20' : 'text-slate-400'}`}
                      >
                        Web URL
                      </button>
                    </div>
                  </div>

                  {uploadMode === 'file' ? (
                    <div className="relative">
                      {!photoPreview ? (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all hover:border-brand-cyan group">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-7 h-7 text-slate-400 group-hover:text-brand-cyan transition-colors mb-2" />
                            <p className="text-xs font-bold text-slate-500 group-hover:text-brand-cyan transition-colors">Click to upload from Album</p>
                            <p className="text-[10px] text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                          </div>
                          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoFileChange} />
                        </label>
                      ) : (
                        <div className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-soft">
                          <img src={photoPreview} className="w-full h-32 object-cover" alt="Preview" />
                          <button
                            type="button"
                            onClick={handleClearPhoto}
                            className="absolute top-2 right-2 w-7 h-7 bg-brand-dark/70 text-white rounded-full flex items-center justify-center hover:bg-brand-dark transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-cyan focus:outline-none font-semibold text-brand-dark text-sm"
                      />
                      {photoUrl && (
                        <button
                          type="button"
                          onClick={handleClearPhoto}
                          className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Real-time Polaroid Live Preview */}
                {(photoPreview || photoUrl || title || note) && (
                  <div className="pt-2 flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Polaroid Preview</span>
                    <div className="bg-white border border-slate-200 p-3 pb-6 rounded-md shadow-lg max-w-[180px] w-full transform rotate-1 border-b-[12px] border-b-slate-50">
                      <div className="aspect-square bg-slate-100 rounded overflow-hidden relative shadow-inner mb-3">
                        {photoPreview || photoUrl ? (
                          <img src={photoPreview || photoUrl} className="w-full h-full object-cover" alt="Polaroid preview" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                            <Camera size={24} />
                          </div>
                        )}
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/90 flex items-center justify-center shadow">
                          {getMoodIcon(moodEmoji)}
                        </div>
                      </div>
                      <h5 className="text-[11px] font-black text-brand-dark truncate font-serif italic text-center">
                        {title || "Untitled Memory"}
                      </h5>
                      <p className="text-[8px] font-bold text-slate-400 text-center mt-0.5">
                        {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUploading}
                  className={`w-full py-3.5 bg-gradient-to-r from-brand-cyan to-teal-500 text-white rounded-2xl font-bold shadow-lg shadow-brand-cyan/20 hover:scale-[0.99] transition-all flex items-center justify-center gap-2 ${isUploading ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Saving Photo...</span>
                    </>
                  ) : (
                    <span>Save to Scrapbook</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingMemory(true)}
            className="fixed bottom-24 right-8 w-14 h-14 bg-gradient-to-tr from-brand-cyan to-teal-400 text-white rounded-full flex items-center justify-center shadow-xl shadow-brand-cyan/30 hover:scale-110 active:scale-95 transition-transform z-40 border border-white/20 active-pop"
          >
            <Plus size={28} strokeWidth={3} />
          </button>
        )
      ) : isAddingOuting ? (
        <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-white rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-slide-up border border-slate-100 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-extrabold text-xl text-brand-dark">Plan an Outing</h3>
              <button onClick={() => setIsAddingOuting(false)} className="text-brand-gray font-bold text-sm bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200">
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddOuting} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Outing Title</label>
                <input
                  type="text"
                  placeholder="e.g. Coffee outing next Friday"
                  value={outingTitle}
                  onChange={(e) => setOutingTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-amber focus:outline-none font-semibold text-brand-dark text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Date</label>
                  <input
                    type="date"
                    value={outingDate}
                    onChange={(e) => setOutingDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-amber focus:outline-none font-semibold text-brand-dark text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Time (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 4:00 PM"
                    value={outingTime}
                    onChange={(e) => setOutingTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-amber focus:outline-none font-semibold text-brand-dark text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Place / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Cafe Rumi"
                  value={outingPlace}
                  onChange={(e) => setOutingPlace(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-amber focus:outline-none font-semibold text-brand-dark text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Vibe / Activity</label>
                <input
                  type="text"
                  placeholder="e.g. Chill chat, studying, walking"
                  value={outingVibe}
                  onChange={(e) => setOutingVibe(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-amber focus:outline-none font-semibold text-brand-dark text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Location Link (optional)</label>
                  <input
                    type="url"
                    placeholder="https://maps.google.com/..."
                    value={outingLocationUrl}
                    onChange={(e) => setOutingLocationUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-amber focus:outline-none font-semibold text-brand-dark text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Page Link (optional)</label>
                  <input
                    type="url"
                    placeholder="https://example.com/..."
                    value={outingPageUrl}
                    onChange={(e) => setOutingPageUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-amber focus:outline-none font-semibold text-brand-dark text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-brand-amber to-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-amber/20 hover:scale-[0.99] transition-all"
              >
                Schedule Outing
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingOuting(true)}
          className="fixed bottom-24 right-8 w-14 h-14 bg-gradient-to-tr from-brand-amber to-amber-400 text-white rounded-full flex items-center justify-center shadow-xl shadow-brand-amber/30 hover:scale-110 active:scale-95 transition-transform z-40 border border-white/20 active-pop"
        >
          <Plus size={28} strokeWidth={3} />
        </button>
      )}

      {/* Scrapbook Polaroid Lightbox Modal */}
      {selectedMemory && (
        <div 
          onClick={() => setSelectedMemory(null)}
          className="fixed inset-0 bg-brand-dark/70 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in cursor-zoom-out"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-5 pb-8 rounded-2xl shadow-2xl max-w-sm w-full animate-scale-in border border-slate-100 cursor-default"
          >
            {/* Polaroid Photo Frame */}
            <div className="relative aspect-square rounded-xl overflow-hidden mb-5 border border-slate-150 shadow-inner bg-slate-50">
              {selectedMemory.photo ? (
                <img src={selectedMemory.photo} alt={selectedMemory.title} className="w-full h-full object-cover animate-fade-in" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-350">
                  <Camera size={48} className="text-slate-300" />
                  <span className="text-[10px] font-bold text-slate-400 mt-2">No Photo Attached</span>
                </div>
              )}
              {selectedMemory.mood_emoji && (
                <div className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-md border border-slate-100">
                  {getMoodIcon(selectedMemory.mood_emoji)}
                </div>
              )}
            </div>

            {/* Description & Metadata */}
            <div className="px-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-brand-cyan uppercase tracking-wider bg-brand-cyan/5 px-2.5 py-1 rounded-md border border-brand-cyan/15">
                  {new Date(selectedMemory.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-1">
                  <User size={10} className="text-slate-350" />
                  By {selectedMemory.created_by === 'you' ? 'You' : partnerName}
                </span>
              </div>
              
              <h4 className="font-extrabold text-xl text-brand-dark mt-4 leading-tight">
                {selectedMemory.title}
              </h4>
              <p className="text-xs text-slate-500 mt-3 leading-relaxed font-bold bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 shadow-inner whitespace-pre-wrap">
                {selectedMemory.note}
              </p>

              {/* Tags */}
              {selectedMemory.tags && selectedMemory.tags.length > 0 && (
                <div className="flex gap-1.5 mt-4.5 flex-wrap">
                  {selectedMemory.tags.map((tag: string) => (
                    <span key={tag} className="text-[9px] font-extrabold text-slate-400 bg-slate-50 border border-slate-100/50 rounded-md px-2 py-0.5 select-none">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions Row (Close & Delete) */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedMemory(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors active-pop"
              >
                Close Memory
              </button>
              <button
                onClick={() => setDeleteConfirmId(selectedMemory.id)}
                className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-100 rounded-xl font-bold transition-all active-pop"
                title="Delete Memory"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        title={isOuting ? "Delete this outing?" : "Delete this memory?"}
        message={isOuting ? "This will permanently remove the planned hangout." : "This will permanently remove the scrapbook memory."}
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteConfirmId) {
            deleteMemory(deleteConfirmId)
            setDeleteConfirmId(null)
            setSelectedMemory(null)
          }
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  )
}
