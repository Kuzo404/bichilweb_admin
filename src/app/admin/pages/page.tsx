/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import AdminLayout from '@/components/AdminLayout'
import {
  PlusIcon, TrashIcon, PencilIcon, EyeIcon, EyeSlashIcon,
  ArrowUpIcon, ArrowDownIcon, DocumentDuplicateIcon,
  ArrowLeftIcon, LinkIcon, DocumentTextIcon, PhotoIcon,
  VideoCameraIcon, CodeBracketIcon, ListBulletIcon,
  ChatBubbleBottomCenterTextIcon, ViewColumnsIcon,
  XMarkIcon, SparklesIcon, Bars3BottomLeftIcon,
  CursorArrowRaysIcon, ArrowsUpDownIcon, MinusIcon,
  CheckCircleIcon, CloudArrowUpIcon,
} from '@heroicons/react/24/outline'
import { axiosInstance } from '@/lib/axios'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type BlockType = 'heading' | 'text' | 'image' | 'video' | 'button' | 'spacer' | 'divider' | 'banner' | 'columns' | 'html' | 'list' | 'quote'

interface Block {
  id: string
  type: BlockType
  content: Record<string, any>
  style: Record<string, string>
}

interface ApiTranslation {
  id?: number
  language: number
  label: string
  font?: string
  family?: string
  weight?: string
  size?: string
}

interface ApiPage {
  id: number
  url: string
  active: boolean
  image: string | null
  content_blocks: string | null
  title_translations: ApiTranslation[]
  description_translations: ApiTranslation[]
}

interface PageSettings {
  url: string
  title_mn: string
  title_en: string
  active: boolean
  image: string
}

interface LayoutSettings {
  maxWidth: string
  fullWidth: boolean
  pagePaddingTop: string
  pagePaddingBottom: string
  pagePaddingLeft: string
  pagePaddingRight: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS & HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const BLOCK_DEFS: { type: BlockType; label: string; icon: any; desc: string }[] = [
  { type: 'heading', label: 'Гарчиг', icon: Bars3BottomLeftIcon, desc: 'H1-H4 гарчиг' },
  { type: 'text', label: 'Текст', icon: DocumentTextIcon, desc: 'Текст параграф' },
  { type: 'image', label: 'Зураг', icon: PhotoIcon, desc: 'Зураг нэмэх' },
  { type: 'video', label: 'Видео', icon: VideoCameraIcon, desc: 'YouTube видео' },
  { type: 'button', label: 'Товч', icon: CursorArrowRaysIcon, desc: 'CTA товч' },
  { type: 'spacer', label: 'Зай', icon: ArrowsUpDownIcon, desc: 'Хоосон зай' },
  { type: 'divider', label: 'Зураас', icon: MinusIcon, desc: 'Хэвтээ шугам' },
  { type: 'banner', label: 'Баннер', icon: SparklesIcon, desc: 'Баннер зураг' },
  { type: 'columns', label: 'Багана', icon: ViewColumnsIcon, desc: '2-3 багана' },
  { type: 'html', label: 'HTML', icon: CodeBracketIcon, desc: 'HTML код' },
  { type: 'list', label: 'Жагсаалт', icon: ListBulletIcon, desc: 'Жагсаалт' },
  { type: 'quote', label: 'Иш татах', icon: ChatBubbleBottomCenterTextIcon, desc: 'Ишлэл' },
]

const FONT_FAMILIES = [
  { value: '', label: 'Анхдагч (Default)' },
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' },
  { value: 'Palatino Linotype, serif', label: 'Palatino' },
]

const DEFAULT_BLOCK_WIDTH: Record<BlockType, number> = {
  heading: 600, text: 600, image: 500, video: 560, button: 200,
  spacer: 600, divider: 600, banner: 800, columns: 700,
  html: 600, list: 500, quote: 500,
}

const RESIZE_HANDLES = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'] as const

const genId = () => Math.random().toString(36).substring(2, 11)

const defaultContent = (type: BlockType): Record<string, any> => {
  const map: Record<BlockType, Record<string, any>> = {
    heading: { text_mn: '', text_en: '', level: 'h2' },
    text: { text_mn: '', text_en: '' },
    image: { url: '', alt: '', caption_mn: '', caption_en: '' },
    video: { url: '' },
    button: { text_mn: 'Дэлгэрэнгүй', text_en: 'Learn More', url: '', variant: 'primary' },
    spacer: { height: '40' },
    divider: { color: '#e5e7eb', thickness: '1' },
    banner: { imageUrl: '', title_mn: '', title_en: '', subtitle_mn: '', subtitle_en: '', overlayOpacity: '40', height: '400' },
    columns: { count: '2', gap: '24', col1_mn: '', col1_en: '', col2_mn: '', col2_en: '', col3_mn: '', col3_en: '' },
    html: { code: '' },
    list: { items_mn: '', items_en: '', listType: 'bullet' },
    quote: { text_mn: '', text_en: '', author: '' },
  }
  return map[type] || {}
}

const defaultLayout = (): LayoutSettings => ({
  maxWidth: '1200',
  fullWidth: false,
  pagePaddingTop: '0',
  pagePaddingBottom: '0',
  pagePaddingLeft: '0',
  pagePaddingRight: '0',
})

const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'}/upload/`, { method: 'POST', body: formData })
    if (res.ok) {
      const data = await res.json()
      return data.url || data.file_url || ''
    }
  } catch (e) { console.warn('Upload error, using local preview:', e) }
  return URL.createObjectURL(file)
}

const defaultStyle = (): Record<string, string> => ({
  textAlign: 'left',
  backgroundColor: '',
  textColor: '',
  paddingTop: '16',
  paddingBottom: '16',
  paddingLeft: '0',
  paddingRight: '0',
  borderRadius: '0',
  fontSize: '',
  fontFamily: '',
  fontWeight: '',
  posX: '50',
  posY: '50',
  width: '600',
  height: '',
  zIndex: '1',
})

const getTrans = (t: ApiTranslation[], lang: number) => t.find(x => x.language === lang) || { language: lang, label: '' }

// ═══════════════════════════════════════════════════════════════════════════════
// REUSABLE SETTING FIELDS
// ═══════════════════════════════════════════════════════════════════════════════

function SInput({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500" />
    </div>
  )
}

function STextarea({ label, value, onChange, placeholder, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500 resize-none" />
    </div>
  )
}

