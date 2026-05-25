import { NavLink, useLocation } from 'react-router-dom'
import { Home, CheckSquare, Image as ImageIcon, BookOpen, Smile } from 'lucide-react'
import clsx from 'clsx'

export function BottomNav() {
  const location = useLocation()

  // Hide BottomNav on settings page to resolve layout overlapping and click conflicts on Logout
  const isSettings = location.pathname.toLowerCase().replace(/\/$/, '') === '/settings'
  if (isSettings) {
    return null
  }

  const links = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { to: '/memories', icon: ImageIcon, label: 'Memories' },
    { to: '/islamic', icon: BookOpen, label: 'Islamic' },
    { to: '/hobbies', icon: Smile, label: 'Hobbies' },
  ]

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-sm bg-white/70 backdrop-blur-xl border border-white/40 py-2.5 px-5 z-40 rounded-[28px] shadow-[0_12px_32px_rgba(0,0,0,0.06)]">
      <div className="flex justify-between items-center relative">
        {links.map(({ to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'relative flex flex-col items-center p-3 rounded-2xl transition-all duration-300 active-pop',
                isActive 
                  ? 'text-brand-purple bg-brand-purple/10 scale-105 shadow-inner' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className="transition-transform duration-300" />
                {isActive && (
                  <span className="absolute bottom-1 w-1.5 h-1.5 bg-brand-purple rounded-full shadow-sm animate-pulse" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
