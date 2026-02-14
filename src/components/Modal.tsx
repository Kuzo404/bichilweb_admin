'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  fullscreen?: boolean
}

export default function Modal({ isOpen, onClose, title, children, size = 'md', fullscreen = false }: ModalProps) {
  // ESC товчоор хаах
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKey)
    }
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Body scroll хаах
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    xs: 'max-w-sm',
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  }

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Box - Desktop */}
      <div
        className={`
          pointer-events-auto
          w-full ${fullscreen ? 'h-[95vh]' : sizes[size]}
          ${fullscreen ? 'max-w-[95vw]' : ''}
          bg-white 
          rounded-2xl md:rounded-2xl
          shadow-[0_8px_24px_rgba(0,0,0,0.12)]
          border border-gray-100
          flex flex-col
          max-h-[90vh]
          transform scale-95 opacity-0
          animate-[modalAppear_0.2s_ease-out_forwards]
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Хаах"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
