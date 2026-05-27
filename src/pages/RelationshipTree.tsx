import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { useAppStore, type TreeNode } from '../store/useAppStore'
import { ArrowLeft, Plus, Heart, Smile, Trash2, X, Users, MessageSquare, LayoutGrid, Orbit } from 'lucide-react'

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
  const [viewMode, setViewMode] = useState<'constellation' | 'grid'>('constellation')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  
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

  // Dynamic coordinates for Constellation nodes
  const familyCoords = familyNodes.map((node, i) => {
    const total = familyNodes.length
    const angle = total > 0 ? (i * 2 * Math.PI) / total - Math.PI / 2 : 0
    const x = Math.round(65 * Math.cos(angle))
    const y = Math.round(65 * Math.sin(angle))
    return { node, x, y }
  })

  const friendCoords = friendNodes.map((node, i) => {
    const total = friendNodes.length
    const angle = total > 0 ? (i * 2 * Math.PI) / total - Math.PI / 2 : 0
    const x = Math.round(115 * Math.cos(angle))
    const y = Math.round(115 * Math.sin(angle))
    return { node, x, y }
  })

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

        {/* View Switcher Toggle */}
        <div className="flex bg-white/45 backdrop-blur-md p-1 rounded-xl border border-white/50 shadow-sm shrink-0">
          <button
            onClick={() => setViewMode('constellation')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'constellation'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-100/50'
                : 'text-slate-400 hover:text-slate-650'
            }`}
            title="Constellation Map"
          >
            <Orbit size={15} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-100/50'
                : 'text-slate-400 hover:text-slate-650'
            }`}
            title="Grid List"
          >
            <LayoutGrid size={15} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* Tabs - Me vs Partner */}
      <div className="flex bg-white/45 backdrop-blur-md p-1.5 rounded-[22px] mb-8 border border-white/50 shadow-sm">
        <button
          onClick={() => setActiveTab('me')}
          className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wide transition-all duration-300 active-pop flex items-center justify-center gap-1.5 ${
            activeTab === 'me'
              ? 'bg-white text-indigo-700 shadow-[0_4px_16px_rgba(168,85,247,0.12)] border border-slate-100/55'
              : 'text-slate-400 hover:text-slate-650'
          }`}
        >
          <Users size={13} className={activeTab === 'me' ? 'text-indigo-600' : ''} />
          My Circle
        </button>
        <button
          onClick={() => setActiveTab('partner')}
          className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wide transition-all duration-300 active-pop flex items-center justify-center gap-1.5 ${
            activeTab === 'partner'
              ? 'bg-white text-indigo-700 shadow-[0_4px_16px_rgba(168,85,247,0.12)] border border-slate-100/55'
              : 'text-slate-400 hover:text-slate-650'
          }`}
        >
          <Heart size={13} className={activeTab === 'partner' ? 'text-indigo-600 fill-indigo-600/10' : ''} />
          {partnerName ? `${partnerName}'s Circle` : "Her Circle"}
        </button>
      </div>

      {/* Primary View Router */}
      {viewMode === 'constellation' ? (
        <div className="flex flex-col items-center justify-center py-6 min-h-[380px] relative select-none">
          {/* Starry Sky Twinkling backgrounds */}
          <div className="absolute top-6 left-10 w-1 h-1 rounded-full bg-white/40 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="absolute top-10 right-12 w-0.5 h-0.5 rounded-full bg-white/60 animate-ping" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-20 left-16 w-1 h-1 rounded-full bg-white/50 animate-pulse" style={{ animationDelay: '1.2s' }} />
          <div className="absolute bottom-10 right-20 w-0.5 h-0.5 rounded-full bg-white/70 animate-ping" style={{ animationDelay: '0.8s' }} />
          <div className="absolute top-36 left-32 w-1 h-1 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute bottom-32 right-36 w-0.5 h-0.5 rounded-full bg-white/50 animate-ping" style={{ animationDelay: '2s' }} />

          {/* Centralized Orbit Arena */}
          <div className="relative w-80 h-80 flex items-center justify-center shrink-0">
            {/* Background SVG Orbits and connector lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 320">
              {/* Inner Family Orbit */}
              <circle cx="160" cy="160" r="65" stroke="rgba(244, 63, 94, 0.12)" strokeWidth="1.5" strokeDasharray="3 5" fill="none" />
              
              {/* Outer Friends Orbit */}
              <circle cx="160" cy="160" r="115" stroke="rgba(0, 188, 212, 0.12)" strokeWidth="1.5" strokeDasharray="3 5" fill="none" />

              {/* Connector lines to Family */}
              {familyCoords.map(({ node, x, y }) => {
                const isHovered = hoveredId === node.id || selectedNode?.id === node.id
                return (
                  <line
                    key={node.id}
                    x1="160"
                    y1="160"
                    x2={160 + x}
                    y2={160 + y}
                    stroke={isHovered ? '#F43F5E' : 'rgba(244, 63, 94, 0.2)'}
                    strokeWidth={isHovered ? '2.5' : '1.2'}
                    strokeDasharray={isHovered ? 'none' : '4 4'}
                    className={isHovered ? '' : 'animate-dash'}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                )
              })}

              {/* Connector lines to Friends */}
              {friendCoords.map(({ node, x, y }) => {
                const isHovered = hoveredId === node.id || selectedNode?.id === node.id
                return (
                  <line
                    key={node.id}
                    x1="160"
                    y1="160"
                    x2={160 + x}
                    y2={160 + y}
                    stroke={isHovered ? '#00BCD4' : 'rgba(0, 188, 212, 0.2)'}
                    strokeWidth={isHovered ? '2.5' : '1.2'}
                    strokeDasharray={isHovered ? 'none' : '4 4'}
                    className={isHovered ? '' : 'animate-dash'}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                )
              })}
            </svg>

            {/* Central Node */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="absolute -inset-3 bg-gradient-to-tr from-brand-purple via-pink-500 to-brand-cyan rounded-full blur-[10px] opacity-40 animate-pulse"></div>
              <div className="w-16 h-16 rounded-full border-[3px] border-white shadow-xl overflow-hidden bg-slate-50 relative z-10 flex items-center justify-center">
                {currentAvatar ? (
                  <img src={currentAvatar} className="w-full h-full object-cover" alt={currentName} />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <span className="text-lg font-black text-slate-450">{getInitials(currentName || '')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Floating Family Nodes */}
            {familyCoords.map(({ node, x, y }) => (
              <div
                key={node.id}
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                }}
                onClick={() => setSelectedNode(node)}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="cursor-pointer flex flex-col items-center z-20 group"
              >
                <div className={`w-9 h-9 rounded-[13px] flex items-center justify-center text-white font-black text-[10px] shadow-sm transition-all duration-300 group-hover:scale-110 active-pop border-2 border-white ${
                  hoveredId === node.id || selectedNode?.id === node.id
                    ? 'bg-gradient-to-tr from-rose-400 to-pink-500 shadow-rose-500/30 scale-105'
                    : 'bg-gradient-to-tr from-rose-350 to-pink-400'
                }`}>
                  {getInitials(node.name)}
                </div>
                <span className="mt-1 bg-white/90 backdrop-blur-sm border border-slate-200/50 shadow-sm px-1.5 py-0.2 rounded-md text-[7.5px] font-black text-brand-dark tracking-wide truncate max-w-[50px] opacity-80 group-hover:opacity-100 transition-opacity">
                  {node.name.split(' ')[0]}
                </span>
              </div>
            ))}

            {/* Floating Friend Nodes */}
            {friendCoords.map(({ node, x, y }) => (
              <div
                key={node.id}
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                }}
                onClick={() => setSelectedNode(node)}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="cursor-pointer flex flex-col items-center z-20 group"
              >
                <div className={`w-9 h-9 rounded-[13px] flex items-center justify-center text-white font-black text-[10px] shadow-sm transition-all duration-300 group-hover:scale-110 active-pop border-2 border-white ${
                  hoveredId === node.id || selectedNode?.id === node.id
                    ? 'bg-gradient-to-tr from-brand-cyan to-indigo-500 shadow-brand-cyan/30 scale-105'
                    : 'bg-gradient-to-tr from-cyan-400 to-indigo-400'
                }`}>
                  {getInitials(node.name)}
                </div>
                <span className="mt-1 bg-white/90 backdrop-blur-sm border border-slate-200/50 shadow-sm px-1.5 py-0.2 rounded-md text-[7.5px] font-black text-brand-dark tracking-wide truncate max-w-[50px] opacity-80 group-hover:opacity-100 transition-opacity">
                  {node.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>

          {/* Quick empty hint */}
          {currentNodes.length === 0 && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mt-4">
              Tap + below to add members to the orbit
            </p>
          )}

          {/* Core label info at bottom of Constellation */}
          <div className="mt-6 flex items-center gap-4 text-[10px] font-black uppercase tracking-wider text-slate-450 bg-white/30 backdrop-blur-sm border border-white/40 px-4.5 py-2.5 rounded-2xl shadow-sm">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-md bg-gradient-to-tr from-rose-450 to-pink-500 shadow-sm" /> Family ({familyNodes.length})</span>
            <span className="h-3.5 border-l border-slate-300" />
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-md bg-gradient-to-tr from-brand-cyan to-indigo-500 shadow-sm" /> Friends ({friendNodes.length})</span>
          </div>
        </div>
      ) : (
        /* Network Grid Mode */
        <div className="grid grid-cols-2 gap-4 items-start animate-fade-in">
          {/* Family Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-1.5 bg-rose-500/10 border border-rose-500/15 py-2.5 rounded-2xl shadow-sm">
              <Heart size={13} className="text-rose-500 fill-rose-500" />
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-600">Family</span>
              <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
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
                    className="bg-white/80 hover:bg-white border border-white/70 hover:border-rose-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(244,63,94,0.08)] rounded-[28px] p-4 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:scale-[1.03] active-pop group animate-fade-in"
                  >
                    <div className="w-12 h-12 rounded-[20px] bg-gradient-to-tr from-rose-400 to-pink-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-rose-500/25 transition-transform group-hover:scale-110 duration-300">
                      {getInitials(node.name)}
                    </div>
                    <span className="text-xs font-black text-brand-dark mt-3 truncate w-full group-hover:text-rose-600 transition-colors">{node.name}</span>
                    <span className="text-[9px] font-black uppercase tracking-wider text-rose-655 bg-rose-500/10 border border-rose-500/15 px-2.5 py-0.5 rounded-full mt-2 select-none shrink-0 transition-colors group-hover:bg-rose-500/15">
                      {node.relationship}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Friends Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-1.5 bg-brand-cyan/15 border border-brand-cyan/20 py-2.5 rounded-2xl shadow-sm">
              <Smile size={13} className="text-cyan-600 fill-cyan-500/10" />
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-655">Friends</span>
              <span className="bg-brand-cyan text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
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
                    className="bg-white/80 hover:bg-white border border-white/70 hover:border-brand-cyan/40 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,188,212,0.08)] rounded-[28px] p-4 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:scale-[1.03] active-pop group animate-fade-in"
                  >
                    <div className="w-12 h-12 rounded-[20px] bg-gradient-to-tr from-brand-cyan to-indigo-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-brand-cyan/25 transition-transform group-hover:scale-110 duration-300">
                      {getInitials(node.name)}
                    </div>
                    <span className="text-xs font-black text-brand-dark mt-3 truncate w-full group-hover:text-brand-cyan transition-colors">{node.name}</span>
                    <span className="text-[9px] font-black uppercase tracking-wider text-cyan-650 bg-brand-cyan/15 border border-brand-cyan/20 px-2.5 py-0.5 rounded-full mt-2 select-none shrink-0 transition-colors group-hover:bg-brand-cyan/20">
                      {node.relationship}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Add Connection Button */}
      <button
        onClick={() => setIsAdding(true)}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-tr from-brand-purple to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-brand-purple/20 hover:scale-105 active-pop z-20 border border-white/20"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* Add Member Drawer/Modal */}
      {isAdding && createPortal(
        <div 
          onClick={() => setIsAdding(false)}
          className="fixed inset-0 max-w-md mx-auto bg-brand-dark/50 backdrop-blur-sm z-50 flex items-end justify-center px-4 pb-8 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[32px] w-full p-6 shadow-2xl animate-slide-up border border-slate-100 relative max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-extrabold text-xl text-brand-dark">Add Connection</h3>
              <button
                onClick={() => setIsAdding(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-655 transition-colors"
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
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-purple focus:outline-none font-semibold text-brand-dark text-sm"
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
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-purple focus:outline-none font-semibold text-brand-dark text-sm"
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
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-purple focus:outline-none font-semibold text-brand-dark h-20 resize-none text-sm"
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
        </div>,
        document.body
      )}

      {/* Node Details Popup */}
      {selectedNode && createPortal(
        <div 
          onClick={() => setSelectedNode(null)}
          className="fixed inset-0 bg-brand-dark/50 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF9F5] rounded-[36px] w-full max-w-sm p-6 shadow-2xl border border-slate-100 relative animate-scale-in overflow-hidden"
          >
            {/* Background Accent glow */}
            <div className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[64px] opacity-20 pointer-events-none ${
              selectedNode.category === 'family' ? 'bg-rose-500' : 'bg-brand-cyan'
            }`} />

            <button
              onClick={() => setSelectedNode(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-655 transition-all active:scale-90"
            >
              <X size={15} strokeWidth={2.5} />
            </button>

            <div className="flex flex-col items-center text-center mt-3 relative">
              {/* Node Icon */}
              <div className={`w-20 h-20 rounded-[24px] flex items-center justify-center text-white font-black text-2xl shadow-lg mb-4 transition-transform hover:scale-105 duration-300 ${
                selectedNode.category === 'family'
                  ? 'bg-gradient-to-tr from-rose-400 to-pink-500 shadow-rose-500/25'
                  : 'bg-gradient-to-tr from-brand-cyan to-indigo-500 shadow-brand-cyan/25'
              }`}>
                {getInitials(selectedNode.name)}
              </div>

              {/* Name */}
              <h3 className="font-extrabold text-xl text-slate-800 leading-tight tracking-tight">{selectedNode.name}</h3>
              
              {/* Category & Relationship Badge */}
              <div className="flex gap-2 mt-3">
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                  selectedNode.category === 'family'
                    ? 'bg-rose-55 text-rose-500 border border-rose-100'
                    : 'bg-cyan-55 text-cyan-600 border border-cyan-100'
                }`}>
                  {selectedNode.category}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-3 py-1 rounded-full border border-slate-200/50">
                  {selectedNode.relationship}
                </span>
              </div>

              {/* Note Content */}
              <div className="w-full mt-6 bg-white/70 border border-slate-200/60 p-4 rounded-2xl shadow-inner text-left">
                <div className="flex items-center space-x-1.5 text-slate-400 mb-2 select-none">
                  <MessageSquare size={12} strokeWidth={2.5} />
                  <span className="text-[8px] font-black uppercase tracking-wider">About {selectedNode.name.split(' ')[0]}</span>
                </div>
                <p className="text-slate-655 text-xs font-semibold leading-relaxed whitespace-pre-wrap">
                  {selectedNode.note || 'No notes added yet for this connection.'}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="w-full mt-6 pt-4 border-t border-slate-200/50 flex space-x-3">
                <button
                  onClick={() => handleDelete(selectedNode.id)}
                  className="flex-1 py-3.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500/15 border border-rose-500/20 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={13} strokeWidth={2.5} />
                  Remove Connection
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
