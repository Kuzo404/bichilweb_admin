'use client'
import { useEffect, useRef, useState } from 'react'
import ImageUpload from '@/components/ImageUpload'
import Modal from '@/components/Modal'
import clsx from 'clsx'
import { axiosInstance } from '@/lib/axios'

// Backend API Response Types
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
  // Add other media fields as needed
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

// Frontend TabContent Type
interface TabContent {
  title_mn: string
  title_en: string
  content_mn: string
  content_en: string
  image_url?: string
  image_height?: string
  // Origin Story
  origin_title_mn: string
  origin_title_en: string
  origin_p1_mn: string
  origin_p1_en: string
  origin_p2_mn: string
  origin_p2_en: string
  origin_p3_mn: string
  origin_p3_en: string
  // What We Do
  whatWeDo_title_mn: string
  whatWeDo_title_en: string
  whatWeDo_content_mn: string
  whatWeDo_content_en: string
  // SME Section
  sme_title_mn: string
  sme_title_en: string
  sme_p1_mn: string
  sme_p1_en: string
  sme_p2_mn: string
  sme_p2_en: string
  // Citizen Section
  citizen_title_mn: string
  citizen_title_en: string
  citizen_p1_mn: string
  citizen_p1_en: string
  citizen_p2_mn: string
  citizen_p2_en: string
  // Font Styling - 12 хэсэг
  origin_title_color: string
  origin_title_size: number
  origin_title_weight: string
  origin_title_family: string
  origin_p1_color: string
  origin_p1_size: number
  origin_p1_weight: string
  origin_p1_family: string
  origin_p2_color: string
  origin_p2_size: number
  origin_p2_weight: string
  origin_p2_family: string
  origin_p3_color: string
  origin_p3_size: number
  origin_p3_weight: string
  origin_p3_family: string
  whatWeDo_title_color: string
  whatWeDo_title_size: number
  whatWeDo_title_weight: string
  whatWeDo_title_family: string
  whatWeDo_content_color: string
  whatWeDo_content_size: number
  whatWeDo_content_weight: string
  whatWeDo_content_family: string
  sme_title_color: string
  sme_title_size: number
  sme_title_weight: string
  sme_title_family: string
  sme_p1_color: string
  sme_p1_size: number
  sme_p1_weight: string
  sme_p1_family: string
  sme_p2_color: string
  sme_p2_size: number
  sme_p2_weight: string
  sme_p2_family: string
  citizen_title_color: string
  citizen_title_size: number
  citizen_title_weight: string
  citizen_title_family: string
  citizen_p1_color: string
  citizen_p1_size: number
  citizen_p1_weight: string
  citizen_p1_family: string
  citizen_p2_color: string
  citizen_p2_size: number
  citizen_p2_weight: string
  citizen_p2_family: string
  // Visibility toggles
  origin_title_visible: boolean
  origin_p1_visible: boolean
  origin_p2_visible: boolean
  origin_p3_visible: boolean
  whatWeDo_title_visible: boolean
  whatWeDo_content_visible: boolean
  sme_title_visible: boolean
  sme_p1_visible: boolean
  sme_p2_visible: boolean
  citizen_title_visible: boolean
  citizen_p1_visible: boolean
  citizen_p2_visible: boolean
  // Timeline Events
  timeline_events: TimelineEvent[]
}

// IntroTab is self-contained — fetches + saves to /about-page/3/ API

// Helper functions
const getTranslation = (translations: APITranslation[], langCode: string, field: 'title' | 'content'): string => {
  const trans = translations.find(t => t.language_code === langCode)
  return trans?.[field] || ''
}

const getColor = (translations: APITranslation[], langCode: string): string => {
  const trans = translations.find(t => t.language_code === langCode)
  return trans?.color || trans?.fontcolor || '#000000'
}

const getFontSize = (translations: APITranslation[], langCode: string): number => {
  const trans = translations.find(t => t.language_code === langCode)
  return parseInt(trans?.fontsize || '14')
}

const getFontWeight = (translations: APITranslation[], langCode: string): string => {
  const trans = translations.find(t => t.language_code === langCode)
  return trans?.fontweight || '400'
}

const getFontFamily = (translations: APITranslation[], langCode: string): string => {
  const trans = translations.find(t => t.language_code === langCode)
  return trans?.fontfamily || 'inherit'
}

// Reusable IntersectionObserver hook
function useInViewAnimation() {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.35, rootMargin: '0px 0px -80px 0px' }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

const initialFormData: TabContent = {
  title_mn: 'Бидний тухай',
  title_en: 'About Us',
  content_mn: '',
  content_en: '',
  image_url: '',
  image_height: 'aspect-video',
  origin_title_mn: '',
  origin_title_en: '',
  origin_p1_mn: '',
  origin_p1_en: '',
  origin_p2_mn: '',
  origin_p2_en: '',
  origin_p3_mn: '',
  origin_p3_en: '',
  whatWeDo_title_mn: '',
  whatWeDo_title_en: '',
  whatWeDo_content_mn: '',
  whatWeDo_content_en: '',
  sme_title_mn: '',
  sme_title_en: '',
  sme_p1_mn: '',
  sme_p1_en: '',
  sme_p2_mn: '',
  sme_p2_en: '',
  citizen_title_mn: '',
  citizen_title_en: '',
  citizen_p1_mn: '',
  citizen_p1_en: '',
  citizen_p2_mn: '',
  citizen_p2_en: '',
  origin_title_color: '#0f172a',
  origin_title_size: 24,
  origin_title_weight: '700',
  origin_title_family: 'inherit',
  origin_p1_color: '#475569',
  origin_p1_size: 14,
  origin_p1_weight: '400',
  origin_p1_family: 'inherit',
  origin_p2_color: '#475569',
  origin_p2_size: 14,
  origin_p2_weight: '400',
  origin_p2_family: 'inherit',
  origin_p3_color: '#0f172a',
  origin_p3_size: 14,
  origin_p3_weight: '600',
  origin_p3_family: 'inherit',
  whatWeDo_title_color: '#0f172a',
  whatWeDo_title_size: 18,
  whatWeDo_title_weight: '700',
  whatWeDo_title_family: 'inherit',
  whatWeDo_content_color: '#475569',
  whatWeDo_content_size: 14,
  whatWeDo_content_weight: '400',
  whatWeDo_content_family: 'inherit',
  sme_title_color: '#0f172a',
  sme_title_size: 18,
  sme_title_weight: '700',
  sme_title_family: 'inherit',
  sme_p1_color: '#475569',
  sme_p1_size: 14,
  sme_p1_weight: '400',
  sme_p1_family: 'inherit',
  sme_p2_color: '#475569',
  sme_p2_size: 14,
  sme_p2_weight: '400',
  sme_p2_family: 'inherit',
  citizen_title_color: '#0f172a',
  citizen_title_size: 18,
  citizen_title_weight: '700',
  citizen_title_family: 'inherit',
  citizen_p1_color: '#475569',
  citizen_p1_size: 14,
  citizen_p1_weight: '400',
  citizen_p1_family: 'inherit',
  citizen_p2_color: '#475569',
  citizen_p2_size: 14,
  citizen_p2_weight: '400',
  citizen_p2_family: 'inherit',
  origin_title_visible: true,
  origin_p1_visible: true,
  origin_p2_visible: true,
  origin_p3_visible: true,
  whatWeDo_title_visible: true,
  whatWeDo_content_visible: true,
  sme_title_visible: true,
  sme_p1_visible: true,
  sme_p2_visible: true,
  citizen_title_visible: true,
  citizen_p1_visible: true,
  citizen_p2_visible: true,
  timeline_events: []
}

