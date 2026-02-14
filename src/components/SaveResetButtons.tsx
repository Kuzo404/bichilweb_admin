'use client'

import { Button } from './FormElements'

interface SaveResetButtonsProps {
  onSave: () => void
  onReset: () => void
  showSuccess?: boolean
  className?: string
  confirmMessage?: string
}

export function SaveResetButtons({ onSave, onReset, showSuccess, className = '', confirmMessage }: SaveResetButtonsProps) {
  const handleSaveClick = () => {
    if (confirmMessage) {
      if (window.confirm(confirmMessage)) {
        onSave()
      }
    } else {
      onSave()
    }
  }

  return (
    <>
      {showSuccess && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-emerald-900">Амжилттай хадгалагдлаа!</h4>
            <p className="text-xs text-emerald-700 mt-0.5">Өөрчлөлтүүд хадгалагдсан.</p>
          </div>
        </div>
      )}
      
      <div className={`flex items-center gap-3 ${className}`}>
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-500 border border-slate-500 rounded-lg hover:bg-slate-600 hover:border-slate-600 transition-colors flex items-center gap-2 shadow-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          <span>Буцах</span>
        </button>
        <Button variant="dark" onClick={handleSaveClick} className="px-4 py-2 text-sm font-medium flex items-center gap-2 shadow-md">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Хадгалах
        </Button>
      </div>
    </>
  )
}