function SSelect({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select value={value || ''} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK PREVIEW RENDERER
// ═══════════════════════════════════════════════════════════════════════════════

function RenderBlock({ block, lang = 'mn' }: { block: Block; lang?: string }) {
  const c = block.content
  const s = block.style
  const wrap: React.CSSProperties = {
    textAlign: (s.textAlign as any) || 'left',
    backgroundColor: s.backgroundColor || undefined,
    color: s.textColor || undefined,
    paddingTop: `${s.paddingTop || 16}px`,
    paddingBottom: `${s.paddingBottom || 16}px`,
    paddingLeft: `${s.paddingLeft || 0}px`,
    paddingRight: `${s.paddingRight || 0}px`,
    borderRadius: `${s.borderRadius || 0}px`,
    fontSize: s.fontSize ? `${s.fontSize}px` : undefined,
    fontFamily: s.fontFamily || undefined,
    fontWeight: (s.fontWeight as any) || undefined,
  }

  switch (block.type) {
    case 'heading': {
      const text = lang === 'mn' ? c.text_mn : c.text_en
      const sizes: Record<string, string> = { h1: '2.5rem', h2: '2rem', h3: '1.5rem', h4: '1.25rem' }
      return <div style={wrap}><div style={{ fontSize: sizes[c.level] || '2rem', fontWeight: 'bold', lineHeight: 1.2 }}>{text || `[${(c.level || 'h2').toUpperCase()} гарчиг]`}</div></div>
    }
    case 'text': {
      const text = lang === 'mn' ? c.text_mn : c.text_en
      return <div style={wrap}><div className="whitespace-pre-wrap leading-relaxed">{text || '[Текст оруулна уу]'}</div></div>
    }
    case 'image':
      return (
        <div style={wrap}>
          {c.url ? (
            <div>
              <img src={c.url} alt={c.alt || ''} className="max-w-full h-auto rounded-lg" />
              {(lang === 'mn' ? c.caption_mn : c.caption_en) && (
                <p className="text-sm text-gray-500 mt-2 text-center">{lang === 'mn' ? c.caption_mn : c.caption_en}</p>
              )}
            </div>
          ) : (
            <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center text-gray-400">
              <PhotoIcon className="h-8 w-8 mr-2" /> Зургийн URL оруулна уу
            </div>
          )}
        </div>
      )
    case 'video': {
      const match = (c.url || '').match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/)
      const ytId = match ? match[1] : null
      const isFile = c._isFile || (c.url && !c.url.includes('youtube') && !c.url.includes('youtu.be'))
      return (
        <div style={wrap}>
          {ytId ? (
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe src={`https://www.youtube.com/embed/${ytId}`} className="absolute inset-0 w-full h-full rounded-lg" allowFullScreen />
            </div>
          ) : isFile && c.url ? (
            <video src={c.url} controls className="w-full rounded-lg" style={{ maxHeight: '400px' }} />
          ) : (
            <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center text-gray-400">
              <VideoCameraIcon className="h-8 w-8 mr-2" /> Видео URL эсвэл файл оруулна уу
            </div>
          )}
        </div>
      )
    }
    case 'button': {
      const text = lang === 'mn' ? c.text_mn : c.text_en
      const vars: Record<string, string> = {
        primary: 'bg-teal-600 text-white',
        secondary: 'bg-gray-200 text-gray-800',
        outline: 'border-2 border-teal-600 text-teal-600',
      }
      return <div style={wrap}><span className={`inline-block px-6 py-3 rounded-lg font-medium ${vars[c.variant] || vars.primary}`}>{text || 'Товч'}</span></div>
    }
    case 'spacer':
      return <div style={{ height: `${c.height || 40}px` }} />
    case 'divider':
      return <div style={wrap}><hr style={{ border: 'none', borderTop: `${c.thickness || 1}px solid ${c.color || '#e5e7eb'}`, margin: 0 }} /></div>
    case 'banner':
      return (
        <div style={{ ...wrap, position: 'relative', height: `${c.height || 400}px`, overflow: 'hidden', borderRadius: `${s.borderRadius || 0}px` }}>
          {c.imageUrl ? <img src={c.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" /> : <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-blue-700" />}
          <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${(parseInt(c.overlayOpacity) || 40) / 100})` }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-8">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{(lang === 'mn' ? c.title_mn : c.title_en) || '[Баннер гарчиг]'}</h2>
            {(lang === 'mn' ? c.subtitle_mn : c.subtitle_en) && <p className="text-lg md:text-xl opacity-90">{lang === 'mn' ? c.subtitle_mn : c.subtitle_en}</p>}
          </div>
        </div>
      )
    case 'columns': {
      const n = parseInt(c.count) || 2
      const cols = n >= 3
        ? [c.col1_mn || c.col1_en, c.col2_mn || c.col2_en, c.col3_mn || c.col3_en]
        : [c.col1_mn || c.col1_en, c.col2_mn || c.col2_en]
      return (
        <div style={wrap}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, 1fr)`, gap: `${c.gap || 24}px` }}>
            {cols.map((col, i) => <div key={i} className="whitespace-pre-wrap">{col || `[Багана ${i + 1}]`}</div>)}
          </div>
        </div>
      )
    }
    case 'html':
      return <div style={wrap} dangerouslySetInnerHTML={{ __html: c.code || '<p style="color:#aaa">[HTML код оруулна уу]</p>' }} />
    case 'list': {
      const items = ((lang === 'mn' ? c.items_mn : c.items_en) || '').split('\n').filter(Boolean)
      const Tag = c.listType === 'numbered' ? 'ol' : 'ul'
      return (
        <div style={wrap}>
          <Tag className={c.listType === 'numbered' ? 'list-decimal pl-6 space-y-1' : 'list-disc pl-6 space-y-1'}>
            {items.length > 0 ? items.map((x: string, i: number) => <li key={i}>{x}</li>) : <li className="text-gray-400">[Жагсаалт оруулна уу]</li>}
          </Tag>
        </div>
      )
    }
    case 'quote': {
      const text = lang === 'mn' ? c.text_mn : c.text_en
      return (
        <div style={wrap}>
          <blockquote className="border-l-4 border-teal-500 pl-6 py-2 italic text-lg text-gray-700">
            <p>{text || '[Ишлэл оруулна уу]'}</p>
            {c.author && <footer className="mt-2 text-sm font-medium text-gray-500 not-italic">— {c.author}</footer>}
          </blockquote>
        </div>
      )
    }
    default:
      return <div style={wrap}>[Unknown: {block.type}]</div>
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK CONTENT EDITOR
// ═══════════════════════════════════════════════════════════════════════════════

