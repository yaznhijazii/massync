import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { useAppStore } from '../store/useAppStore'
import { ArrowLeft, Gift, Plus, Trash2, Star, Heart, MessageSquare, ExternalLink, List, X } from 'lucide-react'
import { ConfirmDialog } from '../components/ConfirmDialog'

// Scatter items freely across the board in a grid-with-jitter layout
function getDreamBoardLayout(index: number, total: number) {
  const cols = total <= 2 ? 2 : total <= 6 ? 3 : 3
  const rows = Math.ceil(total / cols)
  const col = index % cols
  const row = Math.floor(index / cols)

  // Inner cork area is ~290 wide x 305 tall; center at 0,0
  const cellW = 240 / cols
  const cellH = 260 / Math.max(rows, 1)

  const baseX = (col + 0.5) * cellW - 120
  const baseY = (row + 0.5) * cellH - 130

  // Deterministic jitter so items don't align in a rigid grid
  const jitterX = (((index * 73 + 11) % 50) - 25)
  const jitterY = (((index * 89 + 23) % 40) - 20)

  const x = Math.max(-115, Math.min(115, baseX + jitterX))
  const y = Math.max(-125, Math.min(125, baseY + jitterY))

  // Slight tilt — alternating direction
  const tilt = (((index * 31 + 5) % 22) - 11)

  const pinColors = ['#F43F5E', '#A855F7', '#00BCD4', '#F59E0B', '#22C55E', '#EC4899', '#3B82F6', '#EF4444']
  const pinColor = pinColors[index % pinColors.length]

  return { x, y, tilt, pinColor }
}

const getGiftEmoji = (titleStr: string, index: number) => {
  const t = titleStr.toLowerCase()
  if (t.includes('coffee') || t.includes('mug') || t.includes('cup')) return '☕'
  if (t.includes('perfume') || t.includes('scent') || t.includes('candle')) return '🕯️'
  if (t.includes('chocolate') || t.includes('candy') || t.includes('sweet')) return '🍫'
  if (t.includes('bag') || t.includes('wallet') || t.includes('backpack')) return '🛍️'
  if (t.includes('book') || t.includes('novel') || t.includes('read')) return '📚'
  if (t.includes('flower') || t.includes('rose') || t.includes('plant')) return '🌸'
  if (t.includes('watch') || t.includes('bracelet') || t.includes('ring')) return '💍'
  if (t.includes('shoe') || t.includes('sneaker')) return '👟'
  if (t.includes('game') || t.includes('console') || t.includes('gaming')) return '🎮'
  if (t.includes('headphone') || t.includes('earphone') || t.includes('music')) return '🎧'
  const fallback = ['🎁', '🧸', '🎈', '💖', '🌟', '🎀', '🧁', '🎶']
  return fallback[index % fallback.length]
}

