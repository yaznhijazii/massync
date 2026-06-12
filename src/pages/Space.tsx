import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import type { TimeBlock } from '../store/useAppStore'
import html2canvas from 'html2canvas'
import { 
  ChevronLeft, Plus, Clock, Trash2, Calendar, LayoutGrid, 
  BookOpen, User, Trophy, BarChart2, Download, 
  Eye, EyeOff 
} from 'lucide-react'

const DOMAINS = [
  { id: 'spiritual', label: 'Spiritual Routine', color: 'from-emerald-400 to-teal-500', textClass: 'text-emerald-500', borderClass: 'border-emerald-500/30', bgLight: 'bg-emerald-500/10' },
  { id: 'work', label: 'Focus Work', color: 'from-brand-cyan to-blue-500', textClass: 'text-brand-cyan', borderClass: 'border-brand-cyan/30', bgLight: 'bg-brand-cyan/10' },
  { id: 'health', label: 'Physical Health', color: 'from-brand-amber to-orange-500', textClass: 'text-brand-amber', borderClass: 'border-brand-amber/30', bgLight: 'bg-brand-amber/10' },
  { id: 'downtime', label: 'Personal Downtime', color: 'from-brand-purple to-pink-500', textClass: 'text-brand-purple', borderClass: 'border-brand-purple/30', bgLight: 'bg-brand-purple/10' },
  { id: 'matches', label: 'Sports & Matches', color: 'from-rose-500 to-red-600', textClass: 'text-rose-500', borderClass: 'border-rose-500/30', bgLight: 'bg-rose-500/10' }
] as const

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const PRESETS = [
  { title: 'Mosque Prayer 🕌', domain: 'spiritual', emoji: '🕌' },
  { title: 'Focus Coding 💻', domain: 'work', emoji: '💻' },
  { title: 'Gym Workout 🏋️', domain: 'health', emoji: '🏋️' },
  { title: 'Cooking Meal 🍳', domain: 'downtime', emoji: '🍳' },
  { title: 'Daily Walk 🚶', domain: 'health', emoji: '🚶' },
  { title: 'Coffee Break ☕', domain: 'downtime', emoji: '☕' },
  { title: 'Book Reading 📖', domain: 'downtime', emoji: '📖' },
  { title: 'Focus Writing ✍️', domain: 'work', emoji: '✍️' },
  { title: 'Watch Movie 🍿', domain: 'downtime', emoji: '🍿' },
  { title: 'Driving / Transit 🚗', domain: 'downtime', emoji: '🚗' },
  { title: 'Nap / Rest 💤', domain: 'downtime', emoji: '💤' },
  { title: 'Football Match ⚽', domain: 'matches', emoji: '⚽' }
] as const

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export default function Space() {
  const navigate = useNavigate()
  const { timeBlocks, addTimeBlock, deleteTimeBlock, showToast } = useAppStore()

  const [activeDay, setActiveDay] = useState<string>('Monday')
  const [activeTab, setActiveTab] = useState<'calendar' | 'analytics'>('calendar')
  const [isAddingBlock, setIsAddingBlock] = useState(false)
  
  // UX: Core waking hours (06:00 - 23:00) vs Full 24 hours (00:00 - 23:00)
  const [showFullDay, setShowFullDay] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Form State
  const [title, setTitle] = useState('')
  const [domain, setDomain] = useState<TimeBlock['domain']>('work')
  const [day, setDay] = useState<string>('Monday')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [details, setDetails] = useState('')

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const activeDayBlocks = timeBlocks
    .filter((b) => b.day === activeDay)
    .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time))

  // Time metrics calculations
  const totalHours = timeBlocks.reduce((acc, b) => {
    const start = timeToMinutes(b.start_time)
    const end = timeToMinutes(b.end_time)
    const diff = (end - start) / 60
    return acc + (diff > 0 ? diff : 0)
  }, 0)

  const domainHours = DOMAINS.reduce((acc, dom) => {
    const hrs = timeBlocks
      .filter((b) => b.domain === dom.id)
      .reduce((s, b) => {
        const diff = (timeToMinutes(b.end_time) - timeToMinutes(b.start_time)) / 60
        return s + (diff > 0 ? diff : 0)
      }, 0)
    acc[dom.id] = hrs
    return acc
  }, {} as Record<string, number>)

  const freeHours = Math.max(168 - totalHours, 0)

  // Auto scroll to current hour or first block
  useEffect(() => {
    if (activeTab === 'calendar' && scrollContainerRef.current && !isExporting) {
      const now = new Date()
      let targetHour = 8 // Default start hour

      // If active day is today, scroll to current hour
      const todayName = now.toLocaleDateString('en-US', { weekday: 'long' })
      if (activeDay === todayName) {
        targetHour = now.getHours()
      } else if (activeDayBlocks.length > 0) {
        // Scroll to the first block's hour
        targetHour = parseInt(activeDayBlocks[0].start_time.split(':')[0]) || 8
      }

      const rowHeight = 60
      const displayStartHour = showFullDay ? 0 : 6
      const relativeHour = Math.max(0, targetHour - displayStartHour)
      
      const containerHeight = scrollContainerRef.current.clientHeight
      const scrollTarget = (relativeHour * rowHeight) - (containerHeight / 2) + (rowHeight / 2)
      
      scrollContainerRef.current.scrollTop = Math.max(0, scrollTarget)
    }
  }, [activeDay, activeTab, showFullDay, isExporting, activeDayBlocks.length])

  const handleAddBlockSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !startTime || !endTime) return

    const startMin = timeToMinutes(startTime)
    const endMin = timeToMinutes(endTime)

    if (endMin <= startMin) {
      showToast('End time must be after start time!', 'error')
      return
    }

    addTimeBlock({
      title,
      domain,
      day,
      start_time: startTime,
      end_time: endTime,
      details: details.trim() || undefined
    })

    // Reset Form
    setTitle('')
    setDetails('')
    setIsAddingBlock(false)
  }

  // Pre-fill fields from preset ideas
  const handleTapPreset = (preset: typeof PRESETS[number]) => {
    setTitle(preset.title)
    setDomain(preset.domain)
    setDay(activeDay)

    const now = new Date()
    const hr = now.getHours()
    const startStr = `${hr.toString().padStart(2, '0')}:00`
    const endStr = `${((hr + 1) % 24).toString().padStart(2, '0')}:00`
    setStartTime(startStr)
    setEndTime(endStr)

    setIsAddingBlock(true)
  }

  // PNG Plan Exporter Function
  const handleExport = async () => {
    const exportArea = document.getElementById('export-schedule-area')
    if (!exportArea) return

    setIsExporting(true)
    // Wait for states to toggle and elements to hide
    await new Promise((resolve) => setTimeout(resolve, 200))

    try {
      const canvas = await html2canvas(exportArea, {
        useCORS: true,
        backgroundColor: '#F0F9FF', // Sky blue frame match
        scale: 2, // Retinal high resolution
        logging: false
      })

      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `MasSync_TimeBlock_${activeDay}.png`
      link.href = dataUrl
      link.click()

      showToast('Plan exported as picture! 📸', 'success')
    } catch (err) {
      console.error('[MasSync] Export plan as image failed:', err)
      showToast('Image export failed', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  // Get domain visual styling helpers
  const getDomainDetails = (domainId: string) => {
    return DOMAINS.find((d) => d.id === domainId) || DOMAINS[1]
  }

  // Hourly grid configuration based on view toggle
  const rowHeight = 60
  const displayStartHour = showFullDay ? 0 : 6
  const displayEndHour = showFullDay ? 24 : 23
  
  const gridHours = showFullDay 
    ? Array.from({ length: 24 }, (_, i) => i)
    : Array.from({ length: 18 }, (_, i) => i + 6) // 06:00 to 23:00 (18 hours)

  return (
    <div className="relative pb-28 pt-14 px-4 min-h-screen animate-fade-in">
      {/* Header */}
      <header className="flex justify-between items-center mb-5 px-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-2xl bg-white/70 backdrop-blur-md border border-slate-200/50 flex items-center justify-center text-slate-500 hover:text-brand-purple active-pop shadow-sm"
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-brand-dark tracking-tight">
              My Space
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
              Weekly Time-Budgeting
            </p>
          </div>
        </div>
      </header>

      {/* Exporter Area Container */}
      <div id="export-schedule-area" className="space-y-5 p-2 rounded-[36px] transition-colors duration-300">
        
        {/* Exporter branding header (hidden normally, visible when exporting) */}
        {isExporting && (
          <div className="flex justify-between items-center bg-white/80 p-5 rounded-3xl border border-white/50 shadow-sm mb-2">
            <div>
              <span className="text-[9px] font-black text-brand-purple uppercase tracking-widest">MasSync Weekly Plan</span>
              <h2 className="text-lg font-black text-slate-800">{activeDay}'s Time Blocks</h2>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-500">Allocated: {totalHours.toFixed(1)}h</span>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Pillars Schedule</p>
            </div>
          </div>
        )}

        {/* Overview Cards Dashboard (Real-time Analytics) */}
        <section className="grid grid-cols-2 gap-3.5">
          <div className="card-soft bg-gradient-to-tr from-brand-purple/10 to-pink-500/5 border border-brand-purple/20 p-4 shadow-sm flex flex-col justify-between rounded-[28px]">
            <div className="flex justify-between items-start">
              <span className="text-[8px] font-black uppercase text-brand-purple tracking-widest">Time Budgeted</span>
              <Clock size={14} className="text-brand-purple" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-black text-slate-800 tracking-tight leading-none font-mono">
                {totalHours.toFixed(1)}h
              </span>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                {((totalHours / 168) * 100).toFixed(0)}% of 168h
              </p>
            </div>
          </div>

          <div className="card-soft bg-slate-50/70 border border-slate-200/50 p-4 shadow-sm flex flex-col justify-between rounded-[28px]">
            <div className="flex justify-between items-start">
              <span className="text-[8px] font-black uppercase text-slate-450 tracking-widest">Free Hours</span>
              <LayoutGrid size={14} className="text-slate-400" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-black text-slate-700 tracking-tight leading-none font-mono">
                {freeHours.toFixed(1)}h
              </span>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Unallocated remaining
              </p>
            </div>
          </div>
        </section>

        {/* Tabs Switcher (hidden when exporting) */}
        {!isExporting && (
          <div className="flex bg-slate-100/60 backdrop-blur-md p-1 rounded-2xl border border-slate-200/50">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wide transition-all duration-200 active-pop flex items-center justify-center gap-1.5 ${
                activeTab === 'calendar'
                  ? 'bg-white text-brand-dark shadow-sm border border-slate-100/50'
                  : 'text-slate-400 hover:text-slate-655'
              }`}
            >
              <Calendar size={13} />
              Hourly Grid
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wide transition-all duration-200 active-pop flex items-center justify-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-white text-brand-dark shadow-sm border border-slate-100/50'
                  : 'text-slate-400 hover:text-slate-655'
              }`}
            >
              <BarChart2 size={13} />
              Domain Metrics
            </button>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-4">
            
            {/* Day Switcher Strip */}
            <div className="flex gap-2 overflow-x-auto pb-1.5 -mx-2 px-2 select-none scrollbar-none">
              {DAYS.map((d) => {
                const isActive = activeDay === d
                const count = timeBlocks.filter((b) => b.day === d).length
                return (
                  <button
                    key={d}
                    onClick={() => setActiveDay(d)}
                    className={`flex-shrink-0 px-3.5 py-2.5 rounded-2xl font-black text-xs border transition-all active-pop flex flex-col items-center gap-0.5 min-w-[66px] ${
                      isActive
                        ? 'bg-brand-purple border-brand-purple/20 text-white shadow-md shadow-brand-purple/25'
                        : 'bg-white/70 border-slate-200/65 text-slate-500 hover:bg-white'
                    }`}
                  >
                    <span>{d.substring(0, 3)}</span>
                    <span className={`text-[8.5px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Quick Presets Strip (hidden when exporting) */}
            {!isExporting && (
              <div className="space-y-1.5 select-none px-1">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                    💡 Quick Preset Ideas
                  </span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase">Tap to budget time</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1.5 -mx-2 px-2 scrollbar-none">
                  {PRESETS.map((p) => {
                    const dom = getDomainDetails(p.domain)
                    return (
                      <button
                        key={p.title}
                        type="button"
                        onClick={() => handleTapPreset(p)}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[10.5px] font-black border flex items-center gap-1 transition-all active-pop bg-white hover:bg-slate-50 ${dom.borderClass} ${dom.textClass}`}
                      >
                        <span>{p.emoji}</span>
                        <span>{p.title.split(' ')[0]}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Compact 7x24 Heatmap Grid (Visualizing entire week at a glance) */}
            <section className="card-soft bg-white/70 border border-white/50 shadow-soft p-4 rounded-[28px]">
              <h3 className="text-[10px] font-black uppercase text-brand-dark mb-3 tracking-wide select-none">
                Weekly Allocation Heatmap
              </h3>
              
              {/* Heatmap Grid */}
              <div className="flex gap-1.5">
                {/* Day Labels */}
                <div className="flex flex-col justify-between text-[7px] font-black text-slate-350 w-5 uppercase select-none pb-0.5 pt-0.5">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                  <span>Sun</span>
                </div>
                
                {/* Day Columns */}
                <div className="flex-1 grid grid-cols-7 gap-1">
                  {DAYS.map((d) => {
                    const dayBlocks = timeBlocks.filter((b) => b.day === d)
                    return (
                      <div key={d} className="flex flex-col gap-0.5">
                        {Array.from({ length: 24 }).map((_, hr) => {
                          const matchingBlock = dayBlocks.find((b) => {
                            const startHr = parseInt(b.start_time.split(':')[0] || '0')
                            const endHr = parseInt(b.end_time.split(':')[0] || '0')
                            return hr >= startHr && hr < endHr
                          })
                          
                          let cellBg = 'bg-slate-100/80'
                          if (matchingBlock) {
                            const det = getDomainDetails(matchingBlock.domain)
                            if (det.id === 'spiritual') cellBg = 'bg-emerald-500 shadow-sm shadow-emerald-500/10'
                            else if (det.id === 'work') cellBg = 'bg-brand-cyan shadow-sm shadow-brand-cyan/10'
                            else if (det.id === 'health') cellBg = 'bg-brand-amber shadow-sm shadow-brand-amber/10'
                            else if (det.id === 'downtime') cellBg = 'bg-brand-purple shadow-sm shadow-brand-purple/10'
                            else if (det.id === 'matches') cellBg = 'bg-rose-500 shadow-sm shadow-rose-500/10'
                          }

                          return (
                            <div
                              key={hr}
                              className={`aspect-square rounded-[3px] transition-colors duration-300 ${cellBg}`}
                              title={`${d} @ ${hr}:00 — ${matchingBlock ? matchingBlock.title : 'Unallocated'}`}
                            />
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap gap-2.5 mt-3 pt-3 border-t border-slate-100 justify-center">
                {DOMAINS.map((dom) => (
                  <div key={dom.id} className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded bg-gradient-to-tr ${dom.color}`} />
                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider">{dom.label.split(' ')[0]}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-slate-100 border border-slate-200" />
                  <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider">Free</span>
                </div>
              </div>
            </section>

            {/* Strict vertical Hourly timeline calendar */}
            <section className="card-soft bg-white/70 border border-white/50 shadow-soft p-4 rounded-[28px] relative overflow-hidden">
              <div className="flex justify-between items-center mb-4 select-none">
                <h3 className="text-[10px] font-black uppercase text-brand-dark tracking-wide">
                  {activeDay} Grid Timeline
                </h3>
                
                {/* Exporter and hours filters (hidden during print) */}
                {!isExporting && (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setShowFullDay(!showFullDay)}
                      className="px-2 py-1 text-[8.5px] font-black uppercase tracking-wider rounded-xl bg-slate-150/70 hover:bg-slate-200 border border-slate-200/50 text-slate-500 transition-all flex items-center gap-1"
                      title={showFullDay ? "Show Core Waking Hours (06:00 - 23:00)" : "Show All 24 Hours"}
                    >
                      {showFullDay ? <EyeOff size={10} /> : <Eye size={10} />}
                      <span>{showFullDay ? "Core Waking" : "Full 24h"}</span>
                    </button>

                    <button
                      onClick={handleExport}
                      disabled={isExporting}
                      className="px-2 py-1 text-[8.5px] font-black uppercase tracking-wider rounded-xl bg-brand-purple/10 hover:bg-brand-purple/15 border border-brand-purple/20 text-brand-purple transition-all flex items-center gap-1 disabled:opacity-50"
                    >
                      <Download size={10} />
                      <span>Export Pic</span>
                    </button>
                  </div>
                )}
              </div>

              {activeDayBlocks.length === 0 ? (
                <div className="py-12 text-center select-none">
                  <Clock className="text-slate-300 mx-auto mb-2 animate-bounce" size={24} />
                  <p className="text-xs font-extrabold text-slate-500">No time blocks budgeted today</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Tap quick presets or click + to schedule your domains!</p>
                </div>
              ) : (
                /* UX UX Upgrade: Fixed height, scroll-smooth container for daily grid, expands to h-auto when exporting */
                <div 
                  ref={scrollContainerRef}
                  className={`relative border-l border-slate-200/60 pl-8 transition-all duration-300 ${
                    isExporting ? 'h-auto overflow-visible' : 'h-[360px] overflow-y-auto pr-1 scrollbar-thin'
                  }`}
                >
                  {/* Vertical timeline background hours */}
                  <div className="absolute inset-y-0 left-8 right-0 pointer-events-none select-none">
                    {gridHours.map((hr) => (
                      <div
                        key={hr}
                        className="border-b border-dashed border-slate-100 flex items-center"
                        style={{ height: `${rowHeight}px` }}
                      >
                        <span className="absolute left-[-32px] text-[8.5px] font-bold text-slate-400 font-mono mt-[-25px]">
                          {hr.toString().padStart(2, '0')}:00
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Positioning blocks container */}
                  <div 
                    className="relative w-full pointer-events-none"
                    style={{ height: `${gridHours.length * rowHeight}px` }}
                  >
                    {activeDayBlocks.map((block) => {
                      const startMin = timeToMinutes(block.start_time)
                      const endMin = timeToMinutes(block.end_time)
                      const displayStartMin = displayStartHour * 60
                      
                      // Skip rendering if block lies entirely outside display hours
                      if (endMin <= displayStartMin || startMin >= displayEndHour * 60) return null

                      // Cap start and end coordinates within display hour window
                      const visibleStartMin = Math.max(startMin, displayStartMin)
                      const visibleEndMin = Math.min(endMin, displayEndHour * 60)

                      const blockTop = ((visibleStartMin - displayStartMin) / 60) * rowHeight
                      const blockHeight = ((visibleEndMin - visibleStartMin) / 60) * rowHeight
                      
                      const dom = getDomainDetails(block.domain)

                      return (
                        <div
                          key={block.id}
                          className={`absolute left-0 right-0 p-3 rounded-2xl border backdrop-blur-md shadow-sm transition-all duration-300 pointer-events-auto flex justify-between items-start group ${dom.bgLight} ${dom.borderClass}`}
                          style={{
                            top: `${blockTop}px`,
                            height: `${blockHeight}px`,
                            minHeight: '42px'
                          }}
                        >
                          <div className="min-w-0 pr-1 flex-1">
                            <div className="flex items-center gap-1.5">
                              {block.domain === 'matches' ? (
                                <Trophy size={11} className="text-rose-500 shrink-0" />
                              ) : block.domain === 'spiritual' ? (
                                <BookOpen size={11} className="text-emerald-500 shrink-0" />
                              ) : block.created_by === 'partner' ? (
                                <User size={11} className="text-slate-400 shrink-0" />
                              ) : null}
                              <h4 className="font-black text-xs text-slate-800 leading-none truncate select-all">
                                {block.title}
                              </h4>
                            </div>
                            {blockHeight > 55 && (
                              <div className="flex items-center gap-1 text-[8px] font-bold text-slate-500 mt-1 select-none">
                                <Clock size={8} />
                                <span>{block.start_time} - {block.end_time}</span>
                                <span className="mx-1">•</span>
                                <span className={`uppercase tracking-wider ${dom.textClass}`}>{block.domain}</span>
                              </div>
                            )}
                            {blockHeight > 75 && block.details && (
                              <p className="text-[9px] font-bold text-slate-400 mt-1 leading-tight line-clamp-2 select-all">
                                {block.details}
                              </p>
                            )}
                          </div>
                          
                          {/* Hide trash button during picture export */}
                          {!isExporting && (
                            <button
                              onClick={() => deleteTimeBlock(block.id)}
                              className="w-5.5 h-5.5 rounded-lg bg-white/80 border border-slate-200/50 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 flex items-center justify-center text-slate-400 active-pop transition-all shrink-0 ml-1.5"
                              title="Delete Block"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'analytics' && (
          <section className="space-y-6">
            <div className="card-soft bg-white/70 border border-white/50 shadow-soft rounded-[28px] p-5">
              <h3 className="text-sm font-black text-brand-dark mb-4 tracking-wide uppercase flex items-center gap-1.5 select-none">
                <BarChart2 size={16} className="text-brand-purple" />
                Domain Allocation Metrics
              </h3>

              <div className="space-y-4">
                {DOMAINS.map((dom) => {
                  const hours = domainHours[dom.id] || 0
                  const percent = totalHours > 0 ? (hours / totalHours) * 100 : 0
                  return (
                    <div key={dom.id} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-black uppercase text-slate-655 tracking-wide select-none">
                        <span className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded bg-gradient-to-tr ${dom.color}`} />
                          {dom.label}
                        </span>
                        <span className="font-mono text-brand-dark">{hours.toFixed(1)}h ({percent.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${dom.color} transition-all duration-700`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-6 p-4 bg-slate-50 border border-slate-200/40 rounded-2xl select-none">
                <h4 className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Macro Habits Insight</h4>
                <p className="text-xs font-semibold text-slate-600 leading-relaxed mt-1.5">
                  {totalHours > 40 ? (
                    "Wow! You've budgeted a high-density routine this week. Make sure to schedule enough downtime to avoid focus burnout. 🚀"
                  ) : totalHours > 10 ? (
                    "Nice routine building! Consider allocating specific time blocks for spiritual and health domains to maintain a balanced heatmap. ⚖️"
                  ) : (
                    "Your calendar is mostly free. Try time-blocking your upcoming World Cup matches and daily habits to budget your weeks intentionally. ⏳"
                  )}
                </p>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Floating Action Button to Add Time Block (hidden when exporting) */}
      {!isExporting && (
        <button
          onClick={() => {
            // Pre-fill fields with standard defaults
            setTitle('')
            setDetails('')
            setDomain('work')
            setDay(activeDay)
            setStartTime('09:00')
            setEndTime('10:00')
            setIsAddingBlock(true)
          }}
          className="fixed bottom-24 right-8 w-14 h-14 bg-gradient-to-tr from-brand-purple to-pink-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-brand-purple/35 hover:scale-110 active:scale-95 transition-transform z-40 border border-white/20 active-pop animate-pulse"
          title="Schedule a Domain Time Block"
        >
          <Plus size={28} strokeWidth={3} />
        </button>
      )}

      {/* Add Time Block Modal */}
      {isAddingBlock && createPortal(
        <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-white rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-slide-up border border-slate-100 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-extrabold text-xl text-brand-dark">Schedule Time Block</h3>
              <button
                onClick={() => setIsAddingBlock(false)}
                className="text-brand-gray font-bold text-sm bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200 active-pop"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddBlockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Block Title</label>
                <input
                  type="text"
                  placeholder="e.g. Fajr Prayer, Gym workout, World Cup Match..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-purple focus:outline-none font-semibold text-brand-dark text-sm"
                  required
                />
              </div>

              {/* Presets Grid inside Form */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Select Quick Preset Category Idea
                </label>
                <div className="grid grid-cols-3 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {PRESETS.map((p) => {
                    const isSelectedPreset = title === p.title && domain === p.domain
                    return (
                      <button
                        key={p.title}
                        type="button"
                        onClick={() => {
                          setTitle(p.title)
                          setDomain(p.domain)
                        }}
                        className={`px-2 py-2 rounded-xl text-[10px] font-black border transition-all active-pop flex items-center justify-center gap-1 ${
                          isSelectedPreset
                            ? 'bg-brand-purple text-white border-brand-purple'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span>{p.emoji}</span>
                        <span>{p.title.split(' ')[0]}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Domain Category</label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value as TimeBlock['domain'])}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-purple focus:outline-none font-bold text-sm text-brand-dark"
                  >
                    <option value="spiritual">Spiritual Routine</option>
                    <option value="work">Focus Work</option>
                    <option value="health">Physical Health</option>
                    <option value="downtime">Personal Downtime</option>
                    <option value="matches">Sports & Matches</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Day of Week</label>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-purple focus:outline-none font-bold text-sm text-brand-dark"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-purple focus:outline-none font-semibold text-brand-dark text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-purple focus:outline-none font-semibold text-brand-dark text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Notes & Details (optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. World Cup Match: Argentina vs France, live broadcast..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-purple focus:outline-none font-semibold text-brand-dark text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-brand-purple to-pink-500 text-white rounded-2xl font-bold shadow-lg shadow-brand-purple/20 hover:scale-[0.99] transition-all"
              >
                Schedule Block
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
