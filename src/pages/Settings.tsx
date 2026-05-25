import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { ArrowLeft, MapPin, Copy, Check, Link2, LogOut, User, Edit3, Save, Sparkles, Upload, Mail } from 'lucide-react'

const PRESET_VIBES = [
  'studying',
  'chilling',
  'coding',
  'reading',
  'music mood',
  'sleepy',
  'wandering',
  'dreaming',
  'painting'
]

export default function Settings() {
  const navigate = useNavigate()
  const {
    userName,
    userCity,
    inviteCode,
    pairStatus,
    partnerName,
    partnerCity,
    userAvatar,
    partnerAvatar,
    userVibe,
    linkPartner,
    disconnectPartner,
    updateProfile,
    uploadAvatar,
    changeEmail,
    updateFriendshipDate,
    pairId,
    logout,
    dbError
  } = useAppStore()

  const [copied, setCopied] = useState(false)
  const [friendCode, setFriendCode] = useState('')
  const [linking, setLinking] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(userName)
  const [editCity, setEditCity] = useState(userCity)
  const [editAvatar, setEditAvatar] = useState(userAvatar)
  const [editVibe, setEditVibe] = useState(userVibe)
  const [savingProfile, setSavingProfile] = useState(false)

  // Custom picture upload states
  const [uploadingFile, setUploadingFile] = useState(false)
  const [fileError, setFileError] = useState('')

  // Change Email States
  const [newEmail, setNewEmail] = useState('')
  const [changingEmail, setChangingEmail] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState('')
  const [emailError, setEmailError] = useState('')

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.trim()) return

    setEmailError('')
    setEmailSuccess('')
    setChangingEmail(true)

    try {
      await changeEmail(newEmail.trim())
      setEmailSuccess('Confirmation link sent! Please verify your new email address.')
      setNewEmail('')
    } catch (err: any) {
      console.error(err)
      setEmailError(err.message || 'Failed to update email address.')
    } finally {
      setChangingEmail(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit to 1.5MB
    if (file.size > 1.5 * 1024 * 1024) {
      setFileError('Image file is too large. Please select a photo smaller than 1.5MB.')
      return
    }

    setFileError('')
    setUploadingFile(true)
    try {
      const publicUrl = await uploadAvatar(file)
      setEditAvatar(publicUrl)
      setSuccess('Profile photo uploaded successfully!')
    } catch (err: any) {
      console.error(err)
      setFileError(err.message || 'Failed to upload profile photo.')
    } finally {
      setUploadingFile(false)
    }
  }

  // Friendship Anniversary States
  const [friendsSinceInput, setFriendsSinceInput] = useState(() => {
    const local = pairId ? localStorage.getItem(`friends_since_${pairId}`) : null
    if (local) return local
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
    return twoYearsAgo.toISOString().split('T')[0]
  })
  const [savingAnniversary, setSavingAnniversary] = useState(false)
  const [anniversarySaved, setAnniversarySaved] = useState(false)

  React.useEffect(() => {
    if (pairId) {
      const local = localStorage.getItem(`friends_since_${pairId}`)
      if (local) {
        setFriendsSinceInput(local)
      }
    }
  }, [pairId])

  const handleAnniversaryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setFriendsSinceInput(val)
    if (!val) return

    setSavingAnniversary(true)
    setAnniversarySaved(false)
    try {
      await updateFriendshipDate(val)
      setAnniversarySaved(true)
      setTimeout(() => setAnniversarySaved(false), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setSavingAnniversary(false)
    }
  }

  const handleCopyCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!friendCode.trim()) return

    setError('')
    setSuccess('')
    setLinking(true)

    try {
      await linkPartner(friendCode.trim())
      setSuccess('Successfully linked with your friend!')
      setFriendCode('')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to connect. Please check the code.')
    } finally {
      setLinking(false)
    }
  }

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect from your friend? This will unlink your accounts.')) {
      return
    }

    setError('')
    setSuccess('')
    
    try {
      await disconnectPartner()
      setSuccess('Unlinked successfully.')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to disconnect.')
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSavingProfile(true)

    try {
      await updateProfile({
        userName: editName,
        userCity: editCity,
        userAvatar: editAvatar,
        vibeStatus: editVibe
      })
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to save profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleLogout = () => {
    setLoggingOut(true)
    setError('')
    logout()
  }

  return (
    <div className="pb-28 animate-fade-in">
      {/* Header */}
      <header className="pt-14 pb-6 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-2xl bg-white/70 border border-white/50 flex items-center justify-center text-brand-dark active-pop shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-extrabold text-brand-dark">Settings</h1>
        </div>
        <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md border border-white/50 bg-white flex items-center justify-center">
          <img src="/logo.png" className="w-8 h-8 object-cover" alt="Logo" />
        </div>
      </header>

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
          </div>
        )}

        {/* Profile Card (Interactive Editing) */}
        {!isEditing ? (
          <section className="card-soft bg-white/60 border border-white/50 shadow-soft flex items-center justify-between p-5 relative group overflow-hidden">
            {/* Top accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-cyan to-brand-purple"></div>
            
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-slate-50 border-[3px] border-white shadow-md flex items-center justify-center overflow-hidden shrink-0">
                {userAvatar ? (
                  <img src={userAvatar} className="w-full h-full object-cover" alt={userName} />
                ) : (
                  <User size={24} className="text-slate-400" />
                )}
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-black text-brand-dark">{userName || 'Loading...'}</h2>
                {userCity && (
                  <p className="text-xs font-bold text-slate-400 flex items-center">
                    <MapPin size={11} className="mr-1 text-brand-cyan" />
                    {userCity}
                  </p>
                )}
                {userVibe && (
                  <div className="inline-flex text-[9px] font-extrabold text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded-full border border-brand-purple/10">
                    Vibe: {userVibe}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setEditName(userName)
                setEditCity(userCity)
                setEditAvatar(userAvatar)
                setEditVibe(userVibe)
                setIsEditing(true)
              }}
              className="w-9 h-9 rounded-xl bg-white border border-slate-100/50 flex items-center justify-center text-slate-400 hover:text-brand-purple hover:border-brand-purple/20 shadow-sm active-pop transition-all shrink-0"
            >
              <Edit3 size={15} />
            </button>
          </section>
        ) : (
          // Edit Profile Panel
          <section className="card-soft bg-white/80 border border-white/60 p-5 space-y-4 animate-fade-in relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-cyan to-brand-purple"></div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-brand-dark flex items-center gap-1.5">
                <Sparkles size={14} className="text-brand-purple" />
                Edit Profile
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs font-bold text-slate-400 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-lg"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Display Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-brand-purple font-semibold text-brand-dark"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">City / Location</label>
                  <input
                    type="text"
                    required
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-brand-purple font-semibold text-brand-dark"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Current Vibe</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={editVibe}
                    onChange={(e) => setEditVibe(e.target.value)}
                    placeholder="e.g. studying, chilling"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-brand-purple font-semibold text-brand-dark"
                  />
                </div>
                <div className="flex gap-1.5 flex-wrap pt-1">
                  {PRESET_VIBES.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setEditVibe(v)}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition-all active-pop ${
                        editVibe === v
                          ? 'bg-brand-purple/10 border-brand-purple/20 text-brand-purple'
                          : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Profile Picture</label>
                
                {fileError && (
                  <p className="text-[10px] font-bold text-rose-500 animate-fade-in bg-rose-50 border border-rose-100 rounded-lg px-2.5 py-1">
                    {fileError}
                  </p>
                )}

                <div className="flex flex-col items-center justify-center p-5 border border-slate-100/60 bg-slate-50/50 rounded-2xl space-y-3.5">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-[3px] border-white shadow-md overflow-hidden bg-white flex items-center justify-center relative">
                      {editAvatar ? (
                        <img src={editAvatar} className="w-full h-full object-cover" alt="Avatar preview" />
                      ) : (
                        <User size={32} className="text-slate-350" />
                      )}
                      {uploadingFile && (
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    
                    {/* Floating Upload Overlay Button */}
                    <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand-purple border-2 border-white flex items-center justify-center text-white cursor-pointer active-pop shadow-md hover:bg-brand-purple/95 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={uploadingFile}
                      />
                      <Upload size={11} strokeWidth={2.5} />
                    </label>
                  </div>
                  
                  <div className="text-center select-none">
                    <p className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Change Profile Picture</p>
                    <p className="text-[8px] font-semibold text-slate-400/80 mt-0.5">JPEG/PNG, max 1.5MB</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-2.5 mt-2 bg-gradient-to-r from-brand-purple to-brand-cyan text-white font-extrabold rounded-xl text-xs shadow-md shadow-brand-purple/15 flex items-center justify-center gap-1.5 active-pop disabled:opacity-50"
              >
                {savingProfile ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={13} />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </form>
          </section>
        )}

        {/* Pairing Section */}
        <section className="card-soft bg-white/60 border border-white/50 shadow-soft space-y-5">
          <div className="flex items-center space-x-2">
            <Link2 className="text-brand-purple" size={18} />
            <h3 className="text-base font-black text-brand-dark">Pairing System</h3>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold px-4 py-3 rounded-xl animate-fade-in">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold px-4 py-3 rounded-xl animate-fade-in">
              {success}
            </div>
          )}

          {pairStatus === 'active' ? (
            // Connected View
            <div className="space-y-4">
              <div className="bg-slate-50/50 border border-slate-100/50 p-4 rounded-2xl flex items-center justify-between shadow-inner">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-100 overflow-hidden shadow-sm">
                    {partnerAvatar ? (
                      <img src={partnerAvatar} className="w-full h-full object-cover" alt={partnerName} />
                    ) : (
                      <User size={16} className="text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-brand-dark">{partnerName}</h4>
                    <p className="text-[9px] font-black text-brand-green uppercase tracking-wider">Connected</p>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse shadow-sm shadow-brand-green/50"></span>
              </div>

              {partnerCity && (
                <div className="text-xs font-bold text-slate-400 flex items-center px-1">
                  <MapPin size={11} className="mr-1.5 text-brand-cyan" />
                  Partner is in {partnerCity}
                </div>
              )}

              {/* Friendship Anniversary Date Editor */}
              <div className="bg-slate-55/40 border border-slate-100 p-4 rounded-2xl space-y-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block select-none">
                  Friendship Start Date
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={friendsSinceInput}
                    onChange={handleAnniversaryChange}
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-white border border-slate-200/60 focus:outline-none focus:border-brand-purple font-semibold text-brand-dark"
                  />
                  {savingAnniversary ? (
                    <span className="w-4 h-4 border-2 border-brand-purple border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : anniversarySaved ? (
                    <Check size={16} className="text-brand-green shrink-0 animate-pulse" />
                  ) : null}
                </div>
                <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
                  Specify when you and {partnerName} became friends to sync your friendship duration correctly on the home widget!
                </p>
              </div>

              <button
                onClick={handleDisconnect}
                className="w-full bg-slate-50/70 hover:bg-rose-50 hover:text-rose-600 text-slate-500 font-extrabold text-xs py-3 px-4 rounded-xl border border-slate-100 hover:border-rose-150 transition-colors active-pop"
              >
                Disconnect Friend
              </button>
            </div>
          ) : (
            // Unconnected View
            <div className="space-y-5">
              {/* User's Invite Code */}
              <div className="bg-slate-50/50 border border-slate-100/50 p-4 rounded-2xl shadow-inner">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Your Invite Code</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-base font-black text-brand-dark font-mono tracking-wider">
                    {inviteCode || 'Generating...'}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-brand-purple active-pop shadow-sm"
                  >
                    {copied ? <Check size={14} className="text-brand-green" /> : <Copy size={14} />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium leading-relaxed">
                  Share this code with your friend. When they enter it, your accounts will link!
                </p>
              </div>

              {/* Enter Partner's Code */}
              <form onSubmit={handleConnect} className="space-y-3 pt-2">
                <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                  Link with your Friend
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    value={friendCode}
                    onChange={(e) => setFriendCode(e.target.value)}
                    placeholder="e.g. MAS-ABCD"
                    className="flex-1 px-4 py-2.5 bg-slate-50/60 border border-slate-100 rounded-xl text-sm font-extrabold text-brand-dark uppercase placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all font-mono"
                  />
                  <button
                    type="submit"
                    disabled={linking || !friendCode.trim()}
                    className="bg-brand-purple text-white font-extrabold px-5 rounded-xl hover:opacity-95 disabled:opacity-50 disabled:pointer-events-none active-pop shadow-sm flex items-center justify-center text-xs"
                  >
                    {linking ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Connect'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>

        {/* Account Settings (Change Email) */}
        <section className="card-soft bg-white/60 border border-white/50 shadow-soft space-y-4">
          <div className="flex items-center space-x-2">
            <Mail className="text-brand-purple" size={18} />
            <h3 className="text-base font-black text-brand-dark">Account Settings</h3>
          </div>

          {emailError && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold px-4 py-3 rounded-xl animate-fade-in">
              {emailError}
            </div>
          )}

          {emailSuccess && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold px-4 py-3 rounded-xl animate-fade-in">
              {emailSuccess}
            </div>
          )}

          <form onSubmit={handleChangeEmail} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Change Email Address
              </label>
              <div className="flex space-x-2">
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="newemail@example.com"
                  className="flex-1 px-4 py-2.5 bg-slate-50/60 border border-slate-100 rounded-xl text-sm font-semibold text-brand-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all"
                />
                <button
                  type="submit"
                  disabled={changingEmail || !newEmail.trim()}
                  className="bg-brand-purple text-white font-extrabold px-5 rounded-xl hover:opacity-95 disabled:opacity-50 disabled:pointer-events-none active-pop shadow-sm flex items-center justify-center text-xs"
                >
                  {changingEmail ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Update'
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Danger Area */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full bg-white/60 hover:bg-rose-50/50 hover:text-rose-600 text-slate-500 font-extrabold text-xs py-3.5 px-6 rounded-2xl border border-white/50 hover:border-rose-100 shadow-soft flex items-center justify-center space-x-2 active-pop disabled:opacity-50"
        >
          {loggingOut ? (
            <span className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <LogOut size={15} />
              <span>Log Out</span>
            </>
          )}
        </button>
      </main>
    </div>
  )
}
