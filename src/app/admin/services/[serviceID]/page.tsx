'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { Input, Textarea, PageHeader } from '@/components/FormElements'
import DocumentSelector from '@/components/DocumentSelector'
import { axiosInstance } from '@/lib/axios'


interface Translation     { id?: number; language: number; label: string }
interface ServiceTranslation { id?: number; language: number; title: string; description: string }
interface CardTranslation { id?: number; language: number; label: string; short_desc: string }

interface RawDocument   { id: number; translations: Translation[] }
interface RawCollateral { id: number; translations: Translation[] }
interface RawCondition  { id: number; translations: Translation[] }

interface ApiServiceResponse {
  id: number
  translations: ServiceTranslation[]
  cards: { id: number; title: string; translations: CardTranslation[] }[]
  collaterals: { id: number; collateral: RawCollateral }[]
  conditions:  { id: number; condition:  RawCondition  }[]
  documents:   { id: number; document:   RawDocument   }[]
}

interface SelectedItem {
  id: number; relation_id?: number; label_mn: string; label_en: string
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
  id: string
  title_mn: string; title_en: string
  description_mn: string; description_en: string
  cards:       SelectedCard[]
  documents:   SelectedItem[]
  collaterals: SelectedItem[]
  conditions:  SelectedItem[]
}

const getLang = (t: Translation[], id: number) => t.find(x => x.language === id)?.label || ''
const getCardF = (t: CardTranslation[], id: number, f: 'label'|'short_desc') => t.find(x => x.language === id)?.[f] || ''
const getSvcF  = (t: ServiceTranslation[], id: number, f: 'title'|'description') => t.find(x => x.language === id)?.[f] || ''

const toUi = (api: ApiServiceResponse): ServiceData => ({
  id: api.id.toString(),
  title_mn:       getSvcF(api.translations, 2, 'title'),
  title_en:       getSvcF(api.translations, 1, 'title'),
  description_mn: getSvcF(api.translations, 2, 'description'),
  description_en: getSvcF(api.translations, 1, 'description'),
  cards: (api.cards||[]).map(c => ({
    id: c.id, title: c.title,
    label_mn:      getCardF(c.translations, 2, 'label'),
    label_en:      getCardF(c.translations, 1, 'label'),
    short_desc_mn: getCardF(c.translations, 2, 'short_desc'),
    short_desc_en: getCardF(c.translations, 1, 'short_desc'),
  })),
  documents:   (api.documents||[]).map(d => ({ id: d.document.id, relation_id: d.id, label_mn: getLang(d.document.translations,2), label_en: getLang(d.document.translations,1) })),
  collaterals: (api.collaterals||[]).map(c => ({ id: c.collateral.id, relation_id: c.id, label_mn: getLang(c.collateral.translations,2), label_en: getLang(c.collateral.translations,1) })),
  conditions:  (api.conditions||[]).map(c => ({ id: c.condition.id,  relation_id: c.id, label_mn: getLang(c.condition.translations,2),  label_en: getLang(c.condition.translations,1) })),
})

const defaultData = (): ServiceData => ({
  id:'', title_mn:'', title_en:'', description_mn:'', description_en:'',
  cards:[], documents:[], collaterals:[], conditions:[],
})

