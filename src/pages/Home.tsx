import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import type { PrayerLog } from '../store/useAppStore'
import { CheckCircle2, Music, Calendar, BookOpen, Smile, Plus, Settings, User, Heart, Lock, Link2, Network, Edit3, Save, Clock, ChevronRight, Gift } from 'lucide-react'

const PRESET_VIBES = [
  'studying',
  'chilling',
  'coding',
  'reading',
  'music mood',
  'sleepy',
  'wandering',
  'dreaming',
  'painting'
]

export default function Home() {
  const navigate = useNavigate()
  const {
    tasks,
    memories,
    songs,
    myPrayers,
    partnerPrayers,
    hobbies,
    userName,
    partnerName,
    userCity,
    userAvatar,
    partnerAvatar,
    userVibe,
    partnerVibe,
    pairStatus,
    dbError,
    onlineUsers,
    partnerLastSeen,
    partnerId,
    updateProfile
  } = useAppStore()

  // Inline status editor states
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [editCity, setEditCity] = useState(userCity)
  const [editVibe, setEditVibe] = useState(userVibe)
  const [savingStatus, setSavingStatus] = useState(false)
  const [selectedSongMsg, setSelectedSongMsg] = useState<string | null>(null)

  // Sync cities when they load
  useEffect(() => {
    setEditCity(userCity)
    setEditVibe(userVibe)
  }, [userCity, userVibe])

  // Calculate dynamic presence detection
  const isPartnerOnline = partnerId && onlineUsers.includes(partnerId)

  // Relative last seen formatter
  const getRelativeLastSeenStr = (timestamp: string | null) => {
    if (!timestamp) return 'Active recently'
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      
      if (diff < 0) return 'Active just now'
      
      const mins = Math.floor(diff / 60000)
      if (mins < 1) return 'Active just now'
      if (mins < 60) return `Active ${mins}m ago`
      
      const hours = Math.floor(mins / 60)
      if (hours < 24) return `Active ${hours}h ago`
      
      const days = Math.floor(hours / 24)
      if (days === 1) return 'Active yesterday'
      return `Active ${days}d ago`
    } catch (e) {
      return 'Active recently'
    }
  }

  // Handle status update
  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingStatus(true)
    try {
      await updateProfile({
        userCity: editCity,
        vibeStatus: editVibe
      })
      setIsEditingStatus(false)
    } catch (err) {
      console.error('[MasSync] Failed to update status on home page:', err)
    } finally {
      setSavingStatus(false)
    }
  }

  // Calculate dynamic stats
  const sharedTasks = tasks.filter((t) => t.category === 'shared')
  const completedShared = sharedTasks.filter((t) => t.is_done).length

  // Last completed shared task
  const lastCompletedTask = tasks
    .filter((t) => t.is_done && t.category === 'shared' && t.done_at)
    .sort((a, b) => new Date(b.done_at || 0).getTime() - new Date(a.done_at || 0).getTime())[0]

  const activeHobby = hobbies.find((h) => h.status === 'active')

  const nextOuting = memories
    .filter((m) => m.type === 'outing' && new Date(m.date) >= new Date(new Date().setHours(0,0,0,0)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

  // Calculate remaining days for outing
  const getOutingDaysStr = () => {
    if (!nextOuting) return 'No outing planned'
    const diff = new Date(nextOuting.date).getTime() - new Date().setHours(0,0,0,0)
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today!'
    if (days === 1) return 'Tomorrow!'
    return `In ${days} days`
  }

  // Calculate prayer status summary
  const completedPrayers = Object.values(myPrayers).filter(Boolean).length
  const prayerSummary = `${completedPrayers}/5 prayers done`

  const getGreeting = () => {
    const hrs = new Date().getHours()
    if (hrs < 12) return 'Good morning'
    if (hrs < 18) return 'Good afternoon'
    return 'Good evening'
  }

  // Helper to render side-by-side prayer completion grid
  const getPrayerGrid = () => {
    const prayers: { key: keyof PrayerLog; label: string }[] = [
      { key: 'fajr', label: 'Fj' },
      { key: 'dhuhr', label: 'Dh' },
      { key: 'asr', label: 'As' },
      { key: 'maghrib', label: 'Mg' },
      { key: 'isha', label: 'Is' }
    ]
    return (
      <div className="grid grid-cols-5 gap-1.5 w-full mt-3">
        {prayers.map(({ key, label }) => {
          const mine = myPrayers[key]
          const partner = partnerPrayers[key]
          return (
            <div key={key} className="flex flex-col items-center bg-white/40 rounded-xl p-1.5 border border-white/60">
              <span className="text-[8px] font-black text-slate-450 uppercase mb-1">{label}</span>
              <div className="flex flex-col space-y-1">
                {/* You */}
                <div 
                  className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 flex items-center justify-center ${
                    mine 
                      ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]' 
                      : 'bg-white border-slate-200'
                  }`}
                  title={`You: ${key}`}
                >
                  {mine && <span className="text-[7px] text-white font-bold">✓</span>}
                </div>
                {/* Partner */}
                {pairStatus === 'active' && (
                  <div 
                    className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 flex items-center justify-center ${
                      partner 
                        ? 'bg-brand-cyan border-brand-cyan/80 shadow-[0_0_6px_rgba(0,188,212,0.5)]' 
                        : 'bg-white border-slate-200'
                    }`}
                    title={`${partnerName}: ${key}`}
                  >
                    {partner && <span className="text-[7px] text-white font-bold">✓</span>}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="relative pb-28 animate-fade-in z-10">
      {/* Frosted Top Navigation Bar */}
      <header className="pt-12 pb-4 px-6 flex justify-between items-center bg-transparent z-20 relative">
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">MasSync</span>
          <h1 className="text-xl font-black text-slate-800">
            {getGreeting()}
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {pairStatus === 'active' && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-2xl flex items-center space-x-1 shadow-sm text-[9px] font-black text-emerald-600 uppercase tracking-wider bg-white/40 backdrop-blur-sm select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse"></span>
              <span>Sync Live</span>
            </div>
          )}
          <button
            onClick={() => navigate('/settings')}
            className="w-10 h-10 rounded-2xl bg-white/70 backdrop-blur-md border border-white/45 flex items-center justify-center text-slate-500 hover:text-brand-purple active-pop shadow-sm transition-all hover:scale-105"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 space-y-6 relative z-10">
        {dbError && (
          <div className="card-soft bg-rose-500/5 border border-rose-500/15 shadow-soft p-5 text-rose-600 rounded-3xl space-y-2">
            <h4 className="font-extrabold text-sm flex items-center">
              <span className="w-2 h-2 rounded-full bg-rose-500 mr-2 animate-pulse" />
              Database Notice
            </h4>
            <p className="text-xs font-semibold leading-relaxed">
              {dbError}
            </p>
            <p className="text-[10px] text-rose-500/80 font-medium">
              Open Settings or check your Supabase dashboard SQL Editor to apply updates.
            </p>
          </div>
        )}
        
        {/* Redesigned "Us" Hero Card (Frosted Premium Glassmorphic Layout) */}
        <section 
          className="relative overflow-hidden bg-gradient-to-b from-white/90 to-white/70 backdrop-blur-3xl border border-white/75 shadow-glow-brand rounded-[44px] p-8 flex flex-col items-center justify-center transition-all duration-300 animate-shimmer group"
        >
          {/* Subtle Ambient Background Glows */}
          <div className="absolute top-[-10%] left-[-10%] w-36 h-36 rounded-full bg-brand-cyan/20 blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute bottom-[-10%] right-[-10%] w-36 h-36 rounded-full bg-brand-purple/20 blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-cyan via-brand-purple to-pink-500 opacity-90"></div>
          
          <div className="w-full flex justify-between items-center relative mt-3 px-1">
            
            {/* You */}
            <div className="flex flex-col items-center space-y-4.5 z-10 w-[33%] group/user">
              <div className="relative group/avatar">
                {/* Concentric rotating/pulsating gradient ring */}
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-brand-cyan to-brand-purple opacity-75 blur-[2px] animate-pulse"></div>
                <div className="relative w-20 h-20 rounded-full p-[3px] bg-white shadow-xl flex items-center justify-center transition-all duration-300 group-hover/avatar:scale-105">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-100">
                    {userAvatar ? (
                      <img src={userAvatar} className="w-full h-full object-cover" alt={userName} />
                    ) : (
                      <User size={30} className="text-slate-400" />
                    )}
                  </div>
                </div>
                {/* Active Indicator dot */}
                <div className="absolute bottom-0.5 right-0.5 w-4.5 h-4.5 bg-brand-green border-[3px] border-white rounded-full shadow-md z-10"></div>
              </div>
              
              <div className="text-center w-full space-y-1.5">
                <p className="text-sm font-black text-slate-800 tracking-tight flex items-center justify-center gap-1">
                  <span className="truncate max-w-[85px]">{userName ? userName.split(' ')[0] : 'You'}</span>
                </p>
                
                {/* User Vibe Status — always-visible edit */}
                {pairStatus === 'active' && (
                  <button
                    onClick={() => {
                      setEditCity(userCity)
                      setEditVibe(userVibe)
                      setIsEditingStatus(true)
                    }}
                    className="inline-flex items-center gap-1.5 text-[9px] font-black text-brand-purple bg-brand-purple/10 border border-brand-purple/20 px-2.5 py-0.5 rounded-full select-none shadow-inner max-w-full truncate active-pop"
                    title="Update vibe"
                  >
                    <span className="truncate max-w-[70px]">{userVibe || 'Set vibe…'}</span>
                    <Edit3 size={9} className="shrink-0 opacity-70" />
                  </button>
                )}
                {!pairStatus || pairStatus !== 'active' ? (
                  userVibe && (
                    <span className="inline-block text-[9px] font-black text-brand-purple bg-brand-purple/10 border border-brand-purple/20 px-2.5 py-0.5 rounded-full select-none animate-fade-in shadow-inner max-w-full truncate">
                      {userVibe}
                    </span>
                  )
                ) : null}
              </div>
            </div>

            {/* Connection Curved Line with Pulsating Center */}
            <div className="flex-1 flex flex-col items-center px-1 z-0 -mt-12 relative">
              <svg className="w-full h-12 overflow-visible animate-pulse" fill="none" viewBox="0 0 100 30" preserveAspectRatio="none">
                {/* Glow neon backplate */}
                <path 
                  d="M0,15 Q50,30 100,15" 
                  stroke={pairStatus === 'active' ? (isPartnerOnline ? 'url(#online-glow-grad)' : 'url(#active-grad)') : 'url(#pending-grad)'} 
                  strokeWidth="5" 
                  strokeLinecap="round"
                  opacity="0.25"
                  className="blur-[2px]"
                />
                <path 
                  d="M0,15 Q50,30 100,15" 
                  stroke={pairStatus === 'active' ? (isPartnerOnline ? 'url(#online-glow-grad)' : 'url(#active-grad)') : 'url(#pending-grad)'} 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  strokeDasharray={isPartnerOnline ? 'none' : '4 4'}
                  className={isPartnerOnline ? 'animate-dash' : ''}
                />
                
                {/* Signal Pulse Dot travelling the curve when online */}
                {pairStatus === 'active' && isPartnerOnline && (
                  <circle r="3.5" fill="#EC4899" className="shadow-[0_0_10px_#EC4899]">
                    <animateMotion dur="2.5s" repeatCount="indefinite" path="M0,15 Q50,30 100,15" />
                  </circle>
                )}
                
                <defs>
                  <linearGradient id="active-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00BCD4" />
                    <stop offset="50%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#cbd5e1" />
                  </linearGradient>
                  <linearGradient id="online-glow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22C55E" />
                    <stop offset="30%" stopColor="#00BCD4" />
                    <stop offset="50%" stopColor="#EC4899" />
                    <stop offset="70%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#22C55E" />
                  </linearGradient>
                  <linearGradient id="pending-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00BCD4" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6B7280" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Floating Heart Center */}
              <div className="absolute top-[28px] left-1/2 -translate-x-1/2 -translate-y-1/2">
                {pairStatus === 'active' ? (
                  <div className="relative group/heart cursor-pointer">
                    <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-md scale-110 group-hover/heart:scale-125 transition-transform duration-300"></div>
                    <div className="relative w-11 h-11 rounded-full bg-gradient-to-b from-white to-slate-50 border border-white/80 flex items-center justify-center shadow-lg shadow-rose-500/10 transition-transform duration-300 group-hover/heart:scale-110 active:scale-95">
                      <Heart size={16} className={`text-rose-500 fill-rose-500 ${isPartnerOnline ? 'animate-[pulse_1.5s_infinite] drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]' : 'opacity-85'}`} />
                    </div>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100/80 flex items-center justify-center shadow-lg animate-pulse">
                    <Lock size={14} className="text-amber-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Friend */}
            <div className="flex flex-col items-center space-y-4.5 z-10 w-[33%]">
              <div className="relative group/avatar">
                {/* Dynamic gradient outer ring */}
                <div className={`absolute -inset-1.5 rounded-full blur-[2px] transition-all duration-500 ${
                  isPartnerOnline 
                    ? 'bg-gradient-to-tr from-brand-green via-brand-cyan to-brand-purple opacity-80 animate-pulse' 
                    : 'bg-slate-200/50 opacity-40'
                }`}></div>
                <div className="relative w-20 h-20 rounded-full p-[3px] bg-white shadow-xl flex items-center justify-center transition-all duration-300 group-hover/avatar:scale-105">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-100">
                    {pairStatus === 'active' ? (
                      partnerAvatar ? (
                        <img src={partnerAvatar} className="w-full h-full object-cover" alt={partnerName} />
                      ) : (
                        <User size={30} className="text-slate-400" />
                      )
                    ) : (
                      <div 
                        onClick={() => navigate('/settings')}
                        className="w-full h-full bg-gradient-to-tr from-slate-50 to-slate-100 flex items-center justify-center cursor-pointer"
                      >
                        <Plus size={22} className="text-slate-400 animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>
                {/* Status Dot */}
                <div className={`absolute bottom-0.5 right-0.5 w-4.5 h-4.5 border-[3px] border-white rounded-full shadow-md z-10 ${
                  pairStatus === 'active'
                    ? (isPartnerOnline ? 'bg-brand-green animate-pulse' : 'bg-slate-300')
                    : 'bg-amber-400 animate-pulse'
                }`}></div>
              </div>
              
              <div className="text-center w-full space-y-1.5">
                <p className="text-sm font-black text-slate-800 tracking-tight">
                  {pairStatus === 'active' ? (partnerName ? partnerName.split(' ')[0] : 'Partner') : 'No Friend'}
                </p>
                
                {/* Professional Relative Last Seen text */}
                {pairStatus === 'active' && (
                  <div className={`text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 select-none ${
                    isPartnerOnline ? 'text-emerald-500' : 'text-slate-400'
                  }`}>
                    {isPartnerOnline ? (
                      <div className="bg-emerald-50/80 border border-emerald-100/60 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm select-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Online</span>
                      </div>
                    ) : (
                      <span className="flex items-center gap-1 font-bold bg-slate-50/80 border border-slate-100/60 px-2.5 py-0.5 rounded-full shadow-sm select-none">
                        <Clock size={8} className="shrink-0 text-slate-400" />
                        {getRelativeLastSeenStr(partnerLastSeen)}
                      </span>
                    )}
                  </div>
                )}
                {pairStatus !== 'active' && (
                  <span 
                    onClick={() => navigate('/settings')}
                    className="inline-block text-[9px] font-extrabold uppercase bg-amber-50 text-amber-500 px-2.5 py-0.5 rounded-full mt-1.5 animate-pulse cursor-pointer select-none border border-amber-100"
                  >
                    Link now
                  </span>
                )}
                
                {/* Partner Vibe Status */}
                {pairStatus === 'active' && partnerVibe && (
                  <div>
                    <span className="inline-block text-[9px] font-black text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-2.5 py-0.5 rounded-full select-none animate-fade-in shadow-inner max-w-full truncate">
                      {partnerVibe}
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Friendship Duration Footer (Link button only shown if not active) */}
          {pairStatus !== 'active' && (
            <div className="w-full mt-8 pt-5 border-t border-slate-100/50 flex justify-center">
              <button 
                onClick={() => navigate('/settings')}
                className="text-xs font-black text-white bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-95 active-pop px-6 py-2.5 rounded-full flex items-center space-x-1.5 transition-all shadow-md shadow-brand-purple/20 hover:scale-[1.02]"
              >
                <span>Link best friend now</span>
                <Link2 size={12} className="animate-pulse" />
              </button>
            </div>
          )}
        </section>

        {/* Quick Widgets Grid (Enhanced Frosted Cards with Neon Shadow Glows) */}
        <div className="grid grid-cols-2 gap-5">
          {/* Tasks Widget */}
          <button
            onClick={() => navigate('/tasks')}
            className="card-soft bg-white/75 backdrop-blur-3xl border border-white/50 flex flex-col items-start hover:scale-[1.03] active-pop transition-all text-left shadow-glow-amber group relative overflow-hidden"
          >
            <div className="w-full flex justify-between items-center mb-4">
              <div className="w-11 h-11 rounded-2xl bg-brand-amber/10 flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner">
                <CheckCircle2 className="text-brand-amber" size={22} />
              </div>
              
              {/* Mini progress circle */}
              {sharedTasks.length > 0 && (
                <div className="w-9 h-9 relative flex items-center justify-center select-none">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="14" className="stroke-slate-100" strokeWidth="3.5" fill="transparent" />
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="14" 
                      className="stroke-brand-amber" 
                      strokeWidth="3.5" 
                      strokeDasharray={2 * Math.PI * 14}
                      strokeDashoffset={2 * Math.PI * 14 - (completedShared / sharedTasks.length) * (2 * Math.PI * 14)}
                      strokeLinecap="round" 
                      fill="transparent" 
                    />
                  </svg>
                  <span className="absolute text-[9px] font-black text-brand-amber">
                    {Math.round((completedShared / sharedTasks.length) * 100)}%
                  </span>
                </div>
              )}
            </div>
            
            <h3 className="text-sm font-black text-slate-800">Tasks Checklist</h3>
            <p className="text-slate-400 mt-1 text-[11px] font-bold">
              {completedShared}/{sharedTasks.length} shared done
            </p>

            {/* Micro notifications for last completed task */}
            {lastCompletedTask && (
              <p className="text-emerald-600 text-[9px] font-extrabold truncate w-full mt-3 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-xl select-none">
                {lastCompletedTask.done_by === 'you' ? 'You' : partnerName} checked "{lastCompletedTask.title}"
              </p>
            )}
          </button>

          {/* Song Gift Widget — navigates to Memories page */}
          <button
            onClick={() => navigate('/memories')}
            className="card-soft bg-white/75 backdrop-blur-3xl border border-white/50 flex flex-col items-start hover:scale-[1.03] active-pop transition-all text-left shadow-glow-purple group relative overflow-hidden"
          >
            <div className="w-full flex justify-between items-center mb-4">
              {songs[0] ? (
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center shadow-lg animate-spin-slow overflow-hidden">
                    {/* Vinyl grooves */}
                    <div className="absolute inset-1 rounded-full border border-slate-800/40 opacity-70"></div>
                    <div className="absolute inset-2.5 rounded-full border border-slate-800/30 opacity-50"></div>
                    <div className="absolute inset-4 rounded-full border border-slate-800/20 opacity-30"></div>
                    
                    {/* Center Label */}
                    <div className="w-4 h-4 rounded-full bg-brand-purple flex items-center justify-center shadow-inner">
                      <div className="w-1 h-1 rounded-full bg-white"></div>
                    </div>
                  </div>
                  
                  {/* Floating music notes */}
                  <span className="absolute -top-1 -right-1 text-brand-purple animate-bounce text-[10px]">🎵</span>
                  <span className="absolute -bottom-1 -left-1 text-brand-purple animate-pulse text-[10px] [animation-delay:0.5s]">🎶</span>
                </div>
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-brand-purple/10 flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner">
                  <Music className="text-brand-purple" size={22} />
                </div>
              )}
            </div>
            
            <h3 className="text-sm font-black text-slate-800">Song Gift</h3>
            <p className="text-slate-400 mt-1 text-[11px] font-bold truncate w-full">
              {songs[0] ? (songs[0].gifted_by === 'you' ? 'You gifted a track' : `${partnerName} gifted you a track`) : 'Send a track today!'}
            </p>

            {songs[0] ? (
              <div className="w-full mt-3 flex flex-col space-y-1 bg-brand-purple/10 border border-brand-purple/20 px-2.5 py-1.5 rounded-xl">
                <p className="text-brand-purple text-[9px] font-black truncate">
                  "{songs[0].title}"
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[8px] text-slate-400 font-bold truncate max-w-[80px]">{songs[0].artist}</span>
                  {/* Music visualizer bars */}
                  <div className="flex items-end space-x-0.5 h-2.5">
                    <span className="w-0.5 h-1.5 bg-brand-purple/80 rounded-full eq-bar-1"></span>
                    <span className="w-0.5 h-2.5 bg-brand-purple/80 rounded-full eq-bar-2"></span>
                    <span className="w-0.5 h-2 bg-brand-purple/80 rounded-full eq-bar-3"></span>
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-[8px] text-slate-400 font-bold mt-3 inline-block">Tap to browse history</span>
            )}
          </button>
        </div>

        {/* Wide Widgets List (Frosted & Modernized) */}
        <div className="space-y-5">
          
          {/* Outing Widget (Boarding Pass styled) */}
          <button
            onClick={() => navigate('/memories')}
            className="card-soft w-full bg-white/75 backdrop-blur-3xl border border-white/50 flex items-center justify-between hover:scale-[1.015] active-pop transition-all shadow-glow-cyan group relative overflow-hidden"
          >
            <div className="flex items-center z-10">
              <div className="w-11 h-11 rounded-2xl bg-brand-cyan/10 flex items-center justify-center mr-4 transition-transform group-hover:scale-110 shadow-inner">
                <Calendar className="text-brand-cyan" size={22} />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-black text-slate-800">Outing Planner</h3>
                <p className="text-slate-400 text-[11px] font-bold truncate max-w-[180px]">
                  {nextOuting ? nextOuting.title : 'Plan a hangout together'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center z-10 space-x-2">
              <div className="h-10 border-l-2 border-dashed border-slate-200 mr-2"></div>
              <div className="pill bg-brand-cyan/10 border border-brand-cyan/25 font-black px-3.5 py-1.5 text-brand-cyan text-[10px] uppercase tracking-wider shadow-sm">
                {getOutingDaysStr()}
              </div>
            </div>
          </button>

          {/* Gifts We Love Widget */}
          <button
            onClick={() => navigate('/gifts')}
            className="card-soft w-full bg-white/75 backdrop-blur-3xl border border-white/50 flex items-center justify-between hover:scale-[1.015] active-pop transition-all shadow-glow-rose group relative overflow-hidden text-left"
          >
            <div className="flex items-center z-10">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/10 flex items-center justify-center mr-4 transition-transform group-hover:scale-110 shadow-inner">
                <Gift className="text-rose-500" size={22} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">Gifts We Love</h3>
                <p className="text-slate-400 text-[11px] font-bold">
                  {memories.filter(m => m.type === 'gift').length > 0 
                    ? `Wishlist: ${memories.filter(m => m.type === 'gift').length} items saved`
                    : 'Share gift ideas with each other'}
                </p>
              </div>
            </div>
            
            <span className="text-[10px] font-black text-rose-600 bg-rose-500/10 border border-rose-500/20 px-3.5 py-1.5 rounded-full uppercase tracking-wider select-none inline-flex items-center gap-1 shadow-sm">
              Ideas
            </span>
          </button>

          {/* Islamic Corner Widget (Interactive Prayer Streak Table) */}
          <button
            onClick={() => navigate('/islamic')}
            className="card-soft w-full bg-white/75 backdrop-blur-3xl border border-white/50 flex flex-col hover:scale-[1.015] active-pop transition-all shadow-glow-green group relative overflow-hidden text-left"
          >
            <div className="flex items-center w-full justify-between">
              <div className="flex items-center">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center mr-4 transition-transform group-hover:scale-110 shadow-inner">
                  <BookOpen className="text-emerald-500" size={22} />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-black text-slate-800">Islamic Corner</h3>
                  <p className="text-slate-450 text-[11px] font-semibold">{prayerSummary}</p>
                </div>
              </div>
              
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider select-none">
                Streak Check
              </span>
            </div>

            {/* Side by side completion tracker grid */}
            {getPrayerGrid()}
          </button>
          
          {/* Inner Circle / Relationship Tree Widget */}
          <button
            onClick={() => navigate('/tree')}
            className="card-soft w-full bg-white/75 backdrop-blur-3xl border border-white/50 flex items-center justify-between hover:scale-[1.015] active-pop transition-all shadow-glow-indigo group relative overflow-hidden"
          >
            <div className="flex items-center">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 flex items-center justify-center mr-4 transition-transform group-hover:scale-110 shadow-inner">
                <Network className="text-indigo-500" size={22} />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-black text-slate-800">Inner Circle Tree</h3>
                <p className="text-slate-400 text-[11px] font-bold">
                  Manage friends & family relationships
                </p>
              </div>
            </div>
            
            {/* Visual Node connectors */}
            <div className="flex items-center space-x-1.5 mr-2 select-none">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 border border-white shadow-sm animate-pulse"></div>
              <div className="w-4 h-0.5 bg-indigo-200"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 border border-white shadow-sm"></div>
            </div>
          </button>

          {/* Current Hobby Widget */}
          <button
            onClick={() => navigate('/hobbies')}
            className="card-soft w-full bg-white/75 backdrop-blur-3xl border border-white/50 flex flex-col items-start hover:scale-[1.015] active-pop transition-all text-left shadow-glow-rose group relative overflow-hidden"
          >
            <div className="flex items-center w-full justify-between">
              <div className="flex items-center">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/10 flex items-center justify-center mr-4 transition-transform group-hover:scale-110 shadow-inner">
                  <Smile className="text-rose-500" size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">Hobbies & Learning</h3>
                  <p className="text-slate-450 text-[11px] font-semibold">
                    {activeHobby ? activeHobby.name : 'No active hobby progress'}
                  </p>
                </div>
              </div>
              <ChevronRight className="text-slate-400 transition-transform group-hover:translate-x-1" size={16} />
            </div>

            {activeHobby ? (
              <div className="w-full mt-4 space-y-2">
                {/* Visual Progress Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        activeHobby.steps.length > 0
                          ? Math.round((activeHobby.steps.filter((s) => s.is_done).length / activeHobby.steps.length) * 100)
                          : 0
                      }%`
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase select-none">
                  <span>{activeHobby.steps.filter((s) => s.is_done).length}/{activeHobby.steps.length} Steps Done</span>
                  <span>
                    {activeHobby.steps.length > 0
                      ? Math.round((activeHobby.steps.filter((s) => s.is_done).length / activeHobby.steps.length) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 mt-4 select-none">
                 <span className="pill bg-rose-50 text-rose-500 border border-rose-100 font-bold text-[9px] px-2.5 py-0.5">Explore Ideas</span>
                 <span className="pill bg-slate-50 text-slate-400 border border-slate-105 font-bold text-[9px] px-2.5 py-0.5">Start Syncing</span>
              </div>
            )}
          </button>
        </div>

      </main>

      {/* Floating Modal: Update Vibe / Location — centered */}
      {isEditingStatus && (
        <div className="fixed inset-0 bg-brand-dark/45 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-slide-up border border-slate-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-extrabold text-xl text-brand-dark">Set Vibe & City</h3>
              <button 
                onClick={() => setIsEditingStatus(false)} 
                className="text-brand-gray font-bold text-sm bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200 active-pop"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">City Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cairo, Egypt"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-purple font-semibold text-brand-dark text-sm"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Current Vibe</label>
                <input
                  type="text"
                  placeholder="What are you doing right now?"
                  value={editVibe}
                  onChange={(e) => setEditVibe(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-purple font-semibold text-brand-dark text-sm"
                />
                
                {/* Vibe Presets */}
                <div className="flex gap-1.5 flex-wrap pt-2 select-none">
                  {PRESET_VIBES.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setEditVibe(v)}
                      className={`text-[10px] font-extrabold px-3 py-1 rounded-full border transition-all active-pop ${
                        editVibe === v
                          ? 'bg-brand-purple/10 border-brand-purple/20 text-brand-purple'
                          : 'bg-white border-slate-100 text-slate-400 hover:border-slate-250'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={savingStatus}
                className="w-full py-3.5 bg-gradient-to-r from-brand-purple to-brand-cyan text-white font-extrabold rounded-2xl text-xs hover:shadow-lg shadow-md flex items-center justify-center gap-1.5 active-pop disabled:opacity-50"
              >
                {savingStatus ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={13} />
                    <span>Update Status</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Modal: Song Gift Message */}
      {selectedSongMsg && (
        <div className="fixed inset-0 bg-brand-dark/45 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-[36px] w-full max-w-sm p-6 shadow-2xl border border-white/60 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-brand-purple/10 flex items-center justify-center mx-auto shadow-inner">
              <Music className="text-brand-purple" size={28} />
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] font-black text-brand-purple bg-brand-purple/10 px-3 py-1 rounded-full uppercase tracking-widest">
                Gifted Track Message
              </span>
              <h3 className="font-extrabold text-lg text-slate-800 pt-2">
                "{songs[0]?.title}"
              </h3>
              <p className="text-xs text-slate-400 font-bold">
                by {songs[0]?.artist}
              </p>
            </div>

            <p className="bg-slate-50/80 rounded-2xl p-4 text-xs font-semibold text-slate-650 italic leading-relaxed border border-slate-100">
              "{selectedSongMsg}"
            </p>

            <button
              onClick={() => setSelectedSongMsg(null)}
              className="w-full py-3 bg-brand-dark text-white font-black rounded-2xl text-xs active-pop hover:bg-slate-800 shadow-md"
            >
              Close message
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
