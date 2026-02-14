'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center bg-gray-100 rounded-xl p-1">
      <button
        onClick={() => setLanguage('mn')}
        className={`px-3 py-1.5 text-sm rounded-lg transition font-medium ${
          language === 'mn'
            ? 'bg-white shadow text-primary'
            : 'text-gray-600'
        }`}
      >
        MN
      </button>

      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 text-sm rounded-lg transition font-medium ${
          language === 'en'
            ? 'bg-white shadow text-primary'
            : 'text-gray-600'
        }`}
      >
        EN
      </button>
    </div>
  )
}
