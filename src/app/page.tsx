'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import VisitorsChart from '@/components/admin/VisitorsChart'
import {
  NewspaperIcon,
  EyeIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  BriefcaseIcon,
  CubeIcon,
  BanknotesIcon,
  CalculatorIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'

/* ---------- helpers ---------- */

const typeIconMap: Record<string, { icon: React.ElementType; color: string }> = {
  'Мэдээ':                 { icon: NewspaperIcon,        color: 'text-violet-500'  },
  'Ажлын зар':             { icon: BriefcaseIcon,        color: 'text-amber-500'   },
  'Үйлчилгээ':            { icon: CubeIcon,             color: 'text-emerald-500' },
  'Валютын ханш':          { icon: BanknotesIcon,        color: 'text-blue-500'    },
  'Зээлийн тооцоолуур':   { icon: CalculatorIcon,       color: 'text-indigo-500'  },
}

function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Дөнгөж сая'
  if (mins < 60) return `${mins} минутын өмнө`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} цагийн өмнө`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Өчигдөр'
  return `${days} өдрийн өмнө`
}

/* ---------- types ---------- */

interface RecentItem {
  id: string
  type: string
  title: string
  href: string
  updatedAt: string | null
}

/* ------------------ PAGE ------------------ */

export default function AdminDashboard() {
  const [recentItems, setRecentItems] = useState<RecentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/recent-updates?limit=10')
      .then(r => r.json())
      .then(data => setRecentItems(data.items || []))
      .catch(() => setRecentItems([]))
      .finally(() => setLoading(false))
  }, [])
  return (
    <AdminLayout title="Хянах самбар">

      {/* ================= VISITORS CHART ================= */}
      <div className="mb-8">
        <VisitorsChart />
      </div>

      {/* ================= RECENTLY UPDATED ================= */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <ClockIcon className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-medium text-gray-600">
            Сүүлд шинэчилсэн
          </h2>
        </div>

        <div className="bg-white border border-gray-100 divide-y divide-gray-100">
          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              Ачааллаж байна...
            </div>
          ) : recentItems.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              Шинэчлэлт олдсонгүй
            </div>
          ) : (
            recentItems.map((item) => {
              const mapping = typeIconMap[item.type] || {
                icon: WrenchScrewdriverIcon,
                color: 'text-gray-400',
              }
              const Icon = mapping.icon
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <Icon className={`h-4 w-4 flex-shrink-0 ${mapping.color}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{item.type}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <p className="text-sm text-gray-600 truncate">
                        {item.title}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {item.updatedAt ? timeAgo(item.updatedAt) : '—'}
                  </span>
                </Link>
              )
            })
          )}
        </div>
      </div>

      {/* ================= PREVIEW ================= */}
      <div className="bg-white border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-medium text-gray-600">
              Вэбсайт урьдчилж харах
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Frontend-ийн одоогийн төлөв
            </p>
          </div>

          <a
            href={process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}
            target="_blank"
            className="group flex items-center gap-2 px-3 py-1.5 text-xs
              text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <EyeIcon className="h-3.5 w-3.5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
            Шинэ цонхонд
          </a>
        </div>

        <div className="aspect-video border border-gray-200 overflow-hidden">
          <iframe
            src={process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}
            className="w-full h-full"
            loading="lazy"
          />
        </div>
      </div>
    </AdminLayout>
  )
}