export default function IntroTab() {
  const [intro, setIntro] = useState<TabContent>(initialFormData)
  const [expandedYear, setExpandedYear] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [revealedIndexes, setRevealedIndexes] = useState<Set<number>>(new Set())
  const [revealedSections, setRevealedSections] = useState<Set<string>>(new Set())
  const [showPreview, setShowPreview] = useState(true)
  const [showTimelinePreview, setShowTimelinePreview] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<'demo' | 'timeline' | null>(null)
  const [previewLang, setPreviewLang] = useState<'mn' | 'en'>('mn')
  const [fetchLoading, setFetchLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const whatWeDo = useInViewAnimation()
  const timelineRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  // Fetch data from API
  useEffect(() => {
    fetchAboutPage()
  }, [])

  const fetchAboutPage = async () => {
    setFetchLoading(true)
    try {
      const [aboutRes, timelineRes] = await Promise.all([
        axiosInstance.get<APIAboutPage>('/about-page/3/'),
        axiosInstance.get('/timeline/?page=3'),
      ])
      console.log('About page data:', aboutRes.data)
      console.log('Timeline data:', timelineRes.data)
      
      if (aboutRes.data && aboutRes.data.sections) {
        const transformedData = transformAPIToTabContent(aboutRes.data)

        // Map timeline API data to TimelineEvent[]
        const timelineEvents: TimelineEvent[] = (timelineRes.data || []).map((ev: any) => {
          const mn = ev.translations?.find((t: any) => t.language === 2 || t.language_code === 'MN')
          const en = ev.translations?.find((t: any) => t.language === 1 || t.language_code === 'EN')
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
        transformedData.timeline_events = timelineEvents
        setIntro(transformedData)
      }
    } catch (error) {
      console.error('Failed to fetch about page:', error)
      alert('Мэдээлэл татахад алдаа гарлаа')
    } finally {
      setFetchLoading(false)
    }
  }

  const transformAPIToTabContent = (apiData: APIAboutPage): TabContent => {
  const sections = apiData.sections || []
  const result: TabContent = { ...initialFormData }

  sections.forEach((section) => {
    const sectionIndex = section.index
    
    // Helper to get translation by language code
    const getTransByLang = (translations: APITranslation[], lang: string, field: 'title' | 'content') => {
      const trans = translations.find(t => t.language_code === lang)
      return trans?.[field] || ''
    }

    const getStyleByLang = (translations: APITranslation[], lang: string) => {
      const trans = translations.find(t => t.language_code === lang)
      return {
        color: trans?.color || trans?.fontcolor || '#000000',
        size: parseInt(trans?.fontsize || '14'),
        weight: trans?.fontweight || '400',
        family: trans?.fontfamily || 'inherit'
      }
    }

    // Section 0: Origin Story (Бидний түүх)
    if (sectionIndex === 0) {
      result.origin_title_mn = getTransByLang(section.translations, 'MN', 'title')
      result.origin_title_en = getTransByLang(section.translations, 'EN', 'title')
      result.origin_title_visible = section.visible
      
      const titleStyle = getStyleByLang(section.translations, 'MN')
      result.origin_title_color = titleStyle.color
      result.origin_title_size = titleStyle.size
      result.origin_title_weight = titleStyle.weight
      result.origin_title_family = titleStyle.family

      // Blocks (paragraphs)
      section.blocks.forEach((block, blockIdx) => {
        const content_mn = getTransByLang(block.translations, 'MN', 'content')
        const content_en = getTransByLang(block.translations, 'EN', 'content')
        const style = getStyleByLang(block.translations, 'MN')

        if (blockIdx === 0) {
          // Paragraph 1
          result.origin_p1_mn = content_mn
          result.origin_p1_en = content_en
          result.origin_p1_color = style.color
          result.origin_p1_size = style.size
          result.origin_p1_weight = style.weight
          result.origin_p1_family = style.family
          result.origin_p1_visible = block.visible
        } else if (blockIdx === 1) {
          // Paragraph 2
          result.origin_p2_mn = content_mn
          result.origin_p2_en = content_en
          result.origin_p2_color = style.color
          result.origin_p2_size = style.size
          result.origin_p2_weight = style.weight
          result.origin_p2_family = style.family
          result.origin_p2_visible = block.visible
        } else if (blockIdx === 2) {
          // Paragraph 3
          result.origin_p3_mn = content_mn
          result.origin_p3_en = content_en
          result.origin_p3_color = style.color
          result.origin_p3_size = style.size
          result.origin_p3_weight = style.weight
          result.origin_p3_family = style.family
          result.origin_p3_visible = block.visible
        }
      })
    }
    
    // Section 1: What We Do (Юу хийдэг вэ?)
    else if (sectionIndex === 1) {
      result.whatWeDo_title_mn = getTransByLang(section.translations, 'MN', 'title')
      result.whatWeDo_title_en = getTransByLang(section.translations, 'EN', 'title')
      result.whatWeDo_title_visible = section.visible
      
      const titleStyle = getStyleByLang(section.translations, 'MN')
      result.whatWeDo_title_color = titleStyle.color
      result.whatWeDo_title_size = titleStyle.size
      result.whatWeDo_title_weight = titleStyle.weight
      result.whatWeDo_title_family = titleStyle.family

      if (section.blocks[0]) {
        const content_mn = getTransByLang(section.blocks[0].translations, 'MN', 'content')
        const content_en = getTransByLang(section.blocks[0].translations, 'EN', 'content')
        const style = getStyleByLang(section.blocks[0].translations, 'MN')

        result.whatWeDo_content_mn = content_mn
        result.whatWeDo_content_en = content_en
        result.whatWeDo_content_color = style.color
        result.whatWeDo_content_size = style.size
        result.whatWeDo_content_weight = style.weight
        result.whatWeDo_content_family = style.family
        result.whatWeDo_content_visible = section.blocks[0].visible
      }
    }
    
    // Section 2: SME (Жижиг дунд бизнес)
    else if (sectionIndex === 2) {
      result.sme_title_mn = getTransByLang(section.translations, 'MN', 'title')
      result.sme_title_en = getTransByLang(section.translations, 'EN', 'title')
      result.sme_title_visible = section.visible
      
      const titleStyle = getStyleByLang(section.translations, 'MN')
      result.sme_title_color = titleStyle.color
      result.sme_title_size = titleStyle.size
      result.sme_title_weight = titleStyle.weight
      result.sme_title_family = titleStyle.family

      section.blocks.forEach((block, blockIdx) => {
        const content_mn = getTransByLang(block.translations, 'MN', 'content')
        const content_en = getTransByLang(block.translations, 'EN', 'content')
        const style = getStyleByLang(block.translations, 'MN')

        if (blockIdx === 0) {
          result.sme_p1_mn = content_mn
          result.sme_p1_en = content_en
          result.sme_p1_color = style.color
          result.sme_p1_size = style.size
          result.sme_p1_weight = style.weight
          result.sme_p1_family = style.family
          result.sme_p1_visible = block.visible
        } else if (blockIdx === 1) {
          result.sme_p2_mn = content_mn
          result.sme_p2_en = content_en
          result.sme_p2_color = style.color
          result.sme_p2_size = style.size
          result.sme_p2_weight = style.weight
          result.sme_p2_family = style.family
          result.sme_p2_visible = block.visible
        }
      })
    }
    
    // Section 3: Citizen (Иргэн баян бол улс баян)
    else if (sectionIndex === 3) {
      result.citizen_title_mn = getTransByLang(section.translations, 'MN', 'title')
      result.citizen_title_en = getTransByLang(section.translations, 'EN', 'title')
      result.citizen_title_visible = section.visible
      
      const titleStyle = getStyleByLang(section.translations, 'MN')
      result.citizen_title_color = titleStyle.color
      result.citizen_title_size = titleStyle.size
      result.citizen_title_weight = titleStyle.weight
      result.citizen_title_family = titleStyle.family

      section.blocks.forEach((block, blockIdx) => {
        const content_mn = getTransByLang(block.translations, 'MN', 'content')
        const content_en = getTransByLang(block.translations, 'EN', 'content')
        const style = getStyleByLang(block.translations, 'MN')

        if (blockIdx === 0) {
          result.citizen_p1_mn = content_mn
          result.citizen_p1_en = content_en
          result.citizen_p1_color = style.color
          result.citizen_p1_size = style.size
          result.citizen_p1_weight = style.weight
          result.citizen_p1_family = style.family
          result.citizen_p1_visible = block.visible
        } else if (blockIdx === 1) {
          result.citizen_p2_mn = content_mn
          result.citizen_p2_en = content_en
          result.citizen_p2_color = style.color
          result.citizen_p2_size = style.size
          result.citizen_p2_weight = style.weight
          result.citizen_p2_family = style.family
          result.citizen_p2_visible = block.visible
        }
      })
    }
  })

  // Handle media/image
  if (apiData.media && apiData.media.length > 0) {
    result.image_url = apiData.media[0].url
  }

  return result
}

  // IntersectionObserver for timeline
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
  }, [intro.timeline_events])

  useEffect(() => {
    if (whatWeDo.visible && !revealedSections.has('whatWeDo')) {
      setRevealedSections(prev => {
        const next = new Set(prev)
        next.add('whatWeDo')
        return next
      })
    }
  }, [whatWeDo.visible, revealedSections])

  const transformTabContentToAPI = (data: TabContent) => ({
    key: 'intro',
    active: true,
    sections: [
      {
        index: 0,
        visible: data.origin_title_visible,
        translations: [
          { language: 2, title: data.origin_title_mn, color: data.origin_title_color, fontsize: data.origin_title_size.toString(), fontweight: data.origin_title_weight, fontfamily: data.origin_title_family },
          { language: 1, title: data.origin_title_en, color: data.origin_title_color, fontsize: data.origin_title_size.toString(), fontweight: data.origin_title_weight, fontfamily: data.origin_title_family },
        ],
        blocks: [
          {
            index: 0, visible: data.origin_p1_visible,
            translations: [
              { language: 2, content: data.origin_p1_mn, fontcolor: data.origin_p1_color, fontsize: data.origin_p1_size.toString(), fontweight: data.origin_p1_weight, fontfamily: data.origin_p1_family },
              { language: 1, content: data.origin_p1_en, fontcolor: data.origin_p1_color, fontsize: data.origin_p1_size.toString(), fontweight: data.origin_p1_weight, fontfamily: data.origin_p1_family },
            ],
          },
          {
            index: 1, visible: data.origin_p2_visible,
            translations: [
              { language: 2, content: data.origin_p2_mn, fontcolor: data.origin_p2_color, fontsize: data.origin_p2_size.toString(), fontweight: data.origin_p2_weight, fontfamily: data.origin_p2_family },
              { language: 1, content: data.origin_p2_en, fontcolor: data.origin_p2_color, fontsize: data.origin_p2_size.toString(), fontweight: data.origin_p2_weight, fontfamily: data.origin_p2_family },
            ],
          },
          {
            index: 2, visible: data.origin_p3_visible,
            translations: [
              { language: 2, content: data.origin_p3_mn, fontcolor: data.origin_p3_color, fontsize: data.origin_p3_size.toString(), fontweight: data.origin_p3_weight, fontfamily: data.origin_p3_family },
              { language: 1, content: data.origin_p3_en, fontcolor: data.origin_p3_color, fontsize: data.origin_p3_size.toString(), fontweight: data.origin_p3_weight, fontfamily: data.origin_p3_family },
            ],
          },
        ],
      },
      {
        index: 1,
        visible: data.whatWeDo_title_visible,
        translations: [
          { language: 2, title: data.whatWeDo_title_mn, color: data.whatWeDo_title_color, fontsize: data.whatWeDo_title_size.toString(), fontweight: data.whatWeDo_title_weight, fontfamily: data.whatWeDo_title_family },
          { language: 1, title: data.whatWeDo_title_en, color: data.whatWeDo_title_color, fontsize: data.whatWeDo_title_size.toString(), fontweight: data.whatWeDo_title_weight, fontfamily: data.whatWeDo_title_family },
        ],
        blocks: [
          {
            index: 0, visible: data.whatWeDo_content_visible,
            translations: [
              { language: 2, content: data.whatWeDo_content_mn, fontcolor: data.whatWeDo_content_color, fontsize: data.whatWeDo_content_size.toString(), fontweight: data.whatWeDo_content_weight, fontfamily: data.whatWeDo_content_family },
              { language: 1, content: data.whatWeDo_content_en, fontcolor: data.whatWeDo_content_color, fontsize: data.whatWeDo_content_size.toString(), fontweight: data.whatWeDo_content_weight, fontfamily: data.whatWeDo_content_family },
            ],
          },
        ],
      },
      {
        index: 2,
        visible: data.sme_title_visible,
        translations: [
          { language: 2, title: data.sme_title_mn, color: data.sme_title_color, fontsize: data.sme_title_size.toString(), fontweight: data.sme_title_weight, fontfamily: data.sme_title_family },
          { language: 1, title: data.sme_title_en, color: data.sme_title_color, fontsize: data.sme_title_size.toString(), fontweight: data.sme_title_weight, fontfamily: data.sme_title_family },
        ],
        blocks: [
          {
            index: 0, visible: data.sme_p1_visible,
            translations: [
              { language: 2, content: data.sme_p1_mn, fontcolor: data.sme_p1_color, fontsize: data.sme_p1_size.toString(), fontweight: data.sme_p1_weight, fontfamily: data.sme_p1_family },
              { language: 1, content: data.sme_p1_en, fontcolor: data.sme_p1_color, fontsize: data.sme_p1_size.toString(), fontweight: data.sme_p1_weight, fontfamily: data.sme_p1_family },
            ],
          },
          {
            index: 1, visible: data.sme_p2_visible,
            translations: [
              { language: 2, content: data.sme_p2_mn, fontcolor: data.sme_p2_color, fontsize: data.sme_p2_size.toString(), fontweight: data.sme_p2_weight, fontfamily: data.sme_p2_family },
              { language: 1, content: data.sme_p2_en, fontcolor: data.sme_p2_color, fontsize: data.sme_p2_size.toString(), fontweight: data.sme_p2_weight, fontfamily: data.sme_p2_family },
            ],
          },
        ],
      },
      {
        index: 3,
        visible: data.citizen_title_visible,
        translations: [
          { language: 2, title: data.citizen_title_mn, color: data.citizen_title_color, fontsize: data.citizen_title_size.toString(), fontweight: data.citizen_title_weight, fontfamily: data.citizen_title_family },
          { language: 1, title: data.citizen_title_en, color: data.citizen_title_color, fontsize: data.citizen_title_size.toString(), fontweight: data.citizen_title_weight, fontfamily: data.citizen_title_family },
        ],
        blocks: [
          {
            index: 0, visible: data.citizen_p1_visible,
            translations: [
              { language: 2, content: data.citizen_p1_mn, fontcolor: data.citizen_p1_color, fontsize: data.citizen_p1_size.toString(), fontweight: data.citizen_p1_weight, fontfamily: data.citizen_p1_family },
              { language: 1, content: data.citizen_p1_en, fontcolor: data.citizen_p1_color, fontsize: data.citizen_p1_size.toString(), fontweight: data.citizen_p1_weight, fontfamily: data.citizen_p1_family },
            ],
          },
          {
            index: 1, visible: data.citizen_p2_visible,
            translations: [
              { language: 2, content: data.citizen_p2_mn, fontcolor: data.citizen_p2_color, fontsize: data.citizen_p2_size.toString(), fontweight: data.citizen_p2_weight, fontfamily: data.citizen_p2_family },
              { language: 1, content: data.citizen_p2_en, fontcolor: data.citizen_p2_color, fontsize: data.citizen_p2_size.toString(), fontweight: data.citizen_p2_weight, fontfamily: data.citizen_p2_family },
            ],
          },
        ],
      },
    ],
    media: data.image_url
      ? [{ file: data.image_url, aspect_ratio: data.image_height || 'aspect-video' }]
      : [],
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      const apiPayload = transformTabContentToAPI(intro)

      // 1. Save about-page sections
      await axiosInstance.put('/about-page/3/', apiPayload)

      // 2. Save timeline events — delete old, recreate all
      const existingTimeline = await axiosInstance.get('/timeline/?page=3')
      // Delete all existing events
      await Promise.all(
        (existingTimeline.data || []).map((ev: any) =>
          axiosInstance.delete(`/timeline/${ev.id}/`)
        )
      )
      // Create new events
      for (let i = 0; i < intro.timeline_events.length; i++) {
        const ev = intro.timeline_events[i]
        await axiosInstance.post('/timeline/', {
          page: 3,
          year: ev.year,
          sort_order: i,
          visible: ev.visible,
          year_color: ev.year_color,
          title_color: ev.title_color,
          short_color: ev.short_color,
          desc_color: ev.desc_color,
          translations: [
            { language: 2, title: ev.title_mn, short_desc: ev.short_mn, full_desc: ev.desc_mn },
            { language: 1, title: ev.title_en, short_desc: ev.short_en, full_desc: ev.desc_en },
          ],
        })
      }

      alert('Амжилттай хадгалагдлаа!')
    } catch (error) {
      console.error('Save failed:', error)
      alert('Хадгалахад алдаа гарлаа')
    } finally {
      setSaving(false)
    }
  }

  const handleOpenEditModal = (section: 'demo' | 'timeline') => {
    setEditingSection(section)
    setEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setEditingSection(null)
  }

  const toggleYear = (index: number) => {
    setExpandedYear(expandedYear === index ? null : index)
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Мэдээлэл татаж байна...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-1 gap-6">
       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="sticky top-0 bg-slate-50 border-b border-slate-200 px-6 py-3 z-10 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Demo</h3>
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <div className="flex bg-slate-200/80 p-1 rounded-lg">
              <button 
                onClick={() => setPreviewLang('mn')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${previewLang === 'mn' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                MN
              </button>
              <button 
                onClick={() => setPreviewLang('en')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${previewLang === 'en' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                EN
              </button>
            </div>
            <button
              onClick={() => handleOpenEditModal('demo')}
              className="px-3 py-1.5 text-sm font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-md transition-colors"
              title="Засах"
            >
              Засах
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-1 hover:bg-slate-200 rounded transition-colors"
              title={showPreview ? 'Нуух' : 'Харуулах'}
            >
              {showPreview ? (
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0M3 3l18 18" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {showPreview && (
          <div className="overflow-y-auto max-h-[75vh] p-6">
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
              {/* Origin Story */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t border-slate-200 pt-6 first:border-t-0 first:pt-0">
                <div className="space-y-4">
                  <div className="inline-block bg-teal-50 text-teal-700 px-4 py-1.5 rounded-full text-xs font-medium">
                    Бидний түүх
                  </div>
                  {intro.origin_title_visible && (
                    <h2 
                      className="leading-tight"
                      style={{
                        color: intro.origin_title_color,
                        fontSize: `${intro.origin_title_size}px`,
                        fontWeight: intro.origin_title_weight,
                        fontFamily: intro.origin_title_family,
                      }}
                    >
                      {previewLang === 'mn' ? intro.origin_title_mn : intro.origin_title_en}
                    </h2>
                  )}
                  <div className="space-y-3 leading-relaxed text-justify">
                    {intro.origin_p1_visible && (
                      <p style={{
                        color: intro.origin_p1_color,
                        fontSize: `${intro.origin_p1_size}px`,
                        fontWeight: intro.origin_p1_weight,
                        fontFamily: intro.origin_p1_family,
                      }}>{previewLang === 'mn' ? intro.origin_p1_mn : intro.origin_p1_en}</p>
                    )}
                    {intro.origin_p2_visible && (
                      <p style={{
                        color: intro.origin_p2_color,
                        fontSize: `${intro.origin_p2_size}px`,
                        fontWeight: intro.origin_p2_weight,
                        fontFamily: intro.origin_p2_family,
                      }}>{previewLang === 'mn' ? intro.origin_p2_mn : intro.origin_p2_en}</p>
                    )}
                    {intro.origin_p3_visible && (
                      <p style={{
                        color: intro.origin_p3_color,
                        fontSize: `${intro.origin_p3_size}px`,
                        fontWeight: intro.origin_p3_weight,
                        fontFamily: intro.origin_p3_family,
                      }}>{previewLang === 'mn' ? intro.origin_p3_mn : intro.origin_p3_en}</p>
                    )}
                  </div>
                </div>
                <div className={`rounded-lg overflow-hidden bg-slate-100 ${intro.image_height || 'aspect-video'}`}>
                  {intro.image_url ? (
                    <img 
                      src={intro.image_url} 
                      alt="About Us Team" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      Зураг сонгогдоогүй
                    </div>
                  )}
                </div>
              </div>

              {/* What We Do Section */}
              <div className="bg-slate-50 p-6 rounded-lg hover:shadow-md transition-all">
                {intro.whatWeDo_title_visible && (
                  <h3 className="mb-3 flex items-center gap-2" style={{
                    color: intro.whatWeDo_title_color,
                    fontSize: `${intro.whatWeDo_title_size}px`,
                    fontWeight: intro.whatWeDo_title_weight,
                    fontFamily: intro.whatWeDo_title_family,
                  }}>
                    <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-xs">
                      ℹ
                    </span>
                    {previewLang === 'mn' ? intro.whatWeDo_title_mn : intro.whatWeDo_title_en}
                  </h3>
                )}
                {intro.whatWeDo_content_visible && (
                  <p className="leading-relaxed text-justify" style={{
                    color: intro.whatWeDo_content_color,
                    fontSize: `${intro.whatWeDo_content_size}px`,
                    fontWeight: intro.whatWeDo_content_weight,
                    fontFamily: intro.whatWeDo_content_family,
                  }}>
                    {previewLang === 'mn' ? intro.whatWeDo_content_mn : intro.whatWeDo_content_en}
                  </p>
                )}
              </div>

              {/* SME and Citizen Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* SME */}
                <div className="space-y-3">
                  {intro.sme_title_visible && (
                    <h3 className="border-b-2 border-teal-500 pb-2 inline-block" style={{
                      color: intro.sme_title_color,
                      fontSize: `${intro.sme_title_size}px`,
                      fontWeight: intro.sme_title_weight,
                      fontFamily: intro.sme_title_family,
                    }}>{previewLang === 'mn' ? intro.sme_title_mn : intro.sme_title_en}</h3>
                  )}
                  <div className="text-justify leading-relaxed space-y-3">
                    {intro.sme_p1_visible && (
                      <p style={{
                        color: intro.sme_p1_color,
                        fontSize: `${intro.sme_p1_size}px`,
                        fontWeight: intro.sme_p1_weight,
                        fontFamily: intro.sme_p1_family,
                      }}>{previewLang === 'mn' ? intro.sme_p1_mn : intro.sme_p1_en}</p>
                    )}
                    {intro.sme_p2_visible && (
                      <p style={{
                        color: intro.sme_p2_color,
                        fontSize: `${intro.sme_p2_size}px`,
                        fontWeight: intro.sme_p2_weight,
                        fontFamily: intro.sme_p2_family,
                      }}>{previewLang === 'mn' ? intro.sme_p2_mn : intro.sme_p2_en}</p>
                    )}
                  </div>
                </div>

                {/* Citizen Wealth */}
                <div className="space-y-3">
                  {intro.citizen_title_visible && (
                    <h3 className="border-b-2 border-teal-500 pb-2 inline-block" style={{
                      color: intro.citizen_title_color,
                      fontSize: `${intro.citizen_title_size}px`,
                      fontWeight: intro.citizen_title_weight,
                      fontFamily: intro.citizen_title_family,
                    }}>{previewLang === 'mn' ? intro.citizen_title_mn : intro.citizen_title_en}</h3>
                  )}
                  <div className="text-justify leading-relaxed space-y-3">
                    {intro.citizen_p1_visible && (
                      <p style={{
                        color: intro.citizen_p1_color,
                        fontSize: `${intro.citizen_p1_size}px`,
                        fontWeight: intro.citizen_p1_weight,
                        fontFamily: intro.citizen_p1_family,
                      }}>{previewLang === 'mn' ? intro.citizen_p1_mn : intro.citizen_p1_en}</p>
                    )}
                    {intro.citizen_p2_visible && (
                      <p style={{
                        color: intro.citizen_p2_color,
                        fontSize: `${intro.citizen_p2_size}px`,
                        fontWeight: intro.citizen_p2_weight,
                        fontFamily: intro.citizen_p2_family,
                      }}>{previewLang === 'mn' ? intro.citizen_p2_mn : intro.citizen_p2_en}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Preview - Separate */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="sticky top-0 bg-slate-50 border-b border-slate-200 px-6 py-3 z-10 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Түүхэн замнал</h3>
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <div className="flex bg-slate-200/80 p-1 rounded-lg">
              <button 
                onClick={() => setPreviewLang('mn')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${previewLang === 'mn' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                MN
              </button>
              <button 
                onClick={() => setPreviewLang('en')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${previewLang === 'en' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                EN
              </button>
            </div>
            <button
              onClick={() => handleOpenEditModal('timeline')}
              className="px-3 py-1.5 text-sm font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-md transition-colors"
              title="Засах"
            >
              Засах
            </button>
            <button
              onClick={() => setShowTimelinePreview(!showTimelinePreview)}
              className="p-1 hover:bg-slate-200 rounded transition-colors"
              title={showTimelinePreview ? 'Нуух' : 'Харуулах'}
            >
              {showTimelinePreview ? (
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0M3 3l18 18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {showTimelinePreview && (
          <div className="overflow-y-auto max-h-[75vh] p-6">
            <div ref={timelineRef} className="py-12 relative overflow-hidden">
              <h3 className="text-3xl font-bold text-center mb-16 text-slate-900">
                Түүхэн замнал
              </h3>
              
              {/* Vertical Line */}
              <div className="absolute left-[27px] md:left-1/2 top-32 bottom-12 w-0.5 bg-teal-200 transform md:-translate-x-1/2"></div>

              <div className="space-y-12">
                  {intro.timeline_events.filter(e => e.visible).map((event, index) => {
                    const isExpanded = expandedYear === index
                    const isEven = index % 2 === 0

                    // Content Card Component
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
                        {/* Mobile/Desktop Dot */}
                        <div className="absolute left-[18px] md:left-1/2 w-5 h-5 rounded-full border-4 border-white bg-teal-600 shadow-sm z-20 top-0 md:top-8 transform md:-translate-x-1/2"></div>
                        
                        {/* Left Side (Desktop) */}
                        <div className={clsx(
                          "w-full md:w-1/2 pl-16 md:pl-0 md:pr-12 md:text-right flex md:block",
                          isEven ? "" : "md:flex md:justify-end" 
                        )}>
                          {/* Mobile: Always Show Card */}
                          <div className="md:hidden w-full">
                            {ContentCard}
                          </div>

                          {/* Desktop: Show Card if Even, Year if Odd */}
                          <div className="hidden md:block w-full">
                            {isEven ? ContentCard : (
                              <span className="text-5xl font-bold sticky top-32 transition-colors duration-300" style={{ color: event.year_color, opacity: activeIndex === index ? 1 : 0.5 }}>
                                {event.year}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right Side (Desktop) */}
                        <div className="hidden md:block w-full md:w-1/2 md:pl-12 text-left">
                          {/* Desktop: Show Year if Even, Card if Odd */}
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

      {/* Edit Modal */}
      <Modal 
        isOpen={editModalOpen} 
        onClose={handleCloseEditModal} 
        title={editingSection === 'demo' ? 'Demo хэсгийг засах (12 хэсэг)' : 'Түүхэн замналыг засах'}
        size="xl"
      >
        {editingSection === 'demo' && (
          <div className="space-y-5 pb-4">
            {/* IMAGE UPLOAD - Зураг оруулах */}
            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-semibold text-gray-900">Бидний түүхэн зургийг сонгох</h4>
              </div>
              <p className="text-xs text-gray-500 mb-4">Зураг сонгосны дараа уг зургийн URL хаяг дээр дарж өөр зургаар солих боломжтой</p>
              <div className="space-y-4">
                <ImageUpload 
                  value={intro.image_url}
                  onChange={(url: string) => setIntro({ ...intro, image_url: url })}
                  label="Зургийг оруулах"
                />
                
                {/* Image Height/Aspect Ratio Controls */}
                <div className="bg-purple-100/40 rounded-lg p-3 border border-purple-200">
                  <label className="block text-sm font-medium text-gray-800 mb-3">Зургийн хэмжээ/харьцаа</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { value: 'aspect-square', label: '1:1 (Дөрвөлжин)' },
                      { value: 'aspect-video', label: '16:9 (Видео)' },
                      { value: 'aspect-[3/2]', label: '3:2' },
                      { value: 'aspect-[4/3]', label: '4:3' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setIntro({ ...intro, image_height: option.value })}
                        className={clsx(
                          'px-3 py-2 text-xs font-medium rounded-md transition-colors border',
                          intro.image_height === option.value
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ХЭСЭГ 1/12: Origin Title - Гарчиг */}
            <div className="border border-teal-200 rounded-lg p-4 bg-teal-50/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-semibold text-gray-900">1. Бидний түүх - Гарчиг</h4>
                <button
                  onClick={() => setIntro({ ...intro, origin_title_visible: !intro.origin_title_visible })}
                  className={clsx(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    intro.origin_title_visible
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  )}
                >
                  {intro.origin_title_visible ? ' Харагдана' : ' Нуугдсан'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4">Энэ хэсэг зөвхөн гарчгийн текст болон фонт тохиргоог засна</p>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Гарчиг (Монгол)</label>
                    <input
                      type="text"
                      value={intro.origin_title_mn}
                      onChange={(e) => setIntro({ ...intro, origin_title_mn: e.target.value })}
                      placeholder="Гарчиг"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Гарчиг (English)</label>
                    <input
                      type="text"
                      value={intro.origin_title_en}
                      onChange={(e) => setIntro({ ...intro, origin_title_en: e.target.value })}
                      placeholder="Title"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                
                {/* Font Controls for Origin Title */}
                <div className="grid md:grid-cols-4 gap-3 pt-2 pb-2 bg-teal-100/40 rounded-lg p-3 border border-teal-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Өнгө</label>
                    <input
                      type="color"
                      value={intro.origin_title_color}
                      onChange={(e) => setIntro({ ...intro, origin_title_color: e.target.value })}
                      className="w-full h-9 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Хэмжээ (px)</label>
                    <input
                      type="number"
                      min="12"
                      max="48"
                      value={intro.origin_title_size}
                      onChange={(e) => setIntro({ ...intro, origin_title_size: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Жин</label>
                    <select
                      value={intro.origin_title_weight}
                      onChange={(e) => setIntro({ ...intro, origin_title_weight: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    >
                      <option value="400">Regular</option>
                      <option value="500">Medium</option>
                      <option value="600">Semibold</option>
                      <option value="700">Bold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Фонт</label>
                    <select
                      value={intro.origin_title_family}
                      onChange={(e) => setIntro({ ...intro, origin_title_family: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    >
                      <option value="inherit">Default</option>
                      <option value="'Arial', sans-serif">Arial</option>
                      <option value="'Georgia', serif">Georgia</option>
                    </select>
                  </div>
                  <div className="md:col-span-4">
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <span>Preview:</span>
                      <span className="px-2 py-1 rounded border border-gray-200 bg-white" style={{
                        color: intro.origin_title_color,
                        fontSize: `${intro.origin_title_size}px`,
                        fontWeight: intro.origin_title_weight,
                        fontFamily: intro.origin_title_family,
                      }}>Aa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ХЭСЭГ 2/12: Origin P1 - Параграф 1 */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-semibold text-gray-900">2. Бидний түүх - Параграф 1</h4>
                <button
                  onClick={() => setIntro({ ...intro, origin_p1_visible: !intro.origin_p1_visible })}
                  className={clsx(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    intro.origin_p1_visible
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  )}
                >
                  {intro.origin_p1_visible ? ' Харагдана' : ' Нуугдсан'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4">Энэ хэсэг зөвхөн эхний параграфын текст болон фонтыг засна</p>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Параграф 1 (Монгол)</label>
                    <textarea
                      value={intro.origin_p1_mn}
                      onChange={(e) => setIntro({ ...intro, origin_p1_mn: e.target.value })}
                      placeholder="Эхний догол мөр"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Параграф 1 (English)</label>
                    <textarea
                      value={intro.origin_p1_en}
                      onChange={(e) => setIntro({ ...intro, origin_p1_en: e.target.value })}
                      placeholder="First paragraph"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                
                {/* Font Controls for Paragraph 1 */}
                <div className="grid md:grid-cols-4 gap-3 pt-2 pb-2 bg-blue-100/40 rounded-lg p-3 border border-blue-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Өнгө</label>
                    <input
                      type="color"
                      value={intro.origin_p1_color}
                      onChange={(e) => setIntro({ ...intro, origin_p1_color: e.target.value })}
                      className="w-full h-9 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Хэмжээ (px)</label>
                    <input
                      type="number"
                      min="12"
                      max="24"
                      value={intro.origin_p1_size}
                      onChange={(e) => setIntro({ ...intro, origin_p1_size: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Жин</label>
                    <select
                      value={intro.origin_p1_weight}
                      onChange={(e) => setIntro({ ...intro, origin_p1_weight: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    >
                      <option value="400">Regular</option>
                      <option value="500">Medium</option>
                      <option value="600">Semibold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Фонт</label>
                    <select
                      value={intro.origin_p1_family}
                      onChange={(e) => setIntro({ ...intro, origin_p1_family: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    >
                      <option value="inherit">Default</option>
                      <option value="'Arial', sans-serif">Arial</option>
                    </select>
                  </div>
                  <div className="md:col-span-4">
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <span>Preview:</span>
                      <span className="px-2 py-1 rounded border border-gray-200 bg-white" style={{
                        color: intro.origin_p1_color,
                        fontSize: `${intro.origin_p1_size}px`,
                        fontWeight: intro.origin_p1_weight,
                        fontFamily: intro.origin_p1_family,
                      }}>Aa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ХЭСЭГ 3/12: Origin P2 - Параграф 2 */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-semibold text-gray-900">3. Бидний түүх - Параграф 2</h4>
                <button
                  onClick={() => setIntro({ ...intro, origin_p2_visible: !intro.origin_p2_visible })}
                  className={clsx(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    intro.origin_p2_visible
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  )}
                >
                  {intro.origin_p2_visible ? ' Харагдана' : ' Нуугдсан'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4">Энэ хэсэг зөвхөн хоёрдугаар параграфын текст болон фонтыг засна</p>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Параграф 2 (Монгол)</label>
                    <textarea
                      value={intro.origin_p2_mn}
                      onChange={(e) => setIntro({ ...intro, origin_p2_mn: e.target.value })}
                      placeholder="Хоёрдугаар догол мөр"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Параграф 2 (English)</label>
                    <textarea
                      value={intro.origin_p2_en}
                      onChange={(e) => setIntro({ ...intro, origin_p2_en: e.target.value })}
                      placeholder="Second paragraph"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                
                {/* Font Controls for Paragraph 2 */}
                <div className="grid md:grid-cols-4 gap-3 pt-2 pb-2 bg-blue-100/40 rounded-lg p-3 border border-blue-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Өнгө</label>
                    <input
                      type="color"
                      value={intro.origin_p2_color}
                      onChange={(e) => setIntro({ ...intro, origin_p2_color: e.target.value })}
                      className="w-full h-9 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Хэмжээ (px)</label>
                    <input
                      type="number"
                      min="12"
                      max="24"
                      value={intro.origin_p2_size}
                      onChange={(e) => setIntro({ ...intro, origin_p2_size: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Жин</label>
                    <select
                      value={intro.origin_p2_weight}
                      onChange={(e) => setIntro({ ...intro, origin_p2_weight: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    >
                      <option value="400">Regular</option>
                      <option value="500">Medium</option>
                      <option value="600">Semibold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Фонт</label>
                    <select
                      value={intro.origin_p2_family}
                      onChange={(e) => setIntro({ ...intro, origin_p2_family: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    >
                      <option value="inherit">Default</option>
                      <option value="'Arial', sans-serif">Arial</option>
                    </select>
                  </div>
                  <div className="md:col-span-4">
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <span>Preview:</span>
                      <span className="px-2 py-1 rounded border border-gray-200 bg-white" style={{
                        color: intro.origin_p2_color,
                        fontSize: `${intro.origin_p2_size}px`,
                        fontWeight: intro.origin_p2_weight,
                        fontFamily: intro.origin_p2_family,
                      }}>Aa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ХЭСЭГ 4/12: Origin P3 - Параграф 3 */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-semibold text-gray-900">4. Бидний түүх - Параграф 3 (Тодотгол)</h4>
                <button
                  onClick={() => setIntro({ ...intro, origin_p3_visible: !intro.origin_p3_visible })}
                  className={clsx(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    intro.origin_p3_visible
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  )}
                >
                  {intro.origin_p3_visible ? ' Харагдана' : ' Нуугдсан'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4">Энэ хэсэг зөвхөн гуравдугаар параграфын (тодотгол) текст болон фонтыг засна</p>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Параграф 3 (Монгол - Тодотгол)</label>
                    <textarea
                      value={intro.origin_p3_mn}
                      onChange={(e) => setIntro({ ...intro, origin_p3_mn: e.target.value })}
                      placeholder="Гуравдугаар догол мөр"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Параграф 3 (English - Highlight)</label>
                    <textarea
                      value={intro.origin_p3_en}
                      onChange={(e) => setIntro({ ...intro, origin_p3_en: e.target.value })}
                      placeholder="Third paragraph"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                
                {/* Font Controls for Paragraph 3 */}
                <div className="grid md:grid-cols-4 gap-3 pt-2 pb-2 bg-blue-100/40 rounded-lg p-3 border border-blue-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Өнгө</label>
                    <input
                      type="color"
                      value={intro.origin_p3_color}
                      onChange={(e) => setIntro({ ...intro, origin_p3_color: e.target.value })}
                      className="w-full h-9 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Хэмжээ (px)</label>
                    <input
                      type="number"
                      min="12"
                      max="24"
                      value={intro.origin_p3_size}
                      onChange={(e) => setIntro({ ...intro, origin_p3_size: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Жин</label>
                    <select
                      value={intro.origin_p3_weight}
                      onChange={(e) => setIntro({ ...intro, origin_p3_weight: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    >
                      <option value="400">Regular</option>
                      <option value="500">Medium</option>
                      <option value="600">Semibold</option>
                      <option value="700">Bold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Фонт</label>
                    <select
                      value={intro.origin_p3_family}
                      onChange={(e) => setIntro({ ...intro, origin_p3_family: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    >
                      <option value="inherit">Default</option>
                      <option value="'Arial', sans-serif">Arial</option>
                    </select>
                  </div>
                  <div className="md:col-span-4">
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <span>Preview:</span>
                      <span className="px-2 py-1 rounded border border-gray-200 bg-white" style={{
                        color: intro.origin_p3_color,
                        fontSize: `${intro.origin_p3_size}px`,
                        fontWeight: intro.origin_p3_weight,
                        fontFamily: intro.origin_p3_family,
                      }}>Aa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ХЭСЭГ 5/12: What We Do Title */}
            <div className="border border-teal-200 rounded-lg p-4 bg-teal-50/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-semibold text-gray-900">5. Юу хийдэг вэ? - Гарчиг</h4>
                <button
                  onClick={() => setIntro({ ...intro, whatWeDo_title_visible: !intro.whatWeDo_title_visible })}
                  className={clsx(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    intro.whatWeDo_title_visible
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  )}
                >
                  {intro.whatWeDo_title_visible ? ' Харагдана' : ' Нуугдсан'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4">Энэ хэсэг зөвхөн "Юу хийдэг вэ?" гарчгийн текст болон фонт тохиргоог засна</p>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Гарчиг (Монгол)</label>
                    <input
                      type="text"
                      value={intro.whatWeDo_title_mn}
                      onChange={(e) => setIntro({ ...intro, whatWeDo_title_mn: e.target.value })}
                      placeholder="Гарчиг"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Гарчиг (English)</label>
                    <input
                      type="text"
                      value={intro.whatWeDo_title_en}
                      onChange={(e) => setIntro({ ...intro, whatWeDo_title_en: e.target.value })}
                      placeholder="Title"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                
                {/* Font Controls for What We Do Title */}
                <div className="grid md:grid-cols-4 gap-3 pt-2 pb-2 bg-teal-100/40 rounded-lg p-3 border border-teal-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Өнгө</label>
                    <input
                      type="color"
                      value={intro.whatWeDo_title_color}
                      onChange={(e) => setIntro({ ...intro, whatWeDo_title_color: e.target.value })}
                      className="w-full h-9 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Хэмжээ (px)</label>
                    <input
                      type="number"
                      min="16"
                      max="48"
                      value={intro.whatWeDo_title_size}
                      onChange={(e) => setIntro({ ...intro, whatWeDo_title_size: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Жин</label>
                    <select
                      value={intro.whatWeDo_title_weight}
                      onChange={(e) => setIntro({ ...intro, whatWeDo_title_weight: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    >
                      <option value="400">Regular</option>
                      <option value="500">Medium</option>
                      <option value="600">Semibold</option>
                      <option value="700">Bold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Фонт</label>
                    <select
                      value={intro.whatWeDo_title_family}
                      onChange={(e) => setIntro({ ...intro, whatWeDo_title_family: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    >
                      <option value="inherit">Default</option>
                      <option value="'Arial', sans-serif">Arial</option>
                    </select>
                  </div>
                  <div className="md:col-span-4">
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <span>Preview:</span>
                      <span className="px-2 py-1 rounded border border-gray-200 bg-white" style={{
                        color: intro.whatWeDo_title_color,
                        fontSize: `${intro.whatWeDo_title_size}px`,
                        fontWeight: intro.whatWeDo_title_weight,
                        fontFamily: intro.whatWeDo_title_family,
                      }}>Aa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ХЭСЭГ 6/12: What We Do Content */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-semibold text-gray-900">6. Юу хийдэг вэ? - Агуулга</h4>
                <button
                  onClick={() => setIntro({ ...intro, whatWeDo_content_visible: !intro.whatWeDo_content_visible })}
                  className={clsx(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    intro.whatWeDo_content_visible
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  )}
                >
                  {intro.whatWeDo_content_visible ? ' Харагдана' : ' Нуугдсан'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4">Энэ хэсэг зөвхөн "Юу хийдэг вэ?" агуулгын текст болон фонт тохиргоог засна</p>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Агуулга (Монгол)</label>
                    <textarea
                      value={intro.whatWeDo_content_mn}
                      onChange={(e) => setIntro({ ...intro, whatWeDo_content_mn: e.target.value })}
                      placeholder="Агуулга"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Агуулга (English)</label>
                    <textarea
                      value={intro.whatWeDo_content_en}
                      onChange={(e) => setIntro({ ...intro, whatWeDo_content_en: e.target.value })}
                      placeholder="Content"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Font Controls for What We Do Content */}
                <div className="grid md:grid-cols-4 gap-3 pt-2 pb-2 bg-blue-100/40 rounded-lg p-3 border border-blue-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Өнгө</label>
                    <input
                      type="color"
                      value={intro.whatWeDo_content_color}
                      onChange={(e) => setIntro({ ...intro, whatWeDo_content_color: e.target.value })}
                      className="w-full h-9 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Хэмжээ (px)</label>
                    <input
                      type="number"
                      min="12"
                      max="24"
                      value={intro.whatWeDo_content_size}
                      onChange={(e) => setIntro({ ...intro, whatWeDo_content_size: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Жин</label>
                    <select
                      value={intro.whatWeDo_content_weight}
                      onChange={(e) => setIntro({ ...intro, whatWeDo_content_weight: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    >
                      <option value="400">Regular</option>
                      <option value="500">Medium</option>
                      <option value="600">Semibold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Фонт</label>
                    <select
                      value={intro.whatWeDo_content_family}
                      onChange={(e) => setIntro({ ...intro, whatWeDo_content_family: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    >
                      <option value="inherit">Default</option>
                      <option value="'Arial', sans-serif">Arial</option>
                    </select>
                  </div>
                  <div className="md:col-span-4">
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <span>Preview:</span>
                      <span className="px-2 py-1 rounded border border-gray-200 bg-white" style={{
                        color: intro.whatWeDo_content_color,
                        fontSize: `${intro.whatWeDo_content_size}px`,
                        fontWeight: intro.whatWeDo_content_weight,
                        fontFamily: intro.whatWeDo_content_family,
                      }}>Aa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ХЭСЭГ 7/12: SME Title */}
            <div className="border border-teal-200 rounded-lg p-4 bg-teal-50/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-semibold text-gray-900">7. Жижиг дунд бизнес - Гарчиг</h4>
                <button
                  onClick={() => setIntro({ ...intro, sme_title_visible: !intro.sme_title_visible })}
                  className={clsx(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    intro.sme_title_visible
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  )}
                >
                  {intro.sme_title_visible ? ' Харагдана' : ' Нуугдсан'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4">Энэ хэсэг зөвхөн SME гарчгийн текст болон фонт тохиргоог засна</p>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Гарчиг (Монгол)</label>
                    <input
                      type="text"
                      value={intro.sme_title_mn}
                      onChange={(e) => setIntro({ ...intro, sme_title_mn: e.target.value })}
                      placeholder="Гарчиг"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Гарчиг (English)</label>
                    <input
                      type="text"
                      value={intro.sme_title_en}
                      onChange={(e) => setIntro({ ...intro, sme_title_en: e.target.value })}
                      placeholder="Title"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Font Controls for SME Title */}
                <div className="grid md:grid-cols-4 gap-3 pt-2 pb-2 bg-teal-100/40 rounded-lg p-3 border border-teal-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Өнгө</label>
                    <input
                      type="color"
                      value={intro.sme_title_color}
                      onChange={(e) => setIntro({ ...intro, sme_title_color: e.target.value })}
                      className="w-full h-9 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Хэмжээ (px)</label>
                    <input
                      type="number"
                      min="16"
                      max="48"
                      value={intro.sme_title_size}
                      onChange={(e) => setIntro({ ...intro, sme_title_size: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Жин</label>
                    <select
                      value={intro.sme_title_weight}
                      onChange={(e) => setIntro({ ...intro, sme_title_weight: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    >
                      <option value="400">Regular</option>
                      <option value="500">Medium</option>
                      <option value="600">Semibold</option>
                      <option value="700">Bold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Фонт</label>
                    <select
                      value={intro.sme_title_family}
                      onChange={(e) => setIntro({ ...intro, sme_title_family: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    >
                      <option value="inherit">Default</option>
                      <option value="'Arial', sans-serif">Arial</option>
                    </select>
                  </div>
                  <div className="md:col-span-4">
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <span>Preview:</span>
                      <span className="px-2 py-1 rounded border border-gray-200 bg-white" style={{
                        color: intro.sme_title_color,
                        fontSize: `${intro.sme_title_size}px`,
                        fontWeight: intro.sme_title_weight,
                        fontFamily: intro.sme_title_family,
                      }}>Aa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ХЭСЭГ 8/12: SME P1 */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-semibold text-gray-900">8. Жижиг дунд бизнес - Параграф 1</h4>
                <button
                  onClick={() => setIntro({ ...intro, sme_p1_visible: !intro.sme_p1_visible })}
                  className={clsx(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    intro.sme_p1_visible
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  )}
                >
                  {intro.sme_p1_visible ? ' Харагдана' : ' Нуугдсан'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4">Энэ хэсэг зөвхөн SME эхний параграфын текст болон фонт тохиргоог засна</p>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Параграф 1 (Монгол)</label>
                    <textarea
                      value={intro.sme_p1_mn}
                      onChange={(e) => setIntro({ ...intro, sme_p1_mn: e.target.value })}
                      placeholder="Эхний догол мөр"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Параграф 1 (English)</label>
                    <textarea
                      value={intro.sme_p1_en}
                      onChange={(e) => setIntro({ ...intro, sme_p1_en: e.target.value })}
                      placeholder="First paragraph"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Font Controls for SME P1 */}
                <div className="grid md:grid-cols-4 gap-3 pt-2 pb-2 bg-blue-100/40 rounded-lg p-3 border border-blue-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Өнгө</label>
                    <input
                      type="color"
                      value={intro.sme_p1_color}
                      onChange={(e) => setIntro({ ...intro, sme_p1_color: e.target.value })}
                      className="w-full h-9 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Хэмжээ (px)</label>
                    <input
                      type="number"
                      min="12"
                      max="24"
                      value={intro.sme_p1_size}
                      onChange={(e) => setIntro({ ...intro, sme_p1_size: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Жин</label>
                    <select
                      value={intro.sme_p1_weight}
                      onChange={(e) => setIntro({ ...intro, sme_p1_weight: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    >
                      <option value="400">Regular</option>
                      <option value="500">Medium</option>
                      <option value="600">Semibold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Фонт</label>
                    <select
                      value={intro.sme_p1_family}
                      onChange={(e) => setIntro({ ...intro, sme_p1_family: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    >
                      <option value="inherit">Default</option>
                      <option value="'Arial', sans-serif">Arial</option>
                    </select>
                  </div>
                  <div className="md:col-span-4">
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <span>Preview:</span>
                      <span className="px-2 py-1 rounded border border-gray-200 bg-white" style={{
                        color: intro.sme_p1_color,
                        fontSize: `${intro.sme_p1_size}px`,
                        fontWeight: intro.sme_p1_weight,
                        fontFamily: intro.sme_p1_family,
                      }}>Aa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ХЭСЭГ 9/12: SME P2 */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-semibold text-gray-900">9. Жижиг дунд бизнес - Параграф 2</h4>
                <button
                  onClick={() => setIntro({ ...intro, sme_p2_visible: !intro.sme_p2_visible })}
                  className={clsx(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    intro.sme_p2_visible
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  )}
                >
                  {intro.sme_p2_visible ? ' Харагдана' : ' Нуугдсан'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4">Энэ хэсэг зөвхөн SME хоёрдугаар параграфын текст болон фонт тохиргоог засна</p>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Параграф 2 (Монгол)</label>
                    <textarea
                      value={intro.sme_p2_mn}
                      onChange={(e) => setIntro({ ...intro, sme_p2_mn: e.target.value })}
                      placeholder="Хоёрдугаар догол мөр"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Параграф 2 (English)</label>
                    <textarea
                      value={intro.sme_p2_en}
                      onChange={(e) => setIntro({ ...intro, sme_p2_en: e.target.value })}
                      placeholder="Second paragraph"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Font Controls for SME P2 */}
                <div className="grid md:grid-cols-4 gap-3 pt-2 pb-2 bg-blue-100/40 rounded-lg p-3 border border-blue-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Өнгө</label>
                    <input
                      type="color"
                      value={intro.sme_p2_color}
                      onChange={(e) => setIntro({ ...intro, sme_p2_color: e.target.value })}
                      className="w-full h-9 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Хэмжээ (px)</label>
                    <input
                      type="number"
                      min="12"
                      max="24"
                      value={intro.sme_p2_size}
                      onChange={(e) => setIntro({ ...intro, sme_p2_size: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Жин</label>
                    <select
                      value={intro.sme_p2_weight}
                      onChange={(e) => setIntro({ ...intro, sme_p2_weight: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    >
                      <option value="400">Regular</option>
                      <option value="500">Medium</option>
                      <option value="600">Semibold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Фонт</label>
                    <select
                      value={intro.sme_p2_family}
                      onChange={(e) => setIntro({ ...intro, sme_p2_family: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    >
                      <option value="inherit">Default</option>
                      <option value="'Arial', sans-serif">Arial</option>
                    </select>
                  </div>
                  <div className="md:col-span-4">
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <span>Preview:</span>
                      <span className="px-2 py-1 rounded border border-gray-200 bg-white" style={{
                        color: intro.sme_p2_color,
                        fontSize: `${intro.sme_p2_size}px`,
                        fontWeight: intro.sme_p2_weight,
                        fontFamily: intro.sme_p2_family,
                      }}>Aa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ХЭСЭГ 10/12: Citizen Title */}
            <div className="border border-teal-200 rounded-lg p-4 bg-teal-50/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-semibold text-gray-900">10. Иргэн баян бол улс баян - Гарчиг</h4>
                <button
                  onClick={() => setIntro({ ...intro, citizen_title_visible: !intro.citizen_title_visible })}
                  className={clsx(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    intro.citizen_title_visible
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  )}
                >
                  {intro.citizen_title_visible ? ' Харагдана' : ' Нуугдсан'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4">Энэ хэсэг зөвхөн Citizen гарчгийн текст болон фонт тохиргоог засна</p>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Гарчиг (Монгол)</label>
                    <input
                      type="text"
                      value={intro.citizen_title_mn}
                      onChange={(e) => setIntro({ ...intro, citizen_title_mn: e.target.value })}
                      placeholder="Гарчиг"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Гарчиг (English)</label>
                    <input
                      type="text"
                      value={intro.citizen_title_en}
                      onChange={(e) => setIntro({ ...intro, citizen_title_en: e.target.value })}
                      placeholder="Title"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Font Controls for Citizen Title */}
                <div className="grid md:grid-cols-4 gap-3 pt-2 pb-2 bg-teal-100/40 rounded-lg p-3 border border-teal-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Өнгө</label>
                    <input
                      type="color"
                      value={intro.citizen_title_color}
                      onChange={(e) => setIntro({ ...intro, citizen_title_color: e.target.value })}
                      className="w-full h-9 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Хэмжээ (px)</label>
                    <input
                      type="number"
                      min="16"
                      max="48"
                      value={intro.citizen_title_size}
                      onChange={(e) => setIntro({ ...intro, citizen_title_size: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Жин</label>
                    <select
                      value={intro.citizen_title_weight}
                      onChange={(e) => setIntro({ ...intro, citizen_title_weight: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    >
                      <option value="400">Regular</option>
                      <option value="500">Medium</option>
                      <option value="600">Semibold</option>
                      <option value="700">Bold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Фонт</label>
                    <select
                      value={intro.citizen_title_family}
                      onChange={(e) => setIntro({ ...intro, citizen_title_family: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    >
                      <option value="inherit">Default</option>
                      <option value="'Arial', sans-serif">Arial</option>
                    </select>
                  </div>
                  <div className="md:col-span-4">
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <span>Preview:</span>
                      <span className="px-2 py-1 rounded border border-gray-200 bg-white" style={{
                        color: intro.citizen_title_color,
                        fontSize: `${intro.citizen_title_size}px`,
                        fontWeight: intro.citizen_title_weight,
                        fontFamily: intro.citizen_title_family,
                      }}>Aa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ХЭСЭГ 11/12: Citizen P1 */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-semibold text-gray-900">11. Иргэн баян - Параграф 1</h4>
                <button
                  onClick={() => setIntro({ ...intro, citizen_p1_visible: !intro.citizen_p1_visible })}
                  className={clsx(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    intro.citizen_p1_visible
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  )}
                >
                  {intro.citizen_p1_visible ? ' Харагдана' : ' Нуугдсан'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4">Энэ хэсэг зөвхөн Citizen эхний параграфын текст болон фонт тохиргоог засна</p>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Параграф 1 (Монгол)</label>
                    <textarea
                      value={intro.citizen_p1_mn}
                      onChange={(e) => setIntro({ ...intro, citizen_p1_mn: e.target.value })}
                      placeholder="Эхний догол мөр"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Параграф 1 (English)</label>
                    <textarea
                      value={intro.citizen_p1_en}
                      onChange={(e) => setIntro({ ...intro, citizen_p1_en: e.target.value })}
                      placeholder="First paragraph"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Font Controls for Citizen P1 */}
                <div className="grid md:grid-cols-4 gap-3 pt-2 pb-2 bg-blue-100/40 rounded-lg p-3 border border-blue-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Өнгө</label>
                    <input
                      type="color"
                      value={intro.citizen_p1_color}
                      onChange={(e) => setIntro({ ...intro, citizen_p1_color: e.target.value })}
                      className="w-full h-9 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Хэмжээ (px)</label>
                    <input
                      type="number"
                      min="12"
                      max="24"
                      value={intro.citizen_p1_size}
                      onChange={(e) => setIntro({ ...intro, citizen_p1_size: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Жин</label>
                    <select
                      value={intro.citizen_p1_weight}
                      onChange={(e) => setIntro({ ...intro, citizen_p1_weight: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    >
                      <option value="400">Regular</option>
                      <option value="500">Medium</option>
                      <option value="600">Semibold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Фонт</label>
                    <select
                      value={intro.citizen_p1_family}
                      onChange={(e) => setIntro({ ...intro, citizen_p1_family: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    >
                      <option value="inherit">Default</option>
                      <option value="'Arial', sans-serif">Arial</option>
                    </select>
                  </div>
                  <div className="md:col-span-4">
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <span>Preview:</span>
                      <span className="px-2 py-1 rounded border border-gray-200 bg-white" style={{
                        color: intro.citizen_p1_color,
                        fontSize: `${intro.citizen_p1_size}px`,
                        fontWeight: intro.citizen_p1_weight,
                        fontFamily: intro.citizen_p1_family,
                      }}>Aa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ХЭСЭГ 12/12: Citizen P2 */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-semibold text-gray-900">12. Иргэн баян - Параграф 2</h4>
                <button
                  onClick={() => setIntro({ ...intro, citizen_p2_visible: !intro.citizen_p2_visible })}
                  className={clsx(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    intro.citizen_p2_visible
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  )}
                >
                  {intro.citizen_p2_visible ? ' Харагдана' : ' Нуугдсан'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4">Энэ хэсэг зөвхөн Citizen хоёрдугаар параграфын текст болон фонт тохиргоог засна</p>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Параграф 2 (Монгол)</label>
                    <textarea
                      value={intro.citizen_p2_mn}
                      onChange={(e) => setIntro({ ...intro, citizen_p2_mn: e.target.value })}
                      placeholder="Хоёрдугаар догол мөр"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Параграф 2 (English)</label>
                    <textarea
                      value={intro.citizen_p2_en}
                      onChange={(e) => setIntro({ ...intro, citizen_p2_en: e.target.value })}
                      placeholder="Second paragraph"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Font Controls for Citizen P2 */}
                <div className="grid md:grid-cols-4 gap-3 pt-2 pb-2 bg-blue-100/40 rounded-lg p-3 border border-blue-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Өнгө</label>
                    <input
                      type="color"
                      value={intro.citizen_p2_color}
                      onChange={(e) => setIntro({ ...intro, citizen_p2_color: e.target.value })}
                      className="w-full h-9 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Хэмжээ (px)</label>
                    <input
                      type="number"
                      min="12"
                      max="24"
                      value={intro.citizen_p2_size}
                      onChange={(e) => setIntro({ ...intro, citizen_p2_size: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Жин</label>
                    <select
                      value={intro.citizen_p2_weight}
                      onChange={(e) => setIntro({ ...intro, citizen_p2_weight: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    >
                      <option value="400">Regular</option>
                      <option value="500">Medium</option>
                      <option value="600">Semibold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Фонт</label>
                    <select
                      value={intro.citizen_p2_family}
                      onChange={(e) => setIntro({ ...intro, citizen_p2_family: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    >
                      <option value="inherit">Default</option>
                      <option value="'Arial', sans-serif">Arial</option>
                    </select>
                  </div>
                  <div className="md:col-span-4">
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <span>Preview:</span>
                      <span className="px-2 py-1 rounded border border-gray-200 bg-white" style={{
                        color: intro.citizen_p2_color,
                        fontSize: `${intro.citizen_p2_size}px`,
                        fontWeight: intro.citizen_p2_weight,
                        fontFamily: intro.citizen_p2_family,
                      }}>Aa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Болих
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSave()
                  handleCloseEditModal()
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
              >
                Хадгалах
              </button>
            </div>
          </div>
        )}

        {editingSection === 'timeline' && (
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Түүхэн замнал ({intro.timeline_events.length} үйл явдал)</h3>
              <button
                type="button"
                onClick={() => {
                  const newEvent = {
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
                    visible: true
                  }
                  setIntro({ ...intro, timeline_events: [...intro.timeline_events, newEvent] })
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Үйл явдал нэмэх
              </button>
            </div>

            <div className="space-y-4">
              {intro.timeline_events.map((event, index) => (
                <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-teal-600">{index + 1}.</span>
                      <button
                        onClick={() => {
                          const updated = [...intro.timeline_events]
                          updated[index] = { ...updated[index], visible: !updated[index].visible }
                          setIntro({ ...intro, timeline_events: updated })
                        }}
                        className={clsx(
                          'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                          event.visible
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        )}
                      >
                        {event.visible ? ' Харагдана' : ' Нуугдсан'}
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Энэ үйл явдлыг устгах уу?')) {
                          setIntro({ ...intro, timeline_events: intro.timeline_events.filter((_, i) => i !== index) })
                        }
                      }}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Устгах"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Year and Year Color */}
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Он
                        </label>
                        <input
                          type="text"
                          value={event.year}
                          onChange={(e) => {
                            const updated = [...intro.timeline_events]
                            updated[index] = { ...updated[index], year: e.target.value }
                            setIntro({ ...intro, timeline_events: updated })
                          }}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="2024"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Оны өнгө
                        </label>
                        <input
                          type="color"
                          value={event.year_color || '#0d9488'}
                          onChange={(e) => {
                            const updated = [...intro.timeline_events]
                            updated[index] = { ...updated[index], year_color: e.target.value }
                            setIntro({ ...intro, timeline_events: updated })
                          }}
                          className="w-full h-10 rounded-lg border border-slate-300 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Title - Mongolian and English */}
                    <div className="border border-blue-200 bg-blue-50/30 rounded-lg p-3">
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Гарчиг</label>
                      <div className="grid gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1"> Монгол</label>
                          <input
                            type="text"
                            value={event.title_mn || ''}
                            onChange={(e) => {
                              const updated = [...intro.timeline_events]
                              updated[index] = { ...updated[index], title_mn: e.target.value }
                              setIntro({ ...intro, timeline_events: updated })
                            }}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Үйл явдлын нэр (монголоор)"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1"> English</label>
                          <input
                            type="text"
                            value={event.title_en || ''}
                            onChange={(e) => {
                              const updated = [...intro.timeline_events]
                              updated[index] = { ...updated[index], title_en: e.target.value }
                              setIntro({ ...intro, timeline_events: updated })
                            }}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Event name (in English)"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Гарчгийн өнгө</label>
                          <input
                            type="color"
                            value={event.title_color || '#111827'}
                            onChange={(e) => {
                              const updated = [...intro.timeline_events]
                              updated[index] = { ...updated[index], title_color: e.target.value }
                              setIntro({ ...intro, timeline_events: updated })
                            }}
                            className="w-full h-10 rounded-lg border border-slate-300 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Short Description - Mongolian and English */}
                    <div className="border border-green-200 bg-green-50/30 rounded-lg p-3">
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Товч тайлбар</label>
                      <div className="grid gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1"> Монгол</label>
                          <textarea
                            value={event.short_mn || ''}
                            onChange={(e) => {
                              const updated = [...intro.timeline_events]
                              updated[index] = { ...updated[index], short_mn: e.target.value }
                              setIntro({ ...intro, timeline_events: updated })
                            }}
                            rows={2}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Товч тайлбар (монголоор)"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1"> English</label>
                          <textarea
                            value={event.short_en || ''}
                            onChange={(e) => {
                              const updated = [...intro.timeline_events]
                              updated[index] = { ...updated[index], short_en: e.target.value }
                              setIntro({ ...intro, timeline_events: updated })
                            }}
                            rows={2}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Short description (in English)"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Товч тайлбарын өнгө</label>
                          <input
                            type="color"
                            value={event.short_color || '#4b5563'}
                            onChange={(e) => {
                              const updated = [...intro.timeline_events]
                              updated[index] = { ...updated[index], short_color: e.target.value }
                              setIntro({ ...intro, timeline_events: updated })
                            }}
                            className="w-full h-10 rounded-lg border border-slate-300 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Detailed Description - Mongolian and English */}
                    <div className="border border-purple-200 bg-purple-50/30 rounded-lg p-3">
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Дэлгэрэнгүй тайлбар</label>
                      <div className="grid gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1"> Монгол</label>
                          <textarea
                            value={event.desc_mn || ''}
                            onChange={(e) => {
                              const updated = [...intro.timeline_events]
                              updated[index] = { ...updated[index], desc_mn: e.target.value }
                              setIntro({ ...intro, timeline_events: updated })
                            }}
                            rows={4}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Дэлгэрэнгүй тайлбар (монголоор)"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1"> English</label>
                          <textarea
                            value={event.desc_en || ''}
                            onChange={(e) => {
                              const updated = [...intro.timeline_events]
                              updated[index] = { ...updated[index], desc_en: e.target.value }
                              setIntro({ ...intro, timeline_events: updated })
                            }}
                            rows={4}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Detailed description (in English)"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Дэлгэрэнгүй тайлбарын өнгө</label>
                          <input
                            type="color"
                            value={event.desc_color || '#4b5563'}
                            onChange={(e) => {
                              const updated = [...intro.timeline_events]
                              updated[index] = { ...updated[index], desc_color: e.target.value }
                              setIntro({ ...intro, timeline_events: updated })
                            }}
                            className="w-full h-10 rounded-lg border border-slate-300 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex gap-3 sticky bottom-0 bg-white pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Хаах
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSave()
                  handleCloseEditModal()
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
              >
                Хадгалах
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}