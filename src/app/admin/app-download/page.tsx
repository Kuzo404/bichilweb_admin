'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { PageHeader } from '@/components/FormElements'
import {
  DevicePhoneMobileIcon, PlusIcon, TrashIcon, EyeSlashIcon,
  ChevronUpIcon, ChevronDownIcon,
  PencilIcon, ArrowDownTrayIcon, ArrowsRightLeftIcon,
  Squares2X2Icon, ListBulletIcon, ViewColumnsIcon,
  LinkIcon
} from '@heroicons/react/24/outline'
import axiosInstance from '@/app/config/axiosConfig'

// ─── Types ───
interface TitleItem {
  id?: number
  index?: number
  labelmn: string
  labelen: string
  color: string
  fontsize: string
  fontweight: string
  top: number
  left: number
  rotate: number
  size: number
}

interface ListItem {
  id?: number
  index?: number
  labelmn: string
  labelen: string
  icon: string
  icon_url: string
}

interface AppDownloadData {
  id?: number
  image: string | null
  image_url: string | null
  appstore: string
  playstore: string
  bgcolor: string
  fontcolor: string
  titlecolor: string
  iconcolor: string
  buttonbgcolor: string
  buttonfontcolor: string
  googlebuttonbgcolor: string
  googlebuttonfontcolor: string
  active: boolean
  layout: string
  features_layout: string
  titles: TitleItem[]
  lists: ListItem[]
}

const defaultData: AppDownloadData = {
  image: null,
  image_url: null,
  appstore: '',
  playstore: '',
  bgcolor: '#f8fafc',
  fontcolor: '#334155',
  titlecolor: '#0f172a',
  iconcolor: '#3b82f6',
  buttonbgcolor: '#6ee7b7',
  buttonfontcolor: '#ffffff',
  googlebuttonbgcolor: 'transparent',
  googlebuttonfontcolor: '#334155',
  active: true,
  layout: 'standard',
  features_layout: 'vertical',
  titles: [],
  lists: [],
}

const iconOptions = [
  { value: 'check', label: '✓ Check' },
  { value: 'shield', label: '🛡 Shield' },
  { value: 'bolt', label: '⚡ Bolt' },
  { value: 'clock', label: '🕐 Clock' },
  { value: 'star', label: '⭐ Star' },
  { value: 'custom', label: '🔗 Custom URL' },
]

const iconDisplay: Record<string, string> = {
  check: '✓', shield: '🛡', bolt: '⚡', clock: '🕐', star: '⭐'
}

const layoutOptions = [
  { value: 'standard', label: 'Стандарт', desc: 'Текст зүүн, Зураг баруун' },
  { value: 'reverse', label: 'Эсрэг', desc: 'Зураг зүүн, Текст баруун' },
  { value: 'text-top', label: 'Текст дээр', desc: 'Текст дээр, Зураг доор' },
  { value: 'image-top', label: 'Зураг дээр', desc: 'Зураг дээр, Текст доор' },
]

const featuresLayoutOptions = [
  { value: 'vertical', label: 'Босоо', icon: ListBulletIcon, desc: 'Жагсаалт доош' },
  { value: 'grid', label: 'Сүлжээ', icon: Squares2X2Icon, desc: '2 багана grid' },
  { value: 'horizontal', label: 'Хэвтээ', icon: ViewColumnsIcon, desc: 'Хажуу тийш' },
]

