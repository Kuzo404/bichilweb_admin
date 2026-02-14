'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { Input, Textarea, PageHeader } from '@/components/FormElements'
import DocumentSelector from '@/components/DocumentSelector'
import { axiosInstance } from '@/lib/axios'

interface Translation {
  id: number
  language: number
  label: string
}

interface Document {
  id: number
  translations: Translation[]
}

interface SelectedDocument {
  id: number
  label_mn: string
  label_en: string
}

interface SelectedCard {
  id: number
  title: string
  label_mn: string
  label_en: string
  short_desc_mn: string
  short_desc_en: string
  isNew?: boolean
}

interface ServiceData {
  title_mn: string
  title_en: string
  description_mn: string
  description_en: string
  cards: SelectedCard[]
  documents: SelectedDocument[]
  collaterals: SelectedDocument[]
  conditions: SelectedDocument[]
}

const getTranslation = (translations: Translation[], languageId: number): string => {
  const translation = translations.find(t => t.language === languageId)
  return translation?.label || ''
}

const createDefaultData = (): ServiceData => ({
  title_mn: '',
  title_en: '',
  description_mn: '',
  description_en: '',
  cards: [],
  documents: [],
  collaterals: [],
  conditions: [],
})

function ServicePreview({ data, lang }: { data: ServiceData; lang: 'mn' | 'en' }) {
  const title = lang === 'mn' ? data.title_mn : data.title_en
  const desc = lang === 'mn' ? data.description_mn : data.description_en

  const Tick = ({ color = 'text-teal-500' }: { color?: string }) => (
    <svg className={`w-5 h-5 ${color} mt-0.5 shrink-0`} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  )

  return (
    <main className="min-h-[400px] bg-gradient-to-b from-slate-50 via-white to-slate-100 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-slate-200/40 blur-3xl rounded-full" />
      </div>
      <div className="max-w-5xl mx-auto px-6 py-16 relative z-10">

        <header className="text-center mb-12 max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900">
            {title || (lang === 'mn' ? 'Үйлчилгээний нэр' : 'Service Title')}
          </h1>
          {desc && <p className="text-base md:text-lg text-slate-600 leading-relaxed">{desc}</p>}

          {data.cards.length > 0 && (
            <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {data.cards.map((c, i) => (
                <div key={c.id || i} className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-center">
                  <p className="text-base font-semibold text-teal-600 mb-1">
                    {lang === 'mn' ? c.label_mn : c.label_en}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {lang === 'mn' ? c.short_desc_mn : c.short_desc_en}
                  </p>
                </div>
              ))}
            </div>
          )}
        </header>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-slate-100 space-y-10">
          {data.documents.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                {lang === 'mn' ? 'Шаардагдах материал' : 'Required Documents'}
              </h3>
              <ul className="space-y-3">
                {data.documents.map(d => (
                  <li key={d.id} className="flex items-start gap-3 text-sm text-slate-500">
                    <Tick />{lang === 'mn' ? d.label_mn : d.label_en}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.collaterals.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                {lang === 'mn' ? 'Барьцаа хөрөнгө' : 'Collateral'}
              </h3>
              <ul className="space-y-3">
                {data.collaterals.map(c => (
                  <li key={c.id} className="flex items-start gap-3 text-sm text-slate-500">
                    <Tick />{lang === 'mn' ? c.label_mn : c.label_en}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.conditions.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                {lang === 'mn' ? 'Нөхцөл' : 'Conditions'}
              </h3>
              <ul className="space-y-3">
                {data.conditions.map(c => (
                  <li key={c.id} className="flex items-start gap-3 text-sm text-slate-500">
                    <Tick color="text-orange-400" />{lang === 'mn' ? c.label_mn : c.label_en}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!data.documents.length && !data.collaterals.length && !data.conditions.length && (
            <p className="text-sm text-slate-400 text-center py-8 italic">
              {lang === 'mn' ? 'Мэдээлэл байхгүй байна.' : 'No information available.'}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

function CardEditor({ cards, onChange }: { cards: SelectedCard[]; onChange: (c: SelectedCard[]) => void }) {
  const add = () => onChange([...cards, { id: Date.now(), title: '', label_mn: '', label_en: '', short_desc_mn: '', short_desc_en: '', isNew: true }])
  const remove = (i: number) => onChange(cards.filter((_, idx) => idx !== i))
  const patch = (i: number, p: Partial<SelectedCard>) => onChange(cards.map((c, idx) => idx === i ? { ...c, ...p } : c))

  return (
    <div className="space-y-4">
      {cards.length === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-6">
          Card байхгүй. Доорх товчоор нэмнэ үү.
        </p>
      ) : (
        cards.map((card, i) => (
          <div key={card.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 relative">
            <button onClick={() => remove(i)}
              className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors p-1" title="Устгах">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <span className="inline-flex items-center text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
              Card #{i + 1}
              {card.isNew && <span className="ml-1.5 text-amber-500">● Шинэ</span>}
            </span>

            <div className="grid md:grid-cols-2 gap-3 pr-8">
              <Input label="Нэр / Label (МН)" value={card.label_mn} placeholder="Жишээ: Сарын цалин"
                onChange={e => patch(i, { label_mn: e.target.value })} />
              <Input label="Name / Label (EN)" value={card.label_en} placeholder="e.g., Monthly salary"
                onChange={e => patch(i, { label_en: e.target.value })} />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <Input label="Богино тайлбар (МН)" value={card.short_desc_mn} placeholder="Жишээ: Богино хугацааны зээл"
                onChange={e => patch(i, { short_desc_mn: e.target.value })} />
              <Input label="Short Description (EN)" value={card.short_desc_en} placeholder="e.g., Short-term loan service"
                onChange={e => patch(i, { short_desc_en: e.target.value })} />
            </div>
          </div>
        ))
      )}

      <button onClick={add}
        className="w-full py-2.5 border-2 border-dashed border-teal-300 text-teal-600 text-sm font-medium
                   rounded-xl hover:bg-teal-50 hover:border-teal-400 transition-all">
        + Card нэмэх
      </button>
    </div>
  )
}

export default function ServiceAddPage() {
  const router = useRouter()

  const [data, setData] = useState<ServiceData>(createDefaultData())
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [previewLang, setPreviewLang] = useState<'mn' | 'en'>('mn')

  const [availableDocuments, setAvailableDocuments] = useState<Document[]>([])
  const [availableCollaterals, setAvailableCollaterals] = useState<Document[]>([])
  const [availableConditions, setAvailableConditions] = useState<Document[]>([])
  const [loadingAvail, setLoadingAvail] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setLoadingAvail(true)

        const [docsRes, collsRes, condsRes] = await Promise.all([
          axiosInstance.get<Document[]>('/document/'),
          axiosInstance.get<Document[]>('/collateral/'),
          axiosInstance.get<Document[]>('/condition/')
        ])

        setAvailableDocuments(docsRes.data)
        setAvailableCollaterals(collsRes.data)
        setAvailableConditions(condsRes.data)

      } catch (err: any) {
        console.error('Failed to fetch data:', err)
        alert(`Алдаа гарлаа: ${err.response?.data?.message || err.message}`)
      } finally {
        setLoading(false)
        setLoadingAvail(false)
      }
    }

    fetchData()
  }, [])

  const updateData = (updater: (prev: ServiceData) => ServiceData) => {
    setData(updater)
  }

  // Document handlers
  const handleAddDocument = async (document: Document): Promise<boolean> => {
    try {
      const newDoc: SelectedDocument = {
        id: document.id,
        label_mn: getTranslation(document.translations, 2),
        label_en: getTranslation(document.translations, 1),
      }
      setData(prev => ({ ...prev, documents: [...prev.documents, newDoc] }))
      return true
    } catch (error: any) {
      console.error('Failed to add document:', error)
      throw new Error('Баримт нэмэхэд алдаа гарлаа')
    }
  }

  const handleRemoveDocument = async (documentId: number): Promise<boolean> => {
    try {
      setData(prev => ({ ...prev, documents: prev.documents.filter(d => d.id !== documentId) }))
      return true
    } catch (error: any) {
      console.error('Failed to remove document:', error)
      throw new Error('Баримт устгахад алдаа гарлаа')
    }
  }

  // Collateral handlers
  const handleAddCollateral = async (collateral: Document): Promise<boolean> => {
    try {
      const newColl: SelectedDocument = {
        id: collateral.id,
        label_mn: getTranslation(collateral.translations, 2),
        label_en: getTranslation(collateral.translations, 1),
      }
      setData(prev => ({ ...prev, collaterals: [...prev.collaterals, newColl] }))
      return true
    } catch (error: any) {
      console.error('Failed to add collateral:', error)
      throw new Error('Барьцаа нэмэхэд алдаа гарлаа')
    }
  }

  const handleRemoveCollateral = async (collateralId: number): Promise<boolean> => {
    try {
      setData(prev => ({ ...prev, collaterals: prev.collaterals.filter(c => c.id !== collateralId) }))
      return true
    } catch (error: any) {
      console.error('Failed to remove collateral:', error)
      throw new Error('Барьцаа устгахад алдаа гарлаа')
    }
  }

  // Condition handlers
  const handleAddCondition = async (condition: Document): Promise<boolean> => {
    try {
      const newCond: SelectedDocument = {
        id: condition.id,
        label_mn: getTranslation(condition.translations, 2),
        label_en: getTranslation(condition.translations, 1),
      }
      setData(prev => ({ ...prev, conditions: [...prev.conditions, newCond] }))
      return true
    } catch (error: any) {
      console.error('Failed to add condition:', error)
      throw new Error('Нөхцөл нэмэхэд алдаа гарлаа')
    }
  }

  const handleRemoveCondition = async (conditionId: number): Promise<boolean> => {
    try {
      setData(prev => ({ ...prev, conditions: prev.conditions.filter(c => c.id !== conditionId) }))
      return true
    } catch (error: any) {
      console.error('Failed to remove condition:', error)
      throw new Error('Нөхцөл устгахад алдаа гарлаа')
    }
  }

  const handleCreate = async () => {
    if (!data.title_mn || !data.title_en) {
      alert('❌ Үйлчилгээний гарчиг заавал оруулна уу!')
      return
    }

    setIsCreating(true)
    try {
      const createPayload = {
        translations: [
          { language: 1, title: data.title_en, description: data.description_en || null },
          { language: 2, title: data.title_mn, description: data.description_mn || null }
        ],
        cards: data.cards.map(card => ({
          title: card.title || card.label_en || card.label_mn,
          translations: [
            { language: 1, label: card.label_en, short_desc: card.short_desc_en },
            { language: 2, label: card.label_mn, short_desc: card.short_desc_mn },
          ].filter(t => t.label.trim() !== '')
        })),
        documents: data.documents.map(doc => ({ document: doc.id })),
        collaterals: data.collaterals.map(coll => ({ collateral: coll.id })),
        conditions: data.conditions.map(cond => ({ condition: cond.id }))
      }

      const response = await axiosInstance.post('/services/', createPayload)

      alert('✅ Үйлчилгээ амжилттай үүсгэгдлээ!')
      router.push(`/admin/services/${response.data.id}`)

    } catch (error: any) {
      const errorMsg = error.response?.data?.detail
        || error.response?.data?.message
        || error.message
        || 'Тодорхойгүй алдаа'
      alert(`❌ Алдаа: ${errorMsg}`)
    } finally {
      setIsCreating(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Шинэ үйлчилгээ">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Уншиж байна...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Шинэ үйлчилгээ">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Шинэ үйлчилгээ нэмэх"
          description="Бүх талбарыг бөглөж, 'Үүсгэх' товч дарна уу"
          action={
            <div className="flex gap-3">
              <button
                onClick={() => router.back()}
                disabled={isCreating}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-sm"
              >
                ← Буцах
              </button>
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-sm"
              >
                {isCreating ? '⏳ Үүсгэж байна...' : '✅ Үүсгэх'}
              </button>
            </div>
          }
        />

        <div className="mb-8 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-white/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Live Preview</span>
            </div>
            <div className="flex bg-slate-200/80 p-1 rounded-lg">
              {(['mn', 'en'] as const).map(l => (
                <button key={l} onClick={() => setPreviewLang(l)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${previewLang === l ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <ServicePreview data={data} lang={previewLang} />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase">🏷 Үндсэн мэдээлэл / Basic Information</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <Input
                    label="Гарчиг (МН) *"
                    value={data.title_mn}
                    onChange={(e) => updateData((prev) => ({ ...prev, title_mn: e.target.value }))}
                    placeholder="Үйлчилгээний нэр монгол хэлээр..."
                    required
                  />
                  {!data.title_mn && <p className="text-xs text-red-500 mt-1">⚠️ Заавал бөглөнө үү</p>}
                </div>
                <div>
                  <Input
                    label="Title (EN) *"
                    value={data.title_en}
                    onChange={(e) => updateData((prev) => ({ ...prev, title_en: e.target.value }))}
                    placeholder="Service title in English..."
                    required
                  />
                  {!data.title_en && <p className="text-xs text-red-500 mt-1">⚠️ Заавал бөглөнө үү</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <Textarea
                  label="Тайлбар (МН)"
                  value={data.description_mn}
                  onChange={(e) => updateData((prev) => ({ ...prev, description_mn: e.target.value }))}
                  rows={4}
                  placeholder="Дэлгэрэнгүй тайлбар..."
                />
                <Textarea
                  label="Description (EN)"
                  value={data.description_en}
                  onChange={(e) => updateData((prev) => ({ ...prev, description_en: e.target.value }))}
                  rows={4}
                  placeholder="Detailed description..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-600 uppercase">🃏 Cards — Үйлчилгээний үзүүлэлтүүд</h3>
              <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">{data.cards.length}</span>
            </div>
            <CardEditor cards={data.cards} onChange={cards => updateData(p => ({ ...p, cards }))} />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-600 uppercase">📄 Шаардлагатай бичиг баримт</h3>
              <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">{data.documents.length}</span>
            </div>
            <DocumentSelector title="" selectedDocuments={data.documents} availableDocuments={availableDocuments}
              onAdd={handleAddDocument} onRemove={handleRemoveDocument} loading={loadingAvail} />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-600 uppercase">🏠 Барьцаа хөрөнгө</h3>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">{data.collaterals.length}</span>
            </div>
            <DocumentSelector title="" selectedDocuments={data.collaterals} availableDocuments={availableCollaterals}
              onAdd={handleAddCollateral} onRemove={handleRemoveCollateral} loading={loadingAvail} />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-600 uppercase">📋 Нөхцөл шаардлага</h3>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">{data.conditions.length}</span>
            </div>
            <DocumentSelector title="" selectedDocuments={data.conditions} availableDocuments={availableConditions}
              onAdd={handleAddCondition} onRemove={handleRemoveCondition} loading={loadingAvail} />
          </div>

          <div className="flex justify-end pt-2 pb-8">
            <button
              onClick={handleCreate}
              disabled={isCreating || !data.title_mn || !data.title_en}
              className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors shadow-sm"
            >
              {isCreating ? '⏳ Үүсгэж байна...' : '💾 Үүсгэх'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}