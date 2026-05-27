import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAppStore } from '../store/useAppStore'
import type { PrayerLog } from '../store/useAppStore'
import { Book, Check, Leaf, Sunrise, Sunset, Moon, Heart, BookOpen, Sun, SunDim, Play, Pause, Radio, Shuffle, Star } from 'lucide-react'

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
    cardBg: 'bg-gradient-to-tr from-sky-50/60 to-rose-50/30 border-sky-100/40 text-slate-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]',
    iconColor: 'text-sky-500',
    titleColor: 'text-slate-850 font-bold',
    timeColor: 'text-sky-600/70 font-semibold',
    checkBorder: 'border-sky-200 hover:border-sky-400 bg-white/60',
    checkboxBg: 'bg-sky-500 border-sky-400 text-white shadow-[0_4px_12px_rgba(14,165,233,0.3)]',
    partnerCheckboxBg: 'bg-sky-50 border-sky-100/70 text-sky-600'
  },
  dhuhr: {
    cardBg: 'bg-gradient-to-tr from-amber-50/50 to-emerald-50/30 border-amber-100/40 text-slate-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]',
    iconColor: 'text-amber-555',
    titleColor: 'text-slate-850 font-bold',
    timeColor: 'text-amber-600/70 font-semibold',
    checkBorder: 'border-amber-200 hover:border-amber-400 bg-white/60',
    checkboxBg: 'bg-amber-500 border-amber-400 text-white shadow-[0_4px_12px_rgba(245,158,11,0.3)]',
    partnerCheckboxBg: 'bg-amber-50 border-amber-100/70 text-amber-600'
  },
  asr: {
    cardBg: 'bg-gradient-to-tr from-orange-50/60 to-amber-50/30 border-orange-100/40 text-slate-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]',
    iconColor: 'text-orange-500',
    titleColor: 'text-slate-850 font-bold',
    timeColor: 'text-orange-600/70 font-semibold',
    checkBorder: 'border-orange-200 hover:border-orange-400 bg-white/60',
    checkboxBg: 'bg-orange-500 border-orange-400 text-white shadow-[0_4px_12px_rgba(249,115,22,0.3)]',
    partnerCheckboxBg: 'bg-orange-50 border-orange-100/70 text-orange-600'
  },
  maghrib: {
    cardBg: 'bg-gradient-to-tr from-rose-50/50 to-indigo-50/40 border-indigo-100/30 text-slate-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]',
    iconColor: 'text-indigo-500',
    titleColor: 'text-slate-855 font-bold',
    timeColor: 'text-indigo-600/70 font-semibold',
    checkBorder: 'border-indigo-200 hover:border-indigo-400 bg-white/60',
    checkboxBg: 'bg-indigo-500 border-indigo-400 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)]',
    partnerCheckboxBg: 'bg-indigo-50 border-indigo-100/70 text-indigo-650'
  },
  isha: {
    cardBg: 'bg-gradient-to-tr from-slate-900 via-slate-850 to-indigo-950 border-slate-800/45 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
    iconColor: 'text-indigo-300',
    titleColor: 'text-slate-100 font-bold',
    timeColor: 'text-indigo-300/70 font-semibold',
    checkBorder: 'border-slate-700 hover:border-indigo-500 bg-slate-800/40',
    checkboxBg: 'bg-indigo-500 border-indigo-400 text-white shadow-[0_4px_12px_rgba(99,102,241,0.45)]',
    partnerCheckboxBg: 'bg-indigo-950/70 border-indigo-900/60 text-indigo-300'
  }
}

function getArabicFontSizeClass(text: string): string {
  const len = text.length
  if (len > 250) return 'text-[14px] leading-[2.1rem]'
  if (len > 150) return 'text-[15px] leading-[2.2rem]'
  if (len > 85) return 'text-[17px] leading-[2.4rem] font-semibold'
  return 'text-[20px] leading-[2.6rem] font-bold'
}

