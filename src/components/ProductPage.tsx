'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import LoanCalculator from './LoanCalculator'
import TextBlockRenderer from './TextBlockRenderer'

type TextStyle = {
  color: string
  fontSize: {
    mobile: number
    desktop: number
  }
  fontWeight: 'normal' | 'bold'
  align: 'left' | 'center' | 'right'
}

type TextBlock = {
  id: string
  type: 'title' | 'subtitle' | 'paragraph' | 'note'
  content_mn: string
  content_en: string
  style: TextStyle
  placement: 'hero' | 'details' | 'footer'
  order: number
  visible: boolean
}

interface ProductData {
  name_mn: string
  name_en: string
  name_style?: TextStyle
  category_mn: string
  category_en: string
  category_style?: TextStyle
  description_mn: string
  description_en: string
  description_style?: TextStyle
  blocks?: TextBlock[]
  stats: {
    interest?: string
    decision?: string
    term?: string
  }
  statsLabelStyle?: TextStyle
  statsValueStyle?: TextStyle
  details: {
    amount?: string
    fee?: string
    feeLabel?: string
    feeLabelEn?: string
    interest?: string
    term?: string
    decision?: string
  }
  detailsSectionTitle_mn?: string
  detailsSectionTitle_en?: string
  detailsSectionTitleStyle?: TextStyle
  detailsSubtitle_mn?: string
  detailsSubtitle_en?: string
  detailsSubtitleStyle?: TextStyle
  metricsLabelStyle?: TextStyle
  metricsValueStyle?: TextStyle
  materials: Array<{ id?: string; mn: string; en: string }>
  materialsTitle_mn?: string
  materialsTitle_en?: string
  materialsTitleStyle?: TextStyle
  materialsTextStyle?: TextStyle
  materialsIconColor?: string
  collateral?: Array<{ id?: string; mn: string; en: string }>
  collateralTitle_mn?: string
  collateralTitle_en?: string
  collateralTitleStyle?: TextStyle
  collateralTextStyle?: TextStyle
  collateralIconColor?: string
  conditions?: Array<{ id?: string; mn: string; en: string }>
  conditionsTitle_mn?: string
  conditionsTitle_en?: string
  conditionsTitleStyle?: TextStyle
  conditionsTextStyle?: TextStyle
  conditionsIconColor?: string
  // Calculator styling
  calcBtnColor?: string
  calcBtnFontSize?: string
  calcBtnText?: string
  requestBtnColor?: string
  requestBtnFontSize?: string
  requestBtnText?: string
  requestBtnUrl?: string
  disclaimerColor?: string
  disclaimerFontSize?: string
  disclaimerText?: string
  // Product details for calculator
  maxAmount?: number
  minRate?: number
  maxRate?: number
  maxTerm?: number
  downPaymentPercent?: number
  feeType?: string
}

interface ProductPageProps {
  data: ProductData
  forceLang?: 'mn' | 'en'
}

