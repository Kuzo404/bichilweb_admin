import { Input, Button, Textarea } from './FormElements'

type TextStyle = {
  color: string
  fontSize: {
    mobile: number
    desktop: number
  }
  fontWeight: 'normal' | 'bold'
  align: 'left' | 'center' | 'right'
}

type StylePreset = 'heroTitle' | 'sectionTitle' | 'paragraph' | 'note' | 'custom'

type TextBlock = {
  id: string
  type: 'title' | 'subtitle' | 'paragraph' | 'note'
  content_mn: string
  content_en: string
  style: TextStyle
  stylePreset: StylePreset
  placement: 'hero' | 'details' | 'footer'
  order: number
  visible: boolean
}

interface TextBlockEditorProps {
  title: string
  blocks: TextBlock[]
  onChange: (blocks: TextBlock[]) => void
  editLang?: 'mn' | 'en' // Optional for backward compatibility
}

export default function TextBlockEditor({
  title,
  blocks,
  onChange,
}: TextBlockEditorProps) {
  const addBlock = () => {
    const newBlock: TextBlock = {
      id: crypto.randomUUID(),
      type: 'paragraph',
      content_mn: '',
      content_en: '',
      style: {
        color: '#1e293b',
        fontSize: {
          mobile: 14,
          desktop: 16,
        },
        fontWeight: 'normal',
        align: 'left',
      },
      stylePreset: 'paragraph',
      placement: 'details',
      order: blocks.length + 1,
      visible: true,
    }
    onChange([...blocks, newBlock])
  }

  const updateBlock = (index: number, updates: Partial<TextBlock>) => {
    const newBlocks = [...blocks]
    newBlocks[index] = { ...newBlocks[index], ...updates }
    onChange(newBlocks)
  }

  const deleteBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index))
  }

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return

    ;[newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]]
    
    // Update order
    newBlocks.forEach((block, i) => {
      block.order = i + 1
    })

    onChange(newBlocks)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <div key={block.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                Block #{index + 1}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => moveBlock(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveBlock(index, 'down')}
                  disabled={index === blocks.length - 1}
                  className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  onClick={() => deleteBlock(index)}
                  className="p-1 text-red-600 hover:text-red-800"
                  title="Delete"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <Textarea
                  label="Агуулга (MN)"
                  value={block.content_mn}
                  onChange={(e) => updateBlock(index, { content_mn: e.target.value })}
                  rows={2}
                  placeholder="Монгол хэлээр..."
                />
                <Textarea
                  label="Content (EN)"
                  value={block.content_en}
                  onChange={(e) => updateBlock(index, { content_en: e.target.value })}
                  rows={2}
                  placeholder="In English..."
                />
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Төрөл / Type
                  </label>
                  <select
                    value={block.type}
                    onChange={(e) =>
                      updateBlock(index, {
                        type: e.target.value as 'title' | 'subtitle' | 'paragraph' | 'note',
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm"
                  >
                    <option value="title">Title</option>
                    <option value="subtitle">Subtitle</option>
                    <option value="paragraph">Paragraph</option>
                    <option value="note">Note</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Байрлал / Placement
                  </label>
                  <select
                    value={block.placement}
                    onChange={(e) =>
                      updateBlock(index, {
                        placement: e.target.value as 'hero' | 'details' | 'footer',
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm"
                  >
                    <option value="hero">Hero</option>
                    <option value="details">Details</option>
                    <option value="footer">Footer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Загвар / Preset
                  </label>
                  <select
                    value={block.stylePreset}
                    onChange={(e) => {
                      const preset = e.target.value as StylePreset
                      let newStyle = { ...block.style }
                      
                      // Apply preset styles
                      if (preset === 'heroTitle') {
                        newStyle = {
                          color: '#0f172a',
                          fontSize: { mobile: 20, desktop: 24 },
                          fontWeight: 'bold',
                          align: 'center',
                        }
                      } else if (preset === 'sectionTitle') {
                        newStyle = {
                          color: '#1e293b',
                          fontSize: { mobile: 16, desktop: 18 },
                          fontWeight: 'bold',
                          align: 'left',
                        }
                      } else if (preset === 'paragraph') {
                        newStyle = {
                          color: '#64748b',
                          fontSize: { mobile: 13, desktop: 14 },
                          fontWeight: 'normal',
                          align: 'left',
                        }
                      } else if (preset === 'note') {
                        newStyle = {
                          color: '#94a3b8',
                          fontSize: { mobile: 11, desktop: 12 },
                          fontWeight: 'normal',
                          align: 'left',
                        }
                      }
                      
                      updateBlock(index, {
                        stylePreset: preset,
                        ...(preset !== 'custom' && { style: newStyle }),
                      })
                    }}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm"
                  >
                    <option value="heroTitle">Hero Title</option>
                    <option value="sectionTitle">Section Title</option>
                    <option value="paragraph">Paragraph</option>
                    <option value="note">Note</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Харагдах / Visible
                  </label>
                  <input
                    type="checkbox"
                    checked={block.visible}
                    onChange={(e) =>
                      updateBlock(index, {
                        visible: e.target.checked,
                      })
                    }
                    className="mt-2 w-5 h-5 text-teal-600 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <Input
                  type="color"
                  label="Өнгө / Color"
                  value={block.style.color}
                  onChange={(e) =>
                    updateBlock(index, {
                      style: { ...block.style, color: e.target.value },
                      stylePreset: 'custom',
                    })
                  }
                />

                <Input
                  type="number"
                  label="Хэмжээ (Mobile)"
                  value={block.style.fontSize.mobile}
                  onChange={(e) =>
                    updateBlock(index, {
                      style: { 
                        ...block.style, 
                        fontSize: { ...block.style.fontSize, mobile: Number(e.target.value) }
                      },
                      stylePreset: 'custom',
                    })
                  }
                />

                <Input
                  type="number"
                  label="Хэмжээ (Desktop)"
                  value={block.style.fontSize.desktop}
                  onChange={(e) =>
                    updateBlock(index, {
                      style: { 
                        ...block.style, 
                        fontSize: { ...block.style.fontSize, desktop: Number(e.target.value) }
                      },
                      stylePreset: 'custom',
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Зузаан / Weight
                  </label>
                  <select
                    value={block.style.fontWeight}
                    onChange={(e) =>
                      updateBlock(index, {
                        style: {
                          ...block.style,
                          fontWeight: e.target.value as 'normal' | 'bold',
                        },
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Байрлал / Align
                  </label>
                  <select
                    value={block.style.align}
                    onChange={(e) =>
                      updateBlock(index, {
                        style: {
                          ...block.style,
                          align: e.target.value as 'left' | 'center' | 'right',
                        },
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}

        <Button onClick={addBlock}>
          + Block нэмэх / Add Block
        </Button>
      </div>
    </div>
  )
}