export default function Islamic() {
  const { 
    myPrayers, 
    partnerPrayers, 
    myAthkar,
    partnerAthkar,
    partnerName, 
    pairStatus,
    userQuranPage,
    partnerQuranPage,
    quranTarget,
    userAvatar,
    partnerAvatar,
    togglePrayer, 
    fetchPrayers,
    fetchAthkarLogs,
    incrementThikrCount,
    resetAthkarLogs,
    updateQuranPage,
    updateQuranTarget
  } = useAppStore()
  
  useEffect(() => {
    fetchPrayers()
    fetchAthkarLogs()
  }, [fetchPrayers, fetchAthkarLogs])

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

  const handleAthkarCount = (id: string, maxCount: number) => {
    incrementThikrCount(id, maxCount)
  }

  const handleResetAthkar = async (type: 'morning' | 'evening') => {
    const list = type === 'morning' ? morningAthkar : eveningAthkar
    const ids = list.map((item) => item.id)
    await resetAthkarLogs(ids)
  }

  // Quran Khatma Tracker state
  const [isLoggingQuran, setIsLoggingQuran] = useState(false)
  const [logPageInput, setLogPageInput] = useState('')
  const [isEditingTarget, setIsEditingTarget] = useState(false)
  const [targetInput, setTargetInput] = useState('')

  const handleLogQuran = (e: React.FormEvent) => {
    e.preventDefault()
    const p = parseInt(logPageInput)
    if (!isNaN(p) && p > 0 && p <= 604) {
      updateQuranPage(p)
      setIsLoggingQuran(false)
      setLogPageInput('')
    }
  }

  const handleUpdateTarget = (e: React.FormEvent) => {
    e.preventDefault()
    if (targetInput.trim()) {
      updateQuranTarget(targetInput.trim())
      setIsEditingTarget(false)
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
    },
    {
      arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
      translation: 'And whoever relies upon Allah - then He is sufficient for him.',
      surah: 'Surah At-Talaq, Ayah 3'
    },
    {
      arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا',
      translation: 'Our Lord, let not our hearts deviate after You have guided us.',
      surah: 'Surah Ali \'Imran, Ayah 8'
    },
    {
      arabic: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
      translation: 'Indeed, Allah is with the patient.',
      surah: 'Surah Al-Baqarah, Ayah 153'
    },
    {
      arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
      translation: 'Unquestionably, by the remembrance of Allah hearts are assured.',
      surah: 'Surah Ar-Ra\'d, Ayah 28'
    },
    {
      arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
      translation: 'And say, "My Lord, increase me in knowledge."',
      surah: 'Surah Taha, Ayah 114'
    },
    {
      arabic: 'ادْعُونِي أَسْتَجِبْ لَكُمْ',
      translation: 'Call upon Me; I will respond to you.',
      surah: 'Surah Ghafir, Ayah 60'
    }
  ]

  const [currentVerseIndex, setCurrentVerseIndex] = useState(0)

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * verses.length)
    setCurrentVerseIndex(randomIndex)
  }, [])

  const handleShuffleVerse = () => {
    let newIndex = currentVerseIndex
    while (newIndex === currentVerseIndex) {
      newIndex = Math.floor(Math.random() * verses.length)
    }
    setCurrentVerseIndex(newIndex)
  }

  const verse = verses[currentVerseIndex]

  // Quran Radio State & Logic
  const RADIO_STATIONS = [
    { value: 'mix', label: 'Main Radio' },
    { value: 'albaghara', label: 'Al-Baqarah' },
    { value: 'sakina', label: 'Sakina (Calm)' },
    { value: 'tafseer', label: 'Tafseer' },
    { value: 'tarabeel', label: 'Short Recitation' }
  ]
  const [isPlayingRadio, setIsPlayingRadio] = useState(false)
  const [activeStation, setActiveStation] = useState('mix')
  const [audio] = useState(() => {
    const aud = new Audio('https://qurango.net/radio/mix')
    aud.preload = 'none'
    return aud
  })

  useEffect(() => {
    audio.src = `https://qurango.net/radio/${activeStation}`
    if (isPlayingRadio) {
      audio.play().catch((err) => console.log('Audio playback failed:', err))
    }
  }, [activeStation, audio])

  useEffect(() => {
    if (isPlayingRadio) {
      audio.play().catch((err) => console.log('Audio playback failed:', err))
    } else {
      audio.pause()
    }
  }, [isPlayingRadio, audio])

  useEffect(() => {
    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [audio])

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
          <h1 className="text-4xl font-extrabold text-brand-dark tracking-tight font-sans">
            Islamic Corner
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 select-none flex items-center gap-1">
            <span>{hijriDate}</span>
            <Moon size={12} className="text-slate-400" />
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 shadow-sm flex items-center justify-center relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-teal-500/5 opacity-50" />
          <Moon className="text-emerald-600 fill-emerald-600/10 relative z-10" size={18} strokeWidth={2.5} />
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
                ? 'bg-white text-emerald-800 shadow-sm border border-slate-100/50'
                : 'text-slate-405 hover:text-slate-700'
            }`}
          >
            {tab === 'prayer' && <Sunrise size={13} />}
            {tab === 'athkar' && <Leaf size={13} />}
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
                          className={`w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center active-pop overflow-hidden relative ${
                            isMyDone
                              ? theme.checkboxBg
                              : theme.checkBorder + ' bg-white/70'
                          }`}
                        >
                          {isMyDone ? (
                            <Check size={16} strokeWidth={3.5} className="animate-scale-in text-white" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                          )}
                        </button>
                      </div>

                      {/* Partner Checkbox (Read Only visual) */}
                      <div className="flex flex-col items-center space-y-1">
                        <span className="text-[9px] font-black uppercase text-slate-400 select-none">{partnerName?.split(' ')[0]}</span>
                        <div
                          className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all overflow-hidden ${
                            isPartnerDone
                              ? theme.partnerCheckboxBg + ' border-transparent'
                              : 'border-slate-200/50 bg-slate-100/30'
                          }`}
                        >
                          {isPartnerDone ? (
                            <Check size={14} strokeWidth={3.5} className="animate-scale-in" />
                          ) : (
                            <span className="text-[10px] text-slate-350 font-extrabold select-none">••</span>
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
          <div className="flex bg-slate-100/60 backdrop-blur-md p-1 rounded-2xl mb-6 border border-slate-200/50">
            <button
              onClick={() => setAthkarTab('morning')}
              className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wide transition-all flex items-center justify-center space-x-1.5 active-pop ${
                athkarTab === 'morning'
                  ? 'bg-emerald-500 border border-emerald-400/20 text-white shadow-[0_4px_12px_rgba(16,185,129,0.2)]'
                  : 'text-slate-455 hover:text-slate-700'
              }`}
            >
              <Sunrise size={13} />
              <span>Morning</span>
            </button>
            <button
              onClick={() => setAthkarTab('evening')}
              className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wide transition-all flex items-center justify-center space-x-1.5 active-pop ${
                athkarTab === 'evening'
                  ? 'bg-indigo-900 border border-indigo-850/20 text-white shadow-[0_4px_12px_rgba(49,46,129,0.2)]'
                  : 'text-slate-455 hover:text-slate-700'
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
              className="text-[10px] font-black text-rose-500 bg-rose-50 px-3.5 py-1.5 rounded-xl border border-rose-100 hover:bg-rose-100 active-pop uppercase transition-all shadow-sm"
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
                const myCount = myAthkar[item.id] || 0
                const partnerCount = partnerAthkar[item.id] || 0
                const isCompleted = myCount >= item.count
                const isPartnerCompleted = partnerCount >= item.count
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleAthkarCount(item.id, item.count)}
                    className={`card-soft w-full text-left transition-all duration-300 relative overflow-hidden group hover:scale-[1.012] hover:shadow-soft active-pop p-5 border ${
                      isCompleted
                        ? 'border-emerald-500/25 bg-gradient-to-tr from-emerald-50/40 to-teal-50/20 shadow-[0_12px_24px_rgba(16,185,129,0.03)]'
                        : 'border-slate-200/50 bg-white/70 backdrop-blur-md hover:border-emerald-300/40 shadow-sm'
                    }`}
                  >
                    {/* Top Row: Meta & Progress */}
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100/55 w-full mb-4">
                      {/* Left: Counter Progress Circle */}
                      <div className="flex items-center space-x-2.5">
                        <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                          <svg className="w-full h-full -rotate-90">
                            <circle
                              cx="16"
                              cy="16"
                              r="13"
                              className="stroke-slate-100/80"
                              strokeWidth={3}
                              fill="transparent"
                            />
                            <circle
                              cx="16"
                              cy="16"
                              r="13"
                              className={`transition-all duration-300 ${
                                isCompleted ? 'stroke-emerald-555 drop-shadow-[0_0_3px_rgba(16,185,129,0.4)]' : 'stroke-emerald-600'
                              }`}
                              strokeWidth={3.5}
                              strokeDasharray={2 * Math.PI * 13}
                              strokeDashoffset={2 * Math.PI * 13 - (myCount / item.count) * (2 * Math.PI * 13)}
                              strokeLinecap="round"
                              fill="transparent"
                            />
                          </svg>
                          <span className="absolute text-[9px] font-black text-emerald-800">
                            {myCount}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
                          Progress
                        </span>
                      </div>

                      {/* Right: Goal and Status Badge */}
                      <div className="flex items-center space-x-2">
                        {/* Partner progress badge */}
                        {pairStatus === 'active' && (
                          isPartnerCompleted ? (
                            <span className="text-[9px] font-black uppercase text-cyan-600 bg-cyan-500/10 border border-cyan-500/25 px-2 py-1 rounded-lg flex items-center gap-1 select-none" title={`${partnerName} completed`}>
                              {partnerName} Done
                            </span>
                          ) : (
                            <span className="text-[9px] font-black uppercase text-slate-500 bg-slate-50 border border-slate-200/60 px-2 py-1 rounded-lg select-none">
                              {partnerName}: {partnerCount}/{item.count}
                            </span>
                          )
                        )}

                        {/* Your Status Badge */}
                        {isCompleted ? (
                          <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-lg flex items-center gap-1 select-none animate-scale-in">
                            <Check size={10} strokeWidth={3} />
                            Done
                          </span>
                        ) : (
                          <span className="text-[9px] font-black uppercase text-slate-500 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-lg select-none">
                            Goal: {myCount}/{item.count}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Zekr Text (Arabic) */}
                    <p className={`font-arabic dir-rtl mb-4 select-none px-1 w-full text-slate-800 text-center ${getArabicFontSizeClass(item.text)}`}>
                      {item.text}
                    </p>

                    {/* Virtue / Bless (Arabic Text styled properly) */}
                    {item.translation && (
                      <div className="bg-slate-50/50 border border-slate-100/60 p-3.5 rounded-2xl text-[11px] text-slate-500 leading-relaxed font-semibold text-center w-full mt-3 select-none flex items-start gap-2 justify-center transition-all group-hover:bg-slate-50/90">
                        <Leaf size={12} className="text-emerald-500 shrink-0 mt-0.5" />
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
          <section className="card-soft bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white relative overflow-hidden border border-amber-500/20 p-6.5 shadow-xl shadow-indigo-950/20">
            <div className="absolute right-[-10px] bottom-[-20px] text-white/5 font-arabic text-9xl pointer-events-none select-none">
              قرآن
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2 text-amber-400">
                <Star size={14} className="text-amber-400 fill-amber-400/20 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider">Verse of the Day</span>
              </div>
              <button 
                type="button" 
                onClick={handleShuffleVerse}
                className="text-slate-400 hover:text-amber-300 p-2 rounded-xl hover:bg-white/10 active-pop transition-all shrink-0"
                title="Shuffle Verse"
              >
                <Shuffle size={13} />
              </button>
            </div>

            <p className={`text-right leading-loose mb-5 font-arabic dir-rtl text-slate-100 select-none ${getArabicFontSizeClass(verse.arabic)}`}>
              {verse.arabic}
            </p>
            <p className="text-[11px] text-slate-300 leading-relaxed font-semibold mb-5 italic text-left pl-3.5 border-l-2 border-emerald-500/40">
              "{verse.translation}"
            </p>
            <span className="text-[9px] font-black text-amber-300 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/20 uppercase select-none tracking-wider inline-block">
              {verse.surah}
            </span>
          </section>

          {/* Quran Live Radio Player */}
          <section className="card-soft bg-white/70 border border-white/50 p-5 shadow-soft hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100/50 mb-3.5">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Radio size={15} className={`text-emerald-600 ${isPlayingRadio ? 'animate-pulse' : ''}`} />
                </div>
                <div>
                  <h4 className="font-black text-sm text-brand-dark">Quran Live Radio</h4>
                  <p className="text-[10px] font-bold text-slate-400">Peaceful recitations together</p>
                </div>
              </div>
              
              {/* Equalizer Visualizer */}
              {isPlayingRadio && (
                <div className="flex items-end space-x-0.5 h-3.5 w-5 overflow-hidden shrink-0 pb-0.5">
                  <span className="w-[2.5px] h-full bg-emerald-500 rounded-t origin-bottom eq-bar-1" />
                  <span className="w-[2.5px] h-full bg-emerald-500 rounded-t origin-bottom eq-bar-2" />
                  <span className="w-[2.5px] h-full bg-emerald-500 rounded-t origin-bottom eq-bar-3" />
                  <span className="w-[2.5px] h-full bg-emerald-500 rounded-t origin-bottom eq-bar-4" />
                  <span className="w-[2.5px] h-full bg-emerald-500 rounded-t origin-bottom eq-bar-5" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-4">
              {/* Station Selection (Horizontal scrollable pills) */}
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Select Channel</span>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
                  {RADIO_STATIONS.map((st) => {
                    const isActive = activeStation === st.value
                    return (
                      <button
                        key={st.value}
                        type="button"
                        onClick={() => {
                          setActiveStation(st.value)
                          setIsPlayingRadio(true) // autoplay on click
                        }}
                        className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider shrink-0 transition-all active-pop border ${
                          isActive 
                            ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                            : 'bg-white border-slate-200/80 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {st.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Play/Pause Trigger */}
              <button
                type="button"
                onClick={() => setIsPlayingRadio(!isPlayingRadio)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 active-pop transition-all border ${
                  isPlayingRadio 
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30' 
                    : 'bg-white border-slate-200 hover:border-emerald-500 text-slate-700 hover:shadow-sm'
                }`}
              >
                {isPlayingRadio ? (
                  <Pause size={18} strokeWidth={2.5} className="fill-white" />
                ) : (
                  <Play size={18} strokeWidth={2.5} className="fill-slate-700 ml-0.5" />
                )}
              </button>
            </div>
          </section>

          {/* Reading & Khatma progress */}
          <section className="card-soft bg-white/70 border border-white/50">
            <h3 className="font-black text-base text-brand-dark mb-4">Khatma Tracker Together</h3>
            
            {/* Khatma progress bar */}
            <div className="mb-6 bg-slate-50/50 p-4.5 rounded-2xl border border-slate-100/50">
              <div className="flex justify-between items-center text-xs font-black mb-2 select-none">
                <span className="text-slate-400 uppercase tracking-wide text-[10px]">Joint Progress</span>
                <span className="text-brand-purple font-black">{((Math.max(userQuranPage, partnerQuranPage) / 604) * 100).toFixed(1)}% Completed</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner relative">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-brand-cyan transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-shimmer" 
                  style={{ width: `${Math.min(100, Math.max(0, (Math.max(userQuranPage, partnerQuranPage) / 604) * 100))}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100/60">
              {/* My Progress */}
              <div className="bg-slate-50/50 border border-slate-100/50 p-4.5 rounded-2xl text-center shadow-inner relative flex flex-col items-center group hover:bg-slate-50/80 transition-all">
                {userAvatar && (
                  <div className="w-10 h-10 rounded-full border-2 border-white shadow-md overflow-hidden mb-2.5 transition-transform group-hover:scale-105 duration-300">
                    <img src={userAvatar} alt="You" className="w-full h-full object-cover" />
                  </div>
                )}
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Your Page</span>
                <p className="text-3.5xl font-black text-brand-dark font-mono leading-none my-1 tracking-tight">{userQuranPage}</p>
                <button
                  onClick={() => {
                    setLogPageInput(userQuranPage.toString())
                    setIsLoggingQuran(true)
                  }}
                  className="mt-3.5 text-xs font-black text-emerald-700 bg-emerald-100/60 hover:bg-emerald-100 border border-emerald-250/20 px-3 py-2.5 rounded-xl w-full active-pop shadow-sm transition-all"
                >
                  Log Page
                </button>
              </div>

              {/* Partner Progress */}
              <div className="bg-slate-50/50 border border-slate-100/50 p-4.5 rounded-2xl text-center shadow-inner relative flex flex-col items-center group hover:bg-slate-50/80 transition-all">
                {partnerAvatar && (
                  <div className="w-10 h-10 rounded-full border-2 border-white shadow-md overflow-hidden mb-2.5 transition-transform group-hover:scale-105 duration-300">
                    <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover" />
                  </div>
                )}
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">{partnerName}'s Page</span>
                <p className="text-3.5xl font-black text-brand-dark font-mono leading-none my-1 tracking-tight">{partnerQuranPage}</p>
                <div className="mt-3.5 text-[10px] font-extrabold text-slate-455 bg-slate-100 border border-slate-200/50 py-2.5 rounded-xl select-none w-full shadow-sm">
                  Sync Live
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-4 text-[11px] font-extrabold text-slate-450 justify-center">
              <Book size={12} className="text-emerald-500" />
              <span>Target: {quranTarget}</span>
              <button
                type="button"
                onClick={() => {
                  setTargetInput(quranTarget)
                  setIsEditingTarget(true)
                }}
                className="text-emerald-600 hover:text-emerald-800 font-bold ml-1 hover:underline active-pop"
              >
                Edit Target
              </button>
            </div>
          </section>

          {/* Log page dialog */}
          {isLoggingQuran && createPortal(
            <div className="fixed inset-0 bg-brand-dark/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
            </div>,
            document.body
          )}

          {/* Edit target dialog */}
          {isEditingTarget && createPortal(
            <div className="fixed inset-0 bg-brand-dark/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-slide-up border border-slate-100">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-extrabold text-xl text-brand-dark">Edit Khatma Target</h3>
                  <button onClick={() => setIsEditingTarget(false)} className="text-brand-gray font-bold text-sm bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200">
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleUpdateTarget} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Khatma Target Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Finish Al-Baqarah by Sunday"
                      value={targetInput}
                      onChange={(e) => setTargetInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none font-semibold text-brand-dark text-sm"
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-[0.99] transition-all"
                  >
                    Save Target
                  </button>
                </form>
              </div>
            </div>,
            document.body
          )}
        </div>
      )}
    </div>
  )
}
