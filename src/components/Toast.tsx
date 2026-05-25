import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import type { ToastItem } from '../store/useAppStore'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const t = setTimeout(() => setVisible(true), 20)
    return () => clearTimeout(t)
  }, [])

  const handleDismiss = () => {
    setLeaving(true)
    setTimeout(() => onDismiss(toast.id), 300)
  }

  const config = {
    success: {
      bg: 'bg-emerald-500',
      icon: <CheckCircle2 size={18} className="text-white shrink-0" strokeWidth={2.5} />,
    },
    error: {
      bg: 'bg-rose-500',
      icon: <XCircle size={18} className="text-white shrink-0" strokeWidth={2.5} />,
    },
    info: {
      bg: 'bg-brand-dark',
      icon: <Info size={18} className="text-white shrink-0" strokeWidth={2.5} />,
    },
  }[toast.type]

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-white text-sm font-bold max-w-[320px] w-full
        transition-all duration-300 ease-out
        ${config.bg}
        ${visible && !leaving ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}
    >
      {config.icon}
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button
        onClick={handleDismiss}
        className="opacity-70 hover:opacity-100 transition-opacity p-0.5 rounded-lg active:scale-90"
      >
        <X size={14} strokeWidth={3} />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const { toasts, dismissToast } = useAppStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] flex flex-col-reverse gap-2.5 items-center pointer-events-none w-full px-6 max-w-md">
      {toasts.slice(0, 3).map((toast) => (
        <div key={toast.id} className="pointer-events-auto w-full flex justify-center">
          <Toast toast={toast} onDismiss={dismissToast} />
        </div>
      ))}
    </div>
  )
}