function ServicePreview({ data, lang }: { data: ServiceData; lang: 'mn'|'en' }) {
  const title = lang==='mn' ? data.title_mn : data.title_en
  const desc  = lang==='mn' ? data.description_mn : data.description_en

  const Tick = ({ color='text-teal-500' }: { color?: string }) => (
    <svg className={`w-5 h-5 ${color} mt-0.5 shrink-0`} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
    </svg>
  )

  return (
    <main className="min-h-[400px] bg-gradient-to-b from-slate-50 via-white to-slate-100 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-slate-200/40 blur-3xl rounded-full"/>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-16 relative z-10">

        <header className="text-center mb-12 max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900">
            {title || (lang==='mn' ? 'Үйлчилгээний нэр' : 'Service Title')}
          </h1>
          {desc && <p className="text-base md:text-lg text-slate-600 leading-relaxed">{desc}</p>}

          {data.cards.length > 0 && (
            <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {data.cards.map((c, i) => (
                <div key={c.id||i} className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-center">
                  <p className="text-base font-semibold text-teal-600 mb-1">
                    {lang==='mn' ? c.label_mn : c.label_en}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {lang==='mn' ? c.short_desc_mn : c.short_desc_en}
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
                <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0"/>
                {lang==='mn' ? 'Шаардагдах материал' : 'Required Documents'}
              </h3>
              <ul className="space-y-3">
                {data.documents.map(d => (
                  <li key={d.id} className="flex items-start gap-3 text-sm text-slate-500">
                    <Tick/>{lang==='mn' ? d.label_mn : d.label_en}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.collaterals.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0"/>
                {lang==='mn' ? 'Барьцаа хөрөнгө' : 'Collateral'}
              </h3>
              <ul className="space-y-3">
                {data.collaterals.map(c => (
                  <li key={c.id} className="flex items-start gap-3 text-sm text-slate-500">
                    <Tick/>{lang==='mn' ? c.label_mn : c.label_en}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.conditions.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0"/>
                {lang==='mn' ? 'Нөхцөл' : 'Conditions'}
              </h3>
              <ul className="space-y-3">
                {data.conditions.map(c => (
                  <li key={c.id} className="flex items-start gap-3 text-sm text-slate-500">
                    <Tick color="text-orange-400"/>{lang==='mn' ? c.label_mn : c.label_en}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!data.documents.length && !data.collaterals.length && !data.conditions.length && (
            <p className="text-sm text-slate-400 text-center py-8 italic">
              {lang==='mn' ? 'Мэдээлэл байхгүй байна.' : 'No information available.'}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

function CardEditor({ cards, onChange }: { cards: SelectedCard[]; onChange: (c: SelectedCard[]) => void }) {
  const add    = () => onChange([...cards, { id: Date.now(), title: '', label_mn: '', label_en: '', short_desc_mn: '', short_desc_en: '', isNew: true }])
  const remove = (i: number) => onChange(cards.filter((_, idx) => idx !== i))
  const patch  = (i: number, p: Partial<SelectedCard>) => onChange(cards.map((c, idx) => idx===i ? {...c, ...p} : c))

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            <span className="inline-flex items-center text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
              Card #{i + 1}
              {card.isNew && <span className="ml-1.5 text-amber-500">● Шинэ</span>}
            </span>

            <div className="grid md:grid-cols-2 gap-3 pr-8">
              <Input label="Нэр / Label (МН)" value={card.label_mn} placeholder="Жишээ: Сарын цалин"
                onChange={e => patch(i, { label_mn: e.target.value })}/>
              <Input label="Name / Label (EN)" value={card.label_en} placeholder="e.g., Monthly salary"
                onChange={e => patch(i, { label_en: e.target.value })}/>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <Input label="Богино тайлбар (МН)" value={card.short_desc_mn} placeholder="Жишээ: Богино хугацааны зээл"
                onChange={e => patch(i, { short_desc_mn: e.target.value })}/>
              <Input label="Short Description (EN)" value={card.short_desc_en} placeholder="e.g., Short-term loan service"
                onChange={e => patch(i, { short_desc_en: e.target.value })}/>
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

export default function ServiceAdminPage() {
  const params    = useParams()
  const router    = useRouter()
  const serviceId = params?.serviceID as string

  const [data,        setData]        = useState<ServiceData>(defaultData())
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [isSaving,    setIsSaving]    = useState(false)
  const [isDeleting,  setIsDeleting]  = useState(false)
  const [previewLang, setPreviewLang] = useState<'mn'|'en'>('mn')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [availDocs,  setAvailDocs]  = useState<RawDocument[]>([])
  const [availColls, setAvailColls] = useState<RawCollateral[]>([])
  const [availConds, setAvailConds] = useState<RawCondition[]>([])
  const [loadingAvail, setLoadingAvail] = useState(false)

  useEffect(() => {
    if (!serviceId) { setError('Service ID олдсонгүй'); setLoading(false); return }
    const load = async () => {
      try {
        setLoading(true); setLoadingAvail(true)
        const [s, d, co, cn] = await Promise.all([
          axiosInstance.get<ApiServiceResponse>(`/services/${serviceId}/`),
          axiosInstance.get<RawDocument[]>('/document/'),
          axiosInstance.get<RawCollateral[]>('/collateral/'),
          axiosInstance.get<RawCondition[]>('/condition/'),
        ])
        setData(toUi(s.data))
        setAvailDocs(d.data); setAvailColls(co.data); setAvailConds(cn.data)
      } catch (e: any) {
        setError(`Алдаа: ${e.response?.data?.message || e.message}`)
      } finally { setLoading(false); setLoadingAvail(false) }
    }
    load()
  }, [serviceId])

  const upd = (fn: (p: ServiceData) => ServiceData) => setData(fn)

  const addDoc    = async (d: RawDocument):   Promise<boolean> => { upd(p => ({ ...p, documents:   [...p.documents,   { id: d.id,  label_mn: getLang(d.translations,2),  label_en: getLang(d.translations,1)  }] })); return true }
  const remDoc    = async (id: number):       Promise<boolean> => { upd(p => ({ ...p, documents:   p.documents.filter(x => x.id !== id) }));   return true }
  const addColl   = async (c: RawCollateral): Promise<boolean> => { upd(p => ({ ...p, collaterals: [...p.collaterals, { id: c.id,  label_mn: getLang(c.translations,2),  label_en: getLang(c.translations,1)  }] })); return true }
  const remColl   = async (id: number):       Promise<boolean> => { upd(p => ({ ...p, collaterals: p.collaterals.filter(x => x.id !== id) })); return true }
  const addCond   = async (c: RawCondition):  Promise<boolean> => { upd(p => ({ ...p, conditions:  [...p.conditions,  { id: c.id,  label_mn: getLang(c.translations,2),  label_en: getLang(c.translations,1)  }] })); return true }
  const remCond   = async (id: number):       Promise<boolean> => { upd(p => ({ ...p, conditions:  p.conditions.filter(x => x.id !== id) }));  return true }

  const save = async () => {
    if (!serviceId) return
    setIsSaving(true)
    try {
      const payload = {
        translations: [
          { language: 1, title: data.title_en, description: data.description_en },
          { language: 2, title: data.title_mn, description: data.description_mn },
        ],
        cards: data.cards.map(c => ({
          ...(!c.isNew && { id: c.id }),
          title: c.title || c.label_en || c.label_mn,
          translations: [
            { language: 1, label: c.label_en, short_desc: c.short_desc_en },
            { language: 2, label: c.label_mn, short_desc: c.short_desc_mn },
          ],
        })),
        documents:   data.documents.map(d   => ({ document:   d.id })),
        collaterals: data.collaterals.map(c  => ({ collateral: c.id })),
        conditions:  data.conditions.map(c   => ({ condition:  c.id })),
      }
      await axiosInstance.put(`/services/${serviceId}/`, payload)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      const r = await axiosInstance.get<ApiServiceResponse>(`/services/${serviceId}/`)
      setData(toUi(r.data))
    } catch (e: any) {
      alert(`Алдаа: ${e.response?.data?.detail || e.response?.data?.message || e.message}`)
    } finally { setIsSaving(false) }
  }

  const handleDelete = async () => {
    if (!serviceId) return
    
    const confirmMsg = `Та "${data.title_mn || data.title_en}" үйлчилгээг устгахдаа итгэлтэй байна уу?\n\nЭнэ үйлдлийг буцаах боломжгүй!`
    if (!confirm(confirmMsg)) return

    setIsDeleting(true)
    try {
      await axiosInstance.delete(`/services/${serviceId}/`)
      alert('✅ Үйлчилгээ амжилттай устгагдлаа!')
      router.push('/admin/service-add')
    } catch (e: any) {
      const errorMsg = e.response?.data?.detail || e.response?.data?.message || e.message
      alert(`❌ Устгахад алдаа гарлаа: ${errorMsg}`)
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) return (
    <AdminLayout title="Үйлчилгээ">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
          <p className="text-gray-600">Уншиж байна...</p>
        </div>
      </div>
    </AdminLayout>
  )
  if (error) return (
    <AdminLayout title="Алдаа">
      <div className="flex items-center justify-center min-h-screen text-center">
        <div><div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Алдаа гарлаа</h2>
        <p className="text-gray-600">{error}</p></div>
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout title={data.title_mn || 'Үйлчилгээ'}>
      <div className="max-w-6xl mx-auto">

        {saveSuccess && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-emerald-900">Амжилттай хадгалагдлаа!</h4>
              <p className="text-xs text-emerald-700 mt-0.5">Өөрчлөлтүүд серверт хадгалагдлаа.</p>
            </div>
          </div>
        )}

        <PageHeader title={data.title_mn || 'Үйлчилгээ'} description={`ID: ${serviceId}`}
          action={
            <div className="flex gap-3">
              <button 
                onClick={handleDelete} 
                disabled={isDeleting || isSaving}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-sm"
              >
                {isDeleting ? '🗑️ Устгаж байна...' : '🗑️ Устгах'}
              </button>
              <button 
                onClick={save} 
                disabled={isSaving || isDeleting}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-sm"
              >
                {isSaving ? '⏳ Хадгалж байна...' : '💾 Бүгдийг хадгалах'}
              </button>
            </div>
          }
        />

        <div className="mb-8 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-white/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Live Preview</span>
            </div>
            <div className="flex bg-slate-200/80 p-1 rounded-lg">
              {(['mn','en'] as const).map(l => (
                <button key={l} onClick={() => setPreviewLang(l)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${previewLang===l ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <ServicePreview data={data} lang={previewLang}/>
        </div>

        <div className="space-y-6">

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase">🏷 Үндсэн мэдээлэл / Basic Information</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <Input label="Гарчиг (МН) *" value={data.title_mn} placeholder="Үйлчилгээний нэр монгол хэлээр..."
                  onChange={e => upd(p => ({ ...p, title_mn: e.target.value }))}/>
                <Input label="Title (EN) *" value={data.title_en} placeholder="Service title in English..."
                  onChange={e => upd(p => ({ ...p, title_en: e.target.value }))}/>
              </div>
              <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <Textarea label="Тайлбар (МН)" value={data.description_mn} rows={4} placeholder="Дэлгэрэнгүй тайлбар..."
                  onChange={e => upd(p => ({ ...p, description_mn: e.target.value }))}/>
                <Textarea label="Description (EN)" value={data.description_en} rows={4} placeholder="Detailed description..."
                  onChange={e => upd(p => ({ ...p, description_en: e.target.value }))}/>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-600 uppercase">🃏 Cards — Үйлчилгээний үзүүлэлтүүд</h3>
              <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">{data.cards.length}</span>
            </div>
            <CardEditor cards={data.cards} onChange={cards => upd(p => ({ ...p, cards }))}/>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-600 uppercase">📄 Шаардлагатай бичиг баримт</h3>
              <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">{data.documents.length}</span>
            </div>
            <DocumentSelector title="" selectedDocuments={data.documents} availableDocuments={availDocs}
              onAdd={addDoc} onRemove={remDoc} loading={loadingAvail}/>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-600 uppercase">🏠 Барьцаа хөрөнгө</h3>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">{data.collaterals.length}</span>
            </div>
            <DocumentSelector title="" selectedDocuments={data.collaterals} availableDocuments={availColls}
              onAdd={addColl} onRemove={remColl} loading={loadingAvail}/>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-600 uppercase">📋 Нөхцөл шаардлага</h3>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">{data.conditions.length}</span>
            </div>
            <DocumentSelector title="" selectedDocuments={data.conditions} availableDocuments={availConds}
              onAdd={addCond} onRemove={remCond} loading={loadingAvail}/>
          </div>

          <div className="flex justify-between items-center pt-2 pb-8">
            <button 
              onClick={handleDelete} 
              disabled={isDeleting || isSaving}
              className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors shadow-sm"
            >
              {isDeleting ? '🗑️ Устгаж байна...' : '🗑️ Устгах'}
            </button>
            
            <button 
              onClick={save} 
              disabled={isSaving || isDeleting}
              className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors shadow-sm"
            >
              {isSaving ? '⏳ Хадгалж байна...' : '💾 Бүгдийг хадгалах'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}