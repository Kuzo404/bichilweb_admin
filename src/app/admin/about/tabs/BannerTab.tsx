'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import Modal from '@/components/Modal'
import ImageUpload from '@/components/ImageUpload'
import { Input } from '@/components/FormElements'
import { axiosInstance } from '@/lib/axios'

/* ── Types ─────────────────────────────────────────────────────────── */

interface BannerTranslation {
  id?: number
  language: number
  language_code?: string
  title: string
  subtitle: string
}

interface BannerAPI {
  id: number
  page: number
  image: string
  sort_order: number
  active: boolean
  translations: BannerTranslation[]
}

interface BannerFormData {
  image: string
  title_mn: string
  title_en: string
  subtitle_mn: string
  subtitle_en: string
  sort_order: number
}

const emptyForm: BannerFormData = {
  image: '',
  title_mn: '',
  title_en: '',
  subtitle_mn: '',
  subtitle_en: '',
  sort_order: 0,
}

const getTr = (translations: BannerTranslation[], langId: number) =>
  translations.find(t => t.language === langId)

/* ── Component ─────────────────────────────────────────────────────── */

export default function BannerTab() {
  const [banners, setBanners] = useState<BannerAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<BannerFormData>({ ...emptyForm })
  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [lang, setLang] = useState<'mn' | 'en'>('mn')
  const [pageId, setPageId] = useState<number | null>(null)

  const langId = lang === 'mn' ? 1 : 2

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true)
      // Эхлээд about page-ийн ID-г олно
      let pid = pageId
      if (!pid) {
        const pagesRes = await axiosInstance.get('/about-page/')
        const introPage = pagesRes.data.find((p: any) => p.key === 'intro')
        if (introPage) {
          pid = introPage.id
          setPageId(pid)
        } else {
          // About page үүсээгүй бол шинээр үүсгэнэ
          const createRes = await axiosInstance.post('/about-page/', { key: 'intro', active: true, sections: [], media: [] })
          pid = createRes.data.id
          setPageId(pid)
        }
      }
      const res = await axiosInstance.get<BannerAPI[]>(`/about-banner/?page=${pid}`)
      setBanners(res.data)
    } catch {
      setErrorMsg('Баннер татахад алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }, [pageId])

  useEffect(() => { fetchBanners() }, [fetchBanners])

  const openAddModal = () => {
    setEditingId(null)
    setFormData({ ...emptyForm, sort_order: banners.length })
    setModalOpen(true)
  }

  const openEditModal = (banner: BannerAPI) => {
    setEditingId(banner.id)
    const mn = getTr(banner.translations, 1)
    const en = getTr(banner.translations, 2)
    setFormData({
      image: banner.image || '',
      title_mn: mn?.title || '',
      title_en: en?.title || '',
      subtitle_mn: mn?.subtitle || '',
      subtitle_en: en?.subtitle || '',
      sort_order: banner.sort_order,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.image) {
      setErrorMsg('Зураг оруулна уу')
      return
    }
    setIsSaving(true)
    setErrorMsg('')
    try {
      const payload = {
        page: pageId,
        image: formData.image,
        sort_order: formData.sort_order,
        active: true,
        translations: [
          { language: 1, title: formData.title_mn, subtitle: formData.subtitle_mn },
          { language: 2, title: formData.title_en, subtitle: formData.subtitle_en },
        ],
      }
      if (editingId) {
        await axiosInstance.put(`/about-banner/${editingId}/`, payload)
        setSuccessMsg('Баннер амжилттай шинэчлэгдлээ')
      } else {
        await axiosInstance.post('/about-banner/', payload)
        setSuccessMsg('Баннер амжилттай нэмэгдлээ')
      }
      setModalOpen(false)
      await fetchBanners()
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Хадгалахад алдаа гарлаа')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Энэ баннерыг устгах уу?')) return
    try {
      await axiosInstance.delete(`/about-banner/${id}/`)
      setSuccessMsg('Баннер устгагдлаа')
      await fetchBanners()
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch {
      setErrorMsg('Устгахад алдаа гарлаа')
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingId(null)
    setFormData({ ...emptyForm })
  }

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-200">{successMsg}</div>
      )}
      {errorMsg && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {errorMsg}
          <button onClick={() => setErrorMsg('')} className="ml-2 underline">×</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Бидний тухай - Баннер зураг</h2>
            <p className="text-sm text-slate-500 mt-1">Бидний тухай хуудасны дээд хэсгийн баннер зургийг удирдах</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
              {(['mn', 'en'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-3 py-1 rounded-md font-medium transition-colors text-sm ${
                    lang === l ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}>{l.toUpperCase()}</button>
              ))}
            </div>
            <button onClick={openAddModal}
              className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium text-sm">
              <PlusIcon className="w-5 h-5" />
              Баннер нэмэх
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-500">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Ачаалж байна...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="py-16 text-center text-gray-400 border-2 border-dashed border-slate-200 rounded-xl">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium">Баннер зураг байхгүй</p>
            <p className="text-xs mt-1">Шинэ баннер нэмэхийн тулд дээрх товчийг дарна уу</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {banners.map((banner) => {
              const tr = getTr(banner.translations, langId)
              return (
                <div key={banner.id} className="group relative rounded-xl overflow-hidden border border-slate-200 hover:border-teal-300 transition-colors">
                  <div className="relative h-48 bg-gray-100">
                    {banner.image ? (
                      <Image src={banner.image} alt={tr?.title || 'Banner'} fill className="object-cover" 
                        onError={(e) => { (e.target as HTMLImageElement).src = '/img/placeholder.png' }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {/* Overlay with title */}
                    {(tr?.title || tr?.subtitle) && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                        <div className="text-white">
                          {tr?.title && <h3 className="font-bold text-lg">{tr.title}</h3>}
                          {tr?.subtitle && <p className="text-sm opacity-80">{tr.subtitle}</p>}
                        </div>
                      </div>
                    )}
                    {/* Action buttons */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(banner)}
                        className="p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors" title="Засварлах">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(banner.id)}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors" title="Устгах">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3 flex items-center justify-between bg-white">
                    <span className="text-sm text-slate-600">Дараалал: {banner.sort_order}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${banner.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {banner.active ? 'Идэвхтэй' : 'Идэвхгүй'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Banner Edit/Add Modal */}
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingId ? 'Баннер засварлах' : 'Баннер нэмэх'}>
        <div className="space-y-6">
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Зураг *</label>
              <ImageUpload onChange={(url) => setFormData({ ...formData, image: url })} value={formData.image} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Гарчиг (Монгол)</label>
                <Input value={formData.title_mn} onChange={(e) => setFormData({ ...formData, title_mn: e.target.value })} placeholder="Монгол гарчиг" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Title (English)</label>
                <Input value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} placeholder="English title" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Дэд гарчиг (Монгол)</label>
                <Input value={formData.subtitle_mn} onChange={(e) => setFormData({ ...formData, subtitle_mn: e.target.value })} placeholder="Дэд гарчиг" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Subtitle (English)</label>
                <Input value={formData.subtitle_en} onChange={(e) => setFormData({ ...formData, subtitle_en: e.target.value })} placeholder="Subtitle" />
              </div>
            </div>

            <div className="w-32">
              <label className="block text-xs font-medium text-slate-600 mb-1">Дараалал</label>
              <Input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} />
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-200">
            <div className="flex-1" />
            <button onClick={handleCloseModal}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">Цуцлах</button>
            <button onClick={handleSave} disabled={isSaving}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 font-medium">
              {isSaving ? 'Хадгалж байна...' : 'Хадгалах'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
