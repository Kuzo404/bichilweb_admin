'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import Modal from '@/components/Modal'
import ImageUpload from '@/components/ImageUpload'
import { Input, Textarea, Select, Button } from '@/components/FormElements'
import RichTextEditor from '@/components/RichTextEditor'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { axiosInstance } from '@/lib/axios'
import axios from 'axios'

interface ApiTranslation {
  id?: number
  language: number
  label: string
  font: string
  family: string
  weight: string
  size: string
}

interface ApiImage {
  id?: number
  image: string
}

interface ApiSocial {
  id?: number
  social: string
  icon: string
}

interface ApiNewsItem {
  id: number
  category: number
  image: string
  image_url?: string
  video: string
  video_orientation: string
  facebook_url?: string
  feature: boolean
  render: boolean
  show_on_home: boolean
  readtime: number
  slug: string
  date: string
  images: ApiImage[]
  socials: ApiSocial[]
  title_translations: ApiTranslation[]
  shortdesc_translations: ApiTranslation[]
  content_translations: ApiTranslation[]
}

// ===== CATEGORY INTERFACES =====
interface CategoryTranslation {
  id: number
  language: number
  label: string
}

interface CategoryAPI {
  id: number
  translations: CategoryTranslation[]
}

interface Category {
  id: number
  label_mn: string
  label_en: string
}

interface NewsItem {
  id: string
  title_mn: string
  title_en: string
  slug: string
  excerpt_mn: string
  excerpt_en: string
  content_mn: string
  content_en: string
  titleTextColor: string
  titleTextSize: number
  titleFontWeight: string
  titleFontFamily: string
  excerptTextColor: string
  excerptTextSize: number
  excerptFontWeight: string
  excerptFontFamily: string
  contentTextColor: string
  contentTextSize: number
  contentFontWeight: string
  contentFontFamily: string
  bannerImage: string
  category: number
  publishedAt: string
  readTime: number
  isActive: boolean
  isPinnedNews: boolean
  isPinnedHome: boolean
  socialLinks: SocialLink[]
  additionalImages?: string[]
  videoUrl?: string
  videoOrientation?: string
  facebookUrl?: string
}

interface SocialLink {
  id: string
  platform: string
  url: string
  active: boolean
  icon: string
}

const SOCIAL_PLATFORMS = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'X (Twitter)' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'custom', label: 'Бусад' },
]

const renderPlatformSVG = (platform: string, className = 'w-4 h-4') => {
  const p = platform.toLowerCase()
  if (p === 'facebook') return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
  )
  if (p === 'instagram') return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
  )
  if (p === 'twitter' || p === 'x') return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.514l-5.106-6.694-5.979 6.694H2.42l7.728-8.835L1.497 2.25h6.886l4.612 6.105L17.457 2.25zM16.369 20.033h1.83L5.337 4.059H3.425l12.944 15.974z" /></svg>
  )
  if (p === 'youtube') return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
  )
  if (p === 'linkedin') return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
  )
  if (p === 'tiktok') return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
  )
  if (p === 'telegram') return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
  )
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
  )
}

const getTranslation = (translations: ApiTranslation[], language: number): ApiTranslation | undefined => {
  return translations.find(t => t.language === language)
}

const getCategoryTranslation = (translations: CategoryTranslation[], language: number): CategoryTranslation | undefined => {
  return translations.find(t => t.language === language)
}

const mapAPICategoryToCategory = (apiCategory: CategoryAPI): Category => {
  const labelMn = getCategoryTranslation(apiCategory.translations, 1)
  const labelEn = getCategoryTranslation(apiCategory.translations, 2)
  
  return {
    id: apiCategory.id,
    label_mn: labelMn?.label || '',
    label_en: labelEn?.label || '',
  }
}

const mapApiNewsToAdmin = (item: ApiNewsItem): NewsItem => {
  const titleMn = getTranslation(item.title_translations, 1)
  const titleEn = getTranslation(item.title_translations, 2)
  const excerptMn = getTranslation(item.shortdesc_translations, 1)
  const excerptEn = getTranslation(item.shortdesc_translations, 2)
  const contentMn = getTranslation(item.content_translations, 1)
  const contentEn = getTranslation(item.content_translations, 2)

  return {
    id: String(item.id),
    title_mn: titleMn?.label || '',
    title_en: titleEn?.label || '',
    slug: item.slug,
    excerpt_mn: excerptMn?.label || '',
    excerpt_en: excerptEn?.label || '',
    content_mn: contentMn?.label || '',
    content_en: contentEn?.label || '',
    titleTextColor: titleMn?.font || '#0f172a',
    titleTextSize: parseInt(titleMn?.size || '32'),
    titleFontWeight: titleMn?.weight || '700',
    titleFontFamily: titleMn?.family || 'Roboto',
    excerptTextColor: excerptMn?.font || '#0f172a',
    excerptTextSize: parseInt(excerptMn?.size || '16'),
    excerptFontWeight: excerptMn?.weight || '400',
    excerptFontFamily: excerptMn?.family || 'Roboto',
    contentTextColor: contentMn?.font || '#0f172a',
    contentTextSize: parseInt(contentMn?.size || '14'),
    contentFontWeight: contentMn?.weight || '400',
    contentFontFamily: contentMn?.family || 'Roboto',
    bannerImage: item.image_url || item.image,
    category: item.category,
    publishedAt: item.date,
    readTime: item.readtime,
    isActive: item.render,
    isPinnedNews: item.feature,
    isPinnedHome: item.show_on_home || false,
    socialLinks: item.socials.map((s, idx) => ({
      id: `${s.icon}-${idx}`,
      platform: s.icon,
      url: s.social,
      active: true,
      icon: '',
    })),
    additionalImages: item.images.map(img => img.image),
    videoUrl: item.video,
    videoOrientation: item.video_orientation || 'horizontal',
    facebookUrl: item.facebook_url || '',
  }
}

const urlToFile = async (url: string, filename: string): Promise<File | null> => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return new File([blob], filename, { type: blob.type })
  } catch (error) {
    console.error('Error converting URL to file:', error)
    return null
  }
}

const initialFormData = {
  title_mn: '',
  title_en: '',
  slug: '',
  excerpt_mn: '',
  excerpt_en: '',
  content_mn: '',
  content_en: '',
  titleTextColor: '#0f172a',
  titleTextSize: 32,
  titleFontWeight: '700',
  titleFontFamily: 'Roboto',
  excerptTextColor: '#0f172a',
  excerptTextSize: 16,
  excerptFontWeight: '400',
  excerptFontFamily: 'Roboto',
  contentTextColor: '#0f172a',
  contentTextSize: 14,
  contentFontWeight: '400',
  contentFontFamily: 'Roboto',
  bannerImage: '',
  category: 1,
  readTime: 5,
  isActive: true,
  isPinnedNews: false,
  isPinnedHome: false,
  socialLinks: [] as SocialLink[],
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [activeCategory, setActiveCategory] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [categoryTabs, setCategoryTabs] = useState<Category[]>([])
  const [categoryTabsBackup, setCategoryTabsBackup] = useState<Category[] | null>(null)
  const [newCategoryNameMn, setNewCategoryNameMn] = useState('')
  const [newCategoryNameEn, setNewCategoryNameEn] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  const [videoUrl, setVideoUrl] = useState('')
  const [videoOrientation, setVideoOrientation] = useState<'horizontal' | 'vertical'>('horizontal')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null)
  const [latestHeading, setLatestHeading] = useState('Сүүлийн мэдээнүүд')
  const [featuredHeading, setFeaturedHeading] = useState('Онцлох мэдээ')
  const [latestHeadingEn, setLatestHeadingEn] = useState('')
  const [featuredHeadingEn, setFeaturedHeadingEn] = useState('')
  const [headingSaving, setHeadingSaving] = useState(false)
  const [sectionLabelColor, setSectionLabelColor] = useState('#0d9488')
  const [sectionLabelSize, setSectionLabelSize] = useState('14px')
  const [headingColor, setHeadingColor] = useState('#111827')
  const [headingSize, setHeadingSize] = useState('48px')
  const [dividerColor, setDividerColor] = useState('#0d9488')
  const [buttonColor, setButtonColor] = useState('#0d9488')
  const [buttonTextColor, setButtonTextColor] = useState('#ffffff')
  const [buttonSize, setButtonSize] = useState('16px')

  useEffect(() => {
    fetchNews()
    fetchCategories()
    fetchPageSettings()
  }, [])

  useEffect(() => {
    if (!editingNews && formData.title_en) {
      const plainTitle = formData.title_en.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
      const autoSlug = plainTitle
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
      
      if (autoSlug && autoSlug !== formData.slug) {
        setFormData(prev => ({ ...prev, slug: autoSlug }))
      }
    }
  }, [formData.title_en, editingNews, formData.slug])

  const canAddCategory = newCategoryNameMn.trim().length > 0 && newCategoryNameEn.trim().length > 0

  const filteredNews = activeCategory === 0
    ? news
    : news.filter(item => item.category === activeCategory)

  const sortedNews = [...filteredNews].sort((a, b) => {
    const aPinned = a.isPinnedNews
    const bPinned = b.isPinnedNews
    if (aPinned === bPinned) {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    }
    return aPinned ? -1 : 1
  })

  const toEmbedUrl = (url: string) => {
    if (!url) return ''
    try {
      const u = new URL(url)
      const host = u.hostname.toLowerCase()
      // YouTube
      if (host.includes('youtube.com')) {
        const vid = u.searchParams.get('v')
        return vid ? `https://www.youtube.com/embed/${vid}` : ''
      }
      if (host === 'youtu.be') {
        const vid = u.pathname.replace('/', '')
        return vid ? `https://www.youtube.com/embed/${vid}` : ''
      }
      // Facebook video
      if (host.includes('facebook.com') || host.includes('fb.watch')) {
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`
      }
      // TikTok
      if (host.includes('tiktok.com')) {
        const match = url.match(/\/video\/(\d+)/)
        if (match) return `https://www.tiktok.com/embed/v2/${match[1]}`
        return url
      }
      // Instagram
      if (host.includes('instagram.com')) {
        const clean = url.split('?')[0].replace(/\/$/, '')
        return `${clean}/embed`
      }
      // Generic URL — return as-is for iframe embed
      return url
    } catch {
      return ''
    }
  }

  const isValidUrl = (url: string) => {
    try { new URL(url); return true } catch { return false }
  }

  const PinBadge = () => (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-black text-white shadow-sm" aria-label="Pinned">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 6.75h9m-7.5 0 1.5 4.5v4.5l3-2.25v-2.25l1.5-4.5m-6 0h6" />
      </svg>
    </span>
  )

  const derivePlatformFromUrl = (url: string) => {
    try {
      const host = new URL(url).hostname
      if (host.includes('facebook')) return 'facebook'
      if (host.includes('instagram')) return 'instagram'
      if (host.includes('twitter') || host === 'x.com' || host.endsWith('.x.com')) return 'twitter'
      if (host.includes('youtube')) return 'youtube'
      if (host.includes('linkedin')) return 'linkedin'
      return host.replace(/^www\./, '') || 'link'
    } catch {
      return 'link'
    }
  }

  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()

  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {}
    if (!stripHtml(formData.title_mn)) errors.title_mn = 'Монгол гарчиг оруулна уу'
    if (!stripHtml(formData.title_en)) errors.title_en = 'Англи гарчиг оруулна уу'
    if (!stripHtml(formData.excerpt_mn)) errors.excerpt_mn = 'Монгол товч тайлбар оруулна уу'
    if (!stripHtml(formData.excerpt_en)) errors.excerpt_en = 'Англи товч тайлбар оруулна уу'
    if (!stripHtml(formData.content_mn)) errors.content_mn = 'Монгол агуулга оруулна уу'
    if (!stripHtml(formData.content_en)) errors.content_en = 'Англи агуулга оруулна уу'
    if (!formData.bannerImage && !bannerImageFile) errors.bannerImage = 'Үндсэн зураг заавал оруулна уу'

    const invalidLinks = (formData.socialLinks || []).filter((link) => {
      if (!link.active) return false  // Only validate active links
      try { new URL(link.url); return false } catch { return true }
    })
    if (invalidLinks.length > 0) errors.socialLinks = 'Сошиал холбооснуудын URL буруу байна'
    if (videoUrl && !isValidUrl(videoUrl)) errors.video = 'Видео URL буруу байна'

    if (formData.isPinnedNews && !editingNews) {
      const pinnedInCategory = news.filter(item => item.isPinnedNews && item.category === formData.category).length
      if (pinnedInCategory >= 1) errors.pinnedNews = `Энэ ангилалд аль хэдийн онцлох мэдээ байгаа`
    }
    if (editingNews && formData.isPinnedNews) {
      const pinnedInCategory = news.filter(item => item.isPinnedNews && item.category === formData.category && item.id !== editingNews.id).length
      if (pinnedInCategory >= 1) errors.pinnedNews = `Энэ ангилалд аль хэдийн онцлох мэдээ байгаа`
    }

    setFormErrors(errors)
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      const errorList = Object.values(errors).filter(Boolean)
      setErrorMessage(errorList.length > 0 ? errorList[0] : 'Маягтыг шалгаж дахин оруулна уу')
      return
    }

    setIsSaving(true)
    try {
      const formDataToSend = new FormData()

      formDataToSend.append('category', formData.category.toString())
      formDataToSend.append('video', videoUrl || '')
      formDataToSend.append('video_orientation', videoOrientation)
      formDataToSend.append('facebook_url', facebookUrl || '')
      formDataToSend.append('feature', formData.isPinnedNews.toString())
      formDataToSend.append('render', formData.isActive.toString())
      formDataToSend.append('show_on_home', formData.isPinnedHome.toString())
      formDataToSend.append('readtime', formData.readTime.toString())
      formDataToSend.append('slug', formData.slug || '')
      formDataToSend.append('date', new Date().toISOString())

      if (bannerImageFile) {
        formDataToSend.append('image', bannerImageFile)
      }

      // Add nested data as JSON strings
      formDataToSend.append('images', JSON.stringify(
        additionalImages.map(img => ({ image: img }))
      ))

      formDataToSend.append('socials', JSON.stringify(
        (formData.socialLinks || []).filter((link: SocialLink) => link.active).map((link: SocialLink) => ({
          social: link.url,
          icon: link.platform,
        }))
      ))

      console.log('📤 Socials being sent:', JSON.stringify(
        (formData.socialLinks || []).filter((link: SocialLink) => link.active).map((link: SocialLink) => ({
          social: link.url,
          icon: link.platform,
        }))
      ))

      formDataToSend.append('title_translations', JSON.stringify([
        {
          language: 1,
          label: formData.title_mn,
          font: formData.titleTextColor,
          family: formData.titleFontFamily,
          weight: formData.titleFontWeight,
          size: formData.titleTextSize.toString(),
        },
        {
          language: 2,
          label: formData.title_en,
          font: formData.titleTextColor,
          family: formData.titleFontFamily,
          weight: formData.titleFontWeight,
          size: formData.titleTextSize.toString(),
        },
      ]))

      formDataToSend.append('shortdesc_translations', JSON.stringify([
        {
          language: 1,
          label: formData.excerpt_mn,
          font: formData.excerptTextColor,
          family: formData.excerptFontFamily,
          weight: formData.excerptFontWeight,
          size: formData.excerptTextSize.toString(),
        },
        {
          language: 2,
          label: formData.excerpt_en,
          font: formData.excerptTextColor,
          family: formData.excerptFontFamily,
          weight: formData.excerptFontWeight,
          size: formData.excerptTextSize.toString(),
        },
      ]))

      formDataToSend.append('content_translations', JSON.stringify([
        {
          language: 1,
          label: formData.content_mn,
          font: formData.contentTextColor,
          family: formData.contentFontFamily,
          weight: formData.contentFontWeight,
          size: formData.contentTextSize.toString(),
        },
        {
          language: 2,
          label: formData.content_en,
          font: formData.contentTextColor,
          family: formData.contentFontFamily,
          weight: formData.contentFontWeight,
          size: formData.contentTextSize.toString(),
        },
      ]))

      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'
      if (editingNews) {
        await axios.put(`${apiBase}/news/${editingNews.id}/`, formDataToSend, {
          timeout: 30000,
        })
        setSuccessMessage('Мэдээ амжилттай шинэчлэгдлээ')
      } else {
        await axios.post(`${apiBase}/news/`, formDataToSend, {
          timeout: 30000,
        })
        setSuccessMessage('Шинэ мэдээ амжилттай нэмэгдлээ')
      }
      
      await fetchNews()
      setTimeout(() => { handleCloseModal(); setSuccessMessage('') }, 1500)
    } catch (error: any) {
      console.log('Response status:', error?.response?.status)
      console.log('Response data:', JSON.stringify(error?.response?.data))
      console.error('Submit error:', error)
      let errorMsg = editingNews ? 'Шинэчлэхэд алдаа гарлаа' : 'Үүсгэхэд алдаа гарлаа'
      
      if (error.response?.data) {
        const errorData = error.response.data
        if (errorData.feature) errorMsg = Array.isArray(errorData.feature) ? errorData.feature[0] : errorData.feature
        else if (errorData.slug) errorMsg = 'Slug давхцаж байна. Өөр нэр сонгоно уу.'
        else if (errorData.detail) errorMsg = errorData.detail
        else if (errorData.non_field_errors) errorMsg = Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors
      }
      
      setErrorMessage(errorMsg)
      setTimeout(() => setErrorMessage(''), 4000)
    } finally {
      setIsSaving(false)
    }
  }

  const fetchNews = async () => {
    try {
      const response = await axiosInstance.get('/news/')
      const data: ApiNewsItem[] = response.data
      setNews(data.map(mapApiNewsToAdmin))
    } catch (error) {
      console.error('Failed to fetch news:', error)
      setErrorMessage('Мэдээг ачаалахад алдаа гарлаа')
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get<CategoryAPI[]>('/news-category/')
      const transformedCategories = response.data.map(mapAPICategoryToCategory)
      setCategoryTabs(transformedCategories)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchPageSettings = async () => {
    try {
      const response = await axiosInstance.get('/news-page-settings/')
      setLatestHeading(response.data.latest_heading || 'Сүүлийн мэдээнүүд')
      setFeaturedHeading(response.data.featured_heading || 'Онцлох мэдээ')
      setLatestHeadingEn(response.data.latest_heading_en || '')
      setFeaturedHeadingEn(response.data.featured_heading_en || '')
      setSectionLabelColor(response.data.section_label_color || '#0d9488')
      setSectionLabelSize(response.data.section_label_size || '14px')
      setHeadingColor(response.data.heading_color || '#111827')
      setHeadingSize(response.data.heading_size || '48px')
      setDividerColor(response.data.divider_color || '#0d9488')
      setButtonColor(response.data.button_color || '#0d9488')
      setButtonTextColor(response.data.button_text_color || '#ffffff')
      setButtonSize(response.data.button_size || '16px')
    } catch (error) {
      console.error('Failed to fetch page settings:', error)
    }
  }

  const savePageSettings = async () => {
    setHeadingSaving(true)
    try {
      await axiosInstance.put('/news-page-settings/', {
        latest_heading: latestHeading,
        featured_heading: featuredHeading,
        latest_heading_en: latestHeadingEn,
        featured_heading_en: featuredHeadingEn,
        section_label_color: sectionLabelColor,
        section_label_size: sectionLabelSize,
        heading_color: headingColor,
        heading_size: headingSize,
        divider_color: dividerColor,
        button_color: buttonColor,
        button_text_color: buttonTextColor,
        button_size: buttonSize,
      })
      setSuccessMessage('Гарчиг амжилттай хадгалагдлаа')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Failed to save page settings:', error)
      setErrorMessage('Гарчиг хадгалахад алдаа гарлаа')
      setTimeout(() => setErrorMessage(''), 3000)
    } finally {
      setHeadingSaving(false)
    }
  }

  const handleEdit = (item: NewsItem) => {
    setEditingNews(item)
    setFormData({
      title_mn: item.title_mn,
      title_en: item.title_en,
      slug: item.slug,
      excerpt_mn: item.excerpt_mn,
      excerpt_en: item.excerpt_en,
      content_mn: item.content_mn,
      content_en: item.content_en,
      titleTextColor: item.titleTextColor || '#0f172a',
      titleTextSize: item.titleTextSize || 32,
      titleFontWeight: item.titleFontWeight || '700',
      titleFontFamily: item.titleFontFamily || 'Roboto',
      excerptTextColor: item.excerptTextColor || '#0f172a',
      excerptTextSize: item.excerptTextSize || 16,
      excerptFontWeight: item.excerptFontWeight || '400',
      excerptFontFamily: item.excerptFontFamily || 'Roboto',
      contentTextColor: item.contentTextColor || '#0f172a',
      contentTextSize: item.contentTextSize || 14,
      contentFontWeight: item.contentFontWeight || '400',
      contentFontFamily: item.contentFontFamily || 'Roboto',
      bannerImage: item.bannerImage,
      category: item.category,
      readTime: item.readTime || 5,
      isActive: item.isActive,
      isPinnedNews: item.isPinnedNews,
      isPinnedHome: item.isPinnedHome,
      socialLinks: item.socialLinks || [],
    })
    setAdditionalImages(item.additionalImages || [])
    setVideoUrl(item.videoUrl || '')
    setVideoOrientation((item.videoOrientation as 'horizontal' | 'vertical') || 'horizontal')
    setFacebookUrl(item.facebookUrl || '')
    setBannerImageFile(null)
    setModalOpen(true)
  }

  const handleDelete = async (item: NewsItem) => {
    if (confirm('Энэ мэдээг устгахыг сайн дүгнэлээ?')) {
      setIsDeleting(item.id)
      try {
        await axiosInstance.delete(`/news/${item.id}/`)
        setNews(news.filter(n => n.id !== item.id))
        setSuccessMessage('Мэдээ амжилттай устгалаа')
        setTimeout(() => setSuccessMessage(''), 3000)
      } catch (error) {
        console.error(error)
        setErrorMessage('Устгахад алдаа гарлаа')
        setTimeout(() => setErrorMessage(''), 3000)
      } finally {
        setIsDeleting(null)
      }
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingNews(null)
    setFormData(initialFormData)
    setFormErrors({})
    setErrorMessage('')
    setSuccessMessage('')
    setAdditionalImages([])
    setVideoUrl('')
    setVideoOrientation('horizontal')
    setFacebookUrl('')
    setBannerImageFile(null)
  }

  const handleBannerImageChange = (url: string, file?: File) => {
    setFormData({ ...formData, bannerImage: url })
    if (formErrors.bannerImage) setFormErrors({ ...formErrors, bannerImage: '' })
    
    // Use original File directly if provided, avoid URL round-trip
    if (file) {
      setBannerImageFile(file)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryNameMn.trim() || !newCategoryNameEn.trim()) {
      alert('Ангиллын нэрийг Монгол болон Англиар оруулна уу!')
      return
    }

    try {
      const response = await axiosInstance.post('/news-category/', {
        translations: [
          { language: 1, label: newCategoryNameMn.trim() },
          { language: 2, label: newCategoryNameEn.trim() },
        ],
      })

      const newCategoryData: CategoryAPI = response.data
      const newCategory = mapAPICategoryToCategory(newCategoryData)

      setCategoryTabs([...categoryTabs, newCategory])
      setNewCategoryNameMn('')
      setNewCategoryNameEn('')
      setShowAddCategory(false)
      setSuccessMessage('Ангилал амжилттай үүсгэлээ')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Failed to add category:', error)
      setErrorMessage('Ангилал үүсгэхэд алдаа гарлаа')
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Энэ ангиллыг устгахыг сайн дүгнэлээ?')) return

    try {
      await axiosInstance.delete(`/news-category/${id}/`)
      setCategoryTabs(categoryTabs.filter((cat) => cat.id !== id))
      setSuccessMessage('Ангилал амжилттай устгалаа')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: any) {
      console.error('Failed to delete category:', error)
      const errorMsg = error.response?.data?.detail || 'Ангилал устгахад алдаа гарлаа'
      alert(errorMsg)
      setErrorMessage(errorMsg)
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  const handleAddSocialLink = () => {
    const urlInput = document.getElementById('new-social-url') as HTMLInputElement
    const platformSelect = document.getElementById('new-social-platform') as HTMLSelectElement
    const iconInput = document.getElementById('new-social-icon') as HTMLInputElement
    const newSocialUrl = urlInput?.value?.trim() || ''
    const selectedPlatform = platformSelect?.value || ''
    const customIcon = iconInput?.value?.trim() || ''
    
    if (!newSocialUrl) {
      alert('URL оруулна уу')
      return
    }

    const platform = selectedPlatform || derivePlatformFromUrl(newSocialUrl)

    const newLink: SocialLink = {
      id: `${Date.now()}`,
      platform,
      url: newSocialUrl,
      active: true,
      icon: customIcon || '',
    }

    setFormData({
      ...formData,
      socialLinks: [...(formData.socialLinks || []), newLink],
    })
    
    if (urlInput) urlInput.value = ''
    if (iconInput) iconInput.value = ''
    if (platformSelect) platformSelect.value = ''
  }

  const handleToggleSocialLink = (id: string) => {
    setFormData({
      ...formData,
      socialLinks: (formData.socialLinks || []).map((link) =>
        link.id === id ? { ...link, active: !link.active } : link
      ),
    })
  }

  const handleDeleteSocialLink = (id: string) => {
    setFormData({
      ...formData,
      socialLinks: (formData.socialLinks || []).filter((link) => link.id !== id),
    })
  }

  const renderSocialIcon = (icon?: string, platform?: string) => {
    const content = icon?.trim()
    if (content && content.startsWith('<svg')) {
      return <span className="inline-flex w-4 h-4 items-center justify-center" aria-hidden dangerouslySetInnerHTML={{ __html: content }} />
    }
    if (content && (content.startsWith('http://') || content.startsWith('https://'))) {
      return <img src={content} alt={platform || 'icon'} className="w-4 h-4 object-contain" />
    }
    return <span className="inline-flex items-center justify-center text-gray-600">{renderPlatformSVG(platform || '')}</span>
  }

  return (
    <AdminLayout title="Мэдээ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error/Success Messages */}
        {errorMessage && (
          <div className="fixed top-4 right-4 z-50 animate-fade-in">
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 shadow-lg flex items-start gap-3 max-w-sm">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="font-medium text-red-900">Алдаа</h3>
                <p className="text-sm text-red-800 mt-0.5">{errorMessage}</p>
              </div>
              <button onClick={() => setErrorMessage('')} className="flex-shrink-0 text-red-400 hover:text-red-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="fixed top-4 right-4 z-50 animate-fade-in">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200 shadow-lg flex items-start gap-3 max-w-sm">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="font-medium text-green-900">Амжилттай</h3>
                <p className="text-sm text-green-800 mt-0.5">{successMessage}</p>
              </div>
              <button onClick={() => setSuccessMessage('')} className="flex-shrink-0 text-green-400 hover:text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Мэдээ мэдээлэл</h1>
            <p className="text-sm text-gray-500 mt-1">Компанийн мэдээ, мэдээлэл удирдах</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
          >
            <PlusIcon className="h-5 w-5" />
            Шинэ мэдээ
          </button>
        </div>

        {/* Page Heading Settings */}
        <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Хуудасны гарчиг тохиргоо</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">&quot;Онцлох мэдээ&quot; гарчиг</label>
              <input
                type="text"
                value={featuredHeading}
                onChange={(e) => setFeaturedHeading(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">&quot;Онцлох мэдээ&quot; гарчиг (Англи)</label>
              <input
                type="text"
                value={featuredHeadingEn}
                onChange={(e) => setFeaturedHeadingEn(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Featured News"
              />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 items-end mt-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">&quot;Сүүлийн мэдээнүүд&quot; гарчиг</label>
              <input
                type="text"
                value={latestHeading}
                onChange={(e) => setLatestHeading(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">&quot;Сүүлийн мэдээнүүд&quot; гарчиг (Англи)</label>
              <input
                type="text"
                value={latestHeadingEn}
                onChange={(e) => setLatestHeadingEn(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Latest News"
              />
            </div>
          </div>

          {/* Style Settings */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Загвар тохиргоо</h4>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">&quot;Онцолсон мэдээ&quot; текст өнгө</label>
                <div className="flex gap-2">
                  <input type="color" value={sectionLabelColor} onChange={(e) => setSectionLabelColor(e.target.value)} className="w-10 h-[38px] rounded border border-gray-300 cursor-pointer" />
                  <input type="text" value={sectionLabelColor} onChange={(e) => setSectionLabelColor(e.target.value)} className="flex-1 px-2 py-1.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">&quot;Онцолсон мэдээ&quot; текст хэмжээ</label>
                <input type="text" value={sectionLabelSize} onChange={(e) => setSectionLabelSize(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="14px" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">&quot;Мэдээ&quot; гарчиг өнгө</label>
                <div className="flex gap-2">
                  <input type="color" value={headingColor} onChange={(e) => setHeadingColor(e.target.value)} className="w-10 h-[38px] rounded border border-gray-300 cursor-pointer" />
                  <input type="text" value={headingColor} onChange={(e) => setHeadingColor(e.target.value)} className="flex-1 px-2 py-1.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">&quot;Мэдээ&quot; гарчиг хэмжээ</label>
                <input type="text" value={headingSize} onChange={(e) => setHeadingSize(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="48px" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Зураас өнгө</label>
                <div className="flex gap-2">
                  <input type="color" value={dividerColor} onChange={(e) => setDividerColor(e.target.value)} className="w-10 h-[38px] rounded border border-gray-300 cursor-pointer" />
                  <input type="text" value={dividerColor} onChange={(e) => setDividerColor(e.target.value)} className="flex-1 px-2 py-1.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Товч дэвсгэр өнгө</label>
                <div className="flex gap-2">
                  <input type="color" value={buttonColor} onChange={(e) => setButtonColor(e.target.value)} className="w-10 h-[38px] rounded border border-gray-300 cursor-pointer" />
                  <input type="text" value={buttonColor} onChange={(e) => setButtonColor(e.target.value)} className="flex-1 px-2 py-1.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Товч текст өнгө</label>
                <div className="flex gap-2">
                  <input type="color" value={buttonTextColor} onChange={(e) => setButtonTextColor(e.target.value)} className="w-10 h-[38px] rounded border border-gray-300 cursor-pointer" />
                  <input type="text" value={buttonTextColor} onChange={(e) => setButtonTextColor(e.target.value)} className="flex-1 px-2 py-1.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Товч текст хэмжээ</label>
                <input type="text" value={buttonSize} onChange={(e) => setButtonSize(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="16px" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={savePageSettings}
              disabled={headingSaving}
              className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 h-[38px]"
            >
              {headingSaving ? 'Хадгалж байна...' : 'Тохиргоо хадгалах'}
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setActiveCategory(0)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === 0 ? 'bg-teal-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Бүгд
            </button>
            
            {categoryTabs.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat.id ? 'bg-teal-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.label_mn}
              </button>
            ))}
            <button
              onClick={() => setShowAddCategory(!showAddCategory)}
              className="px-5 py-2.5 rounded-full text-sm font-medium bg-teal-600 text-white transition-all duration-300 flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Шинэ ангилал
            </button>
          </div>

          {/* Category Management Panel */}
          {showAddCategory && (
            <div className="mb-4 rounded-lg border border-gray-200 bg-white shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                <PlusIcon className="h-4 w-4 text-gray-500" />
                Шинэ ангилал нэмэх
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  type="text"
                  value={newCategoryNameMn}
                  onChange={(e) => setNewCategoryNameMn(e.target.value)}
                  placeholder="Нэр (MN)"
                  maxLength={50}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  autoFocus
                />
                <input
                  type="text"
                  value={newCategoryNameEn}
                  onChange={(e) => setNewCategoryNameEn(e.target.value)}
                  placeholder="Name (EN)"
                  maxLength={50}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddCategory}
                  disabled={!canAddCategory}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg transition-colors font-medium shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Нэмэх
                </button>
                <button
                  onClick={() => setShowAddCategory(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Цуцлах
                </button>
              </div>

              {categoryTabs.length > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-2">Одоо байгаа ангиллууд</div>
                  <div className="space-y-2">
                    {categoryTabs.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900">{cat.label_mn}</div>
                            <div className="text-xs text-gray-600">{cat.label_en}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-2 rounded-lg bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-colors shrink-0"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sortedNews.map((item) => (
            <div key={item.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="relative aspect-4/3 overflow-hidden bg-gray-100">
                {item.bannerImage ? (
                  <Image src={item.bannerImage} alt={stripHtml(item.title_mn)} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {item.isPinnedNews && (
                  <span className="absolute top-2 left-2"><PinBadge /></span>
                )}

                {item.isPinnedHome && (
                  <span className="absolute top-2 left-2 mt-7 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">Нүүр</span>
                )}

                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(item)} disabled={isSaving || isDeleting === item.id} className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                    <PencilIcon className="h-4 w-4 text-gray-700" />
                  </button>
                  <button onClick={() => handleDelete(item)} disabled={isSaving || isDeleting !== null} className="p-2 bg-white rounded-lg shadow-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                    {isDeleting === item.id ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin" />
                    ) : (
                      <TrashIcon className="h-4 w-4 text-red-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="px-2.5 py-1 rounded-lg font-medium bg-teal-600 text-white">
                    {categoryTabs.find((c) => c.id === item.category)?.label_mn || 'Ангилал'}
                  </span>
                  <span className="text-slate-500">{new Date(item.publishedAt).toLocaleDateString('mn-MN')}</span>
                </div>
                <h3 className="font-semibold text-slate-800 line-clamp-2 mb-2">{stripHtml(item.title_mn)}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{stripHtml(item.excerpt_mn)}</p>
                {(item.socialLinks && item.socialLinks.length > 0) && (
                  <div className="flex flex-wrap gap-2 mt-3 text-xs text-slate-600">
                    {item.socialLinks.filter((link) => link.active).map((link) => (
                      <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                        {renderSocialIcon(link.icon, link.platform)}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {sortedNews.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-1">Мэдээ олдсонгүй</h3>
            <p className="text-slate-500">Энэ төрлийн мэдээ одоогоор байхгүй байна.</p>
          </div>
        )}
      </div>

      {/* Modal - News Form */}
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingNews ? 'Мэдээ засах' : 'Шинэ мэдээ'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-5 pb-4">
          
          {/* Title Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-base font-semibold text-gray-900 mb-4">Гарчиг (Title)</h4>
            <div className="space-y-4">
              <RichTextEditor 
                label="Гарчиг (Монгол)" 
                value={formData.title_mn} 
                onChange={(html) => { 
                  setFormData({ ...formData, title_mn: html })
                  if (formErrors.title_mn) setFormErrors({ ...formErrors, title_mn: '' }) 
                }} 
                placeholder="Мэдээний гарчиг" 
                error={formErrors.title_mn} 
                minHeight="60px"
              />
              <RichTextEditor 
                label="Гарчиг (English)" 
                value={formData.title_en} 
                onChange={(html) => { 
                  setFormData({ ...formData, title_en: html })
                  if (formErrors.title_en) setFormErrors({ ...formErrors, title_en: '' }) 
                }} 
                placeholder="News title" 
                error={formErrors.title_en} 
                minHeight="60px"
              />
            </div>
          </div>

          {/* Excerpt Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-base font-semibold text-gray-900 mb-4">Товч тайлбар (Summary)</h4>
            <div className="space-y-4">
              <RichTextEditor 
                label="Товч тайлбар (Монгол)" 
                value={formData.excerpt_mn} 
                onChange={(html) => { 
                  setFormData({ ...formData, excerpt_mn: html })
                  if (formErrors.excerpt_mn) setFormErrors({ ...formErrors, excerpt_mn: '' }) 
                }} 
                error={formErrors.excerpt_mn} 
                minHeight="80px"
                placeholder="Мэдээний товч тайлбар..." 
              />
              <RichTextEditor 
                label="Товч тайлбар (English)" 
                value={formData.excerpt_en} 
                onChange={(html) => { 
                  setFormData({ ...formData, excerpt_en: html })
                  if (formErrors.excerpt_en) setFormErrors({ ...formErrors, excerpt_en: '' }) 
                }} 
                error={formErrors.excerpt_en} 
                minHeight="80px"
                placeholder="Brief description..." 
              />
            </div>
          </div>

          {/* Content Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-base font-semibold text-gray-900 mb-4">Агуулга (Content)</h4>
            <div className="space-y-4">
              <RichTextEditor 
                label="Агуулга (Монгол)" 
                value={formData.content_mn} 
                onChange={(html) => { 
                  setFormData({ ...formData, content_mn: html })
                  if (formErrors.content_mn) setFormErrors({ ...formErrors, content_mn: '' }) 
                }} 
                error={formErrors.content_mn} 
                minHeight="200px" 
                placeholder="Мэдээний дэлгэрэнгүй агуулга..." 
              />
              <RichTextEditor 
                label="Агуулга (English)" 
                value={formData.content_en} 
                onChange={(html) => { 
                  setFormData({ ...formData, content_en: html })
                  if (formErrors.content_en) setFormErrors({ ...formErrors, content_en: '' }) 
                }} 
                error={formErrors.content_en} 
                minHeight="200px" 
                placeholder="Detailed content..." 
              />
            </div>
          </div>

          {/* Banner Image */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-base font-semibold text-gray-900 mb-4">Үндсэн зураг (Заавал)</h4>
            <ImageUpload 
              label="Үндсэн зураг нэмэх" 
              value={formData.bannerImage} 
              onChange={handleBannerImageChange}
              skipUpload
            />
            {formErrors.bannerImage && (
              <p className="mt-2 text-sm text-red-600">{formErrors.bannerImage}</p>
            )}
          </div>

          {/* Additional Images */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h5 className="text-base font-semibold text-gray-900 mb-4">Нэмэлт зургууд</h5>
            
            <div className="mb-4">
              <ImageUpload 
                label="Зураг нэмэх" 
                value="" 
                onChange={(url) => { 
                  if (url && !additionalImages.includes(url)) 
                    setAdditionalImages([...additionalImages, url]) 
                }} 
              />
            </div>

            {additionalImages.length > 0 && (
              <div className="grid gap-3 grid-cols-3">
                {additionalImages.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <div className="bg-gray-100 rounded-lg aspect-square overflow-hidden flex items-center justify-center border-2 border-gray-300">
                      <img src={img} alt={`Зураг ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute top-2 left-2 bg-gray-900 text-white text-xs font-semibold px-2 py-1 rounded-full">{idx + 1}</div>
                    <button 
                      type="button" 
                      onClick={() => setAdditionalImages(additionalImages.filter((_, i) => i !== idx))} 
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg text-xs opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h5 className="text-base font-semibold text-gray-900 mb-4">Видео (YouTube, Facebook, TikTok, Instagram...)</h5>
            <Input 
              label="Видео URL" 
              value={videoUrl} 
              onChange={(e) => setVideoUrl(e.target.value)} 
              placeholder="https://www.youtube.com/watch?v=... эсвэл бусад видео линк" 
              error={formErrors.video} 
            />
            {videoUrl && (
              <div className="mt-3 flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Видео чиглэл:</span>
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setVideoOrientation('horizontal')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      videoOrientation === 'horizontal'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    ⬜ Хэвтээ
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoOrientation('vertical')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      videoOrientation === 'vertical'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    ⬜ Босоо
                  </button>
                </div>
              </div>
            )}
            {videoUrl && toEmbedUrl(videoUrl) && (
              <div className={`mt-4 rounded-lg border border-gray-200 overflow-hidden bg-black flex items-center justify-center ${videoOrientation === 'vertical' ? 'max-w-[300px] mx-auto' : ''}`} style={{ maxHeight: '400px' }}>
                <iframe 
                  src={toEmbedUrl(videoUrl)} 
                  title="preview-video" 
                  className={videoOrientation === 'vertical' ? 'w-full' : 'w-full'}
                  style={{ aspectRatio: videoOrientation === 'vertical' ? '9/16' : '16/9', maxHeight: '400px' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen 
                />
              </div>
            )}
          </div>

          {/* Facebook Post Embed */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h5 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              Facebook пост оруулах
            </h5>
            <p className="text-xs text-gray-500 mb-3">
              Facebook пост-ийн линкийг оруулбал мэдээний дотор Facebook пост embed хэлбэрээр харагдана.
            </p>
            <Input 
              label="Facebook Post URL" 
              value={facebookUrl} 
              onChange={(e) => setFacebookUrl(e.target.value)} 
              placeholder="https://www.facebook.com/username/posts/123456789..." 
            />
            {facebookUrl && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  Facebook пост embed хэлбэрээр харагдана
                </p>
                <p className="text-xs text-blue-600 mt-1 break-all">{facebookUrl}</p>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-base font-semibold text-gray-900 mb-4">Сонголт (Settings)</h4>
            <div className="space-y-4">
              <div>
                <Input 
                  label="Slug (URL)" 
                  value={formData.slug} 
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })} 
                  placeholder="sustainability-report-2024" 
                />
                <p className="mt-1 text-xs text-gray-400">
                  Англи нэрийг зайгүй, жижиг үсгээр бичнэ. Жишээ: <span className="font-mono text-gray-500">my-news-title</span>. 
                  Энэ нь мэдээний вэб хаяг болно: <span className="font-mono text-gray-500">site.mn/news/<span className="text-teal-600">slug</span></span>. 
                  Хоосон орхивол англи гарчигаас автоматаар үүснэ.
                </p>
              </div>
              <Select 
                label="Ангилал" 
                value={formData.category} 
                onChange={(e) => setFormData({ ...formData, category: Number(e.target.value) })} 
                options={categoryTabs.map(cat => ({ value: cat.id, label: cat.label_mn }))} 
              />
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-800">Унших минут</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min={1} 
                    max={20} 
                    step={1} 
                    value={formData.readTime || 5} 
                    onChange={(e) => setFormData({ ...formData, readTime: Number(e.target.value) })} 
                    className="flex-1" 
                  />
                  <input 
                    type="number" 
                    min={1} 
                    max={20} 
                    value={formData.readTime || 5} 
                    onChange={(e) => setFormData({ ...formData, readTime: Number(e.target.value) || 5 })} 
                    className="w-16 rounded border border-gray-200 px-2 py-2 text-sm" 
                  />
                  <span className="text-sm text-gray-500">мин</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input 
                  id="pin-news" 
                  type="checkbox" 
                  checked={formData.isPinnedNews} 
                  onChange={(e) => { 
                    setFormData({ ...formData, isPinnedNews: e.target.checked })
                    if (formErrors.pinnedNews) setFormErrors({ ...formErrors, pinnedNews: '' }) 
                  }} 
                  className="h-4 w-4 text-teal-600 rounded" 
                />
                <label htmlFor="pin-news" className="text-sm font-semibold text-gray-900">
                  Онцлох (Мэдээ хуудас)
                </label>
              </div>
              {formErrors.pinnedNews && <p className="text-xs text-red-600">{formErrors.pinnedNews}</p>}

              <div className="flex items-center gap-3">
                <input 
                  id="show-on-home" 
                  type="checkbox" 
                  checked={formData.isPinnedHome} 
                  onChange={(e) => setFormData({ ...formData, isPinnedHome: e.target.checked })} 
                  className="h-4 w-4 text-teal-600 rounded" 
                />
                <label htmlFor="show-on-home" className="text-sm font-semibold text-gray-900">
                  Нүүр хуудсанд харуулах
                </label>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-base font-semibold text-gray-900 mb-1">Сошиал холбоос</h4>
            <p className="text-xs text-gray-500 mb-3">Мэдээтэй холбоотой сошиал суваг нэмнэ үү. Хэрэглэгч дарахад тухайн суваг руу үсэрнэ.</p>
            <div className="grid gap-3 md:grid-cols-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Суваг</label>
                <select id="new-social-platform" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500">
                  <option value="">Авто таних</option>
                  {SOCIAL_PLATFORMS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <Input 
                  id="new-social-url"
                  label="URL" 
                  placeholder="https://facebook.com/yourpage" 
                />
              </div>
              <Button 
                type="button" 
                onClick={handleAddSocialLink}
              >
                + Нэмэх
              </Button>
            </div>
            <div className="mt-2">
              <Input 
                id="new-social-icon"
                label="Icon (SVG эсвэл зургийн URL, сонгон)" 
                placeholder="https://example.com/icon.png эсвэл <svg>...</svg>" 
              />
            </div>

            {(formData.socialLinks || []).length > 0 && (
              <div className="mt-4 space-y-2">
                {(formData.socialLinks || []).map((link) => (
                  <div key={link.id} className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 transition-colors ${link.active ? 'border-gray-200 bg-gray-50' : 'border-gray-100 bg-gray-100 opacity-50'}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <input 
                        type="checkbox" 
                        checked={link.active} 
                        onChange={() => handleToggleSocialLink(link.id)} 
                        className="h-4 w-4 rounded text-teal-600" 
                      />
                      {renderSocialIcon(link.icon, link.platform)}
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 capitalize">{SOCIAL_PLATFORMS.find(p => p.value === link.platform)?.label || link.platform}</div>
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-xs text-teal-700 hover:underline block truncate max-w-[280px]"
                        >
                          {link.url}
                        </a>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleDeleteSocialLink(link.id)} 
                      className="p-2 rounded-lg bg-white text-red-600 border border-red-200 hover:bg-red-50 flex-shrink-0"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end border-t border-gray-200 pt-4">
            <button 
              type="button" 
              onClick={handleCloseModal} 
              disabled={isSaving} 
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Цуцлах
            </button>
            <button 
              type="submit" 
              disabled={isSaving} 
              className="px-6 py-2.5 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Хадгалж байна...
                </>
              ) : (
                editingNews ? 'Шинэчлэх' : 'Нэмэх'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  )
}