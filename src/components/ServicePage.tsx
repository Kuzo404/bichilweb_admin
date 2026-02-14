'use client'

import { useLanguage } from '@/contexts/LanguageContext'

// ─────────────────────────────────────────────────────────────
// Types — API JSON бүтэцтэй тохирсон
// ─────────────────────────────────────────────────────────────

interface Translation {
  id: number
  language: number   // 1 = EN, 2 = MN
  label: string
}

interface ServiceTranslation {
  id: number
  language: number
  title: string
  description: string
}

interface CardTranslation {
  id: number
  language: number
  label: string
  short_desc: string
}

interface ServiceCard {
  id: number
  title: string
  translations: CardTranslation[]
}

interface CollateralItem {
  id: number
  collateral: {
    id: number
    translations: Translation[]
  }
}

interface ConditionItem {
  id: number
  condition: {
    id: number
    translations: Translation[]
  }
}

interface DocumentItem {
  id: number
  document: {
    id: number
    translations: Translation[]
  }
}

export interface ApiServiceData {
  id: number
  translations: ServiceTranslation[]
  cards: ServiceCard[]
  collaterals: CollateralItem[]
  conditions: ConditionItem[]
  documents: DocumentItem[]
}

interface ServicePageProps {
  data: ApiServiceData
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const getLang = (translations: Translation[], langId: number) =>
  translations.find((t) => t.language === langId)?.label || ''

const getServiceField = (
  translations: ServiceTranslation[],
  langId: number,
  field: 'title' | 'description'
) => translations.find((t) => t.language === langId)?.[field] || ''

const getCardField = (
  translations: CardTranslation[],
  langId: number,
  field: 'label' | 'short_desc'
) => translations.find((t) => t.language === langId)?.[field] || ''

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function ServicePage({ data }: ServicePageProps) {
  const { language, t } = useLanguage()
  const langId = language === 'mn' ? 2 : 1

  const title       = getServiceField(data.translations, langId, 'title')
  const description = getServiceField(data.translations, langId, 'description')

  const documents   = data.documents   || []
  const collaterals = data.collaterals || []
  const conditions  = data.conditions  || []
  const cards       = data.cards       || []

  const hasCollOrCond = collaterals.length > 0 || conditions.length > 0

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 relative overflow-hidden">
      {/* Background blur */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-slate-200/40 blur-3xl rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-24 relative z-10">

        {/* ── Hero ── */}
        <header className="text-center mb-10 sm:mb-16 max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-slate-900">
            {title}
          </h1>

          {description && (
            <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto px-2">
              {description}
            </p>
          )}

          <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto px-2">
            {t(
              'Энэхүү үйлчилгээ нь танд шаардлагатай бичиг баримт, нөхцөлүүдийг ойлгомжтойгоор танилцуулна.',
              'This service outlines the requirements and conditions you need to know.'
            )}
          </p>
        </header>

        {/* ── Service Cards ── */}
        {cards.length > 0 && (
          <div className="mb-10 sm:mb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => {
              const cardLabel    = getCardField(card.translations, langId, 'label')
              const cardShortDesc = getCardField(card.translations, langId, 'short_desc')
              return (
                <div
                  key={card.id}
                  className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-2"
                >
                  <p className="text-sm font-semibold text-slate-800">
                    {cardLabel || card.title}
                  </p>
                  {cardShortDesc && (
                    <p className="text-xs text-slate-500 leading-relaxed">{cardShortDesc}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── Main content ── */}
        <div className="max-w-6xl mx-auto">
          <section className="space-y-6 sm:space-y-8">
            <div className="relative bg-white rounded-xl sm:rounded-[32px] p-5 sm:p-10 md:p-16 shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-slate-100">

              {/* Documents */}
              {documents.length > 0 && (
                <div className="mb-8 sm:mb-14">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                    <span className="w-2 h-2 rounded-full bg-teal-600 flex-shrink-0" />
                    {t('Шаардагдах материал', 'Required Documents')}
                  </h3>
                  <ul className="space-y-3 sm:space-y-4">
                    {documents.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500 leading-relaxed"
                      >
                        <svg className="w-4 sm:w-5 h-4 sm:h-5 text-teal-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{getLang(item.document.translations, langId)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Collaterals */}
              {collaterals.length > 0 && (
                <div className="mb-8 sm:mb-14">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                    <span className="w-2 h-2 rounded-full bg-teal-600 flex-shrink-0" />
                    {t('Барьцаа хөрөнгө', 'Collateral')}
                  </h3>
                  <ul className="space-y-3 sm:space-y-4">
                    {collaterals.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500 leading-relaxed"
                      >
                        <svg className="w-4 sm:w-5 h-4 sm:h-5 text-teal-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{getLang(item.collateral.translations, langId)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Conditions */}
              {conditions.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                    <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                    {t('Нөхцөл', 'Conditions')}
                  </h3>
                  <ul className="space-y-3 sm:space-y-4">
                    {conditions.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500 leading-relaxed"
                      >
                        <svg className="w-4 sm:w-5 h-4 sm:h-5 text-orange-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{getLang(item.condition.translations, langId)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Empty state */}
              {documents.length === 0 && !hasCollOrCond && (
                <p className="text-sm text-slate-400 text-center py-8">
                  {t('Мэдээлэл байхгүй байна.', 'No information available.')}
                </p>
              )}
            </div>

            {/* Footer disclaimer */}
            <div className="mt-12 sm:mt-20 text-center">
              <div className="inline-block px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-slate-50 border border-slate-200">
                <p className="text-xs sm:text-sm text-slate-500 px-2">
                  {t(
                    'Манай үйлчилгээ нь Монгол Улсын холбогдох хууль, журамд нийцсэн.',
                    'Our services comply with applicable laws and regulations.'
                  )}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}