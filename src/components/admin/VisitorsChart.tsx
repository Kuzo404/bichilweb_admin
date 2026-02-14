'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, BarChart, Bar,
} from 'recharts'
import {
    CalendarIcon, ChevronDownIcon, EyeIcon, EyeSlashIcon,
    ComputerDesktopIcon, DevicePhoneMobileIcon, DeviceTabletIcon,
    UserGroupIcon, ArrowPathIcon, ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline'

/* ---- Types ---- */
interface DailyData {
    date: string
    name?: string
    fullDate?: string
    visitors: number
    sessions: number
    pageViews: number
    bounceRate: number
}

interface Totals {
    visitors: number
    sessions: number
    pageViews: number
    bounceRate: number
}

interface PageStat {
    page_path: string
    total_views: number
    unique_visitors: number
    percentage: number
    desktop: number
    mobile: number
    tablet: number
    desktop_pct: number
    mobile_pct: number
    tablet_pct: number
}

/* ---- Helpers ---- */
function formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0]
}

function formatNumber(num: number): string {
    return new Intl.NumberFormat('mn-MN').format(num)
}

function formatShortDate(dateStr: string): string {
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}/${d.getDate()}`
}

/* ---- Component ---- */
export default function VisitorsChart() {
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 7)

    const [startDate, setStartDate] = useState(formatDateForInput(sevenDaysAgo))
    const [endDate, setEndDate] = useState(formatDateForInput(today))
    const [showCustom, setShowCustom] = useState(false)
    const [selectedMetric, setSelectedMetric] = useState('visitors')
    const [showDropdown, setShowDropdown] = useState(false)
    const [chartData, setChartData] = useState<DailyData[]>([])
    const [totals, setTotals] = useState<Totals>({ visitors: 0, sessions: 0, pageViews: 0, bounceRate: 0 })
    const [pageStats, setPageStats] = useState<PageStat[]>([])
    const [showPageViews, setShowPageViews] = useState(true)
    const [loading, setLoading] = useState(true)
    const [calendarMonth, setCalendarMonth] = useState(new Date())
    const [selectingStartDate, setSelectingStartDate] = useState(true)
    const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const [dateError, setDateError] = useState<string>('')

    const dropdownRef = useRef<HTMLDivElement>(null)
    const modalRef = useRef<HTMLDivElement>(null)

    const centerModal = useCallback(() => {
        if (typeof window === 'undefined') return
        const width = modalRef.current?.offsetWidth ?? 384
        const height = modalRef.current?.offsetHeight ?? 420
        const x = Math.max((window.innerWidth - width) / 2, 16)
        const y = Math.max((window.innerHeight - height) / 2, 80)
        setModalPosition({ x, y })
    }, [])

    useEffect(() => {
        const initializePosition = () => {
            try {
                const saved = localStorage.getItem('modalPosition')
                if (saved) {
                    const pos = JSON.parse(saved)
                    if (typeof pos?.x === 'number' && typeof pos?.y === 'number' && typeof window !== 'undefined') {
                        const width = modalRef.current?.offsetWidth ?? 384
                        const height = modalRef.current?.offsetHeight ?? 420
                        const maxX = Math.max(window.innerWidth - width - 16, 16)
                        const maxY = Math.max(window.innerHeight - height - 16, 80)
                        setModalPosition({ x: Math.min(Math.max(pos.x, 16), maxX), y: Math.min(Math.max(pos.y, 80), maxY) })
                        return
                    }
                }
            } catch { localStorage.removeItem('modalPosition') }
            centerModal()
        }
        initializePosition()
    }, [centerModal])

    useEffect(() => {
        try { localStorage.setItem('modalPosition', JSON.stringify(modalPosition)) } catch { /* ignore */ }
    }, [modalPosition])

    useEffect(() => {
        if (!showCustom) return
        const frame = requestAnimationFrame(() => centerModal())
        return () => cancelAnimationFrame(frame)
    }, [showCustom, centerModal])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return
            setModalPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y })
        }
        const handleMouseUp = () => setIsDragging(false)
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
            return () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp) }
        }
    }, [isDragging, dragOffset])

    const handleModalMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (modalRef.current) {
            const rect = modalRef.current.getBoundingClientRect()
            setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
            setIsDragging(true)
        }
    }

    /* ---- Chart Options ---- */
    const chartOptions = [
        { key: 'visitors', label: 'Зочилсон хүний тоо', color: '#059669', type: 'line', unit: 'хүн', description: 'Вэбсайтад зочилсон давтагдашгүй хэрэглэгчдийн тоо' },
        { key: 'sessions', label: 'Сешн тоо', color: '#f59e0b', type: 'bar', unit: 'сешн', description: 'Хэрэглэгч вэбсайтад зочилсон давталтын тоо (нэг удаагийн зочлого)' },
        { key: 'bounceRate', label: 'Bounce Rate (%)', color: '#ef4444', type: 'line', unit: '%', description: 'Зөвхөн нэг хуудас үзээд явсан зочдын хувь хэмжээ (бага байх нь сайн)' },
    ]

    const currentOption = chartOptions.find(opt => opt.key === selectedMetric) || chartOptions[0]

    const presets = [
        { label: '7 хоног', days: 7 },
        { label: '30 хоног', days: 30 },
        { label: '3 сар', days: 90 },
        { label: '6 сар', days: 180 },
        { label: '1 жил', days: 365 },
    ]

    const applyPreset = (days: number) => {
        const end = new Date()
        const start = new Date()
        start.setDate(end.getDate() - days)
        setStartDate(formatDateForInput(start))
        setEndDate(formatDateForInput(end))
        setShowCustom(false)
    }

    /* ---- Fetch real data from backend ---- */
    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const [summaryRes, pagesRes] = await Promise.all([
                fetch(`/api/analytics/summary?start=${startDate}&end=${endDate}`),
                fetch(`/api/analytics/pages?start=${startDate}&end=${endDate}&limit=10`),
            ])

            if (summaryRes.ok) {
                const summaryData = await summaryRes.json()
                setTotals(summaryData.totals || { visitors: 0, sessions: 0, pageViews: 0, bounceRate: 0 })
                const daily = (summaryData.daily || []).map((d: DailyData) => ({
                    ...d,
                    name: formatShortDate(d.date),
                    fullDate: d.date,
                }))
                setChartData(daily)
            }

            if (pagesRes.ok) {
                const pagesData = await pagesRes.json()
                setPageStats(pagesData.pages || [])
            }
        } catch (err) {
            console.error('Analytics fetch error:', err)
        } finally {
            setLoading(false)
        }
    }, [startDate, endDate])

    useEffect(() => { fetchData() }, [fetchData])

    /* ---- Summary Cards ---- */
    const summaryCards = [
        { label: 'Зочилсон хүн', value: formatNumber(totals.visitors), icon: UserGroupIcon, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Давтагдашгүй' },
        { label: 'Сешн тоо', value: formatNumber(totals.sessions), icon: ArrowTrendingUpIcon, color: 'text-amber-600', bg: 'bg-amber-50', desc: 'Нийт зочлого' },
        { label: 'Хуудас үзэлт', value: formatNumber(totals.pageViews), icon: EyeIcon, color: 'text-blue-600', bg: 'bg-blue-50', desc: 'Нийт' },
        { label: 'Bounce Rate', value: `${totals.bounceRate}%`, icon: ArrowPathIcon, color: 'text-red-500', bg: 'bg-red-50', desc: 'Нэг хуудас' },
    ]

    /* ---- Page name mapping ---- */
    const getPageName = (path: string): string => {
        const map: Record<string, string> = {
            '/': 'Нүүр хуудас',
            '/about': 'Бидний тухай',
            '/about/hr': 'Хүний нөөц',
            '/about/branches': 'Салбарууд',
            '/news': 'Мэдээ',
            '/contact': 'Холбоо барих',
        }
        if (map[path]) return map[path]
        if (path.startsWith('/products/')) return `Бүтээгдэхүүн ${path.split('/').pop()}`
        if (path.startsWith('/services/')) return `Үйлчилгээ ${path.split('/').pop()}`
        if (path.startsWith('/news/')) return `Мэдээ ${path.split('/').pop()}`
        return path
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryCards.map(card => (
                    <div key={card.label} className="bg-white border border-gray-100 p-4">
                        <div className="flex items-start justify-between mb-2">
                            <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center`}>
                                <card.icon className={`w-5 h-5 ${card.color}`} />
                            </div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wide">{card.desc}</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                        <p className="text-xs text-gray-500 mt-1">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Chart Section */}
            <div className="bg-white border border-gray-100 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-sm font-medium text-gray-600">{currentOption.label}</h2>
                            <p className="text-xs text-gray-400 mt-0.5">{startDate} - {endDate}</p>
                        </div>

                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors rounded-sm">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentOption.color }} />
                                {currentOption.label}
                                <ChevronDownIcon className="h-3 w-3" />
                            </button>

                            {showDropdown && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-sm shadow-lg z-10 min-w-64">
                                    {chartOptions.map(option => (
                                        <button key={option.key}
                                            onClick={() => { setSelectedMetric(option.key); setShowDropdown(false) }}
                                            className={`w-full flex flex-col items-start gap-1 px-3 py-3 text-sm text-left hover:bg-gray-50 transition-colors ${selectedMetric === option.key ? 'bg-gray-50' : ''}`}
                                            title={option.description}>
                                            <div className="flex items-center gap-3 w-full">
                                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: option.color }} />
                                                <span className="text-gray-700 font-medium">{option.label}</span>
                                                {selectedMetric === option.key && <span className="ml-auto text-xs text-gray-400">✓</span>}
                                            </div>
                                            <p className="text-xs text-gray-500 ml-5 leading-relaxed">{option.description}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {presets.map(preset => (
                            <button key={preset.label} onClick={() => applyPreset(preset.days)}
                                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                                {preset.label}
                            </button>
                        ))}
                        <button onClick={() => setShowCustom(!showCustom)}
                            className={`px-3 py-1.5 text-xs transition-colors flex items-center gap-1 ${showCustom ? 'text-gray-700 bg-gray-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                            <CalendarIcon className="h-3.5 w-3.5" />
                            Огноо сонгох
                        </button>
                    </div>
                </div>

                {/* Calendar Modal */}
                {showCustom && (
                    <>
                        <div className="fixed inset-0 bg-black/40 z-40 transition-opacity pointer-events-auto" onClick={() => setShowCustom(false)} />
                        <div ref={modalRef} onMouseDown={handleModalMouseDown}
                            className="fixed z-50 w-96 max-w-[calc(100vw-2rem)] p-4 bg-white rounded-lg border border-gray-200 shadow-lg cursor-grab active:cursor-grabbing pointer-events-auto"
                            style={{ left: `${modalPosition.x}px`, top: `${modalPosition.y}px` }}>
                            <div className="flex items-center justify-between mb-4">
                                <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-600 text-sm">◀</button>
                                <h3 className="text-base font-bold text-gray-800">
                                    {calendarMonth.getFullYear()}-{String(calendarMonth.getMonth() + 1).padStart(2, '0')}
                                </h3>
                                <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-600 text-sm">▶</button>
                            </div>
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {['Пн', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'].map(day => (
                                    <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">{day}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1 mb-4">
                                {Array.from({ length: 42 }, (_, i) => {
                                    const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay()
                                    const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate()
                                    const daysInPrevMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 0).getDate()
                                    let dayNumber: number
                                    let isCurrentMonth = false
                                    let isOtherMonth = false
                                    if (i < firstDay) { dayNumber = daysInPrevMonth - firstDay + i + 1; isOtherMonth = true }
                                    else if (i < firstDay + daysInMonth) { dayNumber = i - firstDay + 1; isCurrentMonth = true }
                                    else { dayNumber = i - firstDay - daysInMonth + 1; isOtherMonth = true }
                                    const date = new Date(calendarMonth.getFullYear(), isOtherMonth && i >= firstDay + daysInMonth ? calendarMonth.getMonth() + 1 : calendarMonth.getMonth(), dayNumber)
                                    const dateStr = formatDateForInput(date)
                                    const isStartDate = dateStr === startDate
                                    const isEndDate = dateStr === endDate
                                    const isBetween = dateStr > startDate && dateStr < endDate
                                    return (
                                        <button key={i} disabled={!isCurrentMonth}
                                            onClick={() => {
                                                if (selectingStartDate) { setStartDate(dateStr); setSelectingStartDate(false) }
                                                else {
                                                    if (dateStr < startDate) { setStartDate(dateStr); setEndDate(startDate) }
                                                    else { setEndDate(dateStr) }
                                                    setSelectingStartDate(true)
                                                }
                                            }}
                                            className={`py-1.5 text-xs font-medium rounded transition-all ${!isCurrentMonth ? 'text-gray-300 cursor-default' : isStartDate || isEndDate ? 'bg-teal-600 text-white font-bold' : isBetween ? 'bg-teal-50 text-teal-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                                            {dayNumber}
                                        </button>
                                    )
                                })}
                            </div>
                            <div className="flex items-center justify-center gap-2 px-3 py-2 bg-white rounded-lg mb-4">
                                <span className="px-2 py-1 text-gray-700 text-xs font-bold">{new Date(startDate).toLocaleDateString('mn-MN')}</span>
                                <span className="text-gray-400 text-xs">—</span>
                                <span className="px-2 py-1 text-gray-700 text-xs font-bold">{new Date(endDate).toLocaleDateString('mn-MN')}</span>
                            </div>
                            {dateError && <div className="mb-4 p-2 bg-white border border-red-200 rounded-lg"><p className="text-xs text-red-600 font-medium">{dateError}</p></div>}
                            <div className="flex gap-2">
                                <button onClick={() => { setShowCustom(false); setDateError('') }}
                                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-lg transition-colors">Цуцлах</button>
                                <button onClick={() => {
                                    if (!startDate || !endDate) { setDateError('Эхлэлийн огнөө ба төгсөлтийн огнөө сонгоно уу'); return }
                                    if (new Date(startDate) > new Date(endDate)) { setDateError('Эхлэлийн огнөө төгсөлтийн огнөөгөөс өмнө байх ёстой'); return }
                                    setDateError(''); setShowCustom(false)
                                }} className="flex-1 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-lg transition-colors">Сонгох</button>
                            </div>
                        </div>
                    </>
                )}

                {/* Chart */}
                <div className="h-80">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <svg className="animate-spin h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <p className="text-sm text-gray-400">Уншиж байна...</p>
                            </div>
                        </div>
                    ) : chartData.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-gray-400 text-sm">Мэдээлэл байхгүй</p>
                                <p className="text-gray-300 text-xs mt-1">Огноо өөрчлөх эсвэл сайтруу зочлоорой</p>
                            </div>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            {currentOption.type === 'bar' ? (
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                    <XAxis dataKey="name" stroke="transparent" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={{ stroke: '#f3f4f6' }} interval={Math.floor(chartData.length / 10) || 0} />
                                    <YAxis stroke="transparent" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={{ stroke: '#f3f4f6' }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: 12, padding: '8px 12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                        labelStyle={{ color: '#4b5563', fontWeight: 500, marginBottom: 4 }}
                                        labelFormatter={(label) => { const item = chartData.find(d => d.name === label); return item?.fullDate || label }}
                                        formatter={(value) => [`${value} ${currentOption.unit}`, currentOption.label]} />
                                    <Bar dataKey={selectedMetric} fill={currentOption.color} radius={[2, 2, 0, 0]} animationDuration={500} />
                                </BarChart>
                            ) : (
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                    <XAxis dataKey="name" stroke="transparent" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={{ stroke: '#f3f4f6' }} interval={Math.floor(chartData.length / 10) || 0} />
                                    <YAxis stroke="transparent" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={{ stroke: '#f3f4f6' }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: 12, padding: '8px 12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                        labelStyle={{ color: '#4b5563', fontWeight: 500, marginBottom: 4 }}
                                        labelFormatter={(label) => { const item = chartData.find(d => d.name === label); return item?.fullDate || label }}
                                        formatter={(value) => [`${value} ${currentOption.unit}`, currentOption.label]} />
                                    <Line type="monotone" dataKey={selectedMetric} stroke={currentOption.color} strokeWidth={2} dot={false}
                                        activeDot={{ r: 4, fill: currentOption.color, strokeWidth: 0 }} animationDuration={500} />
                                </LineChart>
                            )}
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Page Views Section */}
            <div className="bg-white border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-600">Хэрэглэгч аль хуудсыг илүү үзэж байна</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Хуудас тус бүрийн үзэлт, % болон төхөөрөмжийн мэдээлэл</p>
                    </div>
                    <button onClick={() => setShowPageViews(!showPageViews)}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-sm transition-colors"
                        title={showPageViews ? 'Хураах' : 'Дэлгэх'}>
                        {showPageViews ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                </div>

                {showPageViews && (
                    loading ? (
                        <div className="py-8 text-center">
                            <p className="text-sm text-gray-400">Уншиж байна...</p>
                        </div>
                    ) : pageStats.length === 0 ? (
                        <div className="py-8 text-center">
                            <p className="text-sm text-gray-400">Хуудсын мэдээлэл байхгүй</p>
                            <p className="text-xs text-gray-300 mt-1">Сайтад зочлогч ирсний дараа энд мэдээлэл харагдана</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pageStats.map((page, idx) => (
                                <div key={page.page_path} className="group">
                                    <div className="flex items-center gap-3">
                                        {/* Rank */}
                                        <span className="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-400 bg-gray-50 rounded">
                                            {idx + 1}
                                        </span>

                                        {/* Page info + bar */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-gray-700 font-medium truncate">
                                                    {getPageName(page.page_path)}
                                                </span>
                                                <div className="flex items-center gap-3 ml-2 shrink-0">
                                                    <span className="text-xs text-gray-500">{formatNumber(page.total_views)} үзэлт</span>
                                                    <span className="text-xs font-semibold text-teal-600">{page.percentage}%</span>
                                                </div>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full bg-linear-to-r from-teal-400 to-teal-600 transition-all duration-500"
                                                    style={{ width: `${Math.max(page.percentage, 2)}%` }} />
                                            </div>

                                            {/* Device breakdown + path */}
                                            <div className="flex items-center gap-4 mt-1.5">
                                                <span className="text-[10px] text-gray-400 font-mono">{page.page_path}</span>
                                                <div className="flex items-center gap-3 ml-auto">
                                                    <div className="flex items-center gap-1" title="Desktop">
                                                        <ComputerDesktopIcon className="w-3 h-3 text-gray-400" />
                                                        <span className="text-[10px] text-gray-500">{page.desktop_pct}%</span>
                                                    </div>
                                                    <div className="flex items-center gap-1" title="Mobile">
                                                        <DevicePhoneMobileIcon className="w-3 h-3 text-gray-400" />
                                                        <span className="text-[10px] text-gray-500">{page.mobile_pct}%</span>
                                                    </div>
                                                    <div className="flex items-center gap-1" title="Tablet">
                                                        <DeviceTabletIcon className="w-3 h-3 text-gray-400" />
                                                        <span className="text-[10px] text-gray-500">{page.tablet_pct}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    )
}