export default function AppDownloadPage() {
  const [data, setData] = useState<AppDownloadData | null>(null)
  const [originalData, setOriginalData] = useState<AppDownloadData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [previewLang, setPreviewLang] = useState<'mn' | 'en'>('mn')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Editing states
  const [editingTitle, setEditingTitle] = useState<number | null>(null)
  const [editingList, setEditingList] = useState<number | null>(null)
  const [showAddTitle, setShowAddTitle] = useState(false)
  const [showAddList, setShowAddList] = useState(false)
  const [newTitle, setNewTitle] = useState<TitleItem>({ labelmn: '', labelen: '', color: '#0f172a', fontsize: '48', fontweight: '800', top: 0, left: 0, rotate: 0, size: 48 })
  const [newList, setNewList] = useState<ListItem>({ labelmn: '', labelen: '', icon: 'check', icon_url: '' })

  useEffect(() => { fetchData() }, [])

  // Cloudinary URL мөн эсэхийг шалгах helper
  const getImageSrc = (url: string | null | undefined): string | null => {
    if (!url) return null
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    return `${process.env.NEXT_PUBLIC_MEDIA_URL || 'http://127.0.0.1:8000'}${url}`
  }

  const normalizeData = (item: any): AppDownloadData => {
    item.layout = item.layout || 'standard'
    item.features_layout = item.features_layout || 'vertical'
    if (item.lists) {
      item.lists = item.lists.map((l: any) => ({ ...l, icon_url: l.icon_url || '' }))
    }
    return item
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await axiosInstance.get('/app-download/')
      const items = res.data
      if (items.length > 0) {
        const item = normalizeData(items[0])
        setData(item)
        setOriginalData(JSON.parse(JSON.stringify(item)))
        setIsNew(false)
        if (item.image_url) {
          setImagePreview(getImageSrc(item.image_url))
        }
      } else {
        setData({ ...defaultData })
        setOriginalData({ ...defaultData })
        setIsNew(true)
      }
    } catch (err) {
      console.error(err)
      setData({ ...defaultData })
      setOriginalData({ ...defaultData })
      setIsNew(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!data) return
    setSaving(true)
    setSaveMsg(null)
    try {
      const formData = new FormData()
      formData.append('appstore', data.appstore || '')
      formData.append('playstore', data.playstore || '')
      formData.append('bgcolor', data.bgcolor || '#f8fafc')
      formData.append('fontcolor', data.fontcolor || '#334155')
      formData.append('titlecolor', data.titlecolor || '#0f172a')
      formData.append('iconcolor', data.iconcolor || '#3b82f6')
      formData.append('buttonbgcolor', data.buttonbgcolor || '#6ee7b7')
      formData.append('buttonfontcolor', data.buttonfontcolor || '#ffffff')
      formData.append('googlebuttonbgcolor', data.googlebuttonbgcolor || 'transparent')
      formData.append('googlebuttonfontcolor', data.googlebuttonfontcolor || '#334155')
      formData.append('active', String(data.active))
      formData.append('layout', data.layout || 'standard')
      formData.append('features_layout', data.features_layout || 'vertical')
      formData.append('titles', JSON.stringify(data.titles))
      formData.append('lists', JSON.stringify(data.lists))
      if (imageFile) {
        formData.append('image_file', imageFile)
      }

      let res
      if (isNew) {
        res = await axiosInstance.post('/app-download/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        res = await axiosInstance.put(`/app-download/${data.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      const readRes = await axiosInstance.get(`/app-download/${res.data.id}/`)
      const item = normalizeData(readRes.data)
      setData(item)
      setOriginalData(JSON.parse(JSON.stringify(item)))
      setIsNew(false)
      setImageFile(null)
      if (item.image_url) {
        setImagePreview(getImageSrc(item.image_url))
      }
      setSaveMsg({ type: 'success', text: 'Амжилттай хадгалагдлаа!' })
      setTimeout(() => setSaveMsg(null), 3000)
    } catch (err: any) {
      console.error(err)
      setSaveMsg({ type: 'error', text: err.response?.data ? JSON.stringify(err.response.data) : 'Хадгалахад алдаа гарлаа' })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (originalData) {
      setData(JSON.parse(JSON.stringify(originalData)))
      setImageFile(null)
      if (originalData.image_url) {
        setImagePreview(getImageSrc(originalData.image_url))
      } else {
        setImagePreview(null)
      }
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  // Title management
  const addTitle = () => {
    if (!data || !newTitle.labelmn.trim()) return
    setData({ ...data, titles: [...data.titles, { ...newTitle }] })
    setNewTitle({ labelmn: '', labelen: '', color: '#0f172a', fontsize: '48', fontweight: '800', top: 0, left: 0, rotate: 0, size: 48 })
    setShowAddTitle(false)
  }

  const removeTitle = (idx: number) => {
    if (!data) return
    setData({ ...data, titles: data.titles.filter((_, i) => i !== idx) })
  }

  const updateTitle = (idx: number, field: keyof TitleItem, value: any) => {
    if (!data) return
    const titles = [...data.titles]
    titles[idx] = { ...titles[idx], [field]: value }
    setData({ ...data, titles })
  }

  // List management
  const addList = () => {
    if (!data || !newList.labelmn.trim()) return
    setData({ ...data, lists: [...data.lists, { ...newList }] })
    setNewList({ labelmn: '', labelen: '', icon: 'check', icon_url: '' })
    setShowAddList(false)
  }

  const removeList = (idx: number) => {
    if (!data) return
    setData({ ...data, lists: data.lists.filter((_, i) => i !== idx) })
  }

  const updateList = (idx: number, field: keyof ListItem, value: any) => {
    if (!data) return
    const lists = [...data.lists]
    lists[idx] = { ...lists[idx], [field]: value }
    setData({ ...data, lists })
  }

  const moveItem = (arr: any[], idx: number, dir: -1 | 1) => {
    const newArr = [...arr]
    const target = idx + dir
    if (target < 0 || target >= newArr.length) return newArr
    ;[newArr[idx], newArr[target]] = [newArr[target], newArr[idx]]
    return newArr
  }

  if (loading) {
    return (
      <AdminLayout title="Апп татах">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!data) return null

  const isReverse = data.layout === 'reverse'
  const isVertical = data.layout === 'text-top' || data.layout === 'image-top'

  return (
    <AdminLayout title="App Download">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="App Download"
          description="Аппликейшн татах хэсгийн тохиргоо"
        />

        {saveMsg && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
            saveMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {saveMsg.text}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* LEFT: Settings */}
          <div className="space-y-6">

            {/* Active Toggle */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Идэвхтэй/Идэвхгүй</h3>
                  <p className="text-sm text-gray-500">Идэвхгүй үед Frontend-д харагдахгүй</p>
                </div>
                <button
                  onClick={() => setData({ ...data, active: !data.active })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    data.active ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    data.active ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            {/* Layout Direction */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <ArrowsRightLeftIcon className="w-5 h-5" /> Текст, зурагны байршил
              </h3>
              <p className="text-xs text-gray-500">Desktop: зүүн/баруун эсвэл дээр/доор</p>
              <div className="grid grid-cols-2 gap-3">
                {layoutOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setData({ ...data, layout: opt.value })}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      data.layout === opt.value
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex gap-2 mb-2">
                      {opt.value === 'standard' ? (
                        <>
                          <div className="flex-1 h-10 bg-blue-200 rounded flex items-center justify-center text-[10px] text-blue-700 font-medium">Текст</div>
                          <div className="w-8 h-10 bg-gray-200 rounded flex items-center justify-center">
                            <DevicePhoneMobileIcon className="w-4 h-4 text-gray-400" />
                          </div>
                        </>
                      ) : opt.value === 'reverse' ? (
                        <>
                          <div className="w-8 h-10 bg-gray-200 rounded flex items-center justify-center">
                            <DevicePhoneMobileIcon className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="flex-1 h-10 bg-blue-200 rounded flex items-center justify-center text-[10px] text-blue-700 font-medium">Текст</div>
                        </>
                      ) : opt.value === 'text-top' ? (
                        <div className="flex flex-col gap-1 w-full">
                          <div className="h-6 bg-blue-200 rounded flex items-center justify-center text-[10px] text-blue-700 font-medium">Текст</div>
                          <div className="h-6 bg-gray-200 rounded flex items-center justify-center">
                            <DevicePhoneMobileIcon className="w-3 h-3 text-gray-400" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1 w-full">
                          <div className="h-6 bg-gray-200 rounded flex items-center justify-center">
                            <DevicePhoneMobileIcon className="w-3 h-3 text-gray-400" />
                          </div>
                          <div className="h-6 bg-blue-200 rounded flex items-center justify-center text-[10px] text-blue-700 font-medium">Текст</div>
                        </div>
                      )}
                    </div>
                    <div className="font-medium text-sm text-gray-900">{opt.label}</div>
                    <div className="text-xs text-gray-500">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Features Layout */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Squares2X2Icon className="w-5 h-5" /> Онцлог давуу талуудын загвар
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {featuresLayoutOptions.map(opt => {
                  const Icon = opt.icon
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setData({ ...data, features_layout: opt.value })}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        data.features_layout === opt.value
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-1 ${data.features_layout === opt.value ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div className="font-medium text-xs text-gray-900">{opt.label}</div>
                      <div className="text-[10px] text-gray-500">{opt.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Store Links */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <ArrowDownTrayIcon className="w-5 h-5" /> Дэлгүүрийн холбоосууд
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">App Store URL</label>
                <input
                  type="text"
                  value={data.appstore}
                  onChange={(e) => setData({ ...data, appstore: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://apps.apple.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Play URL</label>
                <input
                  type="text"
                  value={data.playstore}
                  onChange={(e) => setData({ ...data, playstore: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://play.google.com/..."
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Зураг (Утасны зураг)</h3>
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-20 h-20 object-contain rounded-lg border" />
                )}
                <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition text-sm font-medium">
                  <PlusIcon className="w-4 h-4" />
                  Зураг сонгох
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>

            {/* Colors */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Өнгөний тохиргоо</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'bgcolor', label: 'Арын өнгө' },
                  { key: 'fontcolor', label: 'Текстийн өнгө' },
                  { key: 'titlecolor', label: 'Гарчгийн өнгө' },
                  { key: 'iconcolor', label: 'Дүрсний өнгө' },
                  { key: 'buttonbgcolor', label: 'App Store товч' },
                  { key: 'buttonfontcolor', label: 'App Store текст' },
                  { key: 'googlebuttonbgcolor', label: 'Google товч' },
                  { key: 'googlebuttonfontcolor', label: 'Google текст' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={(data as any)[key] || '#000000'}
                      onChange={(e) => setData({ ...data, [key]: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                    />
                    <span className="text-xs text-gray-600">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Titles Management */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Гарчгийн үгнүүд ({data.titles.length})</h3>
                <button
                  onClick={() => setShowAddTitle(!showAddTitle)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                >
                  <PlusIcon className="w-4 h-4" /> Нэмэх
                </button>
              </div>

              {showAddTitle && (
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/50 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Монгол</label>
                      <input type="text" value={newTitle.labelmn} onChange={(e) => setNewTitle({ ...newTitle, labelmn: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="Манай" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">English</label>
                      <input type="text" value={newTitle.labelen} onChange={(e) => setNewTitle({ ...newTitle, labelen: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="Our" />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500">Top</label>
                      <input type="number" value={newTitle.top} onChange={(e) => setNewTitle({ ...newTitle, top: Number(e.target.value) })}
                        className="w-full px-2 py-1 border rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Left</label>
                      <input type="number" value={newTitle.left} onChange={(e) => setNewTitle({ ...newTitle, left: Number(e.target.value) })}
                        className="w-full px-2 py-1 border rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Rotate</label>
                      <input type="number" value={newTitle.rotate} onChange={(e) => setNewTitle({ ...newTitle, rotate: Number(e.target.value) })}
                        className="w-full px-2 py-1 border rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Size</label>
                      <input type="number" value={newTitle.size} onChange={(e) => setNewTitle({ ...newTitle, size: Number(e.target.value) })}
                        className="w-full px-2 py-1 border rounded text-sm" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="color" value={newTitle.color} onChange={(e) => setNewTitle({ ...newTitle, color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer" />
                    <select value={newTitle.fontweight} onChange={(e) => setNewTitle({ ...newTitle, fontweight: e.target.value })}
                      className="px-2 py-1 border rounded text-sm">
                      <option value="400">Normal</option><option value="500">Medium</option>
                      <option value="600">SemiBold</option><option value="700">Bold</option>
                      <option value="800">ExtraBold</option><option value="900">Black</option>
                    </select>
                    <button onClick={addTitle} className="ml-auto px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                      Нэмэх
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {data.titles.map((t, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition">
                    {editingTitle === i ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" value={t.labelmn} onChange={(e) => updateTitle(i, 'labelmn', e.target.value)}
                            className="px-2 py-1 border rounded text-sm" placeholder="MN" />
                          <input type="text" value={t.labelen} onChange={(e) => updateTitle(i, 'labelen', e.target.value)}
                            className="px-2 py-1 border rounded text-sm" placeholder="EN" />
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <input type="number" value={t.top} onChange={(e) => updateTitle(i, 'top', Number(e.target.value))}
                            className="px-2 py-1 border rounded text-xs" placeholder="Top" />
                          <input type="number" value={t.left} onChange={(e) => updateTitle(i, 'left', Number(e.target.value))}
                            className="px-2 py-1 border rounded text-xs" placeholder="Left" />
                          <input type="number" value={t.rotate} onChange={(e) => updateTitle(i, 'rotate', Number(e.target.value))}
                            className="px-2 py-1 border rounded text-xs" placeholder="Rotate" />
                          <input type="number" value={t.size} onChange={(e) => updateTitle(i, 'size', Number(e.target.value))}
                            className="px-2 py-1 border rounded text-xs" placeholder="Size" />
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="color" value={t.color} onChange={(e) => updateTitle(i, 'color', e.target.value)} className="w-7 h-7 rounded cursor-pointer" />
                          <select value={t.fontweight} onChange={(e) => updateTitle(i, 'fontweight', e.target.value)} className="px-2 py-1 border rounded text-xs">
                            <option value="400">Normal</option><option value="600">SemiBold</option>
                            <option value="700">Bold</option><option value="800">ExtraBold</option>
                          </select>
                          <button onClick={() => setEditingTitle(null)} className="ml-auto px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">
                            Болсон
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: t.color }} />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-gray-900">{t.labelmn}</span>
                          <span className="text-xs text-gray-400 ml-2">/ {t.labelen}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          T:{t.top} L:{t.left} R:{t.rotate}° S:{t.size}
                        </span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setData({ ...data, titles: moveItem(data.titles, i, -1) })} className="p-1 hover:bg-gray-100 rounded" disabled={i === 0}>
                            <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                          </button>
                          <button onClick={() => setData({ ...data, titles: moveItem(data.titles, i, 1) })} className="p-1 hover:bg-gray-100 rounded" disabled={i === data.titles.length - 1}>
                            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                          </button>
                          <button onClick={() => setEditingTitle(i)} className="p-1 hover:bg-blue-50 rounded">
                            <PencilIcon className="w-4 h-4 text-blue-500" />
                          </button>
                          <button onClick={() => removeTitle(i)} className="p-1 hover:bg-red-50 rounded">
                            <TrashIcon className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Features Management */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Онцлог жагсаалт ({data.lists.length})</h3>
                <button
                  onClick={() => setShowAddList(!showAddList)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                >
                  <PlusIcon className="w-4 h-4" /> Нэмэх
                </button>
              </div>

              {showAddList && (
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/50 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Монгол</label>
                      <input type="text" value={newList.labelmn} onChange={(e) => setNewList({ ...newList, labelmn: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="24/7 зээлийн мэдээлэл" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">English</label>
                      <input type="text" value={newList.labelen} onChange={(e) => setNewList({ ...newList, labelen: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="Check loan info 24/7" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <select value={newList.icon} onChange={(e) => setNewList({ ...newList, icon: e.target.value, icon_url: e.target.value === 'custom' ? newList.icon_url : '' })}
                        className="px-3 py-1.5 border rounded text-sm">
                        {iconOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <button onClick={addList} className="ml-auto px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                        Нэмэх
                      </button>
                    </div>
                    {newList.icon === 'custom' && (
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <input
                          type="text"
                          value={newList.icon_url}
                          onChange={(e) => setNewList({ ...newList, icon_url: e.target.value })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                          placeholder="https://example.com/icon.svg эсвэл icon.png"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {data.lists.map((item, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition">
                    {editingList === i ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" value={item.labelmn} onChange={(e) => updateList(i, 'labelmn', e.target.value)}
                            className="px-2 py-1 border rounded text-sm" placeholder="MN" />
                          <input type="text" value={item.labelen} onChange={(e) => updateList(i, 'labelen', e.target.value)}
                            className="px-2 py-1 border rounded text-sm" placeholder="EN" />
                        </div>
                        <div className="flex items-center gap-2">
                          <select value={item.icon} onChange={(e) => updateList(i, 'icon', e.target.value)} className="px-2 py-1 border rounded text-sm">
                            {iconOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                          <button onClick={() => setEditingList(null)} className="ml-auto px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">
                            Болсон
                          </button>
                        </div>
                        {item.icon === 'custom' && (
                          <div className="flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <input
                              type="text"
                              value={item.icon_url}
                              onChange={(e) => updateList(i, 'icon_url', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Icon URL (svg, png, jpg)"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-sm flex-shrink-0 overflow-hidden">
                          {item.icon === 'custom' && item.icon_url ? (
                            <img src={item.icon_url} alt="" className="w-4 h-4 object-contain" />
                          ) : (
                            iconDisplay[item.icon] || '✓'
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-gray-900">{item.labelmn}</span>
                          <span className="text-xs text-gray-400 ml-2">/ {item.labelen}</span>
                        </div>
                        {item.icon === 'custom' && item.icon_url && (
                          <span className="text-[10px] text-blue-500 truncate max-w-[100px]">{item.icon_url.split('/').pop()}</span>
                        )}
                        <div className="flex items-center gap-1">
                          <button onClick={() => setData({ ...data, lists: moveItem(data.lists, i, -1) })} className="p-1 hover:bg-gray-100 rounded" disabled={i === 0}>
                            <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                          </button>
                          <button onClick={() => setData({ ...data, lists: moveItem(data.lists, i, 1) })} className="p-1 hover:bg-gray-100 rounded" disabled={i === data.lists.length - 1}>
                            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                          </button>
                          <button onClick={() => setEditingList(i)} className="p-1 hover:bg-blue-50 rounded">
                            <PencilIcon className="w-4 h-4 text-blue-500" />
                          </button>
                          <button onClick={() => removeList(i)} className="p-1 hover:bg-red-50 rounded">
                            <TrashIcon className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Preview */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Урьдчилан харах</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewLang('mn')}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${
                      previewLang === 'mn' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    MN
                  </button>
                  <button
                    onClick={() => setPreviewLang('en')}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${
                      previewLang === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>

              {!data.active && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700 flex items-center gap-2">
                  <EyeSlashIcon className="w-5 h-5" />
                  Идэвхгүй - Frontend-д харагдахгүй
                </div>
              )}

              {/* Layout info badges */}
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded-full font-medium">
                  {layoutOptions.find(o => o.value === data.layout)?.label || 'Стандарт'}
                </span>
                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] rounded-full font-medium">
                  Онцлог: {featuresLayoutOptions.find(o => o.value === data.features_layout)?.label || 'Босоо'}
                </span>
              </div>

              {/* Preview Container */}
              <div className="rounded-xl overflow-hidden border border-gray-100" style={{ backgroundColor: data.bgcolor }}>
                <div className="p-6">
                  <div className={`${isVertical ? 'flex flex-col gap-6' : 'grid grid-cols-2 gap-4'} items-center`}>
                    {/* Text side */}
                    <div className={`space-y-4 ${isVertical
                      ? (data.layout === 'text-top' ? 'order-1' : 'order-2')
                      : (isReverse ? 'order-2' : 'order-1')
                    } ${isVertical ? 'text-center' : ''}`}>
                      {/* Scattered titles */}
                      <div className="relative min-h-[180px]">
                        {data.titles.map((t, i) => (
                          <span
                            key={i}
                            className="absolute whitespace-nowrap"
                            style={{
                              top: `${t.top * 2.5}px`,
                              left: `${t.left * 2}px`,
                              color: t.color,
                              fontSize: `${Math.max(12, (t.size || 48) / 3)}px`,
                              fontWeight: Number(t.fontweight) || 800,
                              transform: `rotate(${t.rotate}deg)`,
                            }}
                          >
                            {previewLang === 'mn' ? t.labelmn : t.labelen}
                          </span>
                        ))}
                      </div>

                      {/* Features - layout dependent */}
                      <div className={`mt-2 ${
                        data.features_layout === 'grid' ? 'grid grid-cols-2 gap-2' :
                        data.features_layout === 'horizontal' ? 'flex flex-wrap gap-3' :
                        'space-y-2'
                      }`}>
                        {data.lists.map((item, i) => (
                          <div key={i} className={`flex items-center gap-2 ${
                            data.features_layout === 'horizontal' ? 'bg-white/50 px-2 py-1 rounded-lg' :
                            data.features_layout === 'grid' ? 'bg-white/30 px-2 py-1.5 rounded-lg' : ''
                          }`}>
                            <div className="w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0 overflow-hidden"
                              style={{ backgroundColor: `${data.iconcolor}20`, color: data.iconcolor }}>
                              {item.icon === 'custom' && item.icon_url ? (
                                <img src={item.icon_url} alt="" className="w-3 h-3 object-contain" />
                              ) : (
                                iconDisplay[item.icon] || '✓'
                              )}
                            </div>
                            <span style={{ color: data.fontcolor, fontSize: '11px' }}>
                              {previewLang === 'mn' ? item.labelmn : item.labelen}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-2 mt-3">
                        <button className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                          style={{ backgroundColor: data.buttonbgcolor, color: data.buttonfontcolor }}>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                          </svg>
                          App Store
                        </button>
                        <button className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 border"
                          style={{ backgroundColor: data.googlebuttonbgcolor, color: data.googlebuttonfontcolor, borderColor: `${data.googlebuttonfontcolor}30` }}>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z" />
                          </svg>
                          Google Play
                        </button>
                      </div>
                    </div>

                    {/* Image side */}
                    <div className={`flex justify-center ${isVertical
                      ? (data.layout === 'image-top' ? 'order-1' : 'order-2')
                      : (isReverse ? 'order-1' : 'order-2')
                    }`}>
                      {imagePreview ? (
                        <img src={imagePreview} alt="App" className="max-h-[200px] object-contain drop-shadow-lg" />
                      ) : (
                        <div className="w-24 h-40 bg-gray-200 rounded-2xl flex items-center justify-center">
                          <DevicePhoneMobileIcon className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save / Reset Buttons */}
            <div className="flex gap-3 sticky bottom-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>💾 Хадгалах</>
                )}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                Буцаах
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
