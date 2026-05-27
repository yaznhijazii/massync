import { createPortal } from 'react-dom'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'info'
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 bg-brand-dark/50 backdrop-blur-sm z-[60] flex items-center justify-center p-5">
      <div className="bg-white rounded-[28px] w-full max-w-xs p-6 shadow-2xl border border-slate-100 animate-slide-up">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
          variant === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'
        }`}>
          <AlertTriangle size={22} strokeWidth={2.5} />
        </div>

        {/* Text */}
        <h3 className="text-base font-black text-brand-dark text-center mb-2">{title}</h3>
        <p className="text-xs font-semibold text-slate-400 text-center leading-relaxed mb-6">{message}</p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 font-black text-sm active-pop hover:bg-slate-150 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onCancel() }}
            className={`flex-1 py-3 rounded-2xl text-white font-black text-sm active-pop transition-all shadow-md ${
              variant === 'danger'
                ? 'bg-gradient-to-r from-rose-500 to-red-500 shadow-rose-500/25'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/25'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
