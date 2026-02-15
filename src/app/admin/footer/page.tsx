'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Input, PageHeader } from '@/components/FormElements'
import ImageUpload from '@/components/ImageUpload'
import { SaveResetButtons } from '@/components/SaveResetButtons'
import { axiosInstance } from '@/lib/axios'
import { useLanguage } from '@/contexts/LanguageContext'

type LogoType = 'upload' | 'url' | 'svg'

interface LogoImage {
  type: LogoType
  value: string
}

type SocialType = 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'telegram'

interface SocialLink {
  id?: number
  social: SocialType
  url: string
  index?: number
  active?: boolean
}

interface QuickLink {
  id?: number
  nameen: string
  namemn: string
  url: string
}

// 🔧 Backend API Response Type
interface FooterDataBackend {
  id?: number
  logotext: string
  logo?: string
  logo_url?: string
  svg?: string
  descmn: string
  descen: string
  locationmn: string
  locationen: string
  email: string
  phone: string
  bgcolor: string
  fontcolor: string
  featurecolor: string
  socialiconcolor: string
  titlesize: string
  fontsize: string
  copyrighten: string
  copyrightmn: string
  socials: SocialLink[]
  urls: QuickLink[]
}

// 🔧 Frontend State Type
interface FooterDataFrontend {
  logoText: string
  logoImage: LogoImage
  logoFile?: File
  description: { mn: string; en: string }
  address: { mn: string; en: string }
  email: string
  phone: string
  socials: SocialLink[]
  quick_links: QuickLink[]
  copyright: { mn: string; en: string }
  bgColor: string
  textColor: string
  accentColor: string
  titleSize: string
  textSize: string
  iconColor: string
  backend_id?: number
}

// 🔧 Helper: Convert pixel size to Tailwind class
const pixelToTailwind = (pixel: string | number): string => {
  const size = typeof pixel === 'string' ? parseInt(pixel) : pixel
  if (size >= 24) return 'text-2xl'
  if (size >= 20) return 'text-xl'
  if (size >= 18) return 'text-lg'
  if (size >= 16) return 'text-base'
  if (size >= 14) return 'text-sm'
  return 'text-xs'
}

// 🔧 Helper: Convert Tailwind class to pixel size
const tailwindToPixel = (tailwind: string): string => {
  const mapping: Record<string, string> = {
    'text-xs': '12',
    'text-sm': '14',
    'text-base': '16',
    'text-lg': '18',
    'text-xl': '20',
    'text-2xl': '24'
  }
  return mapping[tailwind] || '16'
}

const backendToFrontend = (backend: FooterDataBackend): FooterDataFrontend => {
  let logoImage: LogoImage = { type: 'upload', value: '' }
  
  if (backend.svg && backend.svg.trim() !== '') {
    logoImage = { type: 'svg', value: backend.svg }
    console.log('📷 Using SVG logo')
  } else if (backend.logo_url && backend.logo_url.trim() !== '') {
    const baseUrl = process.env.NEXT_PUBLIC_MEDIA_URL || 'http://127.0.0.1:8000'
    const fullUrl = backend.logo_url.startsWith('http') 
      ? backend.logo_url 
      : `${baseUrl}${backend.logo_url}`
    logoImage = { type: 'upload', value: fullUrl }
    console.log('📷 Logo image URL:', fullUrl)
  } else if (backend.logo && backend.logo.trim() !== '') {
    const baseUrl = process.env.NEXT_PUBLIC_MEDIA_URL || 'http://127.0.0.1:8000'
    const fullUrl = backend.logo.startsWith('http') 
      ? backend.logo 
      : `${baseUrl}/media/footer/${backend.logo}`
    logoImage = { type: 'upload', value: fullUrl }
    console.log('📷 Logo image URL (from logo field):', fullUrl)
  }

  return {
    backend_id: backend.id,
    logoText: backend.logotext || '',
    logoImage,
    description: {
      mn: backend.descmn || '',
      en: backend.descen || ''
    },
    address: {
      mn: backend.locationmn || '',
      en: backend.locationen || ''
    },
    email: backend.email || '',
    phone: backend.phone || '',
    socials: backend.socials || [],
    quick_links: backend.urls || [],
    copyright: {
      mn: backend.copyrightmn || '',
      en: backend.copyrighten || ''
    },
    bgColor: backend.bgcolor || '#ffffff',
    textColor: backend.fontcolor || '#4b5563',
    accentColor: backend.featurecolor || '#14b8a6',
    titleSize: pixelToTailwind(backend.titlesize || '16'),
    textSize: pixelToTailwind(backend.fontsize || '14'),
    iconColor: backend.socialiconcolor || '#14b8a6'
  }
}

