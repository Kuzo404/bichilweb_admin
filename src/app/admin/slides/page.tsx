'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'
import ImageUpload from '@/components/ImageUpload'
import { Input, Select, Checkbox, Button, PageHeader, StatusBadge, FormActions } from '@/components/FormElements'
import { PlusIcon, PhotoIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

interface Slide {
  id: string
  type: 'image' | 'video'
  mediaUrl: string
  title: string
  subtitle: string
  buttonText: string
  buttonLink: string
  order: number
  isActive: boolean
}

const initialFormData: Omit<Slide, 'id'> = {
  type: 'image',
  mediaUrl: '',
  title: '',
  subtitle: '',
  buttonText: 'Дэлгэрэнгүй',
  buttonLink: '/',
  order: 0,
  isActive: true,
}

export default function SlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null)
  const [formData, setFormData] = useState(initialFormData)

  useEffect(() => {
    fetchSlides()
  }, [])

  const fetchSlides = async () => {
    try {
      const res = await fetch('/api/admin/slides')
      if (res.ok) {
        const text = await res.text()
        if (text) {
          const data = JSON.parse(text)
          if (Array.isArray(data)) setSlides(data)
        }
      }
    } catch (error) {
      console.warn('API холболт байхгүй, default утга ашиглаж байна')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const url = editingSlide 
        ? `/api/admin/slides/${editingSlide.id}`
        : '/api/admin/slides'
      
      const res = await fetch(url, {
        method: editingSlide ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Failed to save')

      await fetchSlides()
      handleCloseModal()
    } catch (error) {
      console.error('Error saving slide:', error)
      alert('Хадгалахад алдаа гарлаа')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (slide: Slide) => {
    if (!confirm('Устгахдаа итгэлтэй байна уу?')) return

    try {
      const res = await fetch(`/api/admin/slides/${slide.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete')

      await fetchSlides()
    } catch (error) {
      console.error('Error deleting slide:', error)
      alert('Устгахад алдаа гарлаа')
    }
  }

  const handleEdit = (slide: Slide) => {
    setEditingSlide(slide)
    setFormData({
      type: slide.type,
      mediaUrl: slide.mediaUrl,
      title: slide.title,
      subtitle: slide.subtitle,
      buttonText: slide.buttonText,
      buttonLink: slide.buttonLink,
      order: slide.order,
      isActive: slide.isActive,
    })
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingSlide(null)
    setFormData(initialFormData)
  }

  const columns = [
    {
      key: 'mediaUrl',
      label: 'Зураг',
      render: (slide: Slide) => (
        <div className="h-14 w-24 relative rounded-lg overflow-hidden bg-gray-100 ring-1 ring-gray-200">
          {slide.mediaUrl ? (
            <Image src={slide.mediaUrl} alt={slide.title} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <PhotoIcon className="h-6 w-6 text-gray-300" />
            </div>
          )}
        </div>
      ),
    },
    { 
      key: 'title', 
      label: 'Гарчиг',
      render: (slide: Slide) => (
        <div>
          <p className="font-medium text-gray-900">{slide.title || '—'}</p>
          <p className="text-xs text-gray-500 mt-0.5">{slide.subtitle || 'Дэд гарчиггүй'}</p>
        </div>
      ),
    },
    { 
      key: 'order', 
      label: 'Дараалал',
      render: (slide: Slide) => (
        <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-gray-100 text-sm font-medium text-gray-600">
          {slide.order}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Төрөл',
      render: (slide: Slide) => (
        <span className="text-sm text-gray-600 capitalize">
          {slide.type === 'image' ? 'Зураг' : 'Видео'}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Төлөв',
      render: (slide: Slide) => <StatusBadge active={slide.isActive} />,
    },
  ]

  return (
    <AdminLayout title="Hero Slider">
      <PageHeader
        title="Slider удирдлага"
        description="Нүүр хуудасны слайдер зургууд болон видеонууд"
        action={
          <Button variant="dark" onClick={() => setModalOpen(true)} icon={<PlusIcon className="h-4 w-4" />}>
            Шинэ slide
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={slides}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingSlide ? 'Slide засварлах' : 'Шинэ slide нэмэх'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Төрөл"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'image' | 'video' })}
              options={[
                { value: 'image', label: 'Зураг' },
                { value: 'video', label: 'Видео' },
              ]}
            />
            <Input
              label="Дараалал"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
            />
          </div>

          <ImageUpload
            label="Зураг / Видео"
            value={formData.mediaUrl}
            onChange={(url) => setFormData({ ...formData, mediaUrl: url })}
          />

          <FormActions onCancel={handleCloseModal} loading={saving} />
        </form>
      </Modal>
    </AdminLayout>
  )
}
