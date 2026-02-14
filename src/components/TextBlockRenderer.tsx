type TextStyle = {
  color: string
  fontSize: {
    mobile: number
    desktop: number
  }
  fontWeight: 'normal' | 'bold'
  align: 'left' | 'center' | 'right'
}

type TextBlock = {
  id: string
  type: 'title' | 'subtitle' | 'paragraph' | 'note'
  content_mn: string
  content_en: string
  style: TextStyle
  placement: 'hero' | 'details' | 'footer'
  order: number
  visible: boolean
}

interface TextBlockRendererProps {
  block: TextBlock
  language: 'mn' | 'en'
}

export default function TextBlockRenderer({ block, language }: TextBlockRendererProps) {
  if (!block.visible) return null
  
  const content = language === 'mn' ? block.content_mn : block.content_en

  const style = {
    color: block.style.color,
    fontSize: `${block.style.fontSize.mobile}px`,
    fontWeight: block.style.fontWeight,
    textAlign: block.style.align,
    ['--desktop-size' as any]: `${block.style.fontSize.desktop}px`,
  }

  const commonClass = 'my-4 md:text-[var(--desktop-size)]'

  switch (block.type) {
    case 'title':
      return (
        <h1 className={`${commonClass} font-extrabold`} style={style}>
          {content}
        </h1>
      )

    case 'subtitle':
      return (
        <h2 className={`${commonClass} font-bold`} style={style}>
          {content}
        </h2>
      )

    case 'note':
      return (
        <p className={`${commonClass} italic opacity-80`} style={style}>
          {content}
        </p>
      )

    case 'paragraph':
    default:
      return (
        <p className={commonClass} style={style}>
          {content}
        </p>
      )
  }
}
