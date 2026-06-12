import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import Memories from './pages/Memories'
import Islamic from './pages/Islamic'
import Hobbies from './pages/Hobbies'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Settings from './pages/Settings'
import RelationshipTree from './pages/RelationshipTree'
import Gifts from './pages/Gifts'
import Space from './pages/Space'
import { BottomNav } from './components/BottomNav'
import { ToastContainer } from './components/Toast'
import { useAppStore } from './store/useAppStore'

function App() {
  const { user, authInitialized, initAuth, updateLastSeen, pairStatus } = useAppStore()

  useEffect(() => {
    const unsubscribe = initAuth()
    return () => unsubscribe()
  }, [initAuth])

  // Active heartbeat tracker for last_seen_at updates
  useEffect(() => {
    if (!user || pairStatus !== 'active') return

    // Immediately trigger on mount/load
    updateLastSeen()

    const interval = setInterval(() => {
      updateLastSeen()
    }, 60000) // update every 60 seconds

    // Trigger on visibility change (when user returns to the tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateLastSeen()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user, pairStatus, updateLastSeen])

  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#E0F2FE] via-[#F0F9FF] to-[#E0F7FA]">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            {/* Blurry pulse glow effect in the background */}
            <div className="absolute -inset-2 bg-brand-purple/20 rounded-3xl blur-xl opacity-75 animate-pulse" />
            
            {/* App Logo glass container */}
            <div className="relative w-16 h-16 rounded-3xl bg-white/85 backdrop-blur-md border border-white/50 shadow-soft flex items-center justify-center overflow-hidden">
              <img src="/logo.png" className="w-12 h-12 object-cover" alt="Logo" />
            </div>
          </div>
          
          {/* Soft bouncing dot loader */}
          <div className="flex items-center space-x-1.5 pt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-purple/70 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2.5 h-2.5 rounded-full bg-brand-purple/70 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2.5 h-2.5 rounded-full bg-brand-purple/70 animate-bounce" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      {/* 
        A clean, premium mobile frame container.
        Using a soft sky-blue gradient background so the white rounded cards with drop shadows 
        float beautifully and achieve the true visual depth of a modern friendship app.
      */}
      <div className="min-h-screen max-w-md mx-auto relative z-0 bg-gradient-to-tr from-[#E0F2FE] via-[#F0F9FF] to-[#E0F7FA] shadow-2xl border-x border-slate-100/55 flex flex-col justify-between overflow-x-hidden selection:bg-brand-purple selection:text-white">
        
        {/* Blurry premium background blobs for high-fidelity 3D depth */}
        <div className="absolute top-[-10%] right-[-15%] w-72 h-72 rounded-full bg-brand-cyan/25 blur-3xl pointer-events-none animate-blob-1 z-[-1]" />
        <div className="absolute bottom-[20%] left-[-15%] w-80 h-80 rounded-full bg-brand-purple/20 blur-3xl pointer-events-none animate-blob-2 z-[-1]" />

        <div className="flex-1 pb-24 relative">
          <Routes>
            {user ? (
              <>
                <Route path="/" element={<Home />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/memories" element={<Memories />} />
                <Route path="/islamic" element={<Islamic />} />
                <Route path="/hobbies" element={<Hobbies />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/tree" element={<RelationshipTree />} />
                <Route path="/gifts" element={<Gifts />} />
                <Route path="/space" element={<Space />} />
                {/* Fallbacks */}
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/signup" element={<Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                {/* Fallbacks */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            )}
          </Routes>
        </div>
        {user && <BottomNav />}
        {user && <ToastContainer />}
      </div>
    </BrowserRouter>
  )
}

export default App
