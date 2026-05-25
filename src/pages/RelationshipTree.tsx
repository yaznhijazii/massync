import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore, type TreeNode } from '../store/useAppStore'
import { ArrowLeft, Network, Plus, Heart, Smile, Trash2, X, Sparkles, User, MessageSquare } from 'lucide-react'

export default function RelationshipTree() {
  const navigate = useNavigate()
  const {
    userName,
    partnerName,
    userAvatar,
    partnerAvatar,
    myTreeNodes,
    partnerTreeNodes,
    addTreeNode,
    deleteTreeNode
  } = useAppStore()

  const [activeTab, setActiveTab] = useState<'me' | 'partner'>('me')
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null)
  
  // Add Member Modal State
  const [isAdding, setIsAdding] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<'family' | 'friends'>('family')
  const [relationship, setRelationship] = useState('Mother')
  const [customRelationship, setCustomRelationship] = useState('')
  const [note, setNote] = useState('')

  // Determine current active tree data
  const currentNodes = activeTab === 'me' ? myTreeNodes : partnerTreeNodes
  const currentName = activeTab === 'me' ? userName : partnerName
  const currentAvatar = activeTab === 'me' ? userAvatar : partnerAvatar

  const familyNodes = currentNodes.filter((n) => n.category === 'family')
  const friendNodes = currentNodes.filter((n) => n.category === 'friends')

  const relationshipOptions = category === 'family' 
    ? ['Mother', 'Father', 'Brother', 'Sister', 'Grandmother', 'Grandfather', 'Uncle', 'Aunt', 'Cousin', 'Other']
    : ['Best Friend', 'Close Friend', 'Friend', 'Classmate', 'Colleague', 'Other']

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const finalRelationship = relationship === 'Other' 
      ? (customRelationship.trim() || 'Relative')
      : relationship

    addTreeNode(activeTab, {
      name: name.trim(),
      category,
      relationship: finalRelationship,
      note: note.trim() || undefined
    })

    // Reset Form
    setName('')
    setCustomRelationship('')
    setNote('')
    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this connection from your circle?')) {
      deleteTreeNode(activeTab, id)
      setSelectedNode(null)
    }
  }

  // Helper to get initials
  const getInitials = (str: string) => {
    return str.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
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
            <h1 className="text-2xl font-black text-brand-dark tracking-tight">Inner Circles</h1>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Friends & Family Tree</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center shadow-inner">
          <Network className="text-indigo-600 animate-pulse" size={18} />
        </div>
      </header>

      {/* Tabs - Me vs Partner */}
      <div className="flex bg-slate-100/60 backdrop-blur-md p-1.5 rounded-[22px] mb-8 border border-slate-200/50">
        <button
          onClick={() => setActiveTab('me')}
          className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wide transition-all duration-200 active-pop flex items-center justify-center gap-1.5 ${
            activeTab === 'me'
              ? 'bg-white text-indigo-700 shadow-sm border border-slate-100/55'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Sparkles size={13} className={activeTab === 'me' ? 'text-indigo-600 animate-pulse' : ''} />
          My Circle
        </button>
        <button
          onClick={() => setActiveTab('partner')}
          className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wide transition-all duration-200 active-pop flex items-center justify-center gap-1.5 ${
            activeTab === 'partner'
              ? 'bg-white text-indigo-700 shadow-sm border border-slate-100/55'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Heart size={13} className={activeTab === 'partner' ? 'text-indigo-600 animate-pulse' : ''} />
          {partnerName ? `${partnerName}'s Circle` : "Her Circle"}
        </button>
      </div>

      {/* Visual Connection Diagram Section */}
      <div className="flex flex-col items-center mb-4">
        {/* Central Core User Node */}
        <div className="relative flex flex-col items-center">
          <div className="absolute -inset-2 bg-gradient-to-tr from-brand-purple to-brand-cyan rounded-full blur-[6px] opacity-40 animate-pulse"></div>
          <div className="w-18 h-18 rounded-full border-[3px] border-white shadow-xl overflow-hidden bg-slate-50 relative z-10 flex items-center justify-center">
            {currentAvatar ? (
              <img src={currentAvatar} className="w-full h-full object-cover" alt={currentName} />
            ) : (
              <User size={28} className="text-slate-400" />
            )}
          </div>
          <div className="z-10 mt-3 bg-white/90 border border-white/60 backdrop-blur-md px-4 py-1.5 rounded-full shadow-md text-xs font-black text-brand-dark tracking-wide flex items-center gap-1.5">
            <span>{currentName}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
          </div>
        </div>

        {/* Tree Splitting SVG Connector */}
        <div className="w-full h-12 relative select-none">
          <svg className="w-full h-full" viewBox="0 0 200 48" fill="none">
            <defs>
              <linearGradient id="tree-split-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F43F5E" /> {/* Family Rose */}
                <stop offset="50%" stopColor="#A855F7" /> {/* Middle Purple */}
                <stop offset="100%" stopColor="#6366F1" /> {/* Friends Indigo */}
              </linearGradient>
            </defs>
            <path 
              d="M 100,0 L 100,20 L 50,20 L 50,48 M 100,20 L 150,20 L 150,48" 
              stroke="url(#tree-split-grad)" 
              strokeWidth="2.5" 
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 4"
            />
          </svg>
        </div>
      </div>

      {/* Side-by-side Branches Grid */}
      <div className="grid grid-cols-2 gap-4 items-start">
        {/* Family Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-1.5 bg-rose-50/70 border border-rose-100/50 py-2 rounded-2xl">
            <Heart size={13} className="text-rose-500 fill-rose-500/10" />
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600">Family</span>
            <span className="bg-rose-500/10 text-rose-600 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
              {familyNodes.length}
            </span>
          </div>

          <div className="space-y-3.5">
            {familyNodes.length === 0 ? (
              <div className="border-2 border-dashed border-slate-100/50 bg-white/20 p-6 rounded-[28px] text-center">
                <p className="text-[10px] text-slate-400/80 font-bold uppercase leading-relaxed">No family connections</p>
              </div>
            ) : (
              familyNodes.map((node) => (
                <div 
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="bg-white/70 hover:bg-white border border-white/60 hover:border-rose-300 shadow-[0_8px_16px_rgba(244,63,94,0.02)] hover:shadow-md rounded-3xl p-3.5 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:scale-[1.03] active-pop group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-400 to-pink-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-rose-500/10 transition-transform group-hover:scale-108">
                    {getInitials(node.name)}
                  </div>
                  <span className="text-xs font-black text-brand-dark mt-2.5 truncate w-full">{node.name}</span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-rose-500 bg-rose-50 border border-rose-100/60 px-2 py-0.5 rounded-full mt-1.5 select-none shrink-0">
                    {node.relationship}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Friends Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-1.5 bg-indigo-50/70 border border-indigo-100/50 py-2 rounded-2xl">
            <Smile size={13} className="text-indigo-500 fill-indigo-500/10" />
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">Friends</span>
            <span className="bg-indigo-500/10 text-indigo-600 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
              {friendNodes.length}
            </span>
          </div>

          <div className="space-y-3.5">
            {friendNodes.length === 0 ? (
              <div className="border-2 border-dashed border-slate-100/50 bg-white/20 p-6 rounded-[28px] text-center">
                <p className="text-[10px] text-slate-400/80 font-bold uppercase leading-relaxed">No friend connections</p>
              </div>
            ) : (
              friendNodes.map((node) => (
                <div 
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="bg-white/70 hover:bg-white border border-white/60 hover:border-indigo-300 shadow-[0_8px_16px_rgba(99,102,241,0.02)] hover:shadow-md rounded-3xl p-3.5 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:scale-[1.03] active-pop group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-400 to-cyan-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-500/10 transition-transform group-hover:scale-108">
                    {getInitials(node.name)}
                  </div>
                  <span className="text-xs font-black text-brand-dark mt-2.5 truncate w-full">{node.name}</span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-indigo-500 bg-indigo-50 border border-indigo-100/60 px-2 py-0.5 rounded-full mt-1.5 select-none shrink-0">
                    {node.relationship}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Floating Add Connection Button */}
      <button
        onClick={() => setIsAdding(true)}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-tr from-brand-purple to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-brand-purple/20 hover:scale-105 active-pop z-20 border border-white/20"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* Add Member Drawer/Modal */}
      {isAdding && (
        <div className="fixed inset-0 max-w-md mx-auto bg-brand-dark/40 backdrop-blur-sm z-50 flex items-end justify-center px-4 pb-8 animate-fade-in">
          <div className="bg-white rounded-[32px] w-full p-6 shadow-2xl animate-slide-up border border-slate-100 relative">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-extrabold text-xl text-brand-dark">Add Connection</h3>
              <button
                onClick={() => setIsAdding(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddNode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-purple focus:outline-none font-semibold text-brand-dark"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Category</label>
                  <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => {
                        setCategory('family')
                        setRelationship('Mother')
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs uppercase transition-all ${
                        category === 'family'
                          ? 'bg-white text-rose-500 shadow-sm'
                          : 'text-slate-400'
                      }`}
                    >
                      Family
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCategory('friends')
                        setRelationship('Best Friend')
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs uppercase transition-all ${
                        category === 'friends'
                          ? 'bg-white text-indigo-500 shadow-sm'
                          : 'text-slate-400'
                      }`}
                    >
                      Friends
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Relationship</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-purple focus:outline-none font-bold text-sm text-brand-dark"
                  >
                    {relationshipOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {relationship === 'Other' && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Custom Relationship</label>
                  <input
                    type="text"
                    placeholder="e.g. Step-Brother"
                    value={customRelationship}
                    onChange={(e) => setCustomRelationship(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-purple focus:outline-none font-semibold text-brand-dark"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Notes (optional)</label>
                <textarea
                  placeholder="e.g. Always calls on weekends, loves coffee"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-purple focus:outline-none font-semibold text-brand-dark h-20 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-brand-purple to-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-purple/20 hover:scale-[0.99] transition-all"
              >
                Add to Tree
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Node Details Popup */}
      {selectedNode && (
        <div className="fixed inset-0 max-w-md mx-auto bg-brand-dark/40 backdrop-blur-sm z-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-[36px] w-full p-6 shadow-2xl border border-slate-100 relative animate-scale-in">
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col items-center text-center mt-3">
              {/* Node Icon */}
              <div className={`w-18 h-18 rounded-[24px] flex items-center justify-center text-white font-black text-2xl shadow-lg mb-4 ${
                selectedNode.category === 'family'
                  ? 'bg-gradient-to-tr from-rose-400 to-pink-500 shadow-rose-500/20'
                  : 'bg-gradient-to-tr from-indigo-400 to-cyan-500 shadow-indigo-500/20'
              }`}>
                {getInitials(selectedNode.name)}
              </div>

              {/* Name */}
              <h3 className="font-extrabold text-xl text-brand-dark leading-tight">{selectedNode.name}</h3>
              
              {/* Category & Relationship Badge */}
              <div className="flex gap-2 mt-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                  selectedNode.category === 'family'
                    ? 'bg-rose-50 text-rose-500 border border-rose-100'
                    : 'bg-indigo-50 text-indigo-500 border border-indigo-100'
                }`}>
                  {selectedNode.category}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                  {selectedNode.relationship}
                </span>
              </div>

              {/* Note Content */}
              <div className="w-full mt-6 bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left">
                <div className="flex items-center space-x-2 text-slate-400 mb-2">
                  <MessageSquare size={13} />
                  <span className="text-[9px] font-black uppercase tracking-wider">About Sarah</span>
                </div>
                <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                  {selectedNode.note || 'No notes added yet for this circle member. Add one to remember important details!'}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="w-full mt-6 pt-4 border-t border-slate-100/50 flex space-x-3">
                <button
                  onClick={() => handleDelete(selectedNode.id)}
                  className="flex-1 py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl font-bold text-xs uppercase tracking-wide transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={13} />
                  Remove Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