export default function Gifts() {
  const navigate = useNavigate()
  const { memories, partnerName, fetchMemories, addGift, deleteGift } = useAppStore()

  useEffect(() => {
    setLoading(true)
    fetchMemories().catch(() => {}).finally(() => setLoading(false))
  }, [fetchMemories])

  const [activeTab, setActiveTab] = useState<'me' | 'partner'>('me')
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [photo, setPhoto] = useState('')
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board')
  const [selectedGift, setSelectedGift] = useState<any | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const myGifts = memories.filter((m) => m.type === 'gift' && m.created_by === 'you')
  const partnerGifts = memories.filter((m) => m.type === 'gift' && m.created_by === 'partner')
  const currentGifts = activeTab === 'me' ? myGifts : partnerGifts
  const displayPartnerName = partnerName ? partnerName.split(' ')[0] : 'Partner'

  // Pre-compute layout positions (memoized per gift list)
  const layouts = useMemo(() =>
    currentGifts.map((_, i) => getDreamBoardLayout(i, currentGifts.length)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentGifts.length, activeTab]
  )

  const handleAddGift = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await addGift(title.trim(), note.trim() || undefined, photo.trim() || undefined, link.trim() || undefined)
    handleClose()
  }

  const handleClose = () => {
    setIsAdding(false)
    setTitle('')
    setNote('')
    setPhoto('')
    setLink('')
  }

  // Board container dimensions
  const BOARD_W = 320
  const BOARD_H = 340

  return (
    <div className="relative pb-28 pt-14 px-6 min-h-screen animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-2xl bg-white/70 border border-white/50 flex items-center justify-center text-brand-dark active-pop shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-brand-dark tracking-tight">Gifts We Love</h1>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Dream Board</p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex bg-white/45 backdrop-blur-md p-1 rounded-xl border border-white/50 shadow-sm shrink-0">
          <button
            onClick={() => setViewMode('board')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'board'
                ? 'bg-white text-rose-600 shadow-sm border border-slate-100/50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Dream Board"
          >
            <Gift size={15} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-white text-rose-600 shadow-sm border border-slate-100/50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title="List View"
          >
            <List size={15} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex bg-white/45 backdrop-blur-md p-1.5 rounded-[22px] mb-8 border border-white/50 shadow-sm">
        <button
          onClick={() => setActiveTab('me')}
          className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wide transition-all duration-300 active-pop flex items-center justify-center gap-1.5 ${
            activeTab === 'me'
              ? 'bg-white text-rose-600 shadow-[0_4px_16px_rgba(244,63,94,0.12)] border border-slate-100/55'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Star size={13} />
          My Wishlist
        </button>
        <button
          onClick={() => setActiveTab('partner')}
          className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wide transition-all duration-300 active-pop flex items-center justify-center gap-1.5 ${
            activeTab === 'partner'
              ? 'bg-white text-rose-600 shadow-[0_4px_16px_rgba(244,63,94,0.12)] border border-slate-100/55'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Heart size={13} />
          {displayPartnerName}'s Wishlist
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="card-soft bg-white/70 h-24 animate-pulse rounded-[28px] border border-white/50" />
          ))}
        </div>
      ) : currentGifts.length === 0 ? (
        /* Empty State */
        <div className="card-soft py-14 text-center bg-white/80 border border-dashed border-slate-200 flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center border border-rose-200/50 shadow-inner">
              <Gift size={30} className="text-rose-400 animate-bounce" />
            </div>
            {/* Decorative pin */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-rose-400 border-2 border-white shadow-md" />
          </div>
          <div>
            <p className="text-sm font-black text-brand-dark">
              {activeTab === 'me' ? 'Your dream board is empty' : `${displayPartnerName} hasn't pinned anything yet`}
            </p>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">
              {activeTab === 'me' ? 'Pin your wish items so your partner knows what you dream of!' : 'Check back later ❤️'}
            </p>
          </div>
          {activeTab === 'me' && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full text-xs font-black uppercase tracking-wider active-pop shadow-lg shadow-rose-500/25"
            >
              + Pin First Wish
            </button>
          )}
        </div>
      ) : viewMode === 'board' ? (
        /* ─── DREAM BOARD VIEW ─── */
        <div className="flex flex-col items-center" style={{ paddingTop: 36 }}>

          {/* SVG noise filter def (hidden) for realistic cork grain */}
          <svg width="0" height="0" className="absolute pointer-events-none" style={{ position: 'absolute' }}>
            <defs>
              <filter id="cork-noise" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.72 0.55" numOctaves="4" seed="8" result="noise" />
                <feColorMatrix type="matrix"
                  values="0 0 0 0 0.56
                          0 0 0 0 0.34
                          0 0 0 0 0.12
                          0 0 0 0 0.45"
                  in="noise" result="coloredNoise" />
                <feComposite in="SourceGraphic" in2="coloredNoise" operator="arithmetic" k1="0" k2="0.75" k3="0.45" k4="0" />
              </filter>
              <filter id="wood-noise" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.015 0.6" numOctaves="3" seed="3" result="woodGrain" />
                <feColorMatrix type="saturate" values="0.5" in="woodGrain" result="colorGrain" />
                <feComposite in="SourceGraphic" in2="colorGrain" operator="arithmetic" k1="0" k2="0.85" k3="0.22" k4="0" />
              </filter>
            </defs>
          </svg>

          {/* Hanging rope SVG */}
          <div className="relative" style={{ width: BOARD_W, height: 40, marginBottom: -3, zIndex: 10 }}>
            <svg width={BOARD_W} height={40} viewBox={`0 0 ${BOARD_W} 40`} className="absolute top-0 left-0">
              <path d={`M ${BOARD_W / 2} 3 Q ${BOARD_W / 2 - 58} 20 ${BOARD_W / 2 - 128} 40`}
                stroke="#b89050" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d={`M ${BOARD_W / 2} 3 Q ${BOARD_W / 2 - 52} 18 ${BOARD_W / 2 - 122} 40`}
                stroke="#d4aa68" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />
              <path d={`M ${BOARD_W / 2} 3 Q ${BOARD_W / 2 + 58} 20 ${BOARD_W / 2 + 128} 40`}
                stroke="#b89050" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d={`M ${BOARD_W / 2} 3 Q ${BOARD_W / 2 + 52} 18 ${BOARD_W / 2 + 122} 40`}
                stroke="#d4aa68" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />
              {/* Metal screw/hook */}
              <circle cx={BOARD_W / 2} cy={3} r="5.5" fill="#8a9ab0" />
              <circle cx={BOARD_W / 2} cy={3} r="3.5" fill="#c8d5e8" />
              <circle cx={BOARD_W / 2} cy={3} r="1.5" fill="#8a9ab0" />
            </svg>
          </div>

          {/* ─── Outer Wood Frame ─── */}
          <div
            className="relative"
            style={{
              width: BOARD_W,
              height: BOARD_H,
              borderRadius: 8,
              padding: 13,
              /* Light pine — filtered with wood-noise via SVG filter */
              backgroundColor: '#d4b87a',
              backgroundImage: 'linear-gradient(175deg, #e0c888 0%, #c8a860 30%, #b89048 55%, #c8a860 80%, #d8bc78 100%)',
              filter: 'url(#wood-noise)',
              boxShadow: [
                /* top-left highlight edge */
                'inset 4px 4px 0px rgba(255,240,180,0.55)',
                /* bottom-right shadow edge */
                'inset -4px -4px 0px rgba(80,50,10,0.25)',
                /* outer drop shadow */
                '0 22px 55px rgba(0,0,0,0.30)',
                '0 8px 20px rgba(0,0,0,0.18)',
              ].join(', '),
            }}
          >
            {/* Inner frame bevel — light top/left, dark bottom/right */}
            <div className="absolute inset-0 pointer-events-none rounded-[8px]" style={{
              boxShadow: 'inset 2px 2px 5px rgba(255,245,200,0.4), inset -2px -2px 5px rgba(60,30,5,0.3)',
            }} />

            {/* ─── Cork Surface ─── */}
            <div
              className="relative overflow-hidden"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 3,
                /* Base cork colour — warm medium tan */
                backgroundColor: '#bf8d52',
                backgroundImage: 'linear-gradient(128deg, #cc9960 0%, #b8844a 22%, #c99558 45%, #b58040 68%, #be8c55 88%, #c89858 100%)',
                filter: 'url(#cork-noise)',
                boxShadow: 'inset 0 3px 10px rgba(0,0,0,0.22), inset 0 0 60px rgba(70,35,8,0.14)',
              }}
            >
              {/* Pinned Gift Cards — scattered freely, no center node */}
              {currentGifts.map((gift, i) => {
                const { x, y, tilt, pinColor } = layouts[i]
                const isSelected = selectedGift?.id === gift.id
                const isHovered = hoveredId === gift.id || isSelected
                const emoji = getGiftEmoji(gift.title, i)
                return (
                  <div key={gift.id}
                    style={{
                      position: 'absolute',
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: `translate(-50%, -50%) rotate(${isHovered ? 0 : tilt}deg) scale(${isHovered ? 1.12 : 1})`,
                      transition: 'transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      zIndex: isHovered ? 30 : 20,
                    }}
                    onClick={() => setSelectedGift(gift)}
                    onMouseEnter={() => setHoveredId(gift.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="cursor-pointer"
                  >
                    {/* Push Pin */}
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center"
                      style={{ filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.45))` }}>
                      {/* Pin head */}
                      <div className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: pinColor,
                          border: '1.5px solid rgba(255,255,255,0.6)',
                          boxShadow: `inset 0 -2px 3px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.5), 0 2px 6px ${pinColor}80`,
                          background: `radial-gradient(circle at 35% 30%, ${pinColor}ff, ${pinColor}aa)`,
                        }} />
                      {/* Pin shaft */}
                      <div style={{ width: 3, height: 9, background: 'linear-gradient(to bottom, rgba(150,150,150,0.9), rgba(100,100,100,0.7))', borderRadius: '0 0 2px 2px' }} />
                    </div>

                    {/* Polaroid card */}
                    <div style={{
                      width: 74,
                      borderRadius: 2,
                      background: '#ffffff',
                      boxShadow: isHovered
                        ? '3px 10px 28px rgba(0,0,0,0.35), 1px 3px 8px rgba(0,0,0,0.20)'
                        : `${tilt > 0 ? '3px' : '-3px'} 6px 16px rgba(0,0,0,0.30), 1px 2px 5px rgba(0,0,0,0.14)`,
                    }}>
                      {/* Photo / emoji */}
                      <div className="w-full overflow-hidden flex items-center justify-center"
                        style={{ height: 64, background: '#f1f1f0' }}>
                        {gift.photo
                          ? <img src={gift.photo} alt={gift.title} className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none' }} />
                          : <span className="text-2xl select-none">{emoji}</span>}
                      </div>
                      {/* Caption */}
                      <div style={{ padding: '5px 5px 10px', background: '#ffffff', textAlign: 'center' }}>
                        <p style={{ fontSize: 7, fontWeight: 900, color: '#374151', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          {gift.title.length > 12 ? gift.title.slice(0, 11) + '…' : gift.title}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center mt-5 bg-white/30 backdrop-blur-sm border border-white/40 px-4 py-2 rounded-full shadow-sm">
            Tap a pinned card to view details
          </p>
        </div>
      ) : (
        /* ─── LIST VIEW ─── */
        <div className="space-y-4 animate-fade-in">
          {currentGifts.map((gift, i) => {
            const emoji = getGiftEmoji(gift.title, i)
            return (
              <div
                key={gift.id}
                onClick={() => setSelectedGift(gift)}
                className="flex items-center gap-4 bg-white/80 hover:bg-white border border-white/60 hover:border-rose-200 rounded-[28px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(244,63,94,0.08)] transition-all duration-300 hover:scale-[1.015] active-pop cursor-pointer group"
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-[20px] overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100/50 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
                  {gift.photo ? (
                    <img src={gift.photo} alt={gift.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">{emoji}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-sm text-brand-dark truncate group-hover:text-rose-600 transition-colors">{gift.title}</h3>
                  {gift.note && (
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5 line-clamp-1 flex items-center gap-1">
                      <MessageSquare size={9} className="shrink-0 text-rose-300" />
                      {gift.note}
                    </p>
                  )}
                  {gift.page_url && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-rose-500 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full mt-1">
                      <ExternalLink size={8} />
                      Link
                    </span>
                  )}
                </div>

                {/* Delete */}
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(gift.id) }}
                  className="w-8 h-8 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-all active-pop shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Floating Add Button */}
      <button
        onClick={() => setIsAdding(true)}
        className="fixed bottom-24 right-8 w-14 h-14 bg-gradient-to-tr from-rose-500 to-pink-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-rose-500/30 hover:scale-110 active-pop transition-transform z-40 border border-white/20"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        title="Remove from dream board?"
        message="This will permanently remove this gift idea from your wishlist."
        confirmLabel="Remove"
        onConfirm={() => deleteConfirmId && deleteGift(deleteConfirmId)}
        onCancel={() => setDeleteConfirmId(null)}
      />

      {/* Add Gift Modal */}
      {isAdding && createPortal(
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-brand-dark/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-slide-up border border-slate-100 max-h-[90vh] overflow-y-auto"
          >
            {/* Header with decorative pin */}
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-md shadow-rose-500/25">
                  <Gift size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-brand-dark">Pin a Wish</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Add to your dream board</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all active-pop"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleAddGift} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Gift Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lavender scented candle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-rose-400 font-semibold text-brand-dark text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Note / Details</label>
                <input
                  type="text"
                  placeholder="e.g. The one from Zara Home"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-rose-400 font-semibold text-brand-dark text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Photo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-rose-400 font-semibold text-brand-dark text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Shop Link (Optional)</label>
                <input
                  type="text"
                  placeholder="https://www.zarahome.com/..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-rose-400 font-semibold text-brand-dark text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-rose-500/25 hover:scale-[0.99] active-pop transition-all"
              >
                📌 Pin to Dream Board
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Gift Detail Overlay */}
      {selectedGift && createPortal(
        <div
          onClick={() => setSelectedGift(null)}
          className="fixed inset-0 bg-brand-dark/55 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[36px] w-full max-w-sm shadow-2xl border border-slate-100 relative animate-scale-in overflow-hidden"
          >
            {/* Top accent gradient bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-rose-400 via-pink-500 to-rose-400" />

            {/* Close */}
            <button
              onClick={() => setSelectedGift(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all active:scale-90"
            >
              <X size={15} strokeWidth={2.5} />
            </button>

            <div className="p-6 flex flex-col items-center">
              {/* Pin at top */}
              <div className="relative mb-4">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                  <div className="w-5 h-5 rounded-full bg-rose-500 border-2 border-white shadow-lg" />
                  <div className="w-1.5 h-2.5 bg-rose-400/70 rounded-b-full" />
                </div>
                {/* Image or Emoji Hero */}
                {selectedGift.photo ? (
                  <div className="w-52 h-44 rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-slate-200/50 bg-white mt-3">
                    <img src={selectedGift.photo} className="w-full h-full object-cover" alt={selectedGift.title} />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-rose-50 to-pink-100 border border-rose-100 flex items-center justify-center text-5xl shadow-inner mt-3">
                    {getGiftEmoji(selectedGift.title, 0)}
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="font-extrabold text-xl text-slate-800 text-center px-4 leading-tight tracking-tight mt-1">
                {selectedGift.title}
              </h3>
              <span className="text-[9px] font-black uppercase tracking-widest text-rose-400 mt-1.5 bg-rose-50 border border-rose-100 px-3 py-0.5 rounded-full">
                Wish Pinned
              </span>

              {/* Note */}
              {selectedGift.note && (
                <div className="w-full mt-4 bg-slate-50 border border-slate-200/60 p-4 rounded-2xl text-left flex items-start gap-2">
                  <MessageSquare size={12} className="text-rose-400 mt-0.5 shrink-0" strokeWidth={2.5} />
                  <p className="text-slate-600 text-xs font-semibold leading-relaxed whitespace-pre-wrap">
                    {selectedGift.note}
                  </p>
                </div>
              )}

              {/* Link */}
              {selectedGift.page_url && (
                <a
                  href={selectedGift.page_url.startsWith('http') ? selectedGift.page_url : `https://${selectedGift.page_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30 transition-all active:scale-[0.98]"
                >
                  <ExternalLink size={13} strokeWidth={2.5} />
                  View Shop Link
                </a>
              )}

              {/* Remove */}
              <div className="w-full mt-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setDeleteConfirmId(selectedGift.id)
                    setSelectedGift(null)
                  }}
                  className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-100 rounded-2xl font-black text-[11px] uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Trash2 size={13} strokeWidth={2.5} />
                  Unpin from Board
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
