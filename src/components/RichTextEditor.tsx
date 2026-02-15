'use client'
import { useRef, useEffect, useCallback, useState } from 'react'

interface RichTextEditorProps {
  label: string
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
  error?: string
}

const FONT_FAMILIES = [
  'Roboto',
  'Arial',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Tahoma',
  'Courier New',
  'Trebuchet MS',
]

export default function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = '',
  minHeight = '120px',
  error,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isInternal = useRef(false)
  const [fontSize, setFontSize] = useState(16)
  const [fontColor, setFontColor] = useState('#000000')
  const [fontFamily, setFontFamily] = useState('Roboto')
  const [isFocused, setIsFocused] = useState(false)

  // Sync external value → editor (skip if change was from editor itself)
  useEffect(() => {
    if (editorRef.current && !isInternal.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || ''
      }
    }
    isInternal.current = false
  }, [value])

  const emitChange = useCallback(() => {
    if (editorRef.current) {
      isInternal.current = true
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val)
    editorRef.current?.focus()
    emitChange()
  }

  const applyFontSize = () => {
    document.execCommand('fontSize', false, '7')
    const els = editorRef.current?.querySelectorAll('font[size="7"]')
    els?.forEach((el) => {
      const span = document.createElement('span')
      span.style.fontSize = `${fontSize}px`
      span.innerHTML = el.innerHTML
      el.parentNode?.replaceChild(span, el)
    })
    editorRef.current?.focus()
    emitChange()
  }

  const isEmpty =
    !value ||
    value === '<br>' ||
    value === '<div><br></div>' ||
    value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() === ''

  /* ── Toolbar button helper ── */
  const TBtn = ({
    onClick,
    title,
    children,
    className = '',
  }: {
    onClick: () => void
    title: string
    children: React.ReactNode
    className?: string
  }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`p-1.5 rounded text-sm transition-colors hover:bg-gray-200 text-gray-600 ${className}`}
      title={title}
    >
      {children}
    </button>
  )

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      {/* ─── Toolbar ─── */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border border-gray-300 rounded-t-lg bg-gray-50">
        {/* Bold */}
        <TBtn onClick={() => exec('bold')} title="Тод (Bold)">
          <span className="font-bold w-5 inline-block text-center">B</span>
        </TBtn>

        {/* Italic */}
        <TBtn onClick={() => exec('italic')} title="Налуу (Italic)">
          <span className="italic w-5 inline-block text-center">I</span>
        </TBtn>

        {/* Underline */}
        <TBtn onClick={() => exec('underline')} title="Доогуур зураас (Underline)">
          <span className="underline w-5 inline-block text-center">U</span>
        </TBtn>

        <div className="w-px h-6 bg-gray-300 mx-0.5" />

        {/* Align Left */}
        <TBtn onClick={() => exec('justifyLeft')} title="Зүүн тэгш">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M3 6h18M3 12h12M3 18h18" />
          </svg>
        </TBtn>

        {/* Align Center */}
        <TBtn onClick={() => exec('justifyCenter')} title="Голд тэгш">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M3 6h18M6 12h12M3 18h18" />
          </svg>
        </TBtn>

        {/* Align Right */}
        <TBtn onClick={() => exec('justifyRight')} title="Баруун тэгш">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M3 6h18M9 12h12M3 18h18" />
          </svg>
        </TBtn>

        {/* Justify */}
        <TBtn onClick={() => exec('justifyFull')} title="Хоёр тал тэгш">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </TBtn>

        <div className="w-px h-6 bg-gray-300 mx-0.5" />

        {/* Font Size */}
        <div className="flex items-center">
          <input
            type="number"
            min={8}
            max={72}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value) || 16)}
            className="w-12 px-1 py-1 text-xs border border-gray-300 rounded-l text-center bg-white"
            title="Фонт хэмжээ (px)"
          />
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={applyFontSize}
            className="px-1.5 py-1 text-xs font-medium bg-gray-200 hover:bg-gray-300 rounded-r border border-l-0 border-gray-300"
            title="Хэмжээ хэрэглэх"
          >
            px
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-0.5" />

        {/* Font Family */}
        <select
          value={fontFamily}
          onChange={(e) => {
            setFontFamily(e.target.value)
            exec('fontName', e.target.value)
          }}
          className="px-1.5 py-1 text-xs border border-gray-300 rounded bg-white max-w-[110px]"
          title="Фонт"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f} value={f} style={{ fontFamily: f }}>
              {f}
            </option>
          ))}
        </select>

        <div className="w-px h-6 bg-gray-300 mx-0.5" />

        {/* Text Color */}
        <label
          className="relative flex items-center justify-center w-8 h-8 rounded border border-gray-300 bg-white cursor-pointer hover:bg-gray-100"
          title="Текст өнгө сонгох"
        >
          <input
            type="color"
            value={fontColor}
            onChange={(e) => {
              setFontColor(e.target.value)
              exec('foreColor', e.target.value)
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <span className="text-sm font-bold leading-none" style={{ color: fontColor }}>
            A
          </span>
          <span
            className="absolute bottom-0.5 left-1.5 right-1.5 h-[3px] rounded-sm"
            style={{ backgroundColor: fontColor }}
          />
        </label>
      </div>

      {/* ─── Editor area ─── */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`border border-gray-300 border-t-0 rounded-b-lg px-3 py-2.5 outline-none overflow-auto text-sm text-gray-900 transition-shadow ${
            isFocused ? 'ring-2 ring-teal-500 border-teal-500' : ''
          } ${error ? 'border-red-500' : ''}`}
          style={{ minHeight }}
        />
        {/* Placeholder */}
        {isEmpty && !isFocused && (
          <div className="absolute top-2.5 left-3 text-gray-400 text-sm pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
