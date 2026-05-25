import { NavLink, useLocation } from 'react-router-dom'
import { Home, CheckSquare, Image as ImageIcon, BookOpen, Smile } from 'lucide-react'

const links = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/memories', icon: ImageIcon, label: 'Moments' },
  { to: '/islamic', icon: BookOpen, label: 'Islamic' },
  { to: '/hobbies', icon: Smile, label: 'Hobbies' },
]

// Pages where bottom nav should be hidden
const HIDDEN_PATHS = ['/settings', '/tree', '/gifts']

export function BottomNav() {
  const location = useLocation()

  const currentPath = location.pathname.toLowerCase().replace(/\/$/, '')
  if (HIDDEN_PATHS.includes(currentPath)) {
    return null
  }

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-40">
      {/* Glass pill container */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.10)] rounded-[28px] px-3 py-2">
        <div className="flex justify-between items-center">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className="flex-1"
            >
              {({ isActive }) => (
                <div
                  className={`
                    flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-90
                    ${isActive
                      ? 'bg-brand-purple/10 text-brand-purple'
                      : 'text-slate-400 hover:text-slate-600'
                    }
                  `}
                >
                  <Icon
                    size={isActive ? 22 : 21}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className="transition-all duration-200"
                  />
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider leading-none transition-all duration-200 ${
                      isActive ? 'text-brand-purple' : 'text-slate-400'
                    }`}
                  >
                    {label}
                  </span>
                  {/* Active dot indicator */}
                  {isActive && (
                    <span className="absolute bottom-1.5 w-1 h-1 bg-brand-purple rounded-full opacity-60" />
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
