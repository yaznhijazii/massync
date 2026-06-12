import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { useAppStore } from '../store/useAppStore'
import type { PrayerLog } from '../store/useAppStore'
import { CheckCircle2, Music, Calendar, BookOpen, Smile, Plus, Settings, User, Heart, Lock, Link2, Network, Edit3, Save, Clock, ChevronRight, Gift, MapPin, Zap } from 'lucide-react'

const PRESET_VIBES = [
  'studying', 'chilling', 'coding', 'reading',
  'music mood', 'sleepy', 'wandering', 'dreaming', 'painting'
]

export default function Home() {
  const navigate = useNavigate()
  const {
    tasks, memories, songs, myPrayers, partnerPrayers,
    hobbies, userName, partnerName, userCity, userAvatar,
    partnerAvatar, userVibe, partnerVibe, pairStatus, dbError,
    onlineUsers, partnerLastSeen, partnerId, updateProfile
  } = useAppStore()

  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [editCity, setEditCity] = useState(userCity)
  const [editVibe, setEditVibe] = useState(userVibe)
  const [savingStatus, setSavingStatus] = useState(false)
  const [selectedSongMsg, setSelectedSongMsg] = useState<string | null>(null)

  useEffect(() => { setEditCity(userCity); setEditVibe(userVibe) }, [userCity, userVibe])

  const isPartnerOnline = partnerId && onlineUsers.includes(partnerId)

  const getRelativeLastSeenStr = (timestamp: string | null) => {
    if (!timestamp) return 'Active recently'
    try {
      const diff = Date.now() - new Date(timestamp).getTime()
      if (diff < 0) return 'Just now'
      const mins = Math.floor(diff / 60000)
      if (mins < 1) return 'Just now'
      if (mins < 60) return `${mins}m ago`
      const hours = Math.floor(mins / 60)
      if (hours < 24) return `${hours}h ago`
      const days = Math.floor(hours / 24)
      return days === 1 ? 'Yesterday' : `${days}d ago`
    } catch { return 'Active recently' }
  }

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingStatus(true)
    try {
      await updateProfile({ userCity: editCity, vibeStatus: editVibe })
      setIsEditingStatus(false)
    } catch (err) {
      console.error('[MasSync] Failed to update status:', err)
    } finally { setSavingStatus(false) }
  }

  const sharedTasks = tasks.filter((t) => t.category === 'shared')
  const completedShared = sharedTasks.filter((t) => t.is_done).length
  const activeHobby = hobbies.find((h) => h.status === 'active')
  const nextOuting = memories
    .filter((m) => m.type === 'outing' && new Date(m.date) >= new Date(new Date().setHours(0,0,0,0)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
  const completedPrayers = Object.values(myPrayers).filter(Boolean).length
  const totalGifts = memories.filter(m => m.type === 'gift').length

  const getOutingDaysStr = () => {
    if (!nextOuting) return 'Plan one'
    const diff = new Date(nextOuting.date).getTime() - new Date().setHours(0,0,0,0)
    const days = Math.ceil(diff / 86400000)
    if (days === 0) return 'Today!'
    if (days === 1) return 'Tomorrow!'
    return `In ${days} days`
  }

  const getGreeting = () => {
    const hrs = new Date().getHours()
    if (hrs < 5) return 'Still up? 🌙'
    if (hrs < 12) return 'Good morning ☀️'
    if (hrs < 18) return 'Good afternoon'
    return 'Good evening 🌙'
  }

  const getPrayerGrid = () => {
    const prayers: { key: keyof PrayerLog; label: string }[] = [
      { key: 'fajr', label: 'Fj' }, { key: 'dhuhr', label: 'Dh' },
      { key: 'asr', label: 'As' }, { key: 'maghrib', label: 'Mg' },
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
                <div className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 flex items-center justify-center ${mine ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-white border-slate-200'}`}>
                  {mine && <span className="text-[7px] text-white font-bold">✓</span>}
                </div>
                {pairStatus === 'active' && (
                  <div className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 flex items-center justify-center ${partner ? 'bg-brand-cyan border-brand-cyan/80 shadow-[0_0_6px_rgba(0,188,212,0.5)]' : 'bg-white border-slate-200'}`}>
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

      {/* ── Header ── */}
      <header className="pt-12 pb-5 px-6 flex justify-between items-center">
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">MasSync</span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">
            {getGreeting()}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {pairStatus === 'active' && (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-2xl shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">Sync Live</span>
            </div>
          )}
          <button
            onClick={() => navigate('/settings')}
            className="w-10 h-10 rounded-2xl bg-white/70 backdrop-blur-md border border-white/45 flex items-center justify-center text-slate-500 hover:text-brand-purple active-pop shadow-sm transition-all"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      <main className="px-6 space-y-5 relative z-10">
        {dbError && (
          <div className="card-soft bg-rose-500/5 border border-rose-500/15 p-5 text-rose-600 rounded-3xl space-y-2">
            <h4 className="font-extrabold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />Database Notice
            </h4>
            <p className="text-xs font-semibold leading-relaxed">{dbError}</p>
          </div>
        )}

        {/* ──────────────────────────────────
            "US" HERO CARD
        ────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[40px] bg-gradient-to-b from-white/95 to-white/80 backdrop-blur-3xl border border-white/80 shadow-glow-brand">

          {/* Top accent gradient bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-cyan via-brand-purple to-pink-500" />

          {/* Ambient blobs */}
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-brand-cyan/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-brand-purple/15 blur-3xl pointer-events-none" />

          <div className="relative px-6 pt-7 pb-6">

            {/* Avatars + Connection line */}
            <div className="flex justify-between items-start">

              {/* ── Me ── */}
              <div className="flex flex-col items-center gap-3 w-[38%]">
                <div 
                  onClick={() => navigate('/space')}
                  className="relative cursor-pointer hover:scale-105 active:scale-95 transition-transform group/avatar"
                  title="Go to My Space 🚀"
                >
                  <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-brand-cyan to-brand-purple opacity-70 blur-[3px] animate-pulse group-hover/avatar:opacity-100 transition-opacity" />
                  <div className="relative w-[72px] h-[72px] rounded-full p-[3px] bg-white shadow-xl">
                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center relative">
                      {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" alt={userName} /> : <User size={28} className="text-slate-400" />}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white text-[8px] font-black uppercase tracking-wider text-center">
                        Space 🚀
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-emerald-500 border-[2.5px] border-white rounded-full shadow-md z-10" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-slate-800">{userName ? userName.split(' ')[0] : 'You'}</p>
                  {pairStatus === 'active' && (
                    <button
                      onClick={() => { setEditCity(userCity); setEditVibe(userVibe); setIsEditingStatus(true) }}
                      className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-black text-brand-purple bg-brand-purple/10 border border-brand-purple/20 px-2.5 py-1 rounded-full active-pop max-w-[90px] truncate"
                    >
                      <span className="truncate">{userVibe || 'Set vibe…'}</span>
                      <Edit3 size={8} className="shrink-0" />
                    </button>
                  )}
                </div>
              </div>

              {/* ── Connection ── */}
              <div className="flex-1 flex flex-col items-center relative -mt-1">
                <svg className="w-full h-10 overflow-visible" fill="none" viewBox="0 0 100 28" preserveAspectRatio="none">
                  <path d="M0,14 Q50,28 100,14" stroke={pairStatus === 'active' ? (isPartnerOnline ? 'url(#hg-online)' : 'url(#hg-active)') : 'url(#hg-pending)'}
                    strokeWidth="5" strokeLinecap="round" opacity="0.2" className="blur-[2px]" />
                  <path d="M0,14 Q50,28 100,14" stroke={pairStatus === 'active' ? (isPartnerOnline ? 'url(#hg-online)' : 'url(#hg-active)') : 'url(#hg-pending)'}
                    strokeWidth="2" strokeLinecap="round" strokeDasharray={isPartnerOnline ? 'none' : '4 3'}
                    className={isPartnerOnline ? 'animate-dash' : ''} />
                  {pairStatus === 'active' && isPartnerOnline && (
                    <circle r="3" fill="#EC4899">
                      <animateMotion dur="2.5s" repeatCount="indefinite" path="M0,14 Q50,28 100,14" />
                    </circle>
                  )}
                  <defs>
                    <linearGradient id="hg-active" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00BCD4" /><stop offset="100%" stopColor="#A855F7" />
                    </linearGradient>
                    <linearGradient id="hg-online" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22C55E" /><stop offset="40%" stopColor="#00BCD4" />
                      <stop offset="60%" stopColor="#EC4899" /><stop offset="100%" stopColor="#22C55E" />
                    </linearGradient>
                    <linearGradient id="hg-pending" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.4" /><stop offset="100%" stopColor="#94a3b8" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Heart center */}
                <div className="absolute top-[26px] left-1/2 -translate-x-1/2 -translate-y-1/2">
                  {pairStatus === 'active' ? (
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-md scale-125" />
                      <div className="relative w-10 h-10 rounded-full bg-white border border-white/80 shadow-lg flex items-center justify-center">
                        <Heart size={15} className={`text-rose-500 fill-rose-500 ${isPartnerOnline ? 'animate-[pulse_1.5s_infinite]' : ''}`} />
                      </div>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shadow-md animate-pulse">
                      <Lock size={13} className="text-amber-500" />
                    </div>
                  )}
                </div>
              </div>

              {/* ── Partner ── */}
              <div className="flex flex-col items-center gap-3 w-[38%]">
                <div className="relative">
                  <div className={`absolute -inset-1.5 rounded-full blur-[3px] transition-all duration-500 ${isPartnerOnline ? 'bg-gradient-to-tr from-emerald-400 via-brand-cyan to-brand-purple opacity-75 animate-pulse' : 'bg-slate-200/50 opacity-30'}`} />
                  <div className="relative w-[72px] h-[72px] rounded-full p-[3px] bg-white shadow-xl">
                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                      {pairStatus === 'active'
                        ? (partnerAvatar ? <img src={partnerAvatar} className="w-full h-full object-cover" alt={partnerName} /> : <User size={28} className="text-slate-400" />)
                        : <div onClick={() => navigate('/settings')} className="w-full h-full flex items-center justify-center cursor-pointer"><Plus size={22} className="text-slate-400 animate-pulse" /></div>}
                    </div>
                  </div>
                  <div className={`absolute bottom-0.5 right-0.5 w-4 h-4 border-[2.5px] border-white rounded-full shadow-md z-10 ${pairStatus === 'active' ? (isPartnerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300') : 'bg-amber-400 animate-pulse'}`} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-slate-800">
                    {pairStatus === 'active' ? (partnerName?.split(' ')[0] || 'Partner') : 'No Friend'}
                  </p>
                  {pairStatus === 'active' ? (
                    <div className="mt-1.5">
                      {isPartnerOnline ? (
                        <div className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[9px] font-black text-emerald-600">Online</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
                          <Clock size={8} className="text-slate-350" />{getRelativeLastSeenStr(partnerLastSeen)}
                        </span>
                      )}
                      {partnerVibe && (
                        <div className="mt-1">
                          <span className="text-[9px] font-black text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-2.5 py-0.5 rounded-full inline-block max-w-[90px] truncate">{partnerVibe}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span onClick={() => navigate('/settings')} className="mt-1.5 inline-block text-[9px] font-black bg-amber-50 text-amber-500 px-2.5 py-1 rounded-full animate-pulse cursor-pointer border border-amber-100">
                      Link now
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── City bar ── */}
            {(userCity || pairStatus !== 'active') && (
              <div className="mt-5 flex items-center justify-center gap-2 bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl px-4 py-2.5 shadow-inner">
                <MapPin size={11} className="text-brand-purple shrink-0" />
                <span className="text-[11px] font-black text-slate-600 tracking-wide truncate">
                  {userCity || 'Set your city in settings'}
                </span>
                {pairStatus === 'active' && (
                  <button onClick={() => { setEditCity(userCity); setEditVibe(userVibe); setIsEditingStatus(true) }}
                    className="ml-auto shrink-0 text-[9px] font-black text-brand-purple active-pop">
                    Edit
                  </button>
                )}
              </div>
            )}

            {pairStatus !== 'active' && (
              <div className="mt-4 flex justify-center">
                <button onClick={() => navigate('/settings')}
                  className="text-xs font-black text-white bg-gradient-to-r from-brand-purple to-brand-cyan px-6 py-2.5 rounded-full flex items-center gap-2 shadow-md shadow-brand-purple/20 active-pop">
                  Link best friend now <Link2 size={12} className="animate-pulse" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ──────────────────────────────────
            QUICK STATS ROW
        ────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Tasks Done', value: `${completedShared}/${sharedTasks.length}`, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
            { label: 'Prayers', value: `${completedPrayers}/5`, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
            { label: 'Wish Items', value: String(totalGifts), color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' },
          ].map(({ label, value, color, bg, border }) => (
            <div key={label} className={`${bg} ${border} border rounded-3xl px-3 py-3.5 flex flex-col items-center gap-1 shadow-sm`}>
              <span className={`text-xl font-black ${color} leading-none`}>{value}</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider text-center leading-tight">{label}</span>
            </div>
          ))}
        </div>

        {/* ──────────────────────────────────
            WIDGET GRID — 2 cols
        ────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">

          {/* Tasks */}
          <button onClick={() => navigate('/tasks')}
            className="card-soft bg-white/80 border border-white/60 flex flex-col items-start hover:scale-[1.03] active-pop transition-all text-left shadow-glow-amber group relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-orange-400 opacity-80" />
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
              <CheckCircle2 className="text-amber-500" size={22} />
            </div>
            <h3 className="text-sm font-black text-slate-800">Tasks</h3>
            <p className="text-slate-400 mt-1 text-[11px] font-bold">{completedShared}/{sharedTasks.length} shared</p>
            {sharedTasks.length > 0 && (
              <div className="w-full mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-700"
                  style={{ width: `${sharedTasks.length > 0 ? (completedShared / sharedTasks.length) * 100 : 0}%` }} />
              </div>
            )}
          </button>

          {/* Songs */}
          <button onClick={() => navigate('/memories')}
            className="card-soft bg-white/80 border border-white/60 flex flex-col items-start hover:scale-[1.03] active-pop transition-all text-left shadow-glow-purple group relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-purple to-pink-500 opacity-80" />
            <div className="mb-4 relative">
              {songs[0] ? (
                <div className="w-11 h-11 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center shadow-lg animate-spin-slow relative overflow-hidden">
                  <div className="absolute inset-1 rounded-full border border-slate-700/40" />
                  <div className="absolute inset-2.5 rounded-full border border-slate-700/25" />
                  <div className="w-3.5 h-3.5 rounded-full bg-brand-purple flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-white" />
                  </div>
                </div>
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-brand-purple/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                  <Music className="text-brand-purple" size={22} />
                </div>
              )}
            </div>
            <h3 className="text-sm font-black text-slate-800">Song Gift</h3>
            <p className="text-slate-400 mt-1 text-[11px] font-bold truncate w-full">
              {songs[0] ? (songs[0].gifted_by === 'you' ? 'You sent a track' : `${partnerName} sent one`) : 'Send a track today!'}
            </p>
            {songs[0] && (
              <div className="w-full mt-2 flex items-center gap-1.5">
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 h-1.5 bg-brand-purple/70 rounded-full eq-bar-1" />
                  <span className="w-0.5 h-3 bg-brand-purple/70 rounded-full eq-bar-2" />
                  <span className="w-0.5 h-2 bg-brand-purple/70 rounded-full eq-bar-3" />
                </div>
                <p className="text-[9px] font-black text-brand-purple truncate">"{songs[0].title}"</p>
              </div>
            )}
          </button>
        </div>

        {/* ──────────────────────────────────
            WIDGET LIST — full width
        ────────────────────────────────── */}
        <div className="space-y-4">

          {/* Outing */}
          <button onClick={() => navigate('/memories')}
            className="card-soft w-full bg-white/80 border border-white/60 flex items-center justify-between hover:scale-[1.015] active-pop transition-all shadow-glow-cyan group relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-brand-cyan to-cyan-400 rounded-l-[32px]" />
            <div className="flex items-center z-10 pl-2">
              <div className="w-11 h-11 rounded-2xl bg-brand-cyan/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-inner">
                <Calendar className="text-brand-cyan" size={22} />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-black text-slate-800">Outing Planner</h3>
                <p className="text-slate-400 text-[11px] font-bold truncate max-w-[160px]">
                  {nextOuting ? nextOuting.title : 'Plan a hangout together'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 z-10">
              <span className="text-[10px] font-black text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/25 px-3 py-1.5 rounded-full uppercase tracking-wider">
                {getOutingDaysStr()}
              </span>
            </div>
          </button>

          {/* Gifts */}
          <button onClick={() => navigate('/gifts')}
            className="card-soft w-full bg-white/80 border border-white/60 flex items-center justify-between hover:scale-[1.015] active-pop transition-all shadow-glow-rose group relative overflow-hidden text-left">
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-rose-500 to-pink-500 rounded-l-[32px]" />
            <div className="flex items-center z-10 pl-2">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-inner">
                <Gift className="text-rose-500" size={22} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">Gifts We Love</h3>
                <p className="text-slate-400 text-[11px] font-bold">
                  {totalGifts > 0 ? `${totalGifts} items on the board` : 'Pin gift ideas together'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black text-rose-500 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-full uppercase tracking-wider z-10 flex items-center gap-1">
              <Zap size={9} />Ideas
            </span>
          </button>

          {/* Islamic / Prayer */}
          <button onClick={() => navigate('/islamic')}
            className="card-soft w-full bg-white/80 border border-white/60 flex flex-col hover:scale-[1.015] active-pop transition-all shadow-glow-green group relative overflow-hidden text-left">
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-l-[32px]" />
            <div className="flex items-center w-full justify-between pl-2">
              <div className="flex items-center">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-inner">
                  <BookOpen className="text-emerald-500" size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">Islamic Corner</h3>
                  <p className="text-slate-450 text-[11px] font-semibold">{completedPrayers}/5 prayers today</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mr-1">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className={`w-2 h-2 rounded-full border transition-all ${i < completedPrayers ? 'bg-emerald-500 border-emerald-400' : 'bg-white border-slate-200'}`} />
                ))}
              </div>
            </div>
            {getPrayerGrid()}
          </button>

          {/* Relationship Tree */}
          <button onClick={() => navigate('/tree')}
            className="card-soft w-full bg-white/80 border border-white/60 flex items-center justify-between hover:scale-[1.015] active-pop transition-all shadow-glow-indigo group relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-l-[32px]" />
            <div className="flex items-center pl-2">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-inner">
                <Network className="text-indigo-500" size={22} />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-black text-slate-800">Inner Circle Tree</h3>
                <p className="text-slate-400 text-[11px] font-bold">Manage friends & family</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mr-1">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 border border-white shadow-sm animate-pulse" />
              <div className="w-4 h-0.5 bg-indigo-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 border border-white shadow-sm" />
            </div>
          </button>

          {/* Hobbies */}
          <button onClick={() => navigate('/hobbies')}
            className="card-soft w-full bg-white/80 border border-white/60 flex flex-col items-start hover:scale-[1.015] active-pop transition-all text-left shadow-glow-rose group relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-rose-500 to-fuchsia-500 rounded-l-[32px]" />
            <div className="flex items-center w-full justify-between pl-2">
              <div className="flex items-center">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-inner">
                  <Smile className="text-rose-500" size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">Hobbies & Fun</h3>
                  <p className="text-slate-450 text-[11px] font-semibold truncate max-w-[140px]">
                    {activeHobby ? activeHobby.name : 'No active hobby'}
                  </p>
                </div>
              </div>
              <ChevronRight className="text-slate-400 group-hover:translate-x-1 transition-transform mr-1" size={16} />
            </div>
            {activeHobby && (
              <div className="w-full mt-4 space-y-1.5 pl-2">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-fuchsia-500 rounded-full transition-all duration-700"
                    style={{ width: `${activeHobby.steps.length > 0 ? Math.round((activeHobby.steps.filter(s => s.is_done).length / activeHobby.steps.length) * 100) : 0}%` }} />
                </div>
                <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase">
                  <span>{activeHobby.steps.filter(s => s.is_done).length}/{activeHobby.steps.length} Steps</span>
                  <span>{activeHobby.steps.length > 0 ? Math.round((activeHobby.steps.filter(s => s.is_done).length / activeHobby.steps.length) * 100) : 0}%</span>
                </div>
              </div>
            )}
          </button>
        </div>
      </main>

      {/* ── Edit Vibe Modal ── */}
      {isEditingStatus && createPortal(
        <div className="fixed inset-0 bg-brand-dark/45 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-slide-up border border-slate-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-extrabold text-xl text-brand-dark">Set Vibe & City</h3>
              <button onClick={() => setIsEditingStatus(false)}
                className="text-brand-gray font-bold text-sm bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200 active-pop">
                Cancel
              </button>
            </div>
            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">City Location</label>
                <input type="text" required placeholder="e.g. Cairo, Egypt" value={editCity} onChange={(e) => setEditCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-purple font-semibold text-brand-dark text-sm" autoFocus />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Current Vibe</label>
                <input type="text" placeholder="What are you doing right now?" value={editVibe} onChange={(e) => setEditVibe(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-purple font-semibold text-brand-dark text-sm" />
                <div className="flex gap-1.5 flex-wrap pt-2">
                  {PRESET_VIBES.map((v) => (
                    <button key={v} type="button" onClick={() => setEditVibe(v)}
                      className={`text-[10px] font-extrabold px-3 py-1 rounded-full border transition-all active-pop ${editVibe === v ? 'bg-brand-purple/10 border-brand-purple/20 text-brand-purple' : 'bg-white border-slate-100 text-slate-400'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={savingStatus}
                className="w-full py-3.5 bg-gradient-to-r from-brand-purple to-brand-cyan text-white font-extrabold rounded-2xl text-xs shadow-md flex items-center justify-center gap-1.5 active-pop disabled:opacity-50">
                {savingStatus ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save size={13} /><span>Update Status</span></>}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {selectedSongMsg && createPortal(
        <div className="fixed inset-0 bg-brand-dark/45 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-[36px] w-full max-w-sm p-6 shadow-2xl border border-white/60 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-brand-purple/10 flex items-center justify-center mx-auto">
              <Music className="text-brand-purple" size={28} />
            </div>
            <p className="text-sm font-semibold text-slate-700">{selectedSongMsg}</p>
            <button onClick={() => setSelectedSongMsg(null)}
              className="px-6 py-2.5 bg-brand-purple text-white rounded-full font-black text-xs active-pop">
              Close
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
