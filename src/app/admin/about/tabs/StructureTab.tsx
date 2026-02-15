'use client'

import { useCallback, useState, useEffect } from 'react'
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  Node,
  Edge,
  NodeProps,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { axiosInstance } from '@/lib/axios'

interface OrgNode {
  id: string
  position: { x: number; y: number }
  data: { label: string; isRoot?: boolean }
  type?: string
}

interface OrgEdge {
  id: string
  source: string
  target: string
  type?: string
  markerEnd?: { type: string }
  style?: { stroke: string; strokeWidth: number }
}

interface OrgChartData {
  nodes: OrgNode[]
  edges: OrgEdge[]
}

/* ----------------------------------
   UTILITY FUNCTIONS
-----------------------------------*/
const download = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/* ----------------------------------
   DEFAULT STYLES
-----------------------------------*/
const DEFAULT_EDGE_OPTIONS: any = {
  type: 'smoothstep',
  markerEnd: { type: 'arrowclosed' },
  style: { stroke: '#14b8a6', strokeWidth: 2 },
}

/* ----------------------------------
   Mock data (backend оронд)
-----------------------------------*/
const initialNodes: Node[] = []
const initialEdges: Edge[] = []

/* ----------------------------------
   Custom node (dark, minimalist)
-----------------------------------*/
function OrgNode({ data }: NodeProps) {
  const { preview } = data as any

  return (
    <div
      className={`rounded-lg px-4 py-2 text-sm text-white bg-zinc-800 border border-zinc-700 shadow ${
        preview ? 'cursor-default' : 'cursor-pointer'
      }`}
    >
      {!preview && <Handle type="target" position={Position.Top} />}
      {data.label}
      {!preview && <Handle type="source" position={Position.Bottom} />}
    </div>
  )
}

const nodeTypes = {
  org: OrgNode,
}

/* ----------------------------------
   AUTO LAYOUT ALGORITHM
-----------------------------------*/
const LEVEL_HEIGHT = 140
const SIBLING_GAP = 220

interface TreeNode extends Node {
  children?: TreeNode[]
  level?: number
}

function buildTree(nodes: Node[], parentId: string | null = null): TreeNode[] {
  return nodes
    .filter((n) => {
      // Олох parent id - edges-аас харна
      return !initialEdges.find(
        (e) => e.target === n.id && e.source !== parentId
      ) || parentId === null
    })
    .map((n) => ({
      ...n,
      children: buildTree(
        nodes,
        n.id
      ),
    }))
}

function assignLevels(node: TreeNode, level: number = 0): void {
  node.level = level
  node.children?.forEach((child) => assignLevels(child, level + 1))
}

function layoutChildren(children: TreeNode[], centerX: number): void {
  if (children.length === 0) return

  const totalWidth = (children.length - 1) * SIBLING_GAP
  children.forEach((child, i) => {
    child.position!.x = centerX - totalWidth / 2 + i * SIBLING_GAP
    if (child.children) {
      layoutChildren(child.children, child.position!.x)
    }
  })
}

function autoLayoutTree(nodes: Node[]): Node[] {
  // edges-ээс tree үүсгэ
  const findRoot = (nds: Node[]) =>
    nds.find(
      (n) => !initialEdges.some((e) => e.target === n.id)
    ) || nds[0]

  const root = findRoot(nodes)
  if (!root) return nodes

  // Clone nodes
  const layoutedNodes = nodes.map((n) => ({ ...n, position: { ...n.position } }))
  const rootNode = layoutedNodes.find((n) => n.id === root.id)!

  // Recursive tree build
  const getChildren = (parentId: string): Node[] =>
    layoutedNodes.filter(
      (n) =>
        initialEdges.some(
          (e) => e.source === parentId && e.target === n.id
        )
    )

  // Assign levels
  const assignLevelsRecursive = (node: Node, level: number = 0) => {
    node.position!.y = level * LEVEL_HEIGHT
    getChildren(node.id).forEach((child) =>
      assignLevelsRecursive(child, level + 1)
    )
  }

  // Assign X coordinates
  const assignXRecursive = (node: Node, centerX: number = 0) => {
    node.position!.x = centerX
    const children = getChildren(node.id)
    if (children.length > 0) {
      const totalWidth = (children.length - 1) * SIBLING_GAP
      children.forEach((child, i) => {
        const childX = centerX - totalWidth / 2 + i * SIBLING_GAP
        assignXRecursive(child, childX)
      })
    }
  }

  assignLevelsRecursive(rootNode)
  assignXRecursive(rootNode, 0)

  return layoutedNodes
}

