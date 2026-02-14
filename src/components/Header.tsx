'use client'
import { useState, useEffect } from 'react'
import { Bars3Icon, CalendarIcon } from '@heroicons/react/24/outline'

interface HeaderProps {
  title: string
  onMenuClick?: () => void
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const [today, setToday] = useState('')

  useEffect(() => {
    setToday(new Date().toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }))
  }, [])

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-xl px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <Bars3Icon className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <CalendarIcon className="h-3.5 w-3.5" />
            {today}
          </div>
        </div>
      </div>
    </header>
  )
}
