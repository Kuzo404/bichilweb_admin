'use client'
import { useCallback, useState } from 'react'
import { CloudArrowUpIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'

interface ImageUploadProps {
  value?: string
  onChange: (url: string, file?: File) => void
  label?: string
}


export default function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)



  const handleUpload = useCallback(async (file: File) => {
    setUploading(true)
    try {
      // Django backend руу зураг upload хийх
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'}/upload/`, {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        // Серверээс буцсан URL хадгалах
        const data = await res.json()
        const uploadedUrl = data.url || data.file_url || ''
        if (uploadedUrl) {
          onChange(uploadedUrl, file)
          console.log('Зураг серверт амжилттай upload хийгдлээ:', uploadedUrl)
        } else {
          throw new Error('Upload response байхгүй URL')
        }
      } else {
        // Upload endpoint алдаа
        const errData = await res.json().catch(() => ({}))
        const errMsg = errData.error || `Upload алдаа: ${res.status} ${res.statusText}`
        console.error('Upload endpoint алдаа:', errMsg)
        
        // Fallback: локал preview ашиглах
        const localUrl = URL.createObjectURL(file)
        onChange(localUrl, file)
        alert(`Сервер рүү upload хийхэд алдаа гарлаа:\n${errMsg}\n\nЛокал preview ашиглана.`)
      }
    } catch (error) {
      // Алдаа гарвал локал preview ашиглах
      console.warn('Зураг upload хийхэд алдаа:', error)
      const localUrl = URL.createObjectURL(file)
      onChange(localUrl, file)
      alert(`Зураг upload хийхэд алдаа гарлаа:\n${error instanceof Error ? error.message : 'Unknown error'}\n\nЛокал preview ашиглана.`)
    } finally {
      setUploading(false)
    }
  }, [onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleUpload(file)
    }
  }, [handleUpload])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }, [handleUpload])

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      {value ? (
        <div className="relative group rounded-xl overflow-hidden ring-1 ring-gray-200">
          <div className="relative w-full bg-gray-100" style={{ aspectRatio: '3/2' }}>
            <img
              src={value}
              alt="Uploaded image"
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                console.warn('Image load error:', value)
                const img = e.target as HTMLImageElement
                img.style.display = 'none'
              }}
            />
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-xs text-white/80 truncate">{value.split('/').pop()}</p>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${dragOver
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
            }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />

          <div className={`mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-3 transition-colors ${dragOver ? 'bg-primary/10' : 'bg-gray-100'
            }`}>
            {uploading ? (
              <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <PhotoIcon className={`h-7 w-7 ${dragOver ? 'text-primary' : 'text-gray-400'}`} />
            )}
          </div>

          <p className="text-sm font-medium text-gray-700">
            {uploading ? 'Оруулж байна...' : 'Зураг чирж оруулах'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            эсвэл дарж сонгох
          </p>
          <p className="text-xs text-gray-400 mt-3">
            PNG, JPG, GIF 10MB хүртэл
          </p>
        </div>
      )}
    </div>
  )
}
