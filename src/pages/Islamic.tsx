import { useState, useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import type { PrayerLog } from '../store/useAppStore'
import { Book, Check, Sparkles, Sunrise, Sunset, Moon, Heart, BookOpen, Clock, Sun, SunDim } from 'lucide-react'

interface AthkarItem {
  id: string
  text: string
  translation: string
  count: number
  currentCount: number
}

const PRAYER_THEMES: {
  [key: string]: {
    cardBg: string
    iconColor: string
    titleColor: string
    timeColor: string
    checkBorder: string
    checkboxBg: string
    partnerCheckboxBg: string
  }
} = {
  fajr: {
    cardBg: 'bg-gradient-to-tr from-sky-50/80 to-rose-50/50 border-sky-100/50 text-slate-800',
    iconColor: 'text-sky-500',
    titleColor: 'text-slate-800',
    timeColor: 'text-sky-600/80',
    checkBorder: 'border-sky-300 hover:border-sky-500',
    checkboxBg: 'bg-sky-500 border-sky-500 text-white shadow-sky-500/20',
    partnerCheckboxBg: 'bg-sky-100 border-sky-200 text-sky-600'
  },
  dhuhr: {
    cardBg: 'bg-gradient-to-tr from-amber-50/70 to-emerald-50/40 border-amber-100/40 text-slate-800',
    iconColor: 'text-amber-500',
    titleColor: 'text-slate-800',
    timeColor: 'text-amber-600/80',
    checkBorder: 'border-amber-300 hover:border-amber-500',
    checkboxBg: 'bg-amber-500 border-amber-500 text-white shadow-amber-500/20',
    partnerCheckboxBg: 'bg-amber-100 border-amber-200 text-amber-600'
  },
  asr: {
    cardBg: 'bg-gradient-to-tr from-orange-50/80 to-amber-50/50 border-orange-100/40 text-slate-800',
    iconColor: 'text-orange-500',
    titleColor: 'text-slate-800',
    timeColor: 'text-orange-600/80',
    checkBorder: 'border-orange-300 hover:border-orange-500',
    checkboxBg: 'bg-orange-500 border-orange-500 text-white shadow-orange-500/20',
    partnerCheckboxBg: 'bg-orange-100 border-orange-200 text-orange-600'
  },
  maghrib: {
    cardBg: 'bg-gradient-to-tr from-rose-50/60 to-indigo-50/60 border-indigo-100/40 text-slate-800',
    iconColor: 'text-indigo-500',
    titleColor: 'text-slate-800',
    timeColor: 'text-indigo-600/80',
    checkBorder: 'border-indigo-300 hover:border-indigo-500',
    checkboxBg: 'bg-indigo-500 border-indigo-500 text-white shadow-indigo-500/20',
    partnerCheckboxBg: 'bg-indigo-100 border-indigo-200 text-indigo-600'
  },
  isha: {
    cardBg: 'bg-gradient-to-tr from-slate-900 via-slate-850 to-indigo-950 border-slate-800/40 text-slate-100',
    iconColor: 'text-indigo-300',
    titleColor: 'text-slate-100',
    timeColor: 'text-indigo-300/80',
    checkBorder: 'border-slate-700 hover:border-indigo-500',
    checkboxBg: 'bg-indigo-500 border-indigo-500 text-white shadow-indigo-500/35',
    partnerCheckboxBg: 'bg-indigo-950/80 border-indigo-900 text-indigo-300'
  }
}

export default function Islamic() {
  const { myPrayers, partnerPrayers, partnerName, togglePrayer } = useAppStore()
  const [activeTab, setActiveTab] = useState<'prayer' | 'athkar' | 'quran'>('prayer')
  
  // Prayer Times API State
  const [prayerTimes, setPrayerTimes] = useState<{ [key: string]: string }>({
    Fajr: '04:12',
    Dhuhr: '12:43',
    Asr: '16:21',
    Maghrib: '19:44',
    Isha: '21:08'
  })
  const [hijriDate, setHijriDate] = useState('11 Dhul-Qadah 1447 AH')

  useEffect(() => {
    // Attempt to fetch prayer timings from Aladhan API for Amman, JO
    const fetchPrayerTimes = async () => {
      try {
        const res = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Amman&country=Jordan&method=4')
        const data = await res.json()
        if (data.code === 200 && data.data) {
          const timings = data.data.timings
          setPrayerTimes({
            Fajr: timings.Fajr,
            Dhuhr: timings.Dhuhr,
            Asr: timings.Asr,
            Maghrib: timings.Maghrib,
            Isha: timings.Isha
          })
          const hijri = data.data.date.hijri
          setHijriDate(`${hijri.day} ${hijri.month.en} ${hijri.year} AH`)
        }
      } catch (err) {
        console.log('Error fetching prayer times: ', err)
      }
    }

    fetchPrayerTimes()
  }, [])

  // Athkar State
  const [athkarTab, setAthkarTab] = useState<'morning' | 'evening'>('morning')
  const [morningAthkar, setMorningAthkar] = useState<AthkarItem[]>([
    {
      id: 'm1',
      text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
      translation: 'We have entered a new day and with it all dominion belongs to Allah. Praise is to Allah. None has the right to be worshipped but Allah alone...',
      count: 1,
      currentCount: 0
    },
    {
      id: 'm2',
      text: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ',
      translation: 'Glory is to Allah and praise is to Him, by the number of His creation, by His pleasure, by the weight of His Throne, and by the ink of His words.',
      count: 3,
      currentCount: 0
    },
    {
      id: 'm3',
      text: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ',
      translation: 'O Ever Living One, O Sustainer of all, by Your mercy I advocate Your assistance. Rectify all my affairs and do not leave me in charge of my soul for even the blink of an eye.',
      count: 1,
      currentCount: 0
    }
  ])

  const [eveningAthkar, setEveningAthkar] = useState<AthkarItem[]>([
    {
      id: 'e1',
      text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
      translation: 'We have entered the evening and with it all dominion belongs to Allah. Praise is to Allah. None has the right to be worshipped but Allah alone...',
      count: 1,
      currentCount: 0
    },
    {
      id: 'e2',
      text: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
      translation: 'O Allah, by Your leave we have reached the evening and by Your leave we reached the morning, by Your leave we live and by Your leave we die, and unto You is our return.',
      count: 1,
      currentCount: 0
    },
    {
      id: 'e3',
      text: 'أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
      translation: 'I seek refuge in the perfect words of Allah from the evil of that which He has created.',
      count: 3,
      currentCount: 0
    }
  ])

  const [loadingAthkar, setLoadingAthkar] = useState(false)

  useEffect(() => {
    const fetchAthkar = async () => {
      setLoadingAthkar(true)
      try {
        const url = athkarTab === 'morning' 
          ? 'https://raw.githubusercontent.com/yaznhijazii/personalsfiles/77117060ce43a12ea603b025a7852ffe62cb5c1f/morningthk.json'
          : 'https://raw.githubusercontent.com/yaznhijazii/personalsfiles/77117060ce43a12ea603b025a7852ffe62cb5c1f/masaatk.json';
        
        const res = await fetch(url)
        const data = await res.json()
        if (data && Array.isArray(data.content)) {
          const mapped: AthkarItem[] = data.content.map((item: any, idx: number) => ({
            id: `${athkarTab}-${idx}-${item.repeat}`,
            text: item.zekr,
            translation: item.bless || '',
            count: item.repeat || 1,
            currentCount: 0
          }))
          
          if (athkarTab === 'morning') {
            setMorningAthkar(mapped)
          } else {
            setEveningAthkar(mapped)
          }
        }
      } catch (err) {
        console.error('Error fetching athkar:', err)
      } finally {
        setLoadingAthkar(false)
      }
    }

    fetchAthkar()
  }, [athkarTab])

  const handleAthkarCount = (id: string, type: 'morning' | 'evening') => {
    const list = type === 'morning' ? morningAthkar : eveningAthkar
    const setList = type === 'morning' ? setMorningAthkar : setEveningAthkar
    
    setList(
      list.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            currentCount: item.currentCount < item.count ? item.currentCount + 1 : item.count
          }
        }
        return item
      })
    )
  }

  const handleResetAthkar = (type: 'morning' | 'evening') => {
    const list = type === 'morning' ? morningAthkar : eveningAthkar
    const setList = type === 'morning' ? setMorningAthkar : setEveningAthkar
    setList(list.map((item) => ({ ...item, currentCount: 0 })))
  }

  // Quran Khatma Tracker state
  const [myQuranPage, setMyQuranPage] = useState(150)
  const [partnerQuranPage] = useState(182)
  const [isLoggingQuran, setIsLoggingQuran] = useState(false)
  const [logPageInput, setLogPageInput] = useState('')

  const handleLogQuran = (e: React.FormEvent) => {
    e.preventDefault()
    const p = parseInt(logPageInput)
    if (!isNaN(p) && p > 0 && p <= 604) {
      setMyQuranPage(p)
      setIsLoggingQuran(false)
      setLogPageInput('')
    }
  }

  // Verse of the Day (Curated inspiring ayahs)
  const verses = [
    {
      arabic: 'قَالَ لَا تَخَافَا ۖ إِنَّنِي مَعَكُمَا أَسْمَعُ وَأَرَى',
      translation: 'He said, "Fear not. Indeed, I am with you both; I hear and I see."',
      surah: 'Surah Taha, Ayah 46'
    },
    {
      arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
      translation: 'Indeed, with hardship [will be] ease.',
      surah: 'Surah Ash-Sharh, Ayah 6'
    },
    {
      arabic: 'وَاصْبِرْ لِحُكْمِ رَبِّكَ فَإِنَّكَ بِأَعْيُنِنَا',
      translation: 'And be patient, [O Muhammad], for the decision of your Lord, for indeed, you are in Our eyes.',
      surah: 'Surah At-Tur, Ayah 48'
    }
  ]
  const [currentVerseIndex] = useState(0)
  const verse = verses[currentVerseIndex]

  const prayersList: { key: keyof PrayerLog; label: string; icon: any }[] = [
    { key: 'fajr', label: 'Fajr', icon: Sunrise },
    { key: 'dhuhr', label: 'Dhuhr', icon: Sun },
    { key: 'asr', label: 'Asr', icon: SunDim },
    { key: 'maghrib', label: 'Maghrib', icon: Sunset },
    { key: 'isha', label: 'Isha', icon: Moon }
  ]

  return (
    <div className="relative pb-28 pt-14 px-6 min-h-screen animate-fade-in">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/70 border border-emerald-200/50 px-3.5 py-1.5 rounded-full select-none flex items-center gap-1.5">
            <span>{hijriDate}</span>
            <Moon size={11} className="text-emerald-600 animate-pulse" />
          </span>
          <h1 className="text-4xl font-extrabold text-brand-dark mt-3.5 tracking-tight">
            Islamic Corner
          </h1>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shadow-inner">
          <Moon className="text-emerald-600 fill-emerald-600 animate-pulse" size={20} />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex bg-slate-100/60 backdrop-blur-md p-1 rounded-2xl mb-6 border border-slate-200/50">
        {(['prayer', 'athkar', 'quran'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wide transition-all duration-200 active-pop flex items-center justify-center gap-1.5 ${
              activeTab === tab
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-100/50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab === 'prayer' && <Sparkles size={13} />}
            {tab === 'athkar' && <Clock size={13} />}
            {tab === 'quran' && <BookOpen size={13} />}
            {tab === 'prayer' ? 'Prayers' : tab === 'athkar' ? 'Athkar' : 'Quran'}
          </button>
        ))}
      </div>

      {/* Tab content: Prayers */}
      {activeTab === 'prayer' && (
        <div className="space-y-6">
          <section className="card-soft bg-white/70 border border-white/50 p-6 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100/50">
              <h3 className="font-black text-base text-brand-dark">Today's Prayers</h3>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Amman, Jordan</span>
            </div>

            {/* Prayer List Layout */}
            <div className="space-y-3.5">
              {prayersList.map(({ key, label, icon: IconComponent }) => {
                const isMyDone = myPrayers[key]
                const isPartnerDone = partnerPrayers[key]
                const time = prayerTimes[label]
                const theme = PRAYER_THEMES[key]

                return (
                  <div 
                    key={key} 
                    className={`flex items-center justify-between p-4 rounded-3xl border transition-all duration-300 ${theme.cardBg} ${
                      isMyDone ? 'shadow-[0_8px_20px_-6px_rgba(16,185,129,0.08)] scale-[1.01]' : 'shadow-sm'
                    }`}
                  >
                    {/* Prayer Info */}
                    <div className="flex items-center space-x-3.5">
                      <div className={`w-9 h-9 rounded-xl bg-white/80 border border-white/40 flex items-center justify-center shadow-sm shrink-0 ${theme.iconColor}`}>
                        <IconComponent size={18} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className={`font-black text-sm ${theme.titleColor}`}>{label}</p>
                        <p className={`text-[10px] font-extrabold ${theme.timeColor}`}>{time}</p>
                      </div>
                    </div>

                    {/* Checkboxes Area */}
                    <div className="flex items-center space-x-3">
                      {/* My Checkbox */}
                      <div className="flex flex-col items-center space-y-1">
                        <span className="text-[9px] font-black uppercase text-slate-400 select-none">You</span>
                        <button
                          onClick={() => togglePrayer(key)}
                          className={`w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center active-pop ${
                            isMyDone
                              ? theme.checkboxBg
                              : theme.checkBorder + ' bg-white/70'
                          }`}
                        >
                          {isMyDone && <Check size={16} strokeWidth={3} />}
                        </button>
                      </div>

                      {/* Partner Checkbox (Read Only visual) */}
                      <div className="flex flex-col items-center space-y-1">
                        <span className="text-[9px] font-black uppercase text-slate-400 select-none">{partnerName}</span>
                        <div
                          className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                            isPartnerDone
                              ? theme.partnerCheckboxBg
                              : 'border-slate-200/50 bg-slate-100/30'
                          }`}
                        >
                          {isPartnerDone ? (
                            <Check size={14} strokeWidth={3} />
                          ) : (
                            <span className="text-[10px] text-slate-300 font-extrabold select-none">••</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Encouragement Banner */}
          <section className="card-soft bg-gradient-to-tr from-emerald-50/50 to-teal-50/40 border border-emerald-200/40 p-5 flex items-start space-x-4 shadow-[0_12px_24px_rgba(16,185,129,0.02)]">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
              <Heart size={18} className="text-emerald-600 fill-emerald-600/30" />
            </div>
            <div>
              <h4 className="font-black text-emerald-800 text-sm">Prayer reminder</h4>
              <p className="text-[11px] text-emerald-700/80 mt-1 leading-relaxed font-bold">
                "Indeed, prayer has been decreed upon the believers at specified times." (Surah An-Nisa). Support each other's routines by marking completed prayers.
              </p>
            </div>
          </section>
        </div>
      )}

      {/* Tab content: Athkar */}
      {activeTab === 'athkar' && (
        <div className="space-y-6">
          {/* Sub-tabs for Morning / Evening */}
          <div className="flex space-x-3 mb-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100">
            <button
              onClick={() => setAthkarTab('morning')}
              className={`flex-1 py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wide transition-all flex items-center justify-center space-x-1.5 active-pop ${
                athkarTab === 'morning'
                  ? 'bg-emerald-500 text-white shadow-sm border border-emerald-400/20'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Sunrise size={13} />
              <span>Morning</span>
            </button>
            <button
              onClick={() => setAthkarTab('evening')}
              className={`flex-1 py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wide transition-all flex items-center justify-center space-x-1.5 active-pop ${
                athkarTab === 'evening'
                  ? 'bg-emerald-800 text-white shadow-sm border border-emerald-700/20'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Sunset size={13} />
              <span>Evening</span>
            </button>
          </div>

          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black text-slate-400 uppercase select-none">Tap card to count progress</span>
            <button
              onClick={() => handleResetAthkar(athkarTab)}
              className="text-[10px] font-black text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100 hover:bg-rose-100 active-pop uppercase"
            >
              Reset All
            </button>
          </div>

          {/* List of Athkar */}
          <div className="space-y-4">
            {loadingAthkar ? (
              <div className="text-center py-12 text-slate-400 font-bold text-xs select-none animate-pulse flex flex-col items-center justify-center gap-3 bg-white/40 border border-slate-100 rounded-3xl">
                <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span>Loading Athkar from library...</span>
              </div>
            ) : (
              (athkarTab === 'morning' ? morningAthkar : eveningAthkar).map((item) => {
                const isCompleted = item.currentCount >= item.count
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleAthkarCount(item.id, athkarTab)}
                    className={`card-soft w-full text-left bg-white border transition-all duration-300 relative overflow-hidden group hover:scale-[1.015] hover:shadow-soft active-pop p-5 ${
                      isCompleted
                        ? 'border-emerald-500/35 bg-emerald-50/5 shadow-[0_12px_24px_rgba(16,185,129,0.02)]'
                        : 'border-slate-100/80 hover:border-emerald-300/40 shadow-sm'
                    }`}
                  >
                    {/* Top Row: Meta & Progress */}
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100/50 w-full mb-4">
                      {/* Left: Counter Progress Circle */}
                      <div className="flex items-center space-x-2.5">
                        <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                          <svg className="w-full h-full -rotate-90">
                            <circle
                              cx="16"
                              cy="16"
                              r="13"
                              className="stroke-slate-100"
                              strokeWidth={3}
                              fill="transparent"
                            />
                            <circle
                              cx="16"
                              cy="16"
                              r="13"
                              className={`transition-all duration-300 ${
                                isCompleted ? 'stroke-emerald-500' : 'stroke-emerald-600'
                              }`}
                              strokeWidth={3}
                              strokeDasharray={2 * Math.PI * 13}
                              strokeDashoffset={2 * Math.PI * 13 - (item.currentCount / item.count) * (2 * Math.PI * 13)}
                              strokeLinecap="round"
                              fill="transparent"
                            />
                          </svg>
                          <span className="absolute text-[9px] font-black text-emerald-800">
                            {item.currentCount}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase">
                          Progress
                        </span>
                      </div>

                      {/* Right: Goal and Status Badge */}
                      <div className="flex items-center space-x-2">
                        {isCompleted ? (
                          <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-lg flex items-center gap-1 select-none animate-scale-in">
                            <Check size={10} strokeWidth={3} />
                            Done
                          </span>
                        ) : (
                          <span className="text-[9px] font-black uppercase text-slate-500 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-lg select-none">
                            Goal: {item.currentCount}/{item.count}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Zekr Text (Arabic) */}
                    <p className="text-[22px] font-bold text-slate-800 text-center leading-[2.4rem] font-arabic dir-rtl mb-4 select-none px-1 w-full">
                      {item.text}
                    </p>

                    {/* Virtue / Bless (Arabic Text styled properly) */}
                    {item.translation && (
                      <div className="bg-emerald-50/20 border border-emerald-100/30 p-3.5 rounded-2xl text-[12px] text-emerald-800/80 leading-relaxed font-bold text-center dir-rtl w-full mt-2 select-none flex items-start gap-2 justify-center">
                        <Sparkles size={12} className="text-emerald-500 mt-0.5 shrink-0 animate-pulse" />
                        <span>{item.translation}</span>
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Tab content: Quran */}
      {activeTab === 'quran' && (
        <div className="space-y-6">
          {/* Verse of the day */}
          <section className="card-soft bg-gradient-to-tr from-slate-900 via-slate-850 to-indigo-950 text-white relative overflow-hidden border border-slate-800/40 p-6 shadow-xl">
            <div className="absolute right-[-10px] bottom-[-20px] text-white/5 font-arabic text-9xl pointer-events-none select-none">
              قرآن
            </div>
            
            <div className="flex items-center space-x-2 text-emerald-400 mb-4">
              <Sparkles size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider">Verse of the Day</span>
            </div>

            <p className="text-2xl font-bold text-right leading-loose mb-4 font-arabic dir-rtl text-slate-100 selection:bg-emerald-500 select-none">
              {verse.arabic}
            </p>
            <p className="text-[12px] text-slate-350 leading-relaxed font-semibold mb-4 italic text-left">
              "{verse.translation}"
            </p>
            <span className="text-[9px] font-black text-slate-400 bg-white/10 px-3 py-1.5 rounded-full border border-white/5 uppercase select-none">
              {verse.surah}
            </span>
          </section>

          {/* Reading & Khatma progress */}
          <section className="card-soft bg-white/70 border border-white/50">
            <h3 className="font-black text-base text-brand-dark mb-4">Khatma Tracker Together</h3>
            
            {/* Khatma progress bar */}
            <div className="mb-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
              <div className="flex justify-between items-center text-xs font-black mb-2 select-none">
                <span className="text-slate-400 uppercase">Joint Progress</span>
                <span className="text-brand-purple">27.5% Completed</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-brand-cyan transition-all duration-500 rounded-full" style={{ width: '27.5%' }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100/60">
              {/* My Progress */}
              <div className="bg-slate-50/50 border border-slate-100/50 p-4 rounded-2xl text-center shadow-inner">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Your Page</span>
                <p className="text-3xl font-black text-brand-dark font-mono">{myQuranPage}</p>
                <button
                  onClick={() => setIsLoggingQuran(true)}
                  className="mt-3.5 text-xs font-black text-emerald-700 bg-emerald-100/60 hover:bg-emerald-100 border border-emerald-200/20 px-3 py-2 rounded-xl w-full active-pop shadow-sm transition-all"
                >
                  Log Page
                </button>
              </div>

              {/* Partner Progress */}
              <div className="bg-slate-50/50 border border-slate-100/50 p-4 rounded-2xl text-center shadow-inner">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">{partnerName}'s Page</span>
                <p className="text-3xl font-black text-brand-dark font-mono">{partnerQuranPage}</p>
                <div className="mt-3.5 text-[10px] font-extrabold text-slate-400 bg-slate-100 border border-slate-200/50 py-2 rounded-xl select-none">
                  Updated 2h ago
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-4 text-[11px] font-extrabold text-slate-450 justify-center">
              <Book size={12} className="text-emerald-500" />
              <span>Target: Finish Al-Baqarah by Sunday</span>
            </div>
          </section>

          {/* Log page dialog */}
          {isLoggingQuran && (
            <div className="fixed inset-0 bg-brand-dark/45 backdrop-blur-sm z-50 flex items-end justify-center px-4 pb-8">
              <div className="bg-white rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-slide-up border border-slate-100">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-extrabold text-xl text-brand-dark">Update Quran Page</h3>
                  <button onClick={() => setIsLoggingQuran(false)} className="text-brand-gray font-bold text-sm bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200">
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleLogQuran} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Current Page (1 - 604)</label>
                    <input
                      type="number"
                      min="1"
                      max="604"
                      placeholder="e.g. 152"
                      value={logPageInput}
                      onChange={(e) => setLogPageInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none font-semibold text-brand-dark font-mono"
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-[0.99] transition-all"
                  >
                    Update Progress
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