/* ----------------------------------
   MAIN COMPONENT
-----------------------------------*/
export default function StructureTab({ 
  onSave, 
  loading 
}: { 
  onSave?: (data: any) => void
  loading?: boolean 
}) {
  const [editingNode, setEditingNode] = useState<Node | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [preview, setPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedState, setLastSavedState] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null)
  const [selectingRoot, setSelectingRoot] = useState<Node | null>(null)
  const [structureId, setStructureId] = useState<number | null>(null)
  const [aboutPageId, setAboutPageId] = useState<number | null>(null)
  const [chartTitle, setChartTitle] = useState('')
  const [chartDescription, setChartDescription] = useState('')
  const [showTitleEditor, setShowTitleEditor] = useState(false)

  const [nodes, setNodes, onNodesChange] =
    useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] =
    useEdgesState(initialEdges)

  // Load from API
  useEffect(() => {
    const loadFromAPI = async () => {
      try {
        // Эхлээд about page-ийн ID-г олно
        const pagesRes = await axiosInstance.get('/about-page/')
        const introPage = pagesRes.data.find((p: any) => p.key === 'intro')
        let pid: number
        if (introPage) {
          pid = introPage.id
        } else {
          const createRes = await axiosInstance.post('/about-page/', { key: 'intro', active: true, sections: [], media: [] })
          pid = createRes.data.id
        }
        setAboutPageId(pid)

        const res = await axiosInstance.get(`/org-structure/?page=${pid}`)
        const list = res.data
        if (list.length > 0) {
          const record = list[0]
          setStructureId(record.id)
          const chartData = record.chart_data
          if (chartData && chartData.nodes) {
            setNodes(chartData.nodes.map((n: any) => ({ ...n, type: n.type || 'org' })))
          }
          if (chartData && chartData.edges) {
            setEdges(chartData.edges)
          }
          setLastSavedState({ nodes: chartData.nodes || [], edges: chartData.edges || [] })
          setChartTitle(record.title || '')
          setChartDescription(record.description || '')
        }
      } catch (e) {
        console.error('Failed to load org structure from API:', e)
        // Fallback to localStorage
        const saved = localStorage.getItem('org-chart')
        if (saved) {
          try {
            const parsedState = JSON.parse(saved)
            setNodes(parsedState.nodes)
            setEdges(parsedState.edges)
            setLastSavedState(parsedState)
          } catch (e) {
            console.error('Failed to load org chart from localStorage:', e)
          }
        }
      }
      setIsLoaded(true)
    }
    loadFromAPI()
  }, [])

  // Mark as dirty when current state differs from last saved state
  useEffect(() => {
    if (!isLoaded) return
    if (!lastSavedState) return

    setDirty(
      JSON.stringify({ nodes, edges }) !==
      JSON.stringify(lastSavedState)
    )
  }, [nodes, edges, isLoaded, lastSavedState])

  // Close modal when entering preview mode
  useEffect(() => {
    if (preview) {
      setEditingNode(null)
    }
  }, [preview])

  // Server submission function
  const handleSubmit = async () => {
    const orgNodes: OrgNode[] = nodes.map((node) => ({
      id: node.id,
      position: node.position,
      data: node.data as { label: string; isRoot?: boolean },
      type: node.type
    }))

    const orgEdges: OrgEdge[] = edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type,
      markerEnd: edge.markerEnd as { type: string } | undefined,
      style: edge.style as { stroke: string; strokeWidth: number } | undefined
    }))

    const chartData: OrgChartData = { nodes: orgNodes, edges: orgEdges }

    setIsSaving(true)
    try {
      if (structureId) {
        await axiosInstance.put(`/org-structure/${structureId}/`, {
          page: aboutPageId,
          chart_data: chartData,
          title: chartTitle,
          description: chartDescription,
        })
      } else {
        const res = await axiosInstance.post('/org-structure/', {
          page: aboutPageId,
          chart_data: chartData,
          title: chartTitle,
          description: chartDescription,
        })
        setStructureId(res.data.id)
      }
      // Also save to localStorage as backup
      localStorage.setItem('org-chart', JSON.stringify({ nodes, edges }))
      setLastSavedState({ nodes, edges })
      setDirty(false)
      alert('Серверт амжилттай хадгаллаа')
    } catch (error) {
      console.error('Failed to submit chart:', error)
      alert(
        `Илгээхэд алдаа гарлаа: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    } finally {
      setIsSaving(false)
    }
  }

  // Manual save function (also saves to server)
  const saveChart = async () => {
    await handleSubmit()
  }

  // Reset to last saved state
  const resetChart = () => {
    if (lastSavedState) {
      setNodes(lastSavedState.nodes)
      setEdges(lastSavedState.edges)
      setDirty(false)
      alert('↩️ Буцаалтыг амжилттай гүйцэтгэлээ')
    }
  }

  // Close modal when entering preview mode
  useEffect(() => {
    if (preview) {
      setEditingNode(null)
    }
  }, [preview])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Esc → Close modal
      if (e.key === 'Escape' && editingNode) {
        setEditingNode(null)
        return
      }

      // Enter → Save node
      if (e.key === 'Enter' && editingNode) {
        e.preventDefault()
        saveNodeLabel()
        return
      }

      // Delete → Delete node (not root)
      if (e.key === 'Delete' && editingNode && !editingNode.data?.isRoot) {
        e.preventDefault()
        deleteNode(editingNode.id)
        return
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editingNode])

  const onConnect = useCallback(
    (params: any) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            ...DEFAULT_EDGE_OPTIONS,
          },
          eds
        )
      ),
    []
  )

  const addNode = () => {
    setNodes((nds) => [
      ...nds,
      {
        id: crypto.randomUUID(),
        type: 'org',
        position: { x: 500, y: 500 },
        data: { label: 'Шинэ нэгж' },
      },
    ])
  }

  const deleteNode = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return

    // Root дээр дарсан → modal нээ
    if (node.data?.isRoot) {
      setSelectingRoot(node)
      return
    }

    // Normal delete
    setNodes((nds) => nds.filter((n) => n.id !== nodeId))
    setEdges((eds) =>
      eds.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      )
    )
    setEditingNode(null)
  }

  const onNodeClick = (_: any, node: Node) => {
    setEditingNode(node)
    setEditLabel(node.data.label)
  }

  const saveNodeLabel = () => {
    if (!editingNode) return

    setNodes((nds) =>
      nds.map((n) =>
        n.id === editingNode.id
          ? { ...n, data: { ...n.data, label: editLabel } }
          : n
      )
    )

    setEditingNode(null)
  }


  const addChildNode = (parentId: string) => {
    const newId = crypto.randomUUID()
    const parentNode = nodes.find((n) => n.id === parentId)
    if (!parentNode) return

    // Шинэ child node үүсгэх (parent-ын доор)
    setNodes((nds) => [
      ...nds,
      {
        id: newId,
        type: 'org',
        position: {
          x: parentNode.position.x,
          y: parentNode.position.y + 200,
        },
        data: {
          label: 'Шинэ нэгж',
        },
      },
    ])

    // Edge автоматаар үүсгэх
    setEdges((eds) => [
      ...eds,
      {
        id: `e-${parentId}-${newId}`,
        source: parentId,
        target: newId,
        ...DEFAULT_EDGE_OPTIONS,
      },
    ])
  }

  // Export JSON
  const exportJSON = () => {
    const blob = new Blob(
      [JSON.stringify({ nodes, edges }, null, 2)],
      { type: 'application/json' }
    )
    download(blob, 'org-chart.json')
  }

  // Export PNG
  const exportPNG = async () => {
    try {
      let element = document.querySelector('.react-flow__pane') as HTMLElement
      if (!element) {
        element = document.querySelector('.react-flow') as HTMLElement
      }
      if (!element) {
        alert('Диаграммыг олох боломжгүй')
        return
      }

      // Dynamic import html-to-image
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        skipFonts: true,
        style: {
          padding: '40px',
        } as any,
      })

      const link = document.createElement('a')
      link.href = dataUrl
      link.download = 'org-chart.png'
      link.click()
      alert(' PNG амжилттай экспортлогдлоо')
    } catch (err) {
      console.error('PNG экспорт амжилтгүй:', err)
      alert(`PNG экспорт амжилтгүй болсон: ${err instanceof Error ? err.message : 'Үл мэдэгдэх алдаа'}`)
    }
  }

  return (
    <div className="h-screen w-full bg-black">
      {/* TOP BAR */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="text-white font-medium">
            Байгууллагын бүтэц
          </div>
          {dirty && (
            <span className="text-xs text-yellow-400 flex items-center gap-1">
              ● Өөрчлөлт хадгалагдаагүй
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowTitleEditor(!showTitleEditor)}
            className={`px-3 py-1.5 text-sm rounded ${
              showTitleEditor ? 'bg-amber-600' : 'bg-amber-700 hover:bg-amber-600'
            } text-white font-semibold`}
          >
            ✏️ Гарчиг/Тайлбар
          </button>
          <button
            onClick={saveChart}
            disabled={isSaving}
            className={`px-3 py-1.5 text-sm rounded font-semibold text-white ${
              isSaving
                ? 'bg-green-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isSaving ? 'Хадгалж байна...' : 'Хадгалах'}
          </button>
          <button
            onClick={resetChart}
            disabled={!dirty}
            className={`px-3 py-1.5 text-sm rounded ${dirty ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-600 cursor-not-allowed'} text-white font-semibold`}
          >
            ↩ Буцаах
          </button>
          <button
            onClick={addNode}
            className="px-3 py-1.5 text-sm rounded bg-teal-600 text-white hover:bg-teal-700"
          >
            + Нэгж нэмэх
          </button>
          <button
            onClick={exportJSON}
            className="px-3 py-1.5 text-sm rounded bg-blue-700 text-white hover:bg-blue-800"
          >
             JSON
          </button>
          <button
            onClick={exportPNG}
            className="px-3 py-1.5 text-sm rounded bg-purple-700 text-white hover:bg-purple-800"
          >
             PNG
          </button>
          <button
            onClick={() => setPreview((p) => !p)}
            className={`px-3 py-1.5 text-sm rounded ${
              preview
                ? 'bg-zinc-700 text-zinc-300'
                : 'bg-teal-600 text-white'
            }`}
          >
            👁 Preview
          </button>
        </div>
      </div>

      {/* Title/Description Editor Panel */}
      {showTitleEditor && (
        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900 space-y-3">
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Гарчиг (Frontend дээр харуулна)</label>
            <input
              value={chartTitle}
              onChange={(e) => { setChartTitle(e.target.value); setDirty(true); }}
              placeholder="Зохион байгуулалтын бүтэц"
              className="w-full rounded bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Тайлбар (Frontend дээр харуулна)</label>
            <textarea
              value={chartDescription}
              onChange={(e) => { setChartDescription(e.target.value); setDirty(true); }}
              placeholder="Компанийн зохион байгуулалтын бүтцийн тайлбар..."
              rows={2}
              className="w-full rounded bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white outline-none focus:border-teal-500 resize-none"
            />
          </div>
        </div>
      )}

      {/* FLOW */}
      <ReactFlow
        style={{ background: preview ? '#ffffff' : '#000000' }}
        className={preview ? 'rf-preview' : ''}
        nodes={nodes.map((n) => ({
          ...n,
          data: {
            ...n.data,
            preview,
          },
        }))}
        edges={edges.map((e) =>
          preview
            ? {
                ...e,
                markerEnd: undefined,
              }
            : e
        )}
        nodeTypes={nodeTypes}
        onNodesChange={preview ? undefined : onNodesChange}
        onEdgesChange={preview ? undefined : onEdgesChange}
        onConnect={preview ? undefined : onConnect}
        onNodeClick={preview ? undefined : onNodeClick}
        nodesDraggable={!preview}
        nodesConnectable={!preview}
        elementsSelectable={!preview}
        fitView
        defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
      >
        {!preview && (
          <>
            <Background variant={BackgroundVariant.Dots} gap={32} color="#1f2933" />
            <Controls />
          </>
        )}
      </ReactFlow>

      {/* EDIT MODAL */}
      {editingNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[360px] rounded-lg bg-zinc-900 p-4 border border-zinc-700">
            <div className="text-white font-medium mb-3">
              Нэгжийн нэр засах
            </div>

            <input
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              className="w-full rounded bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white outline-none focus:border-teal-500 mb-4"
              autoFocus
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => deleteNode(editingNode.id)}
                disabled={editingNode.data?.isRoot}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  editingNode.data?.isRoot
                    ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                Устгах
              </button>
              <button
                onClick={() => setEditingNode(null)}
                className="px-3 py-1.5 text-sm rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors"
              >
                Болих
              </button>
              <button
                onClick={saveNodeLabel}
                className="px-3 py-1.5 text-sm rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors"
              >
                Хадгалах
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROOT SELECTION MODAL */}
      {selectingRoot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-[420px] rounded-lg bg-zinc-900 p-4 border border-zinc-700">
            <div className="text-white font-medium mb-2">
              Root нэгж солих
            </div>

            <p className="text-sm text-zinc-400 mb-4">
              &quot;{selectingRoot.data.label}&quot; нь одоогийн root байна.
              <br />
              Шинэ root нэгжийг сонгоно уу.
            </p>

            <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
              {nodes
                .filter((n) => n.id !== selectingRoot.id)
                .map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      // Promote new node to root
                      setNodes((nds) =>
                        nds.map((nd) => ({
                          ...nd,
                          data: {
                            ...nd.data,
                            isRoot: nd.id === n.id,
                          },
                        }))
                      )
                      // Remove parent edge from new root
                      setEdges((eds) => eds.filter((e) => e.target !== n.id))
                      // Delete old root
                      setNodes((nds) => nds.filter((nd) => nd.id !== selectingRoot.id))
                      setEdges((eds) =>
                        eds.filter(
                          (e) => e.source !== selectingRoot.id && e.target !== selectingRoot.id
                        )
                      )
                      setSelectingRoot(null)
                      setEditingNode(null)
                    }}
                    className="w-full text-left px-3 py-2 rounded bg-zinc-800 text-white hover:bg-zinc-700 transition-colors text-sm"
                  >
                    {n.data.label}
                  </button>
                ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectingRoot(null)}
                className="px-3 py-1.5 text-sm rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors"
              >
                Болих
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        :root {
          --color-teal-700: #0d9488;
        }
        .rf-preview .react-flow__pane,
        .rf-preview .react-flow__viewport {
          background: white !important;
        }
      `}</style>
    </div>
  )
}