const frontendToFormData = (frontend: FooterDataFrontend): FormData => {
  const formData = new FormData()

  formData.append('logotext', frontend.logoText || '')
  formData.append('descmn', frontend.description.mn || '')
  formData.append('descen', frontend.description.en || '')
  formData.append('locationmn', frontend.address.mn || '')
  formData.append('locationen', frontend.address.en || '')
  formData.append('email', frontend.email || '')
  formData.append('phone', frontend.phone || '')
  formData.append('bgcolor', frontend.bgColor || '#ffffff')
  formData.append('fontcolor', frontend.textColor || '#4b5563')
  formData.append('featurecolor', frontend.accentColor || '#14b8a6')
  formData.append('socialiconcolor', frontend.iconColor || '#14b8a6')
  
  formData.append('titlesize', tailwindToPixel(frontend.titleSize))
  formData.append('fontsize', tailwindToPixel(frontend.textSize))
  
  formData.append('copyrightmn', frontend.copyright.mn || '')
  formData.append('copyrighten', frontend.copyright.en || '')

  if (frontend.logoImage.type === 'svg' && frontend.logoImage.value.trim() !== '') {
    formData.append('svg', frontend.logoImage.value)
    console.log('📤 Sending SVG logo')
  } else if (frontend.logoFile) {
    formData.append('logo', frontend.logoFile)
    console.log('📤 Sending image file logo')
  }

  const validSocials = frontend.socials
    .filter(s => s.url && s.url.trim() !== '' && s.social)
    .map((s, idx) => ({
      social: s.social,
      url: s.url.trim(),
      index: idx + 1,
      active: s.active !== false
    }))
  
  formData.append('socials', JSON.stringify(validSocials))
  console.log('📤 Valid socials to send:', validSocials)

  const validUrls = frontend.quick_links
    .filter(link => {
      const hasName = link.nameen.trim() !== '' || link.namemn.trim() !== ''
      const hasUrl = link.url.trim() !== ''
      return hasName && hasUrl
    })
    .map(link => ({
      nameen: link.nameen.trim(),
      namemn: link.namemn.trim(),
      url: link.url.trim()
    }))

  formData.append('urls', JSON.stringify(validUrls))
  console.log('📤 Valid URLs to send:', validUrls)

  console.log('📦 Final FormData summary:', {
    logotext: frontend.logoText,
    has_logo_file: !!frontend.logoFile,
    has_svg: frontend.logoImage.type === 'svg' && frontend.logoImage.value.trim() !== '',
    titlesize: tailwindToPixel(frontend.titleSize),
    fontsize: tailwindToPixel(frontend.textSize),
    socials_count: validSocials.length,
    urls_count: validUrls.length
  })

  return formData
}

const getSocialIcon = (type: SocialType) => {
  const icons: Record<SocialType, string> = {
    facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    instagram: 'M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z',
    twitter: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    youtube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
    telegram: 'M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.332-.373-.119l-6.869 4.332-2.993-.937c-.651-.213-.666-.651.136-.968l11.707-4.514c.55-.213 1.028.145.848.957z'
  }
  return icons[type] || ''
}

