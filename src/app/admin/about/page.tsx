'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import IntroTab from './tabs/IntroTab'
import ValuesTab from './tabs/ValuesTab'
import GovernanceTab from './tabs/GovernanceTab'
import StructureTab from './tabs/StructureTab'
import BannerTab from './tabs/BannerTab'

interface Structure {
  id: string
  title_mn: string
  title_en: string
  content_mn: string
  content_en: string
}

export default function AboutAdminPage() {
  const [activeTab, setActiveTab] = useState<'intro' | 'values' | 'governance' | 'structure' | 'banner'>('intro')
  const [loading, setLoading] = useState(false)

  const handleSaveStructure = (data: Structure) => {
    setLoading(true)
    setTimeout(() => {
      alert('Амжилттай хадгаллаа')
      setLoading(false)
    }, 500)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Бидний тухай - Удирдлага</h1>
            <p className="text-slate-600">Компанийн мэдээллийг удирдаж засварлах</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 mb-6">
            <div className="flex gap-2 border-b border-slate-200 pb-4 overflow-x-auto">
              {[
                { id: 'intro', label: 'Бидний тухай' },
                { id: 'values', label: 'Үнэт зүйлс' },
                { id: 'governance', label: 'Засаглал' },
                { id: 'structure', label: 'Бүтэц' },
                { id: 'banner', label: 'Баннер' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'intro' && <IntroTab />}
          {activeTab === 'values' && <ValuesTab />}
          {activeTab === 'governance' && <GovernanceTab />}
          {activeTab === 'structure' && <StructureTab onSave={handleSaveStructure} loading={loading} />}
          {activeTab === 'banner' && <BannerTab />}
        </div>
      </main>
    </div>
  )
}
