'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import ImageUpload from '@/components/ImageUpload'
import Modal from '@/components/Modal'
import clsx from 'clsx'
import { axiosInstance } from '@/lib/axios'

/* ═══════════════════════════════════════════════════════════════════
   Төрлүүд (Types)
   ═══════════════════════════════════════════════════════════════════ */

// Backend API-аас ирэх өгөгдлийн бүтэц
interface APITranslation {
  id: number
  language: number
  language_code: string
  language_name: string
  title?: string
  content?: string
  color?: string
  fontcolor?: string
  fontsize?: string
  fontweight?: string
  fontfamily?: string
}

interface APIBlock {
  id: number
  index: number
  visible: boolean
  translations: APITranslation[]
}

interface APISection {
  id: number
  index: number
  visible: boolean
  created: string | null
  updated: string | null
  translations: APITranslation[]
  blocks: APIBlock[]
}

interface APIMedia {
  id: number
  type: string
  url: string
  file?: string
  aspect_ratio?: string
}

interface APIAboutPage {
  id: number
  key: string
  active: boolean
  created: string | null
  updated: string | null
  sections: APISection[]
  media: APIMedia[]
}

// Түүхэн замналын нэг үйл явдал
interface TimelineEvent {
  id?: number
  year: string
  title_mn: string
  title_en: string
  short_mn: string
  short_en: string
  desc_mn: string
  desc_en: string
  year_color: string
  title_color: string
  short_color: string
  desc_color: string
  visible: boolean
}

// Динамик блок (Параграф) - нэг хэсгийн дотор олон блок байж болно
interface DynamicBlock {
  content_mn: string
  content_en: string
  color: string
  size: number
  weight: string
  family: string
  visible: boolean
}

// Динамик хэсэг (Section) - Гарчиг + Блокууд
interface DynamicSection {
  label: string          // Засварлагч дээр харуулах нэр
  title_mn: string
  title_en: string
  title_color: string
  title_size: number
  title_weight: string
  title_family: string
  visible: boolean
  blocks: DynamicBlock[]
}

// Бүх өгөгдөл
interface IntroData {
  pageId: number | null   // API-аас ирсэн about page-ийн ID
  image_url: string
  image_height: string
  sections: DynamicSection[]
  timeline_events: TimelineEvent[]
}

/* ═══════════════════════════════════════════════════════════════════
   Анхны утгууд (Initial/Default values)
   ═══════════════════════════════════════════════════════════════════ */

// Шинэ блок үүсгэх үед хэрэглэх анхны утга
const newBlock = (): DynamicBlock => ({
  content_mn: '',
  content_en: '',
  color: '#475569',
  size: 14,
  weight: '400',
  family: 'inherit',
  visible: true,
})

// Шинэ хэсэг үүсгэх үед хэрэглэх анхны утга
const newSection = (label?: string): DynamicSection => ({
  label: label || 'Шинэ хэсэг',
  title_mn: '',
  title_en: '',
  title_color: '#0f172a',
  title_size: 18,
  title_weight: '700',
  title_family: 'inherit',
  visible: true,
  blocks: [newBlock()],
})

// Анхны өгөгдөл - хоосон about page
const initialData: IntroData = {
  pageId: null,
  image_url: '',
  image_height: 'aspect-video',
  sections: [
    { ...newSection('Бидний түүх'), title_size: 24, blocks: [newBlock(), newBlock(), { ...newBlock(), weight: '600' }] },
    { ...newSection('Юу хийдэг вэ?'), blocks: [newBlock()] },
    { ...newSection('Жижиг дунд бизнес'), blocks: [newBlock(), newBlock()] },
    { ...newSection('Иргэн баян бол улс баян'), blocks: [newBlock(), newBlock()] },
  ],
  timeline_events: [],
}

/* ═══════════════════════════════════════════════════════════════════
   Тусдаа дэд компонент: Фонт тохиргоо (FontControls)
   ═══════════════════════════════════════════════════════════════════ */
function FontControls({
  color, size, weight, family,
  onChange,
  bgClass = 'bg-teal-100/40 border-teal-200',
  maxSize = 48,
}: {
  color: string; size: number; weight: string; family: string
  onChange: (field: string, value: string | number) => void
  bgClass?: string
  maxSize?: number
}) {
  return (
    <div className={`grid md:grid-cols-4 gap-3 rounded-lg p-3 border ${bgClass}`}>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Өнгө</label>
        <input type="color" value={color} onChange={(e) => onChange('color', e.target.value)}
          className="w-full h-9 rounded border border-gray-300 cursor-pointer" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Хэмжээ (px)</label>
        <input type="number" min="12" max={maxSize} value={size}
          onChange={(e) => onChange('size', Number(e.target.value))}
          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Жин</label>
        <select value={weight} onChange={(e) => onChange('weight', e.target.value)}
          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm">
          <option value="400">Regular</option>
          <option value="500">Medium</option>
          <option value="600">Semibold</option>
          <option value="700">Bold</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Фонт</label>
        <select value={family} onChange={(e) => onChange('family', e.target.value)}
          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm">
          <option value="inherit">Default</option>
          <option value="'Arial', sans-serif">Arial</option>
          <option value="'Georgia', serif">Georgia</option>
        </select>
      </div>
      <div className="md:col-span-4">
        <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
          <span>Урьдчилсан:</span>
          <span className="px-2 py-1 rounded border border-gray-200 bg-white"
            style={{ color, fontSize: `${size}px`, fontWeight: weight, fontFamily: family }}>
            Аа Bb
          </span>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Туслах функцүүд (Helper functions)
   ═══════════════════════════════════════════════════════════════════ */

// API-аас ирсэн өгөгдлийг IntroData руу хөрвүүлнэ
function transformAPIToIntroData(apiData: APIAboutPage): IntroData {
  const result: IntroData = {
    pageId: apiData.id,
    image_url: '',
    image_height: 'aspect-video',
    sections: [],
    timeline_events: [],
  }

  // Зураг
  if (apiData.media && apiData.media.length > 0) {
    result.image_url = apiData.media[0].url || apiData.media[0].file || ''
    result.image_height = apiData.media[0].aspect_ratio || 'aspect-video'
  }

  // Хэсгүүдийг index-ээр нь эрэмбэлж хөрвүүлнэ
  const sortedSections = [...(apiData.sections || [])].sort((a, b) => a.index - b.index)

  for (const section of sortedSections) {
    const mnTitle = section.translations?.find(t => t.language_code === 'MN')
    const enTitle = section.translations?.find(t => t.language_code === 'EN')

    const dynSection: DynamicSection = {
      label: mnTitle?.title || enTitle?.title || `Хэсэг ${section.index + 1}`,
      title_mn: mnTitle?.title || '',
      title_en: enTitle?.title || '',
      title_color: mnTitle?.color || mnTitle?.fontcolor || '#0f172a',
      title_size: parseInt(mnTitle?.fontsize || '18'),
      title_weight: mnTitle?.fontweight || '700',
      title_family: mnTitle?.fontfamily || 'inherit',
      visible: section.visible,
      blocks: [],
    }

    // Блокуудыг index-ээр эрэмбэлнэ
    const sortedBlocks = [...(section.blocks || [])].sort((a, b) => a.index - b.index)
    for (const block of sortedBlocks) {
      const mnBlock = block.translations?.find(t => t.language_code === 'MN')
      const enBlock = block.translations?.find(t => t.language_code === 'EN')
      dynSection.blocks.push({
        content_mn: mnBlock?.content || '',
        content_en: enBlock?.content || '',
        color: mnBlock?.fontcolor || mnBlock?.color || '#475569',
        size: parseInt(mnBlock?.fontsize || '14'),
        weight: mnBlock?.fontweight || '400',
        family: mnBlock?.fontfamily || 'inherit',
        visible: block.visible,
      })
    }

    // Хэрэв блок байхгүй бол нэг хоосон блок нэмнэ
    if (dynSection.blocks.length === 0) {
      dynSection.blocks.push(newBlock())
    }

    result.sections.push(dynSection)
  }

  // Хэсэг байхгүй бол анхны 4 хэсгийг үүсгэнэ
  if (result.sections.length === 0) {
    result.sections = [...initialData.sections]
  }

  return result
}

// IntroData-г API payload руу хөрвүүлнэ
function transformIntroDataToAPI(data: IntroData) {
  return {
    key: 'intro',
    active: true,
    sections: data.sections.map((section, sIdx) => ({
      index: sIdx,
      visible: section.visible,
      translations: [
        {
          language: 1,
          title: section.title_mn,
          color: section.title_color,
          fontsize: section.title_size.toString(),
          fontweight: section.title_weight,
          fontfamily: section.title_family,
        },
        {
          language: 2,
          title: section.title_en,
          color: section.title_color,
          fontsize: section.title_size.toString(),
          fontweight: section.title_weight,
          fontfamily: section.title_family,
        },
      ],
      blocks: section.blocks.map((block, bIdx) => ({
        index: bIdx,
        visible: block.visible,
        translations: [
          {
            language: 1,
            content: block.content_mn,
            fontcolor: block.color,
            fontsize: block.size.toString(),
            fontweight: block.weight,
            fontfamily: block.family,
          },
          {
            language: 2,
            content: block.content_en,
            fontcolor: block.color,
            fontsize: block.size.toString(),
            fontweight: block.weight,
            fontfamily: block.family,
          },
        ],
      })),
    })),
    media: data.image_url
      ? [{ file: data.image_url, aspect_ratio: data.image_height || 'aspect-video' }]
      : [],
  }
}

/* ═══════════════════════════════════════════════════════════════════
   Үндсэн компонент: IntroTab
   ═══════════════════════════════════════════════════════════════════ */
export default function IntroTab() {
  const [data, setData] = useState<IntroData>(initialData)
  const [expandedYear, setExpandedYear] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [revealedIndexes, setRevealedIndexes] = useState<Set<number>>(new Set())
  const [showPreview, setShowPreview] = useState(true)
  const [showTimelinePreview, setShowTimelinePreview] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<'about' | 'timeline' | null>(null)
  const [previewLang, setPreviewLang] = useState<'mn' | 'en'>('mn')
  const [fetchLoading, setFetchLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const timelineRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  /* ── Өгөгдөл татах (Fetch) ──────────────────────────────────── */
  const fetchAboutPage = useCallback(async () => {
    setFetchLoading(true)
    try {
      // 1. About page жагсаалтаас key='intro' хайна
      const listRes = await axiosInstance.get<APIAboutPage[]>('/about-page/')
      let aboutPage = listRes.data.find(p => p.key === 'intro')

      // 2. Олдоогүй бол шинээр үүсгэнэ
      if (!aboutPage) {
        const createRes = await axiosInstance.post<APIAboutPage>('/about-page/', {
          key: 'intro',
          active: true,
          sections: [],
          media: [],
        })
        aboutPage = createRes.data
      }

      // 3. Дэлгэрэнгүй мэдээллийг ID-ээр нь татна
      const [detailRes, timelineRes] = await Promise.all([
        axiosInstance.get<APIAboutPage>(`/about-page/${aboutPage.id}/`),
        axiosInstance.get(`/timeline/?page=${aboutPage.id}`),
      ])

      const introData = transformAPIToIntroData(detailRes.data)

      // Түүхэн замналыг хөрвүүлнэ
      introData.timeline_events = (timelineRes.data || []).map((ev: any) => {
        const mn = ev.translations?.find((t: any) => t.language === 1 || t.language_code === 'MN')
        const en = ev.translations?.find((t: any) => t.language === 2 || t.language_code === 'EN')
        return {
          id: ev.id,
          year: ev.year || '',
          title_mn: mn?.title || '',
          title_en: en?.title || '',
          short_mn: mn?.short_desc || '',
          short_en: en?.short_desc || '',
          desc_mn: mn?.full_desc || '',
          desc_en: en?.full_desc || '',
          year_color: ev.year_color || '#0d9488',
          title_color: ev.title_color || '#111827',
          short_color: ev.short_color || '#4b5563',
          desc_color: ev.desc_color || '#4b5563',
          visible: ev.visible !== false,
        }
      })

      setData(introData)
    } catch (error) {
      console.error('Өгөгдөл татахад алдаа:', error)
      alert('Мэдээлэл татахад алдаа гарлаа')
    } finally {
      setFetchLoading(false)
    }
  }, [])

  useEffect(() => { fetchAboutPage() }, [fetchAboutPage])

  /* ── Хадгалах (Save) ────────────────────────────────────────── */
  const handleSave = async () => {
    setSaving(true)
    try {
      let pageId = data.pageId

      // Хэрэв page үүсээгүй бол POST-оор үүсгэнэ
      if (!pageId) {
        const createRes = await axiosInstance.post<APIAboutPage>('/about-page/', {
          key: 'intro',
          active: true,
          sections: [],
          media: [],
        })
        pageId = createRes.data.id
        setData(prev => ({ ...prev, pageId }))
      }

      // About page-ийн хэсгүүдийг хадгална
      const apiPayload = transformIntroDataToAPI(data)
      await axiosInstance.put(`/about-page/${pageId}/`, apiPayload)

      // Түүхэн замналыг хадгална - хуучныг устгаад дахин үүсгэнэ
      const existingTimeline = await axiosInstance.get(`/timeline/?page=${pageId}`)
      await Promise.all(
        (existingTimeline.data || []).map((ev: any) =>
          axiosInstance.delete(`/timeline/${ev.id}/`)
        )
      )

      // Шинэ үйл явдлуудыг үүсгэнэ
      for (let i = 0; i < data.timeline_events.length; i++) {
        const ev = data.timeline_events[i]
        await axiosInstance.post('/timeline/', {
          page: pageId,
          year: ev.year,
          sort_order: i,
          visible: ev.visible,
          year_color: ev.year_color,
          title_color: ev.title_color,
          short_color: ev.short_color,
          desc_color: ev.desc_color,
          translations: [
            { language: 1, title: ev.title_mn, short_desc: ev.short_mn, full_desc: ev.desc_mn },
            { language: 2, title: ev.title_en, short_desc: ev.short_en, full_desc: ev.desc_en },
          ],
        })
      }

      alert('Амжилттай хадгалагдлаа!')
    } catch (error: any) {
      console.error('Хадгалахад алдаа:', error)
      const detail = error?.response?.data?.detail || error?.response?.data?.message || ''
      alert(`Хадгалахад алдаа гарлаа${detail ? ': ' + detail : ''}`)
    } finally {
      setSaving(false)
    }
  }

  /* ── Хэсэг/блок удирдах (Section/Block management) ──────────── */

  // Хэсэг нэмэх
  const addSection = () => {
    setData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection()],
    }))
  }

  // Хэсэг устгах
  const removeSection = (sIdx: number) => {
    if (!confirm('Энэ хэсгийг устгах уу?')) return
    setData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== sIdx),
    }))
  }

  // Хэсгийн талбар солих
  const updateSection = (sIdx: number, field: string, value: any) => {
    setData(prev => {
      const sections = [...prev.sections]
      sections[sIdx] = { ...sections[sIdx], [field]: value }
      return { ...prev, sections }
    })
  }

  // Хэсгийн фонт талбар солих
  const updateSectionFont = (sIdx: number, field: string, value: string | number) => {
    const key = `title_${field}` as keyof DynamicSection
    updateSection(sIdx, key, value)
  }

  // Блок нэмэх
  const addBlock = (sIdx: number) => {
    setData(prev => {
      const sections = [...prev.sections]
      sections[sIdx] = {
        ...sections[sIdx],
        blocks: [...sections[sIdx].blocks, newBlock()],
      }
      return { ...prev, sections }
    })
  }

  // Блок устгах
  const removeBlock = (sIdx: number, bIdx: number) => {
    if (!confirm('Энэ параграфыг устгах уу?')) return
    setData(prev => {
      const sections = [...prev.sections]
      sections[sIdx] = {
        ...sections[sIdx],
        blocks: sections[sIdx].blocks.filter((_, i) => i !== bIdx),
      }
      return { ...prev, sections }
    })
  }

  // Блокийн талбар солих
  const updateBlock = (sIdx: number, bIdx: number, field: string, value: any) => {
    setData(prev => {
      const sections = [...prev.sections]
      const blocks = [...sections[sIdx].blocks]
      blocks[bIdx] = { ...blocks[bIdx], [field]: value }
      sections[sIdx] = { ...sections[sIdx], blocks }
      return { ...prev, sections }
    })
  }

  /* ── Он солих (Timeline toggle) ─────────────────────────────── */
  const toggleYear = (index: number) => {
    setExpandedYear(expandedYear === index ? null : index)
  }

  /* ── Модал нээх/хаах ─────────────────────────────────────────── */
  const handleOpenEditModal = (section: 'about' | 'timeline') => {
    setEditingSection(section)
    setEditModalOpen(true)
  }
  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setEditingSection(null)
  }

  /* ── Timeline IntersectionObserver ───────────────────────────── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const newlyVisible: number[] = []
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'))
            newlyVisible.push(index)
          }
        })
        if (newlyVisible.length) {
          setActiveIndex(newlyVisible[newlyVisible.length - 1])
          setRevealedIndexes(prev => {
            const next = new Set(prev)
            newlyVisible.forEach(i => next.add(i))
            return next
          })
        }
      },
      { rootMargin: '-30% 0px -30% 0px', threshold: 0.1 }
    )
    itemRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [data.timeline_events])

  /* ── Ачааллаж байна ──────────────────────────────────────────── */
  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Мэдээлэл татаж байна...</p>
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════════
     JSX - Бидний тухай хэсэг
     ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="grid md:grid-cols-1 gap-6">
      {/* ──────────────────────────────────────────────────────────
          1. Бидний тухай хэсэг
          ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="sticky top-0 bg-slate-50 border-b border-slate-200 px-6 py-3 z-10 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Бидний тухай</h3>
          <div className="flex items-center gap-3">
            {/* Хэл солих */}
            <div className="flex bg-slate-200/80 p-1 rounded-lg">
              <button onClick={() => setPreviewLang('mn')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${previewLang === 'mn' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                MN
              </button>
              <button onClick={() => setPreviewLang('en')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${previewLang === 'en' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                EN
              </button>
            </div>
            <button onClick={() => handleOpenEditModal('about')}
              className="px-3 py-1.5 text-sm font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-md transition-colors"
              title="Засах">
              Засах
            </button>
            <button onClick={() => setShowPreview(!showPreview)}
              className="p-1 hover:bg-slate-200 rounded transition-colors"
              title={showPreview ? 'Нуух' : 'Харуулах'}>
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {showPreview ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803M3 3l18 18" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Урьдчилсан харагдац (Preview) */}
        {showPreview && (
          <div className="overflow-y-auto max-h-[75vh] p-6">
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
              {data.sections.map((section, sIdx) => (
                <div key={sIdx} className={`grid grid-cols-1 ${sIdx === 0 ? 'md:grid-cols-2' : ''} gap-8 items-center border-t border-slate-200 pt-6 first:border-t-0 first:pt-0`}>
                  {/* Эхний хэсэгт зураг харуулна */}
                  {sIdx === 0 && data.image_url && (
                    <div className="order-2 md:order-1">
                      <div className={`relative w-full ${data.image_height || 'aspect-video'} rounded-2xl overflow-hidden shadow-lg`}>
                        <img src={data.image_url} alt="Бидний тухай" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                  <div className={`space-y-4 ${sIdx === 0 && data.image_url ? 'order-1 md:order-2' : ''}`}>
                    {/* Хэсгийн шошго */}
                    <div className="inline-block bg-teal-50 text-teal-700 px-4 py-1.5 rounded-full text-xs font-medium">
                      {section.label}
                    </div>
                    {/* Гарчиг */}
                    {section.visible && (section.title_mn || section.title_en) && (
                      <h2 className="leading-tight" style={{
                        color: section.title_color,
                        fontSize: `${section.title_size}px`,
                        fontWeight: section.title_weight,
                        fontFamily: section.title_family,
                      }}>
                        {previewLang === 'mn' ? section.title_mn : section.title_en}
                      </h2>
                    )}
                    {/* Параграфууд */}
                    <div className="space-y-3 leading-relaxed text-justify">
                      {section.blocks.map((block, bIdx) =>
                        block.visible && (block.content_mn || block.content_en) ? (
                          <p key={bIdx} style={{
                            color: block.color,
                            fontSize: `${block.size}px`,
                            fontWeight: block.weight,
                            fontFamily: block.family,
                          }}>
                            {previewLang === 'mn' ? block.content_mn : block.content_en}
                          </p>
                        ) : null
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────
          2. Түүхэн замнал хэсэг (Timeline)
          ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="sticky top-0 bg-slate-50 border-b border-slate-200 px-6 py-3 z-10 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Түүхэн замнал ({data.timeline_events.length} үйл явдал)
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-200/80 p-1 rounded-lg">
              <button onClick={() => setPreviewLang('mn')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${previewLang === 'mn' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                MN
              </button>
              <button onClick={() => setPreviewLang('en')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${previewLang === 'en' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                EN
              </button>
            </div>
            <button onClick={() => handleOpenEditModal('timeline')}
              className="px-3 py-1.5 text-sm font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-md transition-colors">
              Засах
            </button>
            <button onClick={() => setShowTimelinePreview(!showTimelinePreview)}
              className="p-1 hover:bg-slate-200 rounded transition-colors"
              title={showTimelinePreview ? 'Нуух' : 'Харуулах'}>
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {showTimelinePreview ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803M3 3l18 18" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {showTimelinePreview && data.timeline_events.length > 0 && (
          <div className="overflow-y-auto max-h-[75vh] p-6">
            <div ref={timelineRef} className="py-12 relative overflow-hidden">
              <h3 className="text-3xl font-bold text-center mb-16 text-slate-900">
                Түүхэн замнал
              </h3>
              
              {/* Голын шугам */}
              <div className="absolute left-[27px] md:left-1/2 top-32 bottom-12 w-0.5 bg-teal-200 transform md:-translate-x-1/2"></div>

              <div className="space-y-12">
                  {data.timeline_events.filter(e => e.visible).map((event, index) => {
                    const isExpanded = expandedYear === index
                    const isEven = index % 2 === 0

                    {/* Контент карт */}
                    const ContentCard = (
                      <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all group relative z-10">
                        <div className="md:hidden flex items-center gap-3 mb-4">
                          <span className="text-2xl font-bold" style={{ color: event.year_color }}>{event.year}</span>
                          <div className="h-px bg-teal-100 flex-1"></div>
                        </div>

                        <h4 className="text-lg font-bold mb-2 group-hover:text-teal-600 transition-colors" style={{ color: event.title_color }}>{previewLang === 'mn' ? event.title_mn : event.title_en}</h4>
                        <p className="text-sm leading-relaxed" style={{ color: event.short_color }}>
                          {previewLang === 'mn' ? event.short_mn : event.short_en}
                        </p>
                        
                        <div className={clsx(
                          "grid transition-all duration-300 ease-in-out",
                          isExpanded ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"
                        )}>
                          <div className="overflow-hidden min-h-0">
                            <div className="pt-4 border-t border-gray-100 text-sm leading-relaxed text-justify" style={{ color: event.desc_color }}>
                              {previewLang === 'mn' ? event.desc_mn : event.desc_en}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleYear(index)}
                          className="flex items-center gap-2 text-sm font-medium text-teal-600 mt-4 hover:bg-teal-50 px-3 py-1.5 rounded-lg -ml-3 w-fit transition-colors"
                        >
                          {isExpanded ? 'Хураангуйлах' : 'Дэлгэрэнгүй'}
                          <svg 
                            className={clsx("w-4 h-4 transition-transform duration-300", isExpanded ? "rotate-180" : "")} 
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    )

                    return (
                      <div
                        key={index}
                        ref={(el) => { if (el) itemRefs.current[index] = el; }}
                        data-index={index}
                        className="relative flex flex-col md:flex-row items-center md:items-start group"
                      >
                        {/* Голын цэг */}
                        <div className="absolute left-[18px] md:left-1/2 w-5 h-5 rounded-full border-4 border-white bg-teal-600 shadow-sm z-20 top-0 md:top-8 transform md:-translate-x-1/2"></div>
                        
                        {/* Зүүн тал (Desktop) */}
                        <div className={clsx(
                          "w-full md:w-1/2 pl-16 md:pl-0 md:pr-12 md:text-right flex md:block",
                          isEven ? "" : "md:flex md:justify-end" 
                        )}>
                          {/* Гар утас: Карт үргэлж харуулна */}
                          <div className="md:hidden w-full">
                            {ContentCard}
                          </div>

                          {/* Desktop: Тэгш бол Карт, сондгой бол Он */}
                          <div className="hidden md:block w-full">
                            {isEven ? ContentCard : (
                              <span className="text-5xl font-bold sticky top-32 transition-colors duration-300" style={{ color: event.year_color, opacity: activeIndex === index ? 1 : 0.5 }}>
                                {event.year}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Баруун тал (Desktop) */}
                        <div className="hidden md:block w-full md:w-1/2 md:pl-12 text-left">
                          {/* Desktop: Тэгш бол Он, сондгой бол Карт */}
                          {isEven ? (
                            <span className="text-5xl font-bold sticky top-32 transition-colors duration-300" style={{ color: event.year_color, opacity: activeIndex === index ? 1 : 0.5 }}>
                              {event.year}
                            </span>
                          ) : ContentCard}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
      </div>

      {/* ──────────────────────────────────────────────────────────
          Засах модал (Edit Modal)
          ────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        title={editingSection === 'about' ? 'Бидний тухай хэсгийг засах' : 'Түүхэн замналыг засах'}
        size="xl"
      >
        {/* ═══ Бидний тухай засах модал ═══ */}
        {editingSection === 'about' && (
          <div className="space-y-5 pb-4 max-h-[80vh] overflow-y-auto">
            {/* Зураг оруулах хэсэг */}
            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50/20">
              <h4 className="text-base font-semibold text-gray-900 mb-2">Зураг</h4>
              <p className="text-xs text-gray-500 mb-4">Эхний хэсгийн зүүн талд харагдах зураг</p>
              <ImageUpload
                value={data.image_url}
                onChange={(url: string) => setData(prev => ({ ...prev, image_url: url }))}
                label="Зургийг оруулах"
              />
              <div className="mt-3 bg-purple-100/40 rounded-lg p-3 border border-purple-200">
                <label className="block text-sm font-medium text-gray-800 mb-2">Зургийн хэмжээ/харьцаа</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { value: 'aspect-square', label: '1:1 (Дөрвөлжин)' },
                    { value: 'aspect-video', label: '16:9 (Видео)' },
                    { value: 'aspect-[3/2]', label: '3:2' },
                    { value: 'aspect-[4/3]', label: '4:3' },
                  ].map((option) => (
                    <button key={option.value}
                      onClick={() => setData(prev => ({ ...prev, image_height: option.value }))}
                      className={clsx(
                        'px-3 py-2 text-xs font-medium rounded-md transition-colors border',
                        data.image_height === option.value
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      )}>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── Хэсэг бүрийг динамикаар харуулах ─── */}
            {data.sections.map((section, sIdx) => (
              <div key={sIdx} className="border border-slate-200 rounded-lg overflow-hidden">
                {/* Хэсгийн толгой */}
                <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-200">
                  <h4 className="text-base font-semibold text-gray-900">
                    Хэсэг {sIdx + 1}: {section.label || section.title_mn || 'Нэргүй'}
                  </h4>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateSection(sIdx, 'visible', !section.visible)}
                      className={clsx(
                        'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                        section.visible ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                      )}>
                      {section.visible ? 'Харагдана' : 'Нуугдсан'}
                    </button>
                    {data.sections.length > 1 && (
                      <button onClick={() => removeSection(sIdx)}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors" title="Хэсэг устгах">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* Хэсгийн нэр (label) */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Хэсгийн нэр (шошго)</label>
                    <input type="text" value={section.label}
                      onChange={(e) => updateSection(sIdx, 'label', e.target.value)}
                      placeholder="Жнь: Бидний түүх"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>

                  {/* Гарчиг (MN / EN) */}
                  <div className="border border-teal-200 rounded-lg p-4 bg-teal-50/20">
                    <h5 className="text-sm font-semibold text-gray-900 mb-3">Гарчиг</h5>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-800 mb-1">Монгол</label>
                        <input type="text" value={section.title_mn}
                          onChange={(e) => updateSection(sIdx, 'title_mn', e.target.value)}
                          placeholder="Гарчиг (MN)"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-800 mb-1">English</label>
                        <input type="text" value={section.title_en}
                          onChange={(e) => updateSection(sIdx, 'title_en', e.target.value)}
                          placeholder="Title (EN)"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <FontControls
                        color={section.title_color} size={section.title_size}
                        weight={section.title_weight} family={section.title_family}
                        onChange={(field, value) => updateSectionFont(sIdx, field, value)}
                        bgClass="bg-teal-100/40 border-teal-200"
                      />
                    </div>
                  </div>

                  {/* Параграфууд (Блокууд) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-semibold text-gray-900">
                        Агуулга ({section.blocks.length} параграф)
                      </h5>
                      <button onClick={() => addBlock(sIdx)}
                        className="px-3 py-1.5 text-xs font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-md transition-colors flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Параграф нэмэх
                      </button>
                    </div>

                    {section.blocks.map((block, bIdx) => (
                      <div key={bIdx} className="border border-blue-200 rounded-lg p-4 bg-blue-50/20">
                        <div className="flex items-center justify-between mb-3">
                          <h6 className="text-sm font-medium text-gray-900">Параграф {bIdx + 1}</h6>
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateBlock(sIdx, bIdx, 'visible', !block.visible)}
                              className={clsx(
                                'px-2 py-1 rounded-md text-xs font-medium transition-colors',
                                block.visible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              )}>
                              {block.visible ? 'Харагдана' : 'Нуугдсан'}
                            </button>
                            {section.blocks.length > 1 && (
                              <button onClick={() => removeBlock(sIdx, bIdx)}
                                className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors" title="Параграф устгах">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-800 mb-1">Агуулга (Монгол)</label>
                            <textarea value={block.content_mn}
                              onChange={(e) => updateBlock(sIdx, bIdx, 'content_mn', e.target.value)}
                              placeholder="Монгол текст..." rows={3}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-800 mb-1">Content (English)</label>
                            <textarea value={block.content_en}
                              onChange={(e) => updateBlock(sIdx, bIdx, 'content_en', e.target.value)}
                              placeholder="English text..." rows={3}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                          </div>
                        </div>
                        <FontControls
                          color={block.color} size={block.size}
                          weight={block.weight} family={block.family}
                          onChange={(field, value) => updateBlock(sIdx, bIdx, field, value)}
                          bgClass="bg-blue-100/40 border-blue-200"
                          maxSize={24}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Шинэ хэсэг нэмэх товч */}
            <button onClick={addSection}
              className="w-full py-3 text-sm font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg border-2 border-dashed border-teal-300 transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Шинэ хэсэг нэмэх
            </button>

            {/* Хадгалах / Болих товчнууд */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
              <button type="button" onClick={handleCloseEditModal}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                Болих
              </button>
              <button type="button" disabled={saving}
                onClick={() => { handleSave(); handleCloseEditModal() }}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg transition-colors">
                {saving ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>
          </div>
        )}

        {/* ═══ Түүхэн замнал засах модал ═══ */}
        {editingSection === 'timeline' && (
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Түүхэн замнал ({data.timeline_events.length} үйл явдал)
              </h3>
              <button type="button"
                onClick={() => {
                  setData(prev => ({
                    ...prev,
                    timeline_events: [...prev.timeline_events, {
                      year: new Date().getFullYear().toString(),
                      year_color: '#0d9488',
                      title_mn: 'Шинэ үйл явдал',
                      title_en: 'New Event',
                      title_color: '#111827',
                      short_mn: 'Товч тайлбар',
                      short_en: 'Short description',
                      short_color: '#4b5563',
                      desc_mn: 'Дэлгэрэнгүй тайлбар',
                      desc_en: 'Detailed description',
                      desc_color: '#4b5563',
                      visible: true,
                    }],
                  }))
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Үйл явдал нэмэх
              </button>
            </div>

            <div className="space-y-4">
              {data.timeline_events.map((event, index) => (
                <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-teal-600">{index + 1}.</span>
                      <button
                        onClick={() => {
                          const updated = [...data.timeline_events]
                          updated[index] = { ...updated[index], visible: !updated[index].visible }
                          setData(prev => ({ ...prev, timeline_events: updated }))
                        }}
                        className={clsx(
                          'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                          event.visible ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                        )}>
                        {event.visible ? 'Харагдана' : 'Нуугдсан'}
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Энэ үйл явдлыг устгах уу?')) {
                          setData(prev => ({ ...prev, timeline_events: prev.timeline_events.filter((_, i) => i !== index) }))
                        }
                      }}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Устгах">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Он ба оны өнгө */}
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Он</label>
                        <input type="text" value={event.year}
                          onChange={(e) => {
                            const updated = [...data.timeline_events]
                            updated[index] = { ...updated[index], year: e.target.value }
                            setData(prev => ({ ...prev, timeline_events: updated }))
                          }}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="2024" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Оны өнгө</label>
                        <input type="color" value={event.year_color || '#0d9488'}
                          onChange={(e) => {
                            const updated = [...data.timeline_events]
                            updated[index] = { ...updated[index], year_color: e.target.value }
                            setData(prev => ({ ...prev, timeline_events: updated }))
                          }}
                          className="w-full h-10 rounded-lg border border-slate-300 cursor-pointer" />
                      </div>
                    </div>

                    {/* Гарчиг */}
                    <div className="border border-blue-200 bg-blue-50/30 rounded-lg p-3">
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Гарчиг</label>
                      <div className="grid gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Монгол</label>
                          <input type="text" value={event.title_mn || ''}
                            onChange={(e) => {
                              const updated = [...data.timeline_events]
                              updated[index] = { ...updated[index], title_mn: e.target.value }
                              setData(prev => ({ ...prev, timeline_events: updated }))
                            }}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Үйл явдлын нэр" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">English</label>
                          <input type="text" value={event.title_en || ''}
                            onChange={(e) => {
                              const updated = [...data.timeline_events]
                              updated[index] = { ...updated[index], title_en: e.target.value }
                              setData(prev => ({ ...prev, timeline_events: updated }))
                            }}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Event name" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Гарчгийн өнгө</label>
                          <input type="color" value={event.title_color || '#111827'}
                            onChange={(e) => {
                              const updated = [...data.timeline_events]
                              updated[index] = { ...updated[index], title_color: e.target.value }
                              setData(prev => ({ ...prev, timeline_events: updated }))
                            }}
                            className="w-full h-10 rounded-lg border border-slate-300 cursor-pointer" />
                        </div>
                      </div>
                    </div>

                    {/* Товч тайлбар */}
                    <div className="border border-green-200 bg-green-50/30 rounded-lg p-3">
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Товч тайлбар</label>
                      <div className="grid gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Монгол</label>
                          <textarea value={event.short_mn || ''} rows={2}
                            onChange={(e) => {
                              const updated = [...data.timeline_events]
                              updated[index] = { ...updated[index], short_mn: e.target.value }
                              setData(prev => ({ ...prev, timeline_events: updated }))
                            }}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Товч тайлбар" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">English</label>
                          <textarea value={event.short_en || ''} rows={2}
                            onChange={(e) => {
                              const updated = [...data.timeline_events]
                              updated[index] = { ...updated[index], short_en: e.target.value }
                              setData(prev => ({ ...prev, timeline_events: updated }))
                            }}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Short description" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Товч тайлбарын өнгө</label>
                          <input type="color" value={event.short_color || '#4b5563'}
                            onChange={(e) => {
                              const updated = [...data.timeline_events]
                              updated[index] = { ...updated[index], short_color: e.target.value }
                              setData(prev => ({ ...prev, timeline_events: updated }))
                            }}
                            className="w-full h-10 rounded-lg border border-slate-300 cursor-pointer" />
                        </div>
                      </div>
                    </div>

                    {/* Дэлгэрэнгүй тайлбар */}
                    <div className="border border-purple-200 bg-purple-50/30 rounded-lg p-3">
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Дэлгэрэнгүй тайлбар</label>
                      <div className="grid gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Монгол</label>
                          <textarea value={event.desc_mn || ''} rows={4}
                            onChange={(e) => {
                              const updated = [...data.timeline_events]
                              updated[index] = { ...updated[index], desc_mn: e.target.value }
                              setData(prev => ({ ...prev, timeline_events: updated }))
                            }}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Дэлгэрэнгүй тайлбар" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">English</label>
                          <textarea value={event.desc_en || ''} rows={4}
                            onChange={(e) => {
                              const updated = [...data.timeline_events]
                              updated[index] = { ...updated[index], desc_en: e.target.value }
                              setData(prev => ({ ...prev, timeline_events: updated }))
                            }}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Detailed description" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Дэлгэрэнгүй тайлбарын өнгө</label>
                          <input type="color" value={event.desc_color || '#4b5563'}
                            onChange={(e) => {
                              const updated = [...data.timeline_events]
                              updated[index] = { ...updated[index], desc_color: e.target.value }
                              setData(prev => ({ ...prev, timeline_events: updated }))
                            }}
                            className="w-full h-10 rounded-lg border border-slate-300 cursor-pointer" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Хадгалах / Хаах */}
            <div className="mt-6 flex gap-3 sticky bottom-0 bg-white pt-4 border-t border-slate-200">
              <button type="button" onClick={handleCloseEditModal}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                Хаах
              </button>
              <button type="button" disabled={saving}
                onClick={() => { handleSave(); handleCloseEditModal() }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg transition-colors">
                {saving ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