// ==========================================
// 🌐 Social Section Component
// ==========================================
function SocialSection({ data, setData, getSocialIcon }: {
  data: FooterDataFrontend
  setData: (d: FooterDataFrontend) => void
  getSocialIcon: (type: SocialType) => string
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editUrl, setEditUrl] = useState('')
  const [addingType, setAddingType] = useState<SocialType | null>(null)
  const [addUrl, setAddUrl] = useState('')

  const socialLabels: Record<SocialType, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    twitter: 'X (Twitter)',
    linkedin: 'LinkedIn',
    youtube: 'YouTube',
    telegram: 'Telegram'
  }

  const socialPlaceholders: Record<SocialType, string> = {
    facebook: 'https://facebook.com/yourpage',
    instagram: 'https://instagram.com/yourhandle',
    twitter: 'https://x.com/yourhandle',
    linkedin: 'https://linkedin.com/company/yourcompany',
    youtube: 'https://youtube.com/@yourchannel',
    telegram: 'https://t.me/yourchannel'
  }

  const socialColors: Record<SocialType, string> = {
    facebook: '#1877F2',
    instagram: '#E4405F',
    twitter: '#000000',
    linkedin: '#0A66C2',
    youtube: '#FF0000',
    telegram: '#26A5E4'
  }

  const toggleActive = (index: number) => {
    const updated = [...data.socials]
    updated[index] = { ...updated[index], active: !updated[index].active }
    setData({ ...data, socials: updated })
  }

  const startEdit = (index: number) => {
    setEditingIndex(index)
    setEditUrl(data.socials[index].url)
  }

  const saveEdit = () => {
    if (editingIndex !== null && editUrl.trim()) {
      const updated = [...data.socials]
      updated[editingIndex] = { ...updated[editingIndex], url: editUrl.trim() }
      setData({ ...data, socials: updated })
    }
    setEditingIndex(null)
    setEditUrl('')
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setEditUrl('')
  }

  const deleteSocial = (index: number) => {
    const updated = data.socials.filter((_, i) => i !== index)
    setData({ ...data, socials: updated })
  }

  const startAdd = (type: SocialType) => {
    setAddingType(type)
    setAddUrl('')
  }

  const confirmAdd = () => {
    if (addingType && addUrl.trim()) {
      const newSocial: SocialLink = {
        social: addingType,
        url: addUrl.trim(),
        index: data.socials.length + 1,
        active: true
      }
      setData({ ...data, socials: [...data.socials, newSocial] })
    }
    setAddingType(null)
    setAddUrl('')
  }

  const cancelAdd = () => {
    setAddingType(null)
    setAddUrl('')
  }

  const activeCount = data.socials.filter(s => s.active !== false).length

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Нийгмийн сүлжээ</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {data.socials.length} нийт &middot; {activeCount} идэвхтэй
            </p>
          </div>
        </div>
      </div>

      {/* Socials List */}
      {data.socials.length > 0 && (
        <div className="mb-6 space-y-3">
          {data.socials.map((social, index) => {
            const isEditing = editingIndex === index
            const isActive = social.active !== false
            const color = socialColors[social.social] || '#6b7280'
            
            return (
              <div key={index} className={`rounded-xl border-2 transition-all duration-300 ${
                isActive 
                  ? 'border-slate-200 bg-white shadow-sm' 
                  : 'border-slate-100 bg-slate-50/50'
              }`}>
                <div className={`flex items-center gap-4 p-4 ${!isActive ? 'opacity-50' : ''}`}>
                  {/* Social Icon */}
                  <div 
                    className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center shadow-sm transition-all"
                    style={{ backgroundColor: isActive ? color : '#d1d5db' }}
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d={getSocialIcon(social.social)} />
                    </svg>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-slate-900">{socialLabels[social.social]}</p>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        isActive 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {isActive ? 'Идэвхтэй' : 'Идэвхгүй'}
                      </span>
                    </div>
                    {!isEditing && (
                      <p className="text-xs text-slate-500 truncate font-mono">{social.url}</p>
                    )}
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggleActive(index)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shrink-0 ${
                      isActive ? 'bg-teal-500' : 'bg-slate-300'
                    }`}
                    title={isActive ? 'Идэвхгүй болгох' : 'Идэвхтэй болгох'}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                      isActive ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>

                  {/* Edit Button */}
                  {!isEditing && (
                    <button
                      onClick={() => startEdit(index)}
                      className="p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
                      title="Засах"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteSocial(index)}
                    className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
                    title="Устгах"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Inline Edit Panel */}
                {isEditing && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="bg-blue-50/70 rounded-lg p-4 border border-blue-200">
                      <label className="block text-xs font-semibold text-blue-800 mb-2">
                        {socialLabels[social.social]} холбоосыг засах
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          </div>
                          <input
                            type="url"
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit()
                              if (e.key === 'Escape') cancelEdit()
                            }}
                            autoFocus
                            placeholder={socialPlaceholders[social.social]}
                            className="w-full pl-10 pr-3 py-2.5 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white font-mono"
                          />
                        </div>
                        <button
                          onClick={saveEdit}
                          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Хадгалах
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-2.5 bg-white text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors border border-slate-200"
                        >
                          Болих
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add New Social — inline modal style */}
      {addingType && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-5 border-2 border-teal-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                style={{ backgroundColor: socialColors[addingType] }}
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d={getSocialIcon(addingType)} />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{socialLabels[addingType]} нэмэх</h4>
                <p className="text-xs text-slate-500">Холбоосыг оруулна уу</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <input
                  type="url"
                  value={addUrl}
                  onChange={(e) => setAddUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmAdd()
                    if (e.key === 'Escape') cancelAdd()
                  }}
                  autoFocus
                  placeholder={socialPlaceholders[addingType]}
                  className="w-full pl-10 pr-3 py-3 border border-teal-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white font-mono"
                />
              </div>
              <button
                onClick={confirmAdd}
                disabled={!addUrl.trim()}
                className="px-5 py-3 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Нэмэх
              </button>
              <button
                onClick={cancelAdd}
                className="px-4 py-3 bg-white text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors border border-slate-200"
              >
                Болих
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Social Type Grid */}
      {data.socials.length < 6 && !addingType && (
        <div>
          <p className="text-sm font-medium text-slate-600 mb-3">
            {data.socials.length === 0 ? 'Нийгмийн сүлжээ нэмэх:' : 'Шинэ сүлжээ нэмэх:'}
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5">
            {(['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'telegram'] as const).map(type => {
              const isAdded = data.socials.some(s => s.social === type)
              const color = socialColors[type]
              return (
                <button
                  key={type}
                  onClick={() => !isAdded && startAdd(type)}
                  disabled={isAdded}
                  className={`relative p-4 rounded-xl transition-all duration-200 flex flex-col items-center gap-2 ${
                    isAdded
                      ? 'bg-slate-50 cursor-not-allowed'
                      : 'bg-white hover:shadow-md hover:-translate-y-0.5 border border-slate-200 hover:border-transparent cursor-pointer'
                  }`}
                  style={!isAdded ? { } : {}}
                  title={isAdded ? 'Нэмсэн байна' : `${socialLabels[type]} нэмэх`}
                >
                  {isAdded && (
                    <div className="absolute top-1.5 right-1.5">
                      <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                  )}
                  <div 
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isAdded ? 'opacity-30' : 'shadow-sm'}`}
                    style={{ backgroundColor: isAdded ? '#d1d5db' : color }}
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d={getSocialIcon(type)} />
                    </svg>
                  </div>
                  <span className={`text-xs font-semibold ${isAdded ? 'text-slate-400' : 'text-slate-700'}`}>
                    {socialLabels[type]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {data.socials.length === 0 && !addingType && (
        <div className="text-center py-6 text-slate-400">
          <svg className="w-10 h-10 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
          <p className="text-sm">Дээрээс нийгмийн сүлжээг сонгоно уу</p>
        </div>
      )}
    </div>
  )
}

export default function FooterPage() {
  const { language, t } = useLanguage()
  const [data, setData] = useState<FooterDataFrontend>({
    logoText: 'BichilGlobus',
    logoImage: { type: 'upload', value: '' },
    description: {
      mn: 'Таны бизнесийг дэлхийд холбох финтек шийдлүүд.',
      en: 'Fintech solutions connecting your business to the world.'
    },
    address: {
      mn: 'Улаанбаатар хот',
      en: 'Ulaanbaatar City'
    },
    email: 'info@bichilglobus.mn',
    phone: '+976 9999-9999',
    socials: [],
    quick_links: [],
    copyright: {
      mn: 'Бүх эрх хуулиар хамгаалагдсан.',
      en: 'All rights reserved.'
    },
    bgColor: '#ffffff',
    textColor: '#4b5563',
    accentColor: '#14b8a6',
    titleSize: 'text-base',
    textSize: 'text-sm',
    iconColor: '#14b8a6'
  })

  const [saveSuccess, setSaveSuccess] = useState(false)
  const [loading, setLoading] = useState(false)


  const fetchFooter = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get<FooterDataBackend[]>('/footer/')
      
      if (response.data && response.data.length > 0) {
        const footerData = backendToFrontend(response.data[0])
        setData(footerData)
        console.log('✅ Footer loaded successfully')
        console.log('📊 Loaded data:', {
          socials: footerData.socials.length,
          quick_links: footerData.quick_links.length,
          has_logo: !!footerData.logoImage.value
        })
      }
    } catch (error) {
      console.error('❌ Error fetching footer:', error)
      alert('Алдаа: Footer-ийг унших боломжгүй байна.')
    } finally {
      setLoading(false)
    }
  }

  const saveFooter = async () => {
    try {
      setLoading(true)
      const formData = frontendToFormData(data)

      let response
      if (data.backend_id) {
        console.log('🔄 Updating footer ID:', data.backend_id)
        response = await axiosInstance.put<FooterDataBackend>(
          `/footer/${data.backend_id}/`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' }
          }
        )
      } else {
        console.log('🚀 Creating new footer')
        response = await axiosInstance.post<FooterDataBackend>(
          '/footer/',
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' }
          }
        )
      }

      console.log('✅ Footer saved successfully')
      console.log('📊 Response data:', response.data)
      
      const updatedData = backendToFrontend(response.data)
      setData(updatedData)

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error: any) {
      console.error('❌ Error saving footer:', error)
      console.error('Error details:', error.response?.data)
      alert(`Алдаа гарлаа!\n\n${error.response?.data?.detail || 'Footer хадгалагдсангүй.'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    if (confirm('Бүх өөрчлөлтийг буцаах уу?')) {
      fetchFooter()
    }
  }

  const handleImageChange = (file: File) => {
    const imageUrl = URL.createObjectURL(file)
    setData({
      ...data,
      logoImage: { type: 'upload', value: imageUrl },
      logoFile: file
    })
    console.log('📷 Image file selected:', file.name)
  }

  useEffect(() => {
    fetchFooter()
  }, [])

  return (
    <AdminLayout title="Footer">
      <div className="max-w-4xl mx-auto">
        {/* Success Notification */}
        {saveSuccess && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-emerald-900">Амжилттай хадгалагдлаа!</h4>
              <p className="text-xs text-emerald-700 mt-0.5">Өөрчлөлтүүд хадгалагдсан.</p>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
              <p className="mt-4 text-sm text-slate-600">Уншиж байна...</p>
            </div>
          </div>
        )}
        
        <PageHeader
          title="Footer удирдлага"
          description="Веб сайтын доод хэсгийн мэдээлэл"
          action={
            <SaveResetButtons 
              onSave={saveFooter}
              onReset={handleReset}
              confirmMessage="Та хадгалахдаа итгэлтэй байна уу?"
            />
          }
        />

        {/* Live Preview */}
        <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-b from-slate-100 to-slate-50">
          <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-white/50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Live Preview
              </span>
            </div>
          </div>
          <div className="p-4">
            <footer className="text-white rounded-xl overflow-hidden shadow-2xl" style={{ backgroundColor: data.bgColor }}>
              <div className="px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {/* Column 1 - About */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      {data.logoImage.value ? (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shrink-0 bg-white/10">
                          {data.logoImage.type === 'svg' && data.logoImage.value.startsWith('<svg') ? (
                            <div
                              dangerouslySetInnerHTML={{ __html: data.logoImage.value }}
                              className="w-10 h-10 flex items-center justify-center [&_svg]:w-full [&_svg]:h-full"
                            />
                          ) : (
                            <img
                              src={data.logoImage.value}
                              alt="Logo"
                              className="w-10 h-10 object-cover"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg" style={{ background: `linear-gradient(to bottom right, ${data.accentColor}, ${data.accentColor}dd)` }}>
                          BG
                        </div>
                      )}
                      <span className={`${data.titleSize} font-bold text-white`}>{data.logoText}</span>
                    </div>
                    <p className={`${data.textSize} leading-relaxed`} style={{ color: data.textColor }}>
                      {t(data.description.mn, data.description.en)}
                    </p>
                  </div>

                  {/* Column 2 - Contact */}
                  <div>
                    <h4 className={`${data.titleSize} font-semibold mb-4 text-white`}>
                      {t('Холбоо барих', 'Contact Us')}
                    </h4>
                    <div className={`space-y-3 ${data.textSize}`} style={{ color: data.textColor }}>
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: data.iconColor }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{t(data.address.mn, data.address.en)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: data.iconColor }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{data.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: data.iconColor }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{data.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 3 - Quick Links */}
                  <div>
                    <h4 className={`${data.titleSize} font-semibold mb-4 text-white`}>
                      {t('Холбоосууд', 'Quick Links')}
                    </h4>
                    <ul className={`space-y-2 ${data.textSize}`} style={{ color: data.textColor }}>
                      {data.quick_links.map((link, idx) => (
                        <li key={idx}>
                          <a href={link.url} className="hover:opacity-80 transition-opacity">
                            {t(link.namemn, link.nameen)}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Column 4 - Social */}
                  <div>
                    <h4 className={`${data.titleSize} font-semibold mb-4 text-white`}>
                      {t('Биднийг дагах', 'Follow Us')}
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {data.socials.filter(s => s.active !== false).map((social, idx) => (
                        <a 
                          key={idx}
                          href={social.url} 
                          className="w-10 h-10 rounded-full hover:opacity-80 flex items-center justify-center transition-all"
                          style={{ backgroundColor: data.iconColor }}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={social.social}
                        >
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d={getSocialIcon(social.social)} />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="border-t px-8 py-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <div className="flex justify-center items-center">
                  <p className={`${data.textSize} text-center`} style={{ color: data.textColor }}>
                    {t(data.copyright.mn, data.copyright.en)}
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Үндсэн мэдээлэл */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Үндсэн мэдээлэл
              </h3>
            </div>
            <div className="space-y-4">
              <Input
                label="Лого текст"
                value={data.logoText}
                onChange={(e) => setData({ ...data, logoText: e.target.value })}
                placeholder="BichilGlobus"
              />
              
              {/* Image Upload */}
              <ImageUpload
                label="Лого зураг"
                value={data.logoImage.value}
                onChange={(url) => {
                  setData({
                    ...data,
                    logoImage: { type: 'upload', value: url },
                    logoFile: undefined, // Clear file input
                  })
                }}
              />

              {/* SVG Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  SVG код
                </label>
                <textarea
                  value={data.logoImage.type === 'svg' ? data.logoImage.value : ''}
                  onChange={(e) => setData({ ...data, logoImage: { type: 'svg', value: e.target.value } })}
                  rows={5}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm font-mono resize-none"
                  placeholder={'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n  <circle cx="50" cy="50" r="40" fill="blue"/>\n</svg>'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Тайлбар (Монгол)
                </label>
                <textarea
                  value={data.description.mn}
                  onChange={(e) => setData({ 
                    ...data, 
                    description: { ...data.description, mn: e.target.value }
                  })}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description (English)
                </label>
                <textarea
                  value={data.description.en}
                  onChange={(e) => setData({ 
                    ...data, 
                    description: { ...data.description, en: e.target.value }
                  })}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>

          {/* Холбоо барих */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Холбоо барих
              </h3>
            </div>
            <div className="space-y-4">
              <Input
                label="Хаяг (Монгол)"
                value={data.address.mn}
                onChange={(e) => setData({ 
                  ...data, 
                  address: { ...data.address, mn: e.target.value }
                })}
                placeholder="Улаанбаатар хот"
              />
              <Input
                label="Address (English)"
                value={data.address.en}
                onChange={(e) => setData({ 
                  ...data, 
                  address: { ...data.address, en: e.target.value }
                })}
                placeholder="Ulaanbaatar City"
              />
              <Input
                label="И-мэйл"
                type="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                placeholder="info@example.com"
              />
              <Input
                label="Утас"
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
                placeholder="+976 9999-9999"
              />
            </div>
          </div>

          {/* Нийгмийн сүлжээ */}
          <SocialSection data={data} setData={setData} getSocialIcon={getSocialIcon} />

          {/* Quick Links */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Холбоосууд (Quick Links)</h3>
                <p className="text-xs text-slate-500 mt-0.5">{data.quick_links.length} холбоос</p>
              </div>
              <button
                onClick={() => {
                  const newLink: QuickLink = { namemn: '', nameen: '', url: '' }
                  setData({ ...data, quick_links: [...data.quick_links, newLink] })
                  console.log('➕ New quick link form added')
                }}
                className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg text-sm font-semibold hover:bg-teal-200 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Нэмэх
              </button>
            </div>

            {data.quick_links.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <p className="text-sm">Холбоос нэмэгдээгүй байна</p>
                <p className="text-xs mt-1">Дээрх "Нэмэх" товчийг дарж эхлээрэй</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.quick_links.map((link, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <input
                        type="text"
                        value={link.namemn}
                        onChange={(e) => {
                          const newLinks = [...data.quick_links]
                          newLinks[idx] = { ...newLinks[idx], namemn: e.target.value }
                          setData({ ...data, quick_links: newLinks })
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Нэр (Монгол)"
                      />
                      <input
                        type="text"
                        value={link.nameen}
                        onChange={(e) => {
                          const newLinks = [...data.quick_links]
                          newLinks[idx] = { ...newLinks[idx], nameen: e.target.value }
                          setData({ ...data, quick_links: newLinks })
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Name (English)"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => {
                          const newLinks = [...data.quick_links]
                          newLinks[idx] = { ...newLinks[idx], url: e.target.value }
                          setData({ ...data, quick_links: newLinks })
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="/about"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`"${link.namemn || link.nameen || 'Энэ холбоос'}" устгах уу?`)) {
                          const updatedLinks = data.quick_links.filter((_, i) => i !== idx)
                          setData({ ...data, quick_links: updatedLinks })
                          console.log('🗑️ Quick link deleted, remaining:', updatedLinks.length)
                        }
                      }}
                      className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Устгах
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Өнгө */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Өнгө & Үсэг</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Арын өнгө</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={data.bgColor}
                    onChange={(e) => setData({ ...data, bgColor: e.target.value })}
                    className="w-12 h-10 rounded border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={data.bgColor}
                    onChange={(e) => setData({ ...data, bgColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Текстийн өнгө</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={data.textColor}
                    onChange={(e) => setData({ ...data, textColor: e.target.value })}
                    className="w-12 h-10 rounded border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={data.textColor}
                    onChange={(e) => setData({ ...data, textColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Онцлох өнгө</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={data.accentColor}
                    onChange={(e) => setData({ ...data, accentColor: e.target.value })}
                    className="w-12 h-10 rounded border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={data.accentColor}
                    onChange={(e) => setData({ ...data, accentColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Иконы өнгө</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={data.iconColor}
                    onChange={(e) => setData({ ...data, iconColor: e.target.value })}
                    className="w-12 h-10 rounded border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={data.iconColor}
                    onChange={(e) => setData({ ...data, iconColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Copyright</h3>
            <div className="space-y-4">
              <Input
                label="Copyright (МН)"
                value={data.copyright.mn}
                onChange={(e) => setData({ 
                  ...data, 
                  copyright: { ...data.copyright, mn: e.target.value }
                })}
                placeholder="Бүх эрх хуулиар хамгаалагдсан."
              />
              <Input
                label="Copyright (EN)"
                value={data.copyright.en}
                onChange={(e) => setData({ 
                  ...data, 
                  copyright: { ...data.copyright, en: e.target.value }
                })}
                placeholder="All rights reserved."
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}