import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { ArrowLeft, Gift, Plus, Trash2, Star, Heart, MessageSquare, ExternalLink } from 'lucide-react'
import { ConfirmDialog } from '../components/ConfirmDialog'

export default function Gifts() {
  const navigate = useNavigate()
  const {
    memories,
    partnerName,
    fetchMemories,
    addGift,
    deleteGift
  } = useAppStore()

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

  // Filter gifts by type and creator
  const myGifts = memories.filter((m) => m.type === 'gift' && m.created_by === 'you')
  const partnerGifts = memories.filter((m) => m.type === 'gift' && m.created_by === 'partner')

  const currentGifts = activeTab === 'me' ? myGifts : partnerGifts
  const displayPartnerName = partnerName ? partnerName.split(' ')[0] : 'Partner'

  const handleAddGift = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    await addGift(
      title.trim(), 
      note.trim() || undefined, 
      photo.trim() || undefined, 
      link.trim() || undefined
    )
    handleClose()
  }

  const handleClose = () => {
    setIsAdding(false)
    setTitle('')
    setNote('')
    setPhoto('')
    setLink('')
  }

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
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-500/10 border border-rose-500/20 px-3.5 py-1 rounded-full select-none inline-flex items-center gap-1">
              Ideas
            </span>
            <h1 className="text-2xl font-black text-brand-dark mt-1 tracking-tight">Gifts We Love</h1>
          </div>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-rose-500/5 border border-rose-500/20 shadow-sm flex items-center justify-center relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 to-pink-500/5 opacity-50" />
          <Gift className="text-rose-500 relative z-10" size={18} strokeWidth={2.5} />
        </div>
      </header>

      {/* Tabs - Me vs Partner */}
      <div className="flex bg-slate-100/60 backdrop-blur-md p-1.5 rounded-[22px] mb-8 border border-slate-200/50">
        <button
          onClick={() => setActiveTab('me')}
          className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wide transition-all duration-200 active-pop flex items-center justify-center gap-1.5 ${
            activeTab === 'me'
              ? 'bg-white text-rose-600 shadow-sm border border-slate-100/55'
              : 'text-slate-400 hover:text-slate-650'
          }`}
        >
          <Star size={13} />
          Gifts I Love
        </button>
        <button
          onClick={() => setActiveTab('partner')}
          className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wide transition-all duration-200 active-pop flex items-center justify-center gap-1.5 ${
            activeTab === 'partner'
              ? 'bg-white text-rose-600 shadow-sm border border-slate-100/55'
              : 'text-slate-400 hover:text-slate-655'
          }`}
        >
          <Heart size={13} />
          Gifts {displayPartnerName} Loves
        </button>
      </div>

      {/* Gifts List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {loading ? (
          // Loading skeleton
          <div className="col-span-full space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="card-soft bg-white/70 h-24 animate-pulse rounded-[28px] border border-white/50" />
            ))}
          </div>
        ) : currentGifts.length === 0 ? (
          <div className="col-span-full card-soft py-14 text-center bg-white/80 border border-dashed border-slate-200 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center">
              <Gift size={28} className="text-rose-400" />
            </div>
            <div>
              <p className="text-sm font-black text-brand-dark">
                {activeTab === 'me' ? 'Your wishlist is empty' : `${displayPartnerName} hasn't added any gift ideas yet`}
              </p>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                {activeTab === 'me' ? 'Add ideas so your partner knows what you love!' : 'Check back later ❤️'}
              </p>
            </div>
            {activeTab === 'me' && (
              <button
                onClick={() => setIsAdding(true)}
                className="px-5 py-2.5 bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-full text-xs font-black uppercase tracking-wider active-pop"
              >
                + Add First Gift Idea
              </button>
            )}
          </div>
        ) : (
          currentGifts.map((gift) => (
            <div 
              key={gift.id} 
              className="card-soft bg-white/75 hover:bg-white border border-white/60 hover:border-rose-350 shadow-soft overflow-hidden transition-all duration-300 hover:scale-[1.015] flex flex-col group"
            >
              {/* Optional Cover Photo */}
              {gift.photo && (
                <div className="relative w-full h-48 overflow-hidden bg-slate-50 border-b border-slate-100/50">
                  <img 
                    src={gift.photo} 
                    alt={gift.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60 pointer-events-none" />
                </div>
              )}

              {/* Content area */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-extrabold text-sm text-brand-dark leading-snug">{gift.title}</h3>
                    <button
                      onClick={() => setDeleteConfirmId(gift.id)}
                      className="text-slate-300 hover:text-rose-500 p-1.5 rounded-xl hover:bg-rose-50 transition-all flex items-center justify-center shrink-0 active-pop"
                      title="Delete idea"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  {gift.note && (
                    <div className="mt-2.5 bg-rose-500/5 border border-rose-500/10 p-3 rounded-2xl text-[11px] text-rose-900/90 leading-relaxed font-semibold flex items-start gap-1.5 select-none">
                      <MessageSquare size={11} className="text-rose-400 mt-0.5 shrink-0" />
                      <span>{gift.note}</span>
                    </div>
                  )}
                </div>

                {/* Optional Web Link */}
                {gift.page_url && (
                  <div className="mt-4 pt-3 border-t border-slate-100/50 flex items-center justify-start">
                    <a
                      href={gift.page_url.startsWith('http') ? gift.page_url : `https://${gift.page_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] font-black uppercase tracking-wider hover:bg-rose-500/15 transition-all active-pop"
                    >
                      <ExternalLink size={11} />
                      View Link
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setIsAdding(true)}
        className="fixed bottom-24 right-8 w-14 h-14 bg-gradient-to-tr from-rose-500 to-pink-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-rose-500/30 hover:scale-110 active-pop transition-transform z-40 border border-white/20"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        title="Remove gift idea?"
        message="This will permanently remove this gift idea. This action can't be undone."
        confirmLabel="Remove"
        onConfirm={() => deleteConfirmId && deleteGift(deleteConfirmId)}
        onCancel={() => setDeleteConfirmId(null)}
      />

      {/* Add Gift Modal (Centered in the middle of the screen) */}
      {isAdding && (
        <div className="fixed inset-0 bg-brand-dark/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-slide-up border border-slate-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-extrabold text-xl text-brand-dark flex items-center gap-2">
                <Gift className="text-rose-500" size={20} />
                <span>Add Gift Idea</span>
              </h3>
              <button 
                onClick={handleClose} 
                className="text-brand-gray font-bold text-sm bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200 active-pop"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddGift} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Gift Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lavender scented candle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-rose-500 font-semibold text-brand-dark text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Optional Note / Details</label>
                <input
                  type="text"
                  placeholder="e.g. Preferably the one from Zara Home"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-rose-500 font-semibold text-brand-dark text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Photo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="e.g. https://example.com/image.jpg"
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-rose-500 font-semibold text-brand-dark text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Web Link / URL (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. https://www.zarahome.com/..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-rose-500 font-semibold text-brand-dark text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-500/20 hover:scale-[0.99] transition-all"
              >
                Add Idea
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