export default function ProductPage({ data, forceLang }: ProductPageProps) {
  const { language: contextLanguage, t } = useLanguage()
  const language = forceLang || contextLanguage

  const name = language === 'mn' ? data.name_mn : data.name_en
  const category = language === 'mn' ? data.category_mn : data.category_en
  const description = language === 'mn' ? data.description_mn : data.description_en

  const detailsSectionTitle = language === 'mn' 
    ? (data.detailsSectionTitle_mn || 'Бүтээгдэхүүний үндсэн нөхцөл ба шаардлагууд')
    : (data.detailsSectionTitle_en || 'Product conditions and requirements')
  
  const detailsSubtitle = language === 'mn'
    ? (data.detailsSubtitle_mn || name)
    : (data.detailsSubtitle_en || name)

  const materialsTitle = language === 'mn'
    ? (data.materialsTitle_mn || 'Шаардагдах материал')
    : (data.materialsTitle_en || 'Required Documents')

  const collateralTitle = language === 'mn'
    ? (data.collateralTitle_mn || 'Барьцаа хөрөнгө')
    : (data.collateralTitle_en || 'Collateral')

  const conditionsTitle = language === 'mn'
    ? (data.conditionsTitle_mn || 'Нөхцөл')
    : (data.conditionsTitle_en || 'Conditions')

  const stats = [
    data.stats.interest && { 
      value: data.stats.interest, 
      label: t('Сарын хүү', 'Interest Rate') 
    },
    data.stats.decision && { 
      value: data.stats.decision, 
      label: t('Шийдвэр', 'Decision') 
    },
    data.stats.term && { 
      value: data.stats.term, 
      label: t('Хамгийн урт хугацаа', 'Max Term') 
    },
  ].filter(Boolean) as { value: string; label: string }[]

  const getStyleObject = (style?: TextStyle) => {
    if (!style) return {}
    return {
      color: style.color,
      fontSize: `${style.fontSize.mobile}px`,
      fontWeight: style.fontWeight,
      textAlign: style.align,
      ['--desktop-size' as any]: `${style.fontSize.desktop}px`,
    }
  }

  // Check if we have any data to display
  const hasMaterials = data.materials && data.materials.length > 0
  const hasCollateral = data.collateral && data.collateral.length > 0
  const hasConditions = data.conditions && data.conditions.length > 0
  const hasStats = stats.length > 0
  const hasDetailsMetrics = data.details.amount || data.details.fee || data.details.interest || data.details.term || data.details.decision

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-20 space-y-14">
        {/* Hero */}
        <header className="grid gap-10 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-center">
          <div>
            {category && (
              <div 
                className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-1.5 rounded-full mb-4 md:text-[var(--desktop-size)]"
                style={getStyleObject(data.category_style)}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {category}
              </div>
            )}

            {name && (
              <h1 
                className="font-extrabold mb-3 md:text-[var(--desktop-size)]"
                style={getStyleObject(data.name_style)}
              >
                {name}
              </h1>
            )}

            {description && (
              <p 
                className="max-w-xl md:text-[var(--desktop-size)]"
                style={getStyleObject(data.description_style)}
              >
                {description}
              </p>
            )}

            {/* Custom Text Blocks - Hero Placement */}
            {data.blocks
              ?.filter((b) => b.placement === 'hero' && b.visible)
              .sort((a, b) => a.order - b.order)
              .map((block) => (
                <TextBlockRenderer key={block.id} block={block} language={language} />
              ))}
          </div>

          {/* Stats */}
          {hasStats && (
            <section aria-label="Key stats" className="flex flex-row gap-2">
              {stats.map((s, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-center shadow-sm flex-1">
                  <div 
                    className="font-bold text-teal-700 mb-0.5 md:text-[var(--desktop-size)]"
                    style={getStyleObject(data.statsValueStyle)}
                  >
                    {s.value}
                  </div>
                  <div 
                    className="md:text-[var(--desktop-size)]"
                    style={getStyleObject(data.statsLabelStyle)}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </section>
          )}
        </header>

        {/* Main content */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,0.9fr)] items-start">
          {/* LEFT: product details */}
          <section className="space-y-6">
            {/* Custom Text Blocks - Details Placement */}
            {data.blocks
              ?.filter((b) => b.placement === 'details' && b.visible)
              .sort((a, b) => a.order - b.order)
              .map((block) => (
                <div key={block.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <TextBlockRenderer block={block} language={language} />
                </div>
              ))}

            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-7 shadow-sm">
              <h2 
                className="font-bold mb-2 md:text-[var(--desktop-size)]"
                style={getStyleObject(data.detailsSubtitleStyle)}
              >
                {detailsSubtitle}
              </h2>
              <p 
                className="mb-4 md:text-[var(--desktop-size)]"
                style={getStyleObject(data.detailsSectionTitleStyle)}
              >
                {detailsSectionTitle}
              </p>

              {/* Metrics */}
              {hasDetailsMetrics && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {data.details.amount && (
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p 
                        className="mb-1 md:text-[var(--desktop-size)]"
                        style={getStyleObject(data.metricsLabelStyle)}
                      >
                        {t('Хэмжээ /₮/', 'Amount')}
                      </p>
                      <p 
                        className="font-semibold md:text-[var(--desktop-size)]"
                        style={getStyleObject(data.metricsValueStyle)}
                      >
                        {data.details.amount}
                      </p>
                    </div>
                  )}
                  {data.details.fee && (
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p 
                        className="mb-1 md:text-[var(--desktop-size)]"
                        style={getStyleObject(data.metricsLabelStyle)}
                      >
                        {t(data.details.feeLabel || 'Шимтгэл /%/', data.details.feeLabelEn || 'Fee')}
                      </p>
                      <p 
                        className="font-semibold md:text-[var(--desktop-size)]"
                        style={getStyleObject(data.metricsValueStyle)}
                      >
                        {data.details.fee}
                      </p>
                    </div>
                  )}
                  {data.details.interest && (
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p 
                        className="mb-1 md:text-[var(--desktop-size)]"
                        style={getStyleObject(data.metricsLabelStyle)}
                      >
                        {t('Хүү /сарын/', 'Interest')}
                      </p>
                      <p 
                        className="font-semibold md:text-[var(--desktop-size)]"
                        style={getStyleObject(data.metricsValueStyle)}
                      >
                        {data.details.interest}
                      </p>
                    </div>
                  )}
                  {data.details.term && (
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p 
                        className="mb-1 md:text-[var(--desktop-size)]"
                        style={getStyleObject(data.metricsLabelStyle)}
                      >
                        {t('Зээлийн хугацаа', 'Loan Term')}
                      </p>
                      <p 
                        className="font-semibold md:text-[var(--desktop-size)]"
                        style={getStyleObject(data.metricsValueStyle)}
                      >
                        {data.details.term}
                      </p>
                    </div>
                  )}
                  {data.details.decision && (
                    <div className="rounded-xl bg-slate-50 p-3 md:col-span-2">
                      <p 
                        className="mb-1 md:text-[var(--desktop-size)]"
                        style={getStyleObject(data.metricsLabelStyle)}
                      >
                        {t('Шийдвэрлэх хугацаа', 'Decision Time')}
                      </p>
                      <p 
                        className="font-semibold md:text-[var(--desktop-size)]"
                        style={getStyleObject(data.metricsValueStyle)}
                      >
                        {data.details.decision}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Materials */}
              {hasMaterials && (
                <div className="mb-6">
                  <h3 
                    className="font-bold mb-3 md:text-[var(--desktop-size)]"
                    style={getStyleObject(data.materialsTitleStyle)}
                  >
                    {materialsTitle}
                  </h3>
                  <ul className="space-y-2">
                    {data.materials.map((m, index) => (
                      <li key={m.id || `material-${index}`} className="flex items-start gap-2">
                        <svg 
                          className="w-4 h-4 mt-0.5 flex-shrink-0" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          style={{ color: data.materialsIconColor || '#0d9488' }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span 
                          className="md:text-[var(--desktop-size)]"
                          style={getStyleObject(data.materialsTextStyle)}
                        >
                          {language === 'mn' ? m.mn : m.en}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Collateral */}
              {hasCollateral && (
                <div className="mb-6">
                  <h3 
                    className="font-bold mb-3 md:text-[var(--desktop-size)]"
                    style={getStyleObject(data.collateralTitleStyle)}
                  >
                    {collateralTitle}
                  </h3>
                  <ul className="space-y-2">
                    {data.collateral.map((c, index) => (
                      <li key={c.id || `collateral-${index}`} className="flex items-start gap-2">
                        <svg 
                          className="w-4 h-4 mt-0.5 flex-shrink-0" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          style={{ color: data.collateralIconColor || '#0d9488' }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span 
                          className="md:text-[var(--desktop-size)]"
                          style={getStyleObject(data.collateralTextStyle)}
                        >
                          {language === 'mn' ? c.mn : c.en}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Conditions */}
              {hasConditions && (
                <div>
                  <h3 
                    className="font-bold mb-3 md:text-[var(--desktop-size)]"
                    style={getStyleObject(data.conditionsTitleStyle)}
                  >
                    {conditionsTitle}
                  </h3>
                  <ul className="space-y-2">
                    {data.conditions.map((c, index) => (
                      <li key={c.id || `condition-${index}`} className="flex items-start gap-2">
                        <svg 
                          className="w-4 h-4 mt-0.5 flex-shrink-0" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          style={{ color: data.conditionsIconColor || '#f97316' }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span 
                          className="md:text-[var(--desktop-size)]"
                          style={getStyleObject(data.conditionsTextStyle)}
                        >
                          {language === 'mn' ? c.mn : c.en}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Empty state when no data */}
              {!hasMaterials && !hasCollateral && !hasConditions && !hasDetailsMetrics && (
                <div className="text-center py-8 text-slate-400">
                  <p>{t('Мэдээлэл байхгүй байна', 'No information available')}</p>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT: Calculator */}
          <aside>
            <div className="sticky top-24">
              <LoanCalculator
                maxAmount={data.maxAmount}
                maxTerm={data.maxTerm}
                minRate={data.minRate}
                maxRate={data.maxRate}
                downPaymentPercent={data.downPaymentPercent}
                calcBtnColor={data.calcBtnColor}
                calcBtnFontSize={data.calcBtnFontSize}
                calcBtnText={data.calcBtnText}
                requestBtnColor={data.requestBtnColor}
                requestBtnFontSize={data.requestBtnFontSize}
                requestBtnText={data.requestBtnText}
                requestBtnUrl={data.requestBtnUrl}
                disclaimerColor={data.disclaimerColor}
                disclaimerFontSize={data.disclaimerFontSize}
                disclaimerText={data.disclaimerText}
              />
            </div>
          </aside>
        </div>

        {/* Custom Text Blocks - Footer Placement */}
        {data.blocks
          ?.filter((b) => b.placement === 'footer' && b.visible)
          .sort((a, b) => a.order - b.order)
          .map((block) => (
            <div key={block.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <TextBlockRenderer block={block} language={language} />
            </div>
          ))}
      </div>
    </main>
  )
}