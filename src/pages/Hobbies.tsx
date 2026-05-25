import { useState, useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Play, Square, Plus, Search, Radio, Music, Film, Check, Trash2, Smile, BookOpen, Sprout, Disc, Target } from 'lucide-react'

export default function Hobbies() {
  const {
    hobbies,
    watchlist,
    songs,
    partnerName,
    dailyChallengeDone,
    addHobby,
    toggleHobbyStep,
    addWatchItem,
    toggleWatchItem,
    deleteWatchItem,
    giftSong,
    completeDailyChallenge,
    fetchHobbies,
    fetchSongs
  } = useAppStore()

  useEffect(() => {
    fetchHobbies().catch(() => {})
    fetchSongs()
  }, [fetchHobbies, fetchSongs])

  const [activeTab, setActiveTab] = useState<'hobbies' | 'music' | 'entertainment'>('hobbies')

  // Hobby Add Form state
  const [isAddingHobby, setIsAddingHobby] = useState(false)
  const [hobbyName, setHobbyName] = useState('')
  const [hobbyDesc, setHobbyDesc] = useState('')
  const [hobbyCover, setHobbyCover] = useState('')
  const [hobbyGoalDate, setHobbyGoalDate] = useState('')
  const [step1, setStep1] = useState('')
  const [step2, setStep2] = useState('')

  // Watchlist Form state
  const [isAddingWatch, setIsAddingWatch] = useState(false)
  const [watchTitle, setWatchTitle] = useState('')
  const [watchCategory, setWatchCategory] = useState('Movie')
  const [watchType, setWatchType] = useState<'watch' | 'bucket'>('watch')
  const [bucketPriority, setBucketPriority] = useState<'High' | 'Medium' | 'Low'>('Medium')

  // Song Gift state
  const [isGiftingSong, setIsGiftingSong] = useState(false)
  const [songTitle, setSongTitle] = useState('')
  const [songArtist, setSongArtist] = useState('')
  const [songMessage, setSongMessage] = useState('')

  // Radio Browser API search state
  const [radioSearch, setRadioSearch] = useState('')
  const [radioResults, setRadioResults] = useState<any[]>([])
  const [isSearchingRadio, setIsSearchingRadio] = useState(false)
  const [activeStationUrl, setActiveStationUrl] = useState<string | null>(null)
  const [activeStationName, setActiveStationName] = useState<string | null>(null)

  // Audio object helper
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  // Search radio stations
  const handleRadioSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!radioSearch.trim()) return
    setIsSearchingRadio(true)
    try {
      const res = await fetch(`https://de1.api.radio-browser.info/json/stations/search?name=${encodeURIComponent(radioSearch)}&limit=10&hidebroken=true`)
      const data = await res.json()
      setRadioResults(data)
    } catch (err) {
      console.log('Error searching radio stations:', err)
    } finally {
      setIsSearchingRadio(false)
    }
  }

  // Play radio stream
  const handlePlayStation = (url: string, name: string) => {
    if (audioElement) {
      audioElement.pause()
    }

    if (activeStationUrl === url) {
      // Toggle off
      setActiveStationUrl(null)
      setActiveStationName(null)
      setAudioElement(null)
      return
    }

    const audio = new Audio(url)
    audio.play().catch(e => console.log('Audio playback error: ', e))
    setAudioElement(audio)
    setActiveStationUrl(url)
    setActiveStationName(name)
  }

  // Stop radio stream
  const handleStopStation = () => {
    if (audioElement) {
      audioElement.pause()
    }
    setActiveStationUrl(null)
    setActiveStationName(null)
    setAudioElement(null)
  }

  const handleAddHobby = (e: React.FormEvent) => {
    e.preventDefault()
    if (!hobbyName.trim()) return

    const steps = []
    if (step1.trim()) steps.push({ id: `step-${Date.now()}-1`, title: step1.trim(), is_done: false })
    if (step2.trim()) steps.push({ id: `step-${Date.now()}-2`, title: step2.trim(), is_done: false })

    addHobby({
      name: hobbyName,
      description: hobbyDesc,
      cover_image: hobbyCover || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80',
      start_date: new Date().toISOString().split('T')[0],
      goal_date: hobbyGoalDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      steps,
      notes: [],
      photos: []
    })

    setHobbyName('')
    setHobbyDesc('')
    setHobbyCover('')
    setHobbyGoalDate('')
    setStep1('')
    setStep2('')
    setIsAddingHobby(false)
  }

  const handleAddWatch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!watchTitle.trim()) return

    addWatchItem({
      type: watchType,
      title: watchTitle,
      category: watchCategory,
      status: watchType === 'watch' ? 'Want to Watch' : 'Pending',
      priority: watchType === 'bucket' ? bucketPriority : undefined
    })

    setWatchTitle('')
    setIsAddingWatch(false)
  }

  const handleGiftSong = (e: React.FormEvent) => {
    e.preventDefault()
    if (!songTitle.trim() || !songArtist.trim()) return

    giftSong({
      title: songTitle,
      artist: songArtist,
      message: songMessage
    })

    setSongTitle('')
    setSongArtist('')
    setSongMessage('')
    setIsGiftingSong(false)
  }

  // Separate watchlist items
  const watchItems = watchlist.filter(w => w.type === 'watch')
  const bucketItems = watchlist.filter(w => w.type === 'bucket')

  return (
    <div className="relative pb-28 pt-14 px-6 min-h-screen animate-fade-in">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-500/10 border border-rose-500/20 px-3.5 py-1.5 rounded-full select-none inline-flex items-center gap-1.5">
            <span>Grow & Play Hub</span>
            <Target size={11} className="text-rose-500" />
          </span>
          <h1 className="text-4xl font-extrabold text-brand-dark mt-3.5 tracking-tight">
            Hobbies & Fun
          </h1>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-rose-500/5 border border-rose-500/20 shadow-sm flex items-center justify-center relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 to-pink-500/5 opacity-50" />
          <Smile className="text-rose-500 fill-rose-500/10 relative z-10" size={20} strokeWidth={2.5} />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex bg-slate-100/60 backdrop-blur-md p-1 rounded-2xl mb-6 border border-slate-200/50">
        {(['hobbies', 'music', 'entertainment'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-2 rounded-xl font-black text-xs uppercase tracking-wide transition-all duration-200 active-pop flex items-center justify-center gap-1.5 ${
              activeTab === tab
                ? 'bg-white text-brand-dark shadow-sm border border-slate-100/50'
                : 'text-slate-400 hover:text-slate-655'
            }`}
          >
            {tab === 'hobbies' && <Sprout size={13} />}
            {tab === 'music' && <Music size={13} />}
            {tab === 'entertainment' && <Film size={13} />}
            {tab === 'hobbies' ? 'Hobbies' : tab === 'music' ? 'Music' : 'Outings'}
          </button>
        ))}
      </div>

      {/* 1. Hobbies Tab */}
      {activeTab === 'hobbies' && (
        <div className="space-y-6">
          {hobbies.length === 0 ? (
            <p className="text-center py-8 text-[11px] font-bold text-slate-400 select-none">No active hobbies. Create the first one! 🌱</p>
          ) : (
            hobbies.map((hobby) => (
              <div key={hobby.id} className="card-soft bg-white/70 border border-white/50 p-5 space-y-4 shadow-soft">
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-inner border border-slate-50">
                  <img src={hobby.cover_image} alt={hobby.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <div>
                      <span className="text-[9px] font-black uppercase bg-brand-cyan text-white px-2 py-0.5 rounded-md select-none">Active Hobby</span>
                      <h3 className="text-lg font-black text-white mt-1.5 leading-tight">{hobby.name}</h3>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-450 font-bold leading-relaxed">{hobby.description}</p>

                {/* Progress Milestones Checklist */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-extrabold text-xs text-brand-dark">Shared Milestones</h4>
                  <div className="space-y-2">
                    {hobby.steps.map((step) => (
                      <button
                        key={step.id}
                        onClick={() => toggleHobbyStep(hobby.id, step.id)}
                        className="w-full flex items-center space-x-3 text-left p-2.5 rounded-xl hover:bg-slate-50/50 transition-colors"
                      >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                          step.is_done ? 'bg-brand-cyan border-brand-cyan text-white shadow-sm' : 'border-slate-300 bg-white'
                        }`}>
                          {step.is_done && <Check size={11} strokeWidth={4} />}
                        </div>
                        <span className={`text-xs font-semibold ${
                          step.is_done ? 'line-through text-slate-400 font-medium' : 'text-brand-dark'
                        }`}>{step.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add progress note or photo form */}
                <div className="pt-4 border-t border-slate-100/50 flex justify-between text-[9px] font-black text-slate-400 select-none">
                  <span>Start: {new Date(hobby.start_date).toLocaleDateString()}</span>
                  <span>Goal: {new Date(hobby.goal_date).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}

          <button
            onClick={() => setIsAddingHobby(true)}
            className="w-full py-4 card-soft border border-dashed border-slate-200 text-center font-bold text-slate-450 hover:text-brand-purple hover:border-brand-purple/45 flex items-center justify-center bg-white/40 active-pop text-xs"
          >
            <Plus size={16} className="mr-2 animate-pulse" /> Add a Shared Hobby
          </button>
        </div>
      )}

      {/* 2. Music & Radio Tab */}
      {activeTab === 'music' && (
        <div className="space-y-6">
          {/* Song of the Day - Premium Vinyl Style */}
          <section className="card-soft bg-gradient-to-tr from-brand-purple/15 via-pink-500/5 to-sky-500/5 border border-brand-purple/20 p-5 relative overflow-hidden shadow-soft">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <span className="text-[9px] font-black uppercase bg-brand-purple/20 text-brand-purple px-2 py-0.5 rounded-md select-none border border-brand-purple/10">Song of the Day</span>
                {songs[0] ? (
                  <div className="mt-3.5 flex items-center space-x-4">
                    {/* Spin Vinyl CD Record Visual */}
                    <div className="relative w-20 h-20 rounded-full bg-slate-950 border border-slate-800 shadow-lg flex items-center justify-center shrink-0 overflow-hidden animate-spin-slow">
                      <div className="absolute inset-2 border-[4px] border-slate-900 border-dashed rounded-full" />
                      <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                        <Disc className="text-white opacity-40" size={12} />
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <h3 className="font-black text-base text-brand-dark leading-tight">{songs[0].title}</h3>
                      <p className="text-xs text-slate-400 font-bold">{songs[0].artist}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 mt-2 font-bold leading-relaxed">No song gifted yet today. Select a special song for {partnerName}!</p>
                )}
              </div>
              <Music className="text-brand-purple" size={26} />
            </div>

            {songs[0] && (
              <div className="mt-4 bg-white/50 border border-white/80 p-3 rounded-2xl shadow-inner text-xs text-slate-500 leading-relaxed font-semibold">
                "{songs[0].message}"
              </div>
            )}

            {/* Custom music player slider bar */}
            {songs[0] && (
              <div className="mt-4 flex items-center space-x-3 select-none">
                <span className="text-[9px] font-black text-slate-400 font-mono">0:45</span>
                <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-purple rounded-full" style={{ width: '33%' }}></div>
                </div>
                <span className="text-[9px] font-black text-slate-400 font-mono">3:12</span>
              </div>
            )}

            <button
              onClick={() => setIsGiftingSong(true)}
              className="mt-5 w-full py-3 bg-brand-purple text-white font-extrabold rounded-2xl text-xs hover:shadow-lg hover:shadow-brand-purple/20 transition-all flex items-center justify-center gap-1.5 active-pop shadow-md shadow-brand-purple/10"
            >
              <Music size={13} />
              <span>Gift {partnerName} a Song</span>
            </button>
          </section>

          {/* Radio Station Browser */}
          <section className="card-soft bg-white/70 border border-white/50 shadow-soft">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Radio size={18} className="text-brand-cyan" />
                <h3 className="font-black text-base text-brand-dark">Sync Radio</h3>
              </div>
              
              {/* Radio visualizer jumping bars */}
              {activeStationUrl && (
                <div className="flex items-end space-x-0.5 h-4 select-none pr-1">
                  <span className="w-0.5 bg-brand-cyan rounded-full h-full origin-bottom eq-bar-1" />
                  <span className="w-0.5 bg-brand-cyan rounded-full h-full origin-bottom eq-bar-2" />
                  <span className="w-0.5 bg-brand-cyan rounded-full h-full origin-bottom eq-bar-3" />
                  <span className="w-0.5 bg-brand-cyan rounded-full h-full origin-bottom eq-bar-4" />
                  <span className="w-0.5 bg-brand-cyan rounded-full h-full origin-bottom eq-bar-5" />
                </div>
              )}
            </div>

            {/* Audio Stream Control bar if playing */}
            {activeStationUrl && (
              <div className="bg-brand-cyan/5 border border-brand-cyan/15 px-4 py-3 rounded-2xl flex items-center justify-between mb-4 shadow-inner">
                <div className="flex items-center space-x-3.5">
                  <div className="w-7 h-7 rounded-full bg-brand-cyan/15 flex items-center justify-center shadow-sm">
                    <Play size={12} className="text-brand-cyan fill-brand-cyan" />
                  </div>
                  <div className="text-[11px] font-bold text-slate-500">
                    Live: <span className="text-brand-cyan font-black">{activeStationName}</span>
                  </div>
                </div>
                <button
                  onClick={handleStopStation}
                  className="text-[9px] font-black text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100 hover:bg-rose-100 active-pop uppercase"
                >
                  Stop
                </button>
              </div>
            )}

            <form onSubmit={handleRadioSearch} className="flex space-x-2">
              <input
                type="text"
                placeholder="Search stations e.g. Quran, Classical..."
                value={radioSearch}
                onChange={(e) => setRadioSearch(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-brand-cyan font-semibold text-brand-dark"
              />
              <button
                type="submit"
                className="px-3.5 bg-brand-cyan text-white rounded-xl text-sm font-bold flex items-center hover:scale-95 transition-transform shadow-md shadow-brand-cyan/10"
              >
                <Search size={14} />
              </button>
            </form>

            <div className="space-y-2 mt-4 max-h-60 overflow-y-auto pr-1">
              {isSearchingRadio && <p className="text-center text-[10px] text-slate-400 py-4 font-bold select-none uppercase tracking-wide">Searching stations...</p>}
              {radioResults.map((station, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50/50 border border-slate-50 transition-colors">
                  <div className="w-[75%]">
                    <p className="text-xs font-black text-brand-dark truncate">{station.name}</p>
                    <p className="text-[9px] text-slate-450 font-bold truncate">{station.country} • {station.tags?.split(',').slice(0,2).join(', ')}</p>
                  </div>
                  <button
                    onClick={() => handlePlayStation(station.url_resolved, station.name)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
                      activeStationUrl === station.url_resolved
                        ? 'bg-rose-500 text-white shadow-rose-500/25 scale-95'
                        : 'bg-brand-cyan/10 text-brand-cyan'
                    }`}
                  >
                    {activeStationUrl === station.url_resolved ? <Square size={10} fill="white" /> : <Play size={10} className="ml-0.5" fill="currentColor" />}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Past gifted songs log */}
          <section className="card-soft bg-white/70 border border-white/50 shadow-soft">
            <h3 className="font-black text-sm text-brand-dark mb-4 pb-2 border-b border-slate-100">Past Gifted Songs</h3>
            <div className="space-y-4">
              {songs.length === 0 ? (
                <p className="text-center py-4 text-xs text-slate-400 font-semibold select-none">No past songs gifted.</p>
              ) : (
                songs.map((song) => (
                  <div key={song.id} className="flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-center shadow-sm shrink-0">
                      <Music size={16} className="text-slate-400" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-extrabold text-xs text-brand-dark leading-tight">{song.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold">{song.artist}</p>
                      <p className="text-[11px] text-slate-500 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 font-bold italic">
                        "{song.message}"
                      </p>
                      <span className="text-[9px] font-black text-slate-400 mt-1 block">
                        Gifted by {song.gifted_by === 'you' ? 'you' : partnerName} • {song.gifted_at}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {/* 3. Entertainment / Outings & Fun Tab */}
      {activeTab === 'entertainment' && (
        <div className="space-y-6">
          {/* Daily Challenge card */}
          <section className="card-soft bg-gradient-to-r from-teal-500 to-emerald-600 text-white relative overflow-hidden shadow-soft">
            <div className="absolute right-[-10px] bottom-[-20px] opacity-10">
              <Target size={110} />
            </div>
            <span className="text-[9px] font-black uppercase bg-white/20 text-white px-2 py-0.5 rounded border border-white/5 select-none">Daily mini-challenge</span>
            <h3 className="font-extrabold text-base text-white mt-2.5">Take a photo of what you're eating right now!</h3>
            <p className="text-white/80 text-[11px] mt-1 font-semibold">Send a quick snap to share your moment.</p>

            {dailyChallengeDone ? (
              <div className="mt-4 bg-white/20 border border-white/30 px-3 py-2 rounded-xl flex items-center justify-center space-x-2 font-bold text-xs select-none">
                <Check size={14} strokeWidth={3} />
                <span>Challenge Completed!</span>
              </div>
            ) : (
              <button
                onClick={completeDailyChallenge}
                className="mt-4 px-4 py-2 bg-white text-emerald-800 rounded-xl text-xs font-black hover:scale-95 transition-transform"
              >
                Complete Challenge
              </button>
            )}
          </section>

          {/* Watchlist Section */}
          <section className="card-soft bg-white/70 border border-white/50 shadow-soft">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Film size={18} className="text-brand-purple" />
                <h3 className="font-black text-sm text-brand-dark">Our Watchlist</h3>
              </div>
              <button
                onClick={() => {
                  setWatchType('watch')
                  setIsAddingWatch(true)
                }}
                className="text-[10px] font-black text-brand-purple bg-brand-purple/10 px-2.5 py-1.5 rounded-xl uppercase"
              >
                Add Movie
              </button>
            </div>

            <div className="space-y-2">
              {watchItems.length === 0 ? (
                <p className="text-center py-4 text-xs text-slate-400 font-semibold select-none">Watchlist is empty.</p>
              ) : (
                watchItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50 group shadow-inner">
                    <div className="w-[60%]">
                      <h4 className="font-bold text-xs text-brand-dark truncate">{item.title}</h4>
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase">{item.category} • added by {item.added_by === 'you' ? 'you' : partnerName}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleWatchItem(item.id)}
                        className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border transition-all ${
                          item.status === 'Done'
                            ? 'bg-brand-green/10 border-brand-green/20 text-brand-green'
                            : item.status === 'Watching'
                            ? 'bg-brand-purple/10 border-brand-purple/20 text-brand-purple'
                            : 'bg-white border-slate-200 text-slate-400'
                        }`}
                      >
                        {item.status}
                      </button>
                      <button
                        onClick={() => deleteWatchItem(item.id)}
                        className="text-slate-300 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Bucket List Section */}
          <section className="card-soft bg-white/70 border border-white/50 shadow-soft">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <BookOpen size={18} className="text-brand-cyan" />
                <h3 className="font-black text-sm text-brand-dark">Our Bucket List</h3>
              </div>
              <button
                onClick={() => {
                  setWatchType('bucket')
                  setIsAddingWatch(true)
                }}
                className="text-[10px] font-black text-brand-cyan bg-brand-cyan/10 px-2.5 py-1.5 rounded-xl uppercase"
              >
                Add Item
              </button>
            </div>

            <div className="space-y-2">
              {bucketItems.length === 0 ? (
                <p className="text-center py-4 text-xs text-slate-400 font-semibold select-none">Bucket list is empty.</p>
              ) : (
                bucketItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50 group shadow-inner">
                    <div className="w-[60%]">
                      <h4 className="font-bold text-xs text-brand-dark truncate">{item.title}</h4>
                      <div className="flex items-center space-x-2 mt-1 select-none">
                        <span className="text-[9px] text-slate-450 font-bold">{item.category}</span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md border ${
                          item.priority === 'High' ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-slate-50 border-slate-100 text-slate-400'
                        }`}>{item.priority} Priority</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleWatchItem(item.id)}
                        className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border transition-all ${
                          item.status === 'Completed'
                            ? 'bg-brand-green/10 border-brand-green/20 text-brand-green'
                            : 'bg-white border-slate-200 text-slate-400'
                        }`}
                      >
                        {item.status}
                      </button>
                      <button
                        onClick={() => deleteWatchItem(item.id)}
                        className="text-slate-300 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {/* Floating Modal: Add Shared Hobby */}
      {isAddingHobby && (
        <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 max-h-[100vh] overflow-y-auto">
          <div className="bg-white rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-slide-up border border-slate-100 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-extrabold text-xl text-brand-dark">Start a New Shared Hobby</h3>
              <button onClick={() => setIsAddingHobby(false)} className="text-brand-gray font-bold text-sm bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200">
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddHobby} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Hobby Name</label>
                <input
                  type="text"
                  placeholder="e.g. Arabic Calligraphy"
                  value={hobbyName}
                  onChange={(e) => setHobbyName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-purple focus:outline-none font-semibold text-brand-dark text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Description</label>
                <textarea
                  rows={2}
                  placeholder="What will you learn and achieve together?"
                  value={hobbyDesc}
                  onChange={(e) => setHobbyDesc(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-purple focus:outline-none font-semibold text-brand-dark text-sm resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Goal Date</label>
                <input
                  type="date"
                  value={hobbyGoalDate}
                  onChange={(e) => setHobbyGoalDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-purple focus:outline-none font-semibold text-brand-dark text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider">Initial Steps / Milestones</label>
                <input
                  type="text"
                  placeholder="Step 1: e.g. Buy calligraphy set"
                  value={step1}
                  onChange={(e) => setStep1(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-purple focus:outline-none font-semibold text-brand-dark text-sm"
                />
                <input
                  type="text"
                  placeholder="Step 2: e.g. Practice first surah"
                  value={step2}
                  onChange={(e) => setStep2(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-purple focus:outline-none font-semibold text-brand-dark text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Cover Image URL (optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={hobbyCover}
                  onChange={(e) => setHobbyCover(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-purple focus:outline-none font-semibold text-brand-dark text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-brand-purple to-pink-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-purple/20 hover:scale-[0.99] transition-all"
              >
                Launch Shared Hobby
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Modal: Add Watchlist / Bucket list item */}
      {isAddingWatch && (
        <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-slide-up border border-slate-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-extrabold text-xl text-brand-dark">Add to Shared Fun</h3>
              <button onClick={() => setIsAddingWatch(false)} className="text-brand-gray font-bold text-sm bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200">
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddWatch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Item Title</label>
                <input
                  type="text"
                  placeholder={watchType === 'watch' ? 'e.g. Interstellar' : 'e.g. Skydive in Dubai'}
                  value={watchTitle}
                  onChange={(e) => setWatchTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-cyan font-semibold text-brand-dark text-sm"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Category</label>
                  <input
                    type="text"
                    placeholder={watchType === 'watch' ? 'Movie, Series, Anime' : 'Travel, Adventure, Food'}
                    value={watchCategory}
                    onChange={(e) => setWatchCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-cyan font-semibold text-brand-dark text-sm"
                    required
                  />
                </div>

                {watchType === 'bucket' && (
                  <div>
                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Priority</label>
                    <select
                      value={bucketPriority}
                      onChange={(e) => setBucketPriority(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-cyan font-bold text-sm text-brand-dark"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-brand-cyan to-teal-500 text-white rounded-2xl font-bold shadow-lg shadow-brand-cyan/20 hover:scale-[0.99] transition-all"
              >
                Add Item
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Modal: Gift a Song */}
      {isGiftingSong && (
        <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-slide-up border border-slate-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-extrabold text-xl text-brand-dark">Gift a Song today</h3>
              <button onClick={() => setIsGiftingSong(false)} className="text-brand-gray font-bold text-sm bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200">
                Cancel
              </button>
            </div>

            <form onSubmit={handleGiftSong} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Song Title</label>
                  <input
                    type="text"
                    placeholder="As It Was"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-purple font-semibold text-brand-dark text-sm"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Artist</label>
                  <input
                    type="text"
                    placeholder="Harry Styles"
                    value={songArtist}
                    onChange={(e) => setSongArtist(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-purple font-semibold text-brand-dark text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Sweet Message</label>
                <textarea
                  rows={2}
                  placeholder="This reminded me of you..."
                  value={songMessage}
                  onChange={(e) => setSongMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-purple font-semibold text-brand-dark text-sm resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-brand-purple to-pink-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-purple/20 hover:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <Music size={16} />
                Send Gift
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