function BlockContentEditor({ block, onChange }: { block: Block; onChange: (updates: Record<string, any>) => void }) {
  const c = block.content
  const u = onChange

  switch (block.type) {
    case 'heading':
      return (
        <>
          <SSelect label="Түвшин" value={c.level} options={[{ value: 'h1', label: 'H1 — Том гарчиг' }, { value: 'h2', label: 'H2 — Дунд гарчиг' }, { value: 'h3', label: 'H3 — Жижиг гарчиг' }, { value: 'h4', label: 'H4 — Дэд гарчиг' }]} onChange={v => u({ level: v })} />
          <SInput label="🇲🇳 Гарчиг (MN)" value={c.text_mn} onChange={v => u({ text_mn: v })} placeholder="Монгол гарчиг" />
          <SInput label="🇺🇸 Heading (EN)" value={c.text_en} onChange={v => u({ text_en: v })} placeholder="English heading" />
        </>
      )
    case 'text':
      return (
        <>
          <STextarea label="🇲🇳 Текст (MN)" value={c.text_mn} onChange={v => u({ text_mn: v })} placeholder="Монгол текст..." rows={5} />
          <STextarea label="🇺🇸 Text (EN)" value={c.text_en} onChange={v => u({ text_en: v })} placeholder="English text..." rows={5} />
        </>
      )
    case 'image':
      return (
        <>
          <div className="flex gap-1 mb-2">
            {[{ v: 'url', l: 'URL оруулах' }, { v: 'upload', l: 'Файл оруулах' }].map(t => (
              <button key={t.v} onClick={() => u({ _inputMode: t.v })}
                className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${(c._inputMode || 'url') === t.v ? 'bg-teal-50 border-teal-300 text-teal-700 font-medium' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                {t.l}
              </button>
            ))}
          </div>
          {(c._inputMode || 'url') === 'url' ? (
            <SInput label="Зургийн URL" value={c.url} onChange={v => u({ url: v })} placeholder="https://..." />
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Зураг сонгох</label>
              <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-teal-300 transition-colors cursor-pointer">
                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={async e => {
                    const file = e.target.files?.[0]
                    if (file) { const url = await uploadFile(file); u({ url }) }
                  }} />
                <CloudArrowUpIcon className="h-8 w-8 text-gray-300 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Зураг чирж тавих эсвэл дарж сонгох</p>
              </div>
            </div>
          )}
          <SInput label="Alt текст" value={c.alt} onChange={v => u({ alt: v })} placeholder="Зургийн тайлбар" />
          <SInput label="🇲🇳 Тайлбар (MN)" value={c.caption_mn} onChange={v => u({ caption_mn: v })} />
          <SInput label="🇺🇸 Caption (EN)" value={c.caption_en} onChange={v => u({ caption_en: v })} />
          {c.url && <img src={c.url} alt={c.alt} className="w-full h-32 object-cover rounded-lg mt-2" />}
        </>
      )
    case 'video':
      return (
        <>
          <div className="flex gap-1 mb-2">
            {[{ v: 'url', l: 'YouTube URL' }, { v: 'upload', l: 'Файл оруулах' }].map(t => (
              <button key={t.v} onClick={() => u({ _inputMode: t.v })}
                className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${(c._inputMode || 'url') === t.v ? 'bg-teal-50 border-teal-300 text-teal-700 font-medium' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                {t.l}
              </button>
            ))}
          </div>
          {(c._inputMode || 'url') === 'url' ? (
            <SInput label="YouTube URL" value={c.url} onChange={v => u({ url: v })} placeholder="https://youtube.com/watch?v=..." />
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Видео сонгох</label>
              <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-teal-300 transition-colors cursor-pointer">
                <input type="file" accept="video/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={async e => {
                    const file = e.target.files?.[0]
                    if (file) { const url = await uploadFile(file); u({ url, _isFile: true }) }
                  }} />
                <CloudArrowUpIcon className="h-8 w-8 text-gray-300 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Видео файл сонгох (mp4, webm, ...)</p>
              </div>
            </div>
          )}
          {c.url && c._isFile && <p className="text-xs text-green-600 mt-1">✓ Видео файл оруулсан</p>}
        </>
      )
    case 'button':
      return (
        <>
          <SInput label="🇲🇳 Товч текст (MN)" value={c.text_mn} onChange={v => u({ text_mn: v })} placeholder="Дэлгэрэнгүй" />
          <SInput label="🇺🇸 Button text (EN)" value={c.text_en} onChange={v => u({ text_en: v })} placeholder="Learn More" />
          <SInput label="Холбоос URL" value={c.url} onChange={v => u({ url: v })} placeholder="https://..." />
          <SSelect label="Хэв маяг" value={c.variant} options={[{ value: 'primary', label: 'Primary (Үндсэн)' }, { value: 'secondary', label: 'Secondary (Дэд)' }, { value: 'outline', label: 'Outline (Хүрээтэй)' }]} onChange={v => u({ variant: v })} />
        </>
      )
    case 'spacer':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Өндөр (px)</label>
          <input type="range" min="10" max="200" value={c.height || 40} onChange={e => u({ height: e.target.value })} className="w-full accent-teal-600" />
          <span className="text-xs text-gray-500">{c.height || 40}px</span>
        </div>
      )
    case 'divider':
      return (
        <>
          <SInput label="Өнгө" value={c.color} onChange={v => u({ color: v })} placeholder="#e5e7eb" />
          <SSelect label="Зузаан" value={c.thickness} options={[{ value: '1', label: '1px' }, { value: '2', label: '2px' }, { value: '3', label: '3px' }, { value: '4', label: '4px' }]} onChange={v => u({ thickness: v })} />
        </>
      )
    case 'banner':
      return (
        <>
          <div className="flex gap-1 mb-2">
            {[{ v: 'url', l: 'URL оруулах' }, { v: 'upload', l: 'Файл оруулах' }].map(t => (
              <button key={t.v} onClick={() => u({ _inputMode: t.v })}
                className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${(c._inputMode || 'url') === t.v ? 'bg-teal-50 border-teal-300 text-teal-700 font-medium' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                {t.l}
              </button>
            ))}
          </div>
          {(c._inputMode || 'url') === 'url' ? (
            <SInput label="Зургийн URL" value={c.imageUrl} onChange={v => u({ imageUrl: v })} placeholder="https://..." />
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Баннер зураг</label>
              <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-teal-300 transition-colors cursor-pointer">
                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={async e => {
                    const file = e.target.files?.[0]
                    if (file) { const url = await uploadFile(file); u({ imageUrl: url }) }
                  }} />
                <CloudArrowUpIcon className="h-8 w-8 text-gray-300 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Баннер зураг сонгох</p>
              </div>
            </div>
          )}
          {c.imageUrl && <img src={c.imageUrl} alt="" className="w-full h-20 object-cover rounded-lg mt-2" />}
          <SInput label="🇲🇳 Гарчиг (MN)" value={c.title_mn} onChange={v => u({ title_mn: v })} />
          <SInput label="🇺🇸 Title (EN)" value={c.title_en} onChange={v => u({ title_en: v })} />
          <SInput label="🇲🇳 Дэд гарчиг (MN)" value={c.subtitle_mn} onChange={v => u({ subtitle_mn: v })} />
          <SInput label="🇺🇸 Subtitle (EN)" value={c.subtitle_en} onChange={v => u({ subtitle_en: v })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Бүдгэрэлт ({c.overlayOpacity || 40}%)</label>
            <input type="range" min="0" max="100" value={c.overlayOpacity || 40} onChange={e => u({ overlayOpacity: e.target.value })} className="w-full accent-teal-600" />
          </div>
          <SInput label="Өндөр (px)" value={c.height} onChange={v => u({ height: v })} placeholder="400" />
        </>
      )
    case 'columns':
      return (
        <>
          <SSelect label="Баганы тоо" value={c.count} options={[{ value: '2', label: '2 багана' }, { value: '3', label: '3 багана' }]} onChange={v => u({ count: v })} />
          <SInput label="Зай (px)" value={c.gap} onChange={v => u({ gap: v })} placeholder="24" />
          <STextarea label="🇲🇳 Багана 1 (MN)" value={c.col1_mn} onChange={v => u({ col1_mn: v })} rows={3} />
          <STextarea label="🇲🇳 Багана 2 (MN)" value={c.col2_mn} onChange={v => u({ col2_mn: v })} rows={3} />
          {parseInt(c.count) >= 3 && <STextarea label="🇲🇳 Багана 3 (MN)" value={c.col3_mn} onChange={v => u({ col3_mn: v })} rows={3} />}
          <STextarea label="🇺🇸 Column 1 (EN)" value={c.col1_en} onChange={v => u({ col1_en: v })} rows={3} />
          <STextarea label="🇺🇸 Column 2 (EN)" value={c.col2_en} onChange={v => u({ col2_en: v })} rows={3} />
          {parseInt(c.count) >= 3 && <STextarea label="🇺🇸 Column 3 (EN)" value={c.col3_en} onChange={v => u({ col3_en: v })} rows={3} />}
        </>
      )
    case 'html':
      return <STextarea label="HTML код" value={c.code} onChange={v => u({ code: v })} placeholder="<div>...</div>" rows={8} />
    case 'list':
      return (
        <>
          <SSelect label="Төрөл" value={c.listType} options={[{ value: 'bullet', label: '● Цэгтэй' }, { value: 'numbered', label: '1. Дугаартай' }]} onChange={v => u({ listType: v })} />
          <STextarea label="🇲🇳 Жагсаалт (MN)" value={c.items_mn} onChange={v => u({ items_mn: v })} placeholder="Мөр бүрт нэг зүйл..." rows={5} />
          <STextarea label="🇺🇸 List items (EN)" value={c.items_en} onChange={v => u({ items_en: v })} placeholder="One item per line..." rows={5} />
        </>
      )
    case 'quote':
      return (
        <>
          <STextarea label="🇲🇳 Ишлэл (MN)" value={c.text_mn} onChange={v => u({ text_mn: v })} rows={3} />
          <STextarea label="🇺🇸 Quote (EN)" value={c.text_en} onChange={v => u({ text_en: v })} rows={3} />
          <SInput label="Зохиогч" value={c.author} onChange={v => u({ author: v })} placeholder="Нэр" />
        </>
      )
    default:
      return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE EDITOR
// ═══════════════════════════════════════════════════════════════════════════════

function BlockStyleEditor({ block, onChange }: { block: Block; onChange: (updates: Record<string, string>) => void }) {
  const s = block.style
  const u = onChange

  if (block.type === 'spacer') return null

  return (
    <>
      {/* Font Controls */}
      {['heading', 'text', 'button', 'list', 'quote', 'columns'].includes(block.type) && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-600">Фонт</label>
          <select value={s.fontFamily || ''} onChange={e => u({ fontFamily: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500">
            {FONT_FAMILIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Хэмжээ (px)</label>
              <input type="number" value={s.fontSize || ''} onChange={e => u({ fontSize: e.target.value })}
                placeholder="авто" min="8" max="200" className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Жин</label>
              <select value={s.fontWeight || ''} onChange={e => u({ fontWeight: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm">
                <option value="">Анхдагч</option>
                <option value="300">Нарийн (300)</option>
                <option value="400">Хэвийн (400)</option>
                <option value="500">Дунд (500)</option>
                <option value="600">Зузаан (600)</option>
                <option value="700">Тод (700)</option>
                <option value="900">Хар (900)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Зэрэгцүүлэлт</label>
        <div className="flex gap-1">
          {[{ v: 'left', l: 'Зүүн' }, { v: 'center', l: 'Төв' }, { v: 'right', l: 'Баруун' }].map(a => (
            <button key={a.v} onClick={() => u({ textAlign: a.v })}
              className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${s.textAlign === a.v ? 'bg-teal-50 border-teal-300 text-teal-700 font-medium' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              {a.l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Дэвсгэр өнгө</label>
          <div className="flex items-center gap-2">
            <input type="color" value={s.backgroundColor || '#ffffff'} onChange={e => u({ backgroundColor: e.target.value })} className="w-8 h-8 rounded border border-gray-200 cursor-pointer" />
            <input type="text" value={s.backgroundColor || ''} onChange={e => u({ backgroundColor: e.target.value })} placeholder="авто" className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Текст өнгө</label>
          <div className="flex items-center gap-2">
            <input type="color" value={s.textColor || '#000000'} onChange={e => u({ textColor: e.target.value })} className="w-8 h-8 rounded border border-gray-200 cursor-pointer" />
            <input type="text" value={s.textColor || ''} onChange={e => u({ textColor: e.target.value })} placeholder="авто" className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs" />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Дотоод зай (px)</label>
        <div className="grid grid-cols-2 gap-2">
          {[{ key: 'paddingTop', l: 'Дээр' }, { key: 'paddingBottom', l: 'Доор' }, { key: 'paddingLeft', l: 'Зүүн' }, { key: 'paddingRight', l: 'Бар.' }].map(p => (
            <div key={p.key} className="flex items-center gap-1">
              <span className="text-xs text-gray-400 w-8">{p.l}</span>
              <input type="number" value={s[p.key] || '0'} onChange={e => u({ [p.key]: e.target.value })}
                className="w-full px-2 py-1 border border-gray-200 rounded text-xs" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Булангийн радиус ({s.borderRadius || 0}px)</label>
        <input type="range" min="0" max="32" value={s.borderRadius || 0} onChange={e => u({ borderRadius: e.target.value })} className="w-full accent-teal-600" />
      </div>

      {/* Dimensions */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Хэмжээ (px)</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-xs text-gray-400">Өргөн</span>
            <input type="number" value={s.width || ''} onChange={e => u({ width: e.target.value })}
              placeholder="авто" min="50" className="w-full px-2 py-1 border border-gray-200 rounded text-xs" />
          </div>
          <div>
            <span className="text-xs text-gray-400">Өндөр</span>
            <input type="number" value={s.height || ''} onChange={e => u({ height: e.target.value })}
              placeholder="авто" min="30" className="w-full px-2 py-1 border border-gray-200 rounded text-xs" />
          </div>
        </div>
      </div>

      {/* Position */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Байршил (px)</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-xs text-gray-400">X (зүүнээс)</span>
            <input type="number" value={s.posX || '0'} onChange={e => u({ posX: e.target.value })}
              className="w-full px-2 py-1 border border-gray-200 rounded text-xs" />
          </div>
          <div>
            <span className="text-xs text-gray-400">Y (дээрээс)</span>
            <input type="number" value={s.posY || '0'} onChange={e => u({ posY: e.target.value })}
              className="w-full px-2 py-1 border border-gray-200 rounded text-xs" />
          </div>
        </div>
      </div>

      {/* Z-index / Layer */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Давхарга (z-index)</label>
        <div className="flex items-center gap-2">
          <button onClick={() => u({ zIndex: String(Math.max(1, parseInt(s.zIndex || '1') - 1)) })}
            className="px-3 py-1.5 border border-gray-200 rounded text-xs hover:bg-gray-50 transition-colors">← Ард</button>
          <span className="text-sm font-mono text-gray-600 w-10 text-center">{s.zIndex || '1'}</span>
          <button onClick={() => u({ zIndex: String(parseInt(s.zIndex || '1') + 1) })}
            className="px-3 py-1.5 border border-gray-200 rounded text-xs hover:bg-gray-50 transition-colors">Өмнө →</button>
        </div>
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function PageBuilder() {
  const [mode, setMode] = useState<'list' | 'editor'>('list')
  const [pages, setPages] = useState<ApiPage[]>([])
  const [blocks, setBlocks] = useState<Block[]>([])
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [pageSettings, setPageSettings] = useState<PageSettings>({ url: '', title_mn: '', title_en: '', active: true, image: '' })
  const [editingPageId, setEditingPageId] = useState<number | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showBlockPalette, setShowBlockPalette] = useState(false)
  const [addAfterBlockId, setAddAfterBlockId] = useState<string | null>(null)
  const [rightTab, setRightTab] = useState<'page' | 'block'>('page')
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>(defaultLayout())
  const canvasRef = useRef<HTMLDivElement>(null)
  const [dragInfo, setDragInfo] = useState<{ blockId: string; offsetX: number; offsetY: number } | null>(null)
  const [resizeInfo, setResizeInfo] = useState<{ blockId: string; handle: string; startX: number; startY: number; startPosX: number; startPosY: number; startW: number; startH: number } | null>(null)

  const selectedBlock = blocks.find(b => b.id === selectedBlockId) || null

  useEffect(() => { loadPages() }, [])

  // ── API ──────────────────────────────────────────────────────────────────────

  const loadPages = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get<ApiPage[]>('/page/')
      setPages(res.data)
    } catch (e) { console.error('Failed to load pages:', e) }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    if (!pageSettings.title_mn) { alert('Хуудасны нэр оруулна уу'); return }
    if (!pageSettings.url) { alert('URL хаяг оруулна уу'); return }
    setSaving(true)
    try {
      const payload = {
        url: pageSettings.url,
        active: pageSettings.active,
        image: pageSettings.image || null,
        content_blocks: JSON.stringify({ layout: layoutSettings, blocks }),
        title_translations: [
          { language: 1, label: pageSettings.title_mn },
          { language: 2, label: pageSettings.title_en },
        ],
        description_translations: [
          { language: 1, label: '' },
          { language: 2, label: '' },
        ],
      }
      if (editingPageId) {
        await axiosInstance.put(`/page/${editingPageId}/`, payload)
      } else {
        const res = await axiosInstance.post('/page/', payload)
        setEditingPageId(res.data.id)
      }
      await loadPages()
      alert('Хуудас амжилттай хадгалагдлаа!')
    } catch (err: any) {
      console.error(err)
      alert(`Хадгалахад алдаа: ${err.response?.data?.detail || err.message}`)
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Энэ хуудсыг устгах уу?')) return
    try {
      await axiosInstance.delete(`/page/${id}/`)
      await loadPages()
    } catch (e: any) {
      alert(`Устгахад алдаа: ${e.response?.data?.detail || e.message}`)
    }
  }

  const handleEditPage = (page: ApiPage) => {
    setEditingPageId(page.id)
    const tmn = getTrans(page.title_translations, 1)
    const ten = getTrans(page.title_translations, 2)
    setPageSettings({ url: page.url || '', title_mn: tmn.label, title_en: ten.label, active: page.active ?? true, image: page.image || '' })

    // Parse content_blocks or auto-migrate from old title/description
    let parsed: Block[] = []
    let parsedLayout: LayoutSettings = defaultLayout()
    try {
      const raw = page.content_blocks ? JSON.parse(page.content_blocks) : []
      if (Array.isArray(raw)) {
        parsed = raw
      } else if (raw && raw.blocks) {
        parsed = raw.blocks || []
        parsedLayout = { ...defaultLayout(), ...(raw.layout || {}) }
      }
    } catch { parsed = [] }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      // Auto-migrate old pages: create blocks from title & description
      const autoBlocks: Block[] = []
      const dmn = getTrans(page.description_translations, 1)
      if (dmn.label) {
        autoBlocks.push({ id: genId(), type: 'text', content: { text_mn: dmn.label, text_en: getTrans(page.description_translations, 2).label }, style: defaultStyle() })
      }
      parsed = autoBlocks
    }

    setBlocks(parsed.map((block: Block, idx: number) => ({
      ...block,
      style: {
        ...defaultStyle(),
        ...block.style,
        posX: block.style?.posX || '50',
        posY: block.style?.posY || String(idx * 200 + 50),
        width: block.style?.width || String(DEFAULT_BLOCK_WIDTH[block.type as BlockType] || 600),
        zIndex: block.style?.zIndex || String(idx + 1),
      },
    })))
    setLayoutSettings(parsedLayout)
    setSelectedBlockId(null)
    setShowPreview(false)
    setRightTab('page')
    setMode('editor')
  }

  const handleNewPage = () => {
    setEditingPageId(null)
    setPageSettings({ url: '', title_mn: '', title_en: '', active: true, image: '' })
    setBlocks([])
    setSelectedBlockId(null)
    setShowPreview(false)
    setRightTab('page')
    setMode('editor')
  }

  // ── Block Ops ────────────────────────────────────────────────────────────────

  const addBlock = (type: BlockType, afterId?: string | null) => {
    // Calculate Y position: below the last block
    const maxBottom = blocks.reduce((max, b) => {
      const bottom = parseInt(b.style?.posY || '0') + parseInt(b.style?.height || '150')
      return Math.max(max, bottom)
    }, 0)
    const newBlock: Block = {
      id: genId(), type,
      content: defaultContent(type),
      style: {
        ...defaultStyle(),
        posX: '50',
        posY: String(maxBottom + 30),
        width: String(DEFAULT_BLOCK_WIDTH[type] || 600),
        zIndex: String(blocks.length + 1),
      },
    }
    setBlocks([...blocks, newBlock])
    setSelectedBlockId(newBlock.id)
    setRightTab('block')
    setShowBlockPalette(false)
    setAddAfterBlockId(null)
  }

  const updateBlockContent = (id: string, content: Record<string, any>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content: { ...b.content, ...content } } : b))
  }

  const updateBlockStyle = (id: string, style: Record<string, string>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, style: { ...b.style, ...style } } : b))
  }

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id))
    if (selectedBlockId === id) { setSelectedBlockId(null); setRightTab('page') }
  }

  const moveBlock = (id: string, dir: 'up' | 'down') => {
    const idx = blocks.findIndex(b => b.id === id)
    if ((dir === 'up' && idx === 0) || (dir === 'down' && idx === blocks.length - 1)) return
    const nb = [...blocks]
    const swap = dir === 'up' ? idx - 1 : idx + 1
    ;[nb[idx], nb[swap]] = [nb[swap], nb[idx]]
    setBlocks(nb)
  }


  // ── Free-form Canvas Mouse Handlers ──────────────────────────────────────────

  const handleBlockMouseDown = useCallback((e: React.MouseEvent, blockId: string) => {
    if ((e.target as HTMLElement).dataset.resizeHandle) return
    e.preventDefault()
    e.stopPropagation()
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    if (!canvasRect) return
    setBlocks(prev => {
      const block = prev.find(b => b.id === blockId)
      if (!block) return prev
      const posX = parseInt(block.style.posX || '0')
      const posY = parseInt(block.style.posY || '0')
      setDragInfo({ blockId, offsetX: e.clientX - canvasRect.left - posX + canvasRef.current!.scrollLeft, offsetY: e.clientY - canvasRect.top - posY + canvasRef.current!.scrollTop })
      return prev
    })
    setSelectedBlockId(blockId)
    setRightTab('block')
  }, [])

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, blockId: string, handle: string) => {
    e.preventDefault()
    e.stopPropagation()
    setBlocks(prev => {
      const block = prev.find(b => b.id === blockId)
      if (!block) return prev
      const el = document.getElementById(`block-${blockId}`)
      const rect = el?.getBoundingClientRect()
      setResizeInfo({
        blockId, handle,
        startX: e.clientX, startY: e.clientY,
        startPosX: parseInt(block.style.posX || '0'),
        startPosY: parseInt(block.style.posY || '0'),
        startW: rect?.width || parseInt(block.style.width || '400'),
        startH: rect?.height || parseInt(block.style.height || '200'),
      })
      return prev
    })
  }, [])

  useEffect(() => {
    if (!dragInfo && !resizeInfo) return
    const handleMouseMove = (e: MouseEvent) => {
      if (dragInfo) {
        const canvasRect = canvasRef.current?.getBoundingClientRect()
        if (!canvasRect) return
        const scrollLeft = canvasRef.current!.scrollLeft
        const scrollTop = canvasRef.current!.scrollTop
        const newX = Math.max(0, Math.round(e.clientX - canvasRect.left + scrollLeft - dragInfo.offsetX))
        const newY = Math.max(0, Math.round(e.clientY - canvasRect.top + scrollTop - dragInfo.offsetY))
        setBlocks(prev => prev.map(b => b.id === dragInfo.blockId
          ? { ...b, style: { ...b.style, posX: String(newX), posY: String(newY) } }
          : b
        ))
      }
      if (resizeInfo) {
        const dx = e.clientX - resizeInfo.startX
        const dy = e.clientY - resizeInfo.startY
        const h = resizeInfo.handle
        let w = resizeInfo.startW, ht = resizeInfo.startH
        let px = resizeInfo.startPosX, py = resizeInfo.startPosY
        if (h.includes('e')) w = Math.max(50, resizeInfo.startW + dx)
        if (h.includes('w')) { w = Math.max(50, resizeInfo.startW - dx); px = resizeInfo.startPosX + resizeInfo.startW - w }
        if (h.includes('s')) ht = Math.max(30, resizeInfo.startH + dy)
        if (h.includes('n')) { ht = Math.max(30, resizeInfo.startH - dy); py = resizeInfo.startPosY + resizeInfo.startH - ht }
        setBlocks(prev => prev.map(b => b.id === resizeInfo.blockId
          ? { ...b, style: { ...b.style, width: String(Math.round(w)), height: String(Math.round(ht)), posX: String(Math.round(px)), posY: String(Math.round(py)) } }
          : b
        ))
      }
    }
    const handleMouseUp = () => { setDragInfo(null); setResizeInfo(null) }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp) }
  }, [dragInfo, resizeInfo])

  const duplicateBlock = (id: string) => {
    const idx = blocks.findIndex(b => b.id === id)
    if (idx === -1) return
    const clone: Block = { ...JSON.parse(JSON.stringify(blocks[idx])), id: genId() }
    const nb = [...blocks]
    nb.splice(idx + 1, 0, clone)
    setBlocks(nb)
    setSelectedBlockId(clone.id)
  }

  // ═══ LIST VIEW ══════════════════════════════════════════════════════════════

  if (mode === 'list') {
    return (
      <AdminLayout title="Хуудас удирдах">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Хуудас удирдах</h1>
              <p className="text-sm text-gray-500 mt-1">WordPress шиг хүссэн дизайнтай хуудас үүсгэнэ</p>
            </div>
            <button onClick={handleNewPage}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium shadow-sm">
              <PlusIcon className="h-5 w-5" />
              Шинэ хуудас
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Нийт хуудас', value: pages.length, bg: 'bg-blue-50 text-blue-700' },
              { label: 'Идэвхтэй', value: pages.filter(p => p.active).length, bg: 'bg-emerald-50 text-emerald-700' },
              { label: 'Идэвхгүй', value: pages.filter(p => !p.active).length, bg: 'bg-amber-50 text-amber-700' },
            ].map(s => (
              <div key={s.label} className={`rounded-xl p-5 ${s.bg}`}>
                <div className="text-sm font-medium opacity-70">{s.label}</div>
                <div className="text-3xl font-bold mt-1">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Pages Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-teal-600 border-t-transparent mx-auto mb-4" />
              <p className="text-gray-500">Уншиж байна...</p>
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
              <DocumentDuplicateIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Хуудас байхгүй</h3>
              <p className="text-gray-500 mb-6">Эхний хуудсаа үүсгээрэй</p>
              <button onClick={handleNewPage} className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700">
                <PlusIcon className="h-5 w-5" />Шинэ хуудас
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {pages.map(page => {
                const tmn = getTrans(page.title_translations, 1)
                let blockCount = 0
                try { blockCount = page.content_blocks ? JSON.parse(page.content_blocks).length : 0 } catch { /* empty */ }
                return (
                  <div key={page.id} className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-teal-300 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${page.active ? 'bg-teal-50' : 'bg-gray-100'}`}>
                          <DocumentDuplicateIcon className={`h-6 w-6 ${page.active ? 'text-teal-600' : 'text-gray-400'}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">{tmn.label || 'Нэргүй'}</h3>
                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${page.active ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {page.active ? 'Идэвхтэй' : 'Идэвхгүй'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><LinkIcon className="h-3.5 w-3.5" />{page.url || '/'}</span>
                            <span className="text-gray-300">·</span>
                            <span>{blockCount} блок</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditPage(page)} className="p-2.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Засах">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(page.id)} className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Устгах">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </AdminLayout>
    )
  }

  // ═══ EDITOR VIEW ═════════════════════════════════════════════════════════════

  return (
    <AdminLayout title={pageSettings.title_mn || 'Шинэ хуудас'}>
      <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
        {/* ── Top Bar ──────────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setMode('list')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="Буцах">
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="h-6 w-px bg-gray-200" />
            <input
              type="text" value={pageSettings.title_mn}
              onChange={e => setPageSettings(s => ({ ...s, title_mn: e.target.value }))}
              placeholder="Хуудасны нэр..."
              className="text-lg font-semibold border-none focus:ring-0 focus:outline-none bg-transparent w-52 placeholder:text-gray-300"
            />
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2.5 py-1.5">
              <LinkIcon className="h-3.5 w-3.5 text-gray-400" />
              <input type="text" value={pageSettings.url}
                onChange={e => setPageSettings(s => ({ ...s, url: e.target.value }))}
                placeholder="/url"
                className="text-sm border-none focus:ring-0 focus:outline-none bg-transparent w-32 placeholder:text-gray-400"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-gray-50">
              <input type="checkbox" checked={pageSettings.active}
                onChange={e => setPageSettings(s => ({ ...s, active: e.target.checked }))}
                className="rounded text-teal-600 focus:ring-teal-500" />
              Идэвхтэй
            </label>
            <button onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showPreview ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {showPreview ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              {showPreview ? 'Засварлах' : 'Урьдчилан үзэх'}
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium text-sm shadow-sm">
              {saving && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
              {saving ? 'Хадгалж байна...' : 'Хадгалах'}
            </button>
          </div>
        </div>

        {/* ── Editor Body ──────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left: Block Palette */}
          {!showPreview && (
            <div className="w-52 bg-gray-50 border-r border-gray-200 overflow-y-auto shrink-0 p-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Блок нэмэх</h3>
              <div className="grid grid-cols-2 gap-1.5">
                {BLOCK_DEFS.map(bt => {
                  const Icon = bt.icon
                  return (
                    <button key={bt.type} onClick={() => addBlock(bt.type)}
                      className="flex flex-col items-center gap-1 p-2.5 bg-white border border-gray-200 rounded-lg hover:border-teal-300 hover:shadow-sm transition-all group"
                      title={bt.desc}>
                      <Icon className="h-5 w-5 text-gray-400 group-hover:text-teal-600 transition-colors" />
                      <span className="text-[11px] font-medium text-gray-500 group-hover:text-teal-700">{bt.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Center: Canvas */}
          <div className="flex-1 overflow-auto bg-gray-100" onClick={() => { setSelectedBlockId(null); setRightTab('page') }}>
            {showPreview ? (
              /* ── Preview Mode ── */
              <div className="p-8" style={{ maxWidth: layoutSettings.fullWidth ? '100%' : `${layoutSettings.maxWidth || 1200}px`, margin: '0 auto' }}>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-4 text-white">
                    <div className="flex items-center gap-2 text-sm opacity-75 mb-1">
                      <LinkIcon className="h-3.5 w-3.5" />
                      {pageSettings.url || '/'}
                    </div>
                    <h1 className="text-2xl font-bold">{pageSettings.title_mn || 'Нэргүй хуудас'}</h1>
                  </div>
                  <div style={{
                    position: 'relative',
                    minHeight: `${Math.max(600, blocks.reduce((max, b) => Math.max(max, parseInt(b.style.posY || '0') + parseInt(b.style.height || '200')), 0) + 100)}px`,
                    paddingTop: `${layoutSettings.pagePaddingTop || 32}px`,
                    paddingBottom: `${layoutSettings.pagePaddingBottom || 32}px`,
                    paddingLeft: `${layoutSettings.pagePaddingLeft || 32}px`,
                    paddingRight: `${layoutSettings.pagePaddingRight || 32}px`,
                  }}>
                    {blocks.length === 0 ? (
                      <p className="text-center text-gray-400 py-20">Блок нэмж хуудасаа бүрдүүлнэ үү</p>
                    ) : (
                      blocks.map(block => (
                        <div key={block.id} style={{
                          position: 'absolute',
                          left: `${block.style.posX || 0}px`,
                          top: `${block.style.posY || 0}px`,
                          width: block.style.width ? `${block.style.width}px` : 'auto',
                          height: block.style.height ? `${block.style.height}px` : 'auto',
                          zIndex: parseInt(block.style.zIndex || '1'),
                          overflow: 'hidden',
                        }}>
                          <RenderBlock block={block} lang="mn" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* ── Free-form Edit Canvas ── */
              <div
                ref={canvasRef}
                className="relative bg-white"
                style={{
                  width: `${Math.max(1200, blocks.reduce((max, b) => Math.max(max, parseInt(b.style?.posX || '0') + parseInt(b.style?.width || '600') + 100), 0))}px`,
                  height: `${Math.max(2000, blocks.reduce((max, b) => Math.max(max, parseInt(b.style?.posY || '0') + parseInt(b.style?.height || '200') + 200), 0))}px`,
                  backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  cursor: dragInfo ? 'grabbing' : 'default',
                }}
                onClick={(e) => { e.stopPropagation(); setSelectedBlockId(null); setRightTab('page') }}
              >
                {blocks.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center py-24 px-12 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/60">
                      <DocumentDuplicateIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-500 mb-2">Хоосон хуудас</h3>
                      <p className="text-gray-400 mb-6">Зүүн талаас блок сонгож нэмнэ үү</p>
                      <button onClick={(e) => { e.stopPropagation(); setShowBlockPalette(true); setAddAfterBlockId(null) }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-medium">
                        <PlusIcon className="h-5 w-5" />Блок нэмэх
                      </button>
                    </div>
                  </div>
                )}

                {blocks.map(block => {
                  const blockDef = BLOCK_DEFS.find(bt => bt.type === block.type)
                  const Icon = blockDef?.icon || DocumentTextIcon
                  const isSelected = selectedBlockId === block.id
                  const bs = block.style

                  return (
                    <div
                      key={block.id}
                      id={`block-${block.id}`}
                      onMouseDown={e => handleBlockMouseDown(e, block.id)}
                      onClick={e => { e.stopPropagation(); setSelectedBlockId(block.id); setRightTab('block') }}
                      className={`group absolute ${dragInfo?.blockId === block.id ? 'cursor-grabbing' : 'cursor-grab'}`}
                      style={{
                        left: `${bs.posX || 0}px`,
                        top: `${bs.posY || 0}px`,
                        width: bs.width ? `${bs.width}px` : 'auto',
                        height: bs.height ? `${bs.height}px` : 'auto',
                        zIndex: parseInt(bs.zIndex || '1'),
                        minWidth: '50px',
                        minHeight: '30px',
                        outline: isSelected ? '2px solid #0d9488' : undefined,
                        outlineOffset: '1px',
                        boxShadow: isSelected ? '0 0 0 4px rgba(13,148,136,0.15)' : '0 1px 3px rgba(0,0,0,0.08)',
                        transition: dragInfo?.blockId === block.id || resizeInfo?.blockId === block.id ? 'none' : 'box-shadow 0.15s',
                      }}
                    >
                      {/* Block type label */}
                      <div className={`absolute -top-6 left-0 z-30 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-600 text-white text-[11px] rounded-md font-medium shadow-sm whitespace-nowrap">
                          <Icon className="h-3 w-3" />
                          {blockDef?.label}
                          <span className="opacity-60 ml-1">{bs.width ? `${bs.width}×${bs.height || 'auto'}` : ''}</span>
                        </span>
                      </div>

                      {/* Block toolbar */}
                      <div className={`absolute -top-6 right-0 flex items-center gap-0.5 z-30 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                        <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); duplicateBlock(block.id) }}
                          className="p-1 bg-white border border-gray-200 rounded hover:bg-gray-50 shadow-sm" title="Хуулах">
                          <DocumentDuplicateIcon className="h-3 w-3 text-gray-500" />
                        </button>
                        <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); deleteBlock(block.id) }}
                          className="p-1 bg-white border border-red-200 rounded hover:bg-red-50 shadow-sm" title="Устгах">
                          <TrashIcon className="h-3 w-3 text-red-500" />
                        </button>
                      </div>

                      {/* Block content */}
                      <div className="w-full h-full overflow-hidden bg-white rounded-lg" style={{ pointerEvents: dragInfo ? 'none' : 'auto' }}>
                        <RenderBlock block={block} lang="mn" />
                      </div>

                      {/* Resize handles */}
                      {isSelected && RESIZE_HANDLES.map(handle => {
                        const pos: React.CSSProperties = {}
                        if (handle.includes('n')) pos.top = -5
                        if (handle.includes('s')) pos.bottom = -5
                        if (handle.includes('w')) pos.left = -5
                        if (handle.includes('e')) pos.right = -5
                        if (handle === 'n' || handle === 's') { pos.left = '50%'; pos.marginLeft = -5 }
                        if (handle === 'w' || handle === 'e') { pos.top = '50%'; pos.marginTop = -5 }
                        if (handle === 'nw') { pos.top = -5; pos.left = -5 }
                        if (handle === 'ne') { pos.top = -5; pos.right = -5 }
                        if (handle === 'sw') { pos.bottom = -5; pos.left = -5 }
                        if (handle === 'se') { pos.bottom = -5; pos.right = -5 }
                        const cursorMap: Record<string, string> = { nw: 'nw-resize', n: 'n-resize', ne: 'ne-resize', w: 'w-resize', e: 'e-resize', sw: 'sw-resize', s: 's-resize', se: 'se-resize' }
                        return (
                          <div
                            key={handle}
                            data-resize-handle="true"
                            onMouseDown={e => handleResizeMouseDown(e, block.id, handle)}
                            className="absolute z-40 w-[10px] h-[10px] bg-white border-2 border-teal-500 rounded-sm hover:bg-teal-100"
                            style={{ ...pos, cursor: cursorMap[handle] }}
                          />
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right: Settings Panel */}
          {!showPreview && (
            <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto shrink-0 flex flex-col">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 shrink-0">
                <button onClick={() => setRightTab('page')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${rightTab === 'page' ? 'text-teal-700 border-b-2 border-teal-600 bg-teal-50/50' : 'text-gray-500 hover:text-gray-700'}`}>
                  Хуудас
                </button>
                <button onClick={() => setRightTab('block')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${rightTab === 'block' ? 'text-teal-700 border-b-2 border-teal-600 bg-teal-50/50' : 'text-gray-500 hover:text-gray-700'} ${!selectedBlock ? 'opacity-40' : ''}`}>
                  Блок
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {rightTab === 'page' ? (
                  /* ── Page Settings ── */
                  <div className="space-y-4">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Хуудасны тохиргоо</h4>
                    <SInput label="🇲🇳 Гарчиг (MN)" value={pageSettings.title_mn} onChange={v => setPageSettings(s => ({ ...s, title_mn: v }))} placeholder="Хуудасны нэр" />
                    <SInput label="🇺🇸 Title (EN)" value={pageSettings.title_en} onChange={v => setPageSettings(s => ({ ...s, title_en: v }))} placeholder="Page title" />
                    <div>
                      <SInput label="URL хаяг" value={pageSettings.url} onChange={v => setPageSettings(s => ({ ...s, url: v }))} placeholder="/about-us" />
                      <p className="text-xs text-gray-400 mt-1">Жишээ: /about-us, /services/loan</p>
                    </div>
                    <SInput label="Зураг (URL)" value={pageSettings.image} onChange={v => setPageSettings(s => ({ ...s, image: v }))} placeholder="https://..." />
                    {pageSettings.image && (
                      <img src={pageSettings.image} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                    )}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <input type="checkbox" checked={pageSettings.active}
                        onChange={e => setPageSettings(s => ({ ...s, active: e.target.checked }))}
                        className="rounded text-teal-600 focus:ring-teal-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Идэвхтэй</span>
                        <p className="text-xs text-gray-400">Вэбсайтад харагдана</p>
                      </div>
                    </div>

                    {/* Layout Settings */}
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Байршил тохиргоо</h4>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <input type="checkbox" checked={layoutSettings.fullWidth}
                          onChange={e => setLayoutSettings(s => ({ ...s, fullWidth: e.target.checked }))}
                          className="rounded text-teal-600 focus:ring-teal-500" />
                        <div>
                          <span className="text-sm font-medium text-gray-700">Дэлгэцний бүтэн өргөн</span>
                          <p className="text-xs text-gray-400">Хуудсыг бүрэн өргөнөөр харуулах</p>
                        </div>
                      </div>
                      {!layoutSettings.fullWidth && (
                        <SInput label="Хамгийн их өргөн (px)" value={layoutSettings.maxWidth}
                          onChange={v => setLayoutSettings(s => ({ ...s, maxWidth: v }))} placeholder="1200" />
                      )}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Хуудасны дотоод зай (px)</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'pagePaddingTop', l: 'Дээр' },
                            { key: 'pagePaddingBottom', l: 'Доор' },
                            { key: 'pagePaddingLeft', l: 'Зүүн' },
                            { key: 'pagePaddingRight', l: 'Бар.' },
                          ].map(p => (
                            <div key={p.key} className="flex items-center gap-1">
                              <span className="text-xs text-gray-400 w-8">{p.l}</span>
                              <input type="number" value={(layoutSettings as any)[p.key] || '0'}
                                onChange={e => setLayoutSettings(s => ({ ...s, [p.key]: e.target.value }))}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-xs" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Block summary */}
                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Блокууд ({blocks.length})</h4>
                      {blocks.length === 0 ? (
                        <p className="text-sm text-gray-400">Блок нэмэгдээгүй байна</p>
                      ) : (
                        <div className="space-y-1">
                          {blocks.map((b, i) => {
                            const def = BLOCK_DEFS.find(d => d.type === b.type)
                            const Icon = def?.icon || DocumentTextIcon
                            return (
                              <button key={b.id}
                                onClick={() => { setSelectedBlockId(b.id); setRightTab('block') }}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${selectedBlockId === b.id ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50 text-gray-600'}`}>
                                <span className="text-xs text-gray-400 w-5">{i + 1}</span>
                                <Icon className="h-4 w-4 shrink-0" />
                                <span className="truncate">{def?.label}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ) : selectedBlock ? (
                  /* ── Block Settings ── */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {(() => { const Icon = BLOCK_DEFS.find(d => d.type === selectedBlock.type)?.icon || DocumentTextIcon; return <Icon className="h-5 w-5 text-teal-600" /> })()}
                        <h3 className="font-semibold text-gray-900">{BLOCK_DEFS.find(d => d.type === selectedBlock.type)?.label}</h3>
                      </div>
                      <button onClick={() => { setSelectedBlockId(null); setRightTab('page') }} className="p-1 hover:bg-gray-100 rounded">
                        <XMarkIcon className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Агуулга</h4>
                      <BlockContentEditor block={selectedBlock} onChange={updates => updateBlockContent(selectedBlock.id, updates)} />
                    </div>

                    {/* Style */}
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Загвар</h4>
                      <BlockStyleEditor block={selectedBlock} onChange={updates => updateBlockStyle(selectedBlock.id, updates)} />
                    </div>

                    {/* Delete */}
                    <div className="pt-4 border-t border-gray-100">
                      <button onClick={() => deleteBlock(selectedBlock.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors">
                        <TrashIcon className="h-4 w-4" />
                        Блок устгах
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── No block selected ── */
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <CursorArrowRaysIcon className="h-10 w-10 text-gray-200 mb-3" />
                    <p className="text-gray-500 font-medium">Блок сонгоно уу</p>
                    <p className="text-sm text-gray-400 mt-1">Блок дээр дарж тохиргоо хийнэ</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Block Palette Modal ───────────────────────────────────────────── */}
        {showBlockPalette && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowBlockPalette(false)}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-[420px] max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-gray-900">Блок нэмэх</h3>
                <button onClick={() => setShowBlockPalette(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <XMarkIcon className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {BLOCK_DEFS.map(bt => {
                  const Icon = bt.icon
                  return (
                    <button key={bt.type} onClick={() => addBlock(bt.type, addAfterBlockId)}
                      className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-xl hover:border-teal-400 hover:bg-teal-50 transition-all group">
                      <Icon className="h-6 w-6 text-gray-400 group-hover:text-teal-600" />
                      <span className="text-xs font-medium text-gray-600 group-hover:text-teal-700">{bt.label}</span>
                      <span className="text-[10px] text-gray-400">{bt.desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
