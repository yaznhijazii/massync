import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { CheckCircle2, Music, Calendar, BookOpen, Smile, MapPin, Plus, Settings, User, Heart, Lock, Link2, Sparkles, Network } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const {
    tasks,
    memories,
    songs,
    myPrayers,
    hobbies,
    userName,
    partnerName,
    userCity,
    partnerCity,
    userAvatar,
    partnerAvatar,
    userVibe,
    partnerVibe,
    friendshipDuration,
    pairStatus,
    dbError
  } = useAppStore()

  // Calculate dynamic stats
  const sharedTasks = tasks.filter((t) => t.category === 'shared')
  const completedShared = sharedTasks.filter((t) => t.is_done).length

  const activeHobby = hobbies.find((h) => h.status === 'active')

  const nextOuting = memories
    .filter((m) => m.type === 'outing' && new Date(m.date) >= new Date(new Date().setHours(0,0,0,0)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

  // Calculate remaining days for outing
  const getOutingDaysStr = () => {
    if (!nextOuting) return 'No outing planned'
    const diff = new Date(nextOuting.date).getTime() - new Date().setHours(0,0,0,0)
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Outing today!'
    if (days === 1) return 'Tomorrow!'
    return `In ${days} days`
  }

  // Calculate prayer status summary
  const completedPrayers = Object.values(myPrayers).filter(Boolean).length
  const prayerSummary = `${completedPrayers}/5 Prayers done`

  return (
    <div className="relative pb-28 animate-fade-in">
      {/* Frosted Top Navigation Bar */}
      <header className="pt-12 pb-4 px-6 flex justify-between items-center bg-transparent z-20 relative">
        <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md border border-white/50 bg-white/80 backdrop-blur-md flex items-center justify-center transition-transform hover:scale-105 active-pop">
          <img src="/logo.png" className="w-8 h-8 object-cover" alt="Logo" />
        </div>
        
        <div className="flex items-center space-x-2">
          {pairStatus === 'active' && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-2xl flex items-center space-x-1.5 shadow-[0_4px_12px_rgba(16,185,129,0.06)] text-[10px] font-black text-emerald-600 uppercase tracking-wider bg-white/40 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse"></span>
              <span>Synced</span>
            </div>
          )}
          <button
            onClick={() => navigate('/settings')}
            className="w-10 h-10 rounded-2xl bg-white/70 backdrop-blur-md border border-white/45 flex items-center justify-center text-slate-500 hover:text-brand-purple active-pop shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all hover:scale-105"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 space-y-6">
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
        
        {/* The "Us" Hero Card (Enhanced Glassmorphism) */}
        <section 
          onClick={() => pairStatus !== 'active' && navigate('/settings')}
          className={`relative overflow-hidden bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_20px_40px_rgba(0,0,0,0.03)] rounded-[36px] p-6 flex flex-col items-center justify-center transition-all duration-300 ${pairStatus !== 'active' ? 'cursor-pointer hover:border-brand-purple/25 hover:shadow-lg' : ''}`}
        >
          {/* Animated gradient top bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-cyan via-brand-purple to-pink-500 opacity-90"></div>
          
          <div className="w-full flex justify-between items-center relative mt-3 px-1">
            
            {/* You */}
            <div className="flex flex-col items-center space-y-3.5 z-10 w-[30%]">
              <div className="relative">
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-brand-cyan to-brand-purple rounded-full blur-[4px] opacity-40 animate-pulse"></div>
                <div className="relative w-18 h-18 rounded-full border-[3px] border-white shadow-md overflow-hidden bg-slate-50 flex items-center justify-center">
                  {userAvatar ? (
                    <img src={userAvatar} className="w-full h-full object-cover" alt={userName} />
                  ) : (
                    <User size={28} className="text-slate-400" />
                  )}
                </div>
                <div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-brand-green border-[2.5px] border-white rounded-full shadow-sm z-10"></div>
              </div>
              <div className="text-center w-full">
                <p className="text-sm font-black text-brand-dark truncate">{userName || 'You'}</p>
                
                {/* Location */}
                <div className="flex items-center justify-center text-[10px] font-bold text-slate-400 mt-1 select-none">
                  <MapPin size={9} className="mr-0.5 text-brand-cyan shrink-0" />
                  <span className="truncate max-w-[70px]">{userCity || 'Earth'}</span>
                </div>
                
                {/* User Vibe Status */}
                {userVibe && (
                  <span className="inline-block text-[9px] font-extrabold text-brand-purple bg-brand-purple/10 border border-brand-purple/10 px-2 py-0.5 rounded-full mt-2 select-none animate-fade-in shadow-inner max-w-full truncate">
                    {userVibe}
                  </span>
                )}
              </div>
            </div>

            {/* Connection Curved Line with Pulsating Center */}
            <div className="flex-1 flex flex-col items-center px-1 z-0 -mt-10 relative">
              <svg className="w-full h-12" fill="none" viewBox="0 0 100 30" preserveAspectRatio="none">
                <path 
                  d="M0,15 Q50,30 100,15" 
                  stroke={pairStatus === 'active' ? 'url(#active-grad)' : 'url(#pending-grad)'} 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  strokeDasharray={pairStatus === 'active' ? 'none' : '4 4'}
                  className={pairStatus === 'active' ? 'animate-dash' : ''}
                />
                <defs>
                  <linearGradient id="active-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00BCD4" />
                    <stop offset="50%" stopColor="#A855F7" />
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
                  <div className="w-9 h-9 rounded-full bg-white/90 border border-white/80 flex items-center justify-center shadow-lg shadow-rose-500/10 backdrop-blur-md transition-transform hover:scale-110 active-pop">
                    <Heart size={15} className="text-rose-500 fill-rose-500 animate-pulse" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-100/80 flex items-center justify-center shadow-lg animate-pulse">
                    <Lock size={13} className="text-amber-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Friend */}
            <div className="flex flex-col items-center space-y-3.5 z-10 w-[30%]">
              <div className="relative">
                {pairStatus === 'active' && (
                  <div className="absolute -inset-1.5 bg-gradient-to-tr from-brand-purple to-brand-cyan rounded-full blur-[4px] opacity-40 animate-pulse"></div>
                )}
                <div className="w-18 h-18 rounded-full border-[3px] border-white shadow-md overflow-hidden bg-slate-50 flex items-center justify-center">
                  {pairStatus === 'active' ? (
                    partnerAvatar ? (
                      <img src={partnerAvatar} className="w-full h-full object-cover" alt={partnerName} />
                    ) : (
                      <User size={28} className="text-slate-400" />
                    )
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-slate-55 to-slate-100 flex items-center justify-center">
                      <Plus size={22} className="text-slate-400 animate-pulse" />
                    </div>
                  )}
                </div>
                <div className={`absolute bottom-0.5 right-0.5 w-4 h-4 border-[2.5px] border-white rounded-full shadow-sm z-10 ${pairStatus === 'active' ? 'bg-slate-300' : 'bg-amber-400 animate-pulse'}`}></div>
              </div>
              <div className="text-center w-full">
                <p className="text-sm font-black text-brand-dark truncate">
                  {pairStatus === 'active' ? partnerName : 'No Friend'}
                </p>
                
                {/* Location */}
                {pairStatus === 'active' && (
                  <div className="flex items-center justify-center text-[10px] font-bold text-slate-400 mt-1 select-none">
                    <MapPin size={9} className="mr-0.5 text-brand-cyan shrink-0" />
                    <span className="truncate max-w-[70px]">{partnerCity || 'Earth'}</span>
                  </div>
                )}
                
                {/* Partner Vibe Status */}
                {pairStatus === 'active' && partnerVibe ? (
                  <span className="inline-block text-[9px] font-extrabold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/10 px-2 py-0.5 rounded-full mt-2 select-none animate-fade-in shadow-inner max-w-full truncate">
                    {partnerVibe}
                  </span>
                ) : pairStatus !== 'active' ? (
                  <span className="inline-block text-[9px] font-extrabold uppercase bg-amber-50 text-amber-500 px-2 py-0.5 rounded-full mt-1.5 animate-pulse">
                    Link now
                  </span>
                ) : null}
              </div>
            </div>

          </div>

          {/* Friendship Duration Footer */}
          <div className="w-full mt-6 pt-4 border-t border-slate-100/40 flex justify-center">
            {pairStatus === 'active' ? (
              <span className="text-[10px] font-extrabold text-slate-400 bg-slate-50/50 px-4 py-1.5 rounded-full border border-slate-100/30 select-none tracking-wide uppercase flex items-center gap-1.5">
                <span>{friendshipDuration}</span>
                <Sparkles size={11} className="text-brand-purple fill-brand-purple/10 animate-pulse" />
              </span>
            ) : (
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  navigate('/settings')
                }}
                className="text-xs font-black text-white bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-95 active-pop px-6 py-2.5 rounded-full flex items-center space-x-1.5 transition-all shadow-md shadow-brand-purple/20 hover:scale-[1.02]"
              >
                <span>Link best friend now</span>
                <Link2 size={12} className="animate-pulse" />
              </button>
            )}
          </div>
        </section>

        {/* Quick Widgets Grid */}
        <div className="grid grid-cols-2 gap-5">
          {/* Tasks Widget */}
          <button
            onClick={() => navigate('/tasks')}
            className="card-soft bg-white/70 backdrop-blur-xl border border-white/50 flex flex-col items-start hover:scale-[1.03] active-pop transition-all text-left shadow-[0_12px_24px_rgba(0,0,0,0.02)] group"
          >
            <div className="w-11 h-11 rounded-2xl bg-brand-amber/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <CheckCircle2 className="text-brand-amber animate-pulse" size={22} />
            </div>
            <h3 className="text-base font-black text-brand-dark">Tasks</h3>
            <p className="text-slate-400 mt-1 text-[11px] font-bold">
              {completedShared}/{sharedTasks.length} Shared Done
            </p>
          </button>

          {/* Music Widget */}
          <button
            onClick={() => navigate('/hobbies')}
            className="card-soft bg-white/70 backdrop-blur-xl border border-white/50 flex flex-col items-start hover:scale-[1.03] active-pop transition-all text-left shadow-[0_12px_24px_rgba(0,0,0,0.02)] group"
          >
            <div className="w-11 h-11 rounded-2xl bg-brand-purple/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <Music className="text-brand-purple" size={22} />
            </div>
            <h3 className="text-base font-black text-brand-dark">Song Gift</h3>
            <p className="text-slate-400 mt-1 text-[11px] font-bold truncate w-full">
              {songs[0] ? `"${songs[0].title}"` : 'Gift a song!'}
            </p>
          </button>
        </div>

        {/* Wide Widgets */}
        <div className="space-y-5">
          
          {/* Outing Widget */}
          <button
            onClick={() => navigate('/memories')}
            className="card-soft w-full bg-white/70 backdrop-blur-xl border border-white/50 flex items-center justify-between hover:scale-[1.01] active-pop transition-all shadow-[0_12px_24px_rgba(0,0,0,0.02)] group"
          >
            <div className="flex items-center">
              <div className="w-11 h-11 rounded-2xl bg-brand-cyan/10 flex items-center justify-center mr-4 transition-transform group-hover:scale-110">
                <Calendar className="text-brand-cyan" size={22} />
              </div>
              <div className="text-left">
                <h3 className="text-base font-black text-brand-dark">Next Outing</h3>
                <p className="text-slate-400 text-[11px] font-bold">
                  {nextOuting ? nextOuting.title : 'Plan a hangout'}
                </p>
              </div>
            </div>
            <div className="pill pill-outline font-black px-3.5 py-1.5 border-brand-cyan/30 text-brand-cyan text-[11px]">
              {getOutingDaysStr()}
            </div>
          </button>

          {/* Islamic Corner Widget */}
          <button
            onClick={() => navigate('/islamic')}
            className="card-soft w-full bg-white/70 backdrop-blur-xl border border-white/50 flex items-center justify-between hover:scale-[1.01] active-pop transition-all shadow-[0_12px_24px_rgba(0,0,0,0.02)] group"
          >
            <div className="flex items-center">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center mr-4 transition-transform group-hover:scale-110">
                <BookOpen className="text-emerald-500" size={22} />
              </div>
              <div className="text-left">
                <h3 className="text-base font-black text-brand-dark">Islamic Corner</h3>
                <p className="text-slate-400 text-[11px] font-bold">{prayerSummary}</p>
              </div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 shadow-lg shadow-emerald-500/50 animate-pulse"></div>
          </button>
          
          {/* Inner Circle / Relationship Tree Widget */}
          <button
            onClick={() => navigate('/tree')}
            className="card-soft w-full bg-white/70 backdrop-blur-xl border border-white/50 flex items-center justify-between hover:scale-[1.01] active-pop transition-all shadow-[0_12px_24px_rgba(0,0,0,0.02)] group"
          >
            <div className="flex items-center">
              <div className="w-11 h-11 rounded-2xl bg-indigo-550/10 flex items-center justify-center mr-4 transition-transform group-hover:scale-110">
                <Network className="text-indigo-550" size={22} />
              </div>
              <div className="text-left">
                <h3 className="text-base font-black text-brand-dark">Inner Circle Tree</h3>
                <p className="text-slate-400 text-[11px] font-bold">
                  View friends & family circles
                </p>
              </div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-2 shadow-lg shadow-indigo-500/50 animate-pulse"></div>
          </button>

          {/* Current Hobby Widget */}
          <button
            onClick={() => navigate('/hobbies')}
            className="card-soft w-full bg-white/70 backdrop-blur-xl border border-white/50 flex flex-col items-start hover:scale-[1.01] active-pop transition-all text-left shadow-[0_12px_24px_rgba(0,0,0,0.02)] group"
          >
            <div className="flex items-center w-full justify-between">
              <div className="flex items-center">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/10 flex items-center justify-center mr-4 transition-transform group-hover:scale-110">
                  <Smile className="text-rose-500" size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-brand-dark">Shared Hobby</h3>
                  <p className="text-slate-400 text-[11px] font-bold">
                    {activeHobby ? activeHobby.name : 'No active hobby'}
                  </p>
                </div>
              </div>
            </div>
            {activeHobby && (
              <div className="flex gap-2 mt-4">
                 <span className="pill bg-brand-cyan/10 text-brand-cyan font-bold text-[10px] px-2.5 py-0.5">Calligraphy</span>
                 <span className="pill bg-brand-amber/10 text-brand-amber font-bold text-[10px] px-2.5 py-0.5">Art</span>
              </div>
            )}
          </button>
        </div>

      </main>
    </div>
  )
}
