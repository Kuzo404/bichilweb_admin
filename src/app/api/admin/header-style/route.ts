// ============================================================================
// HEADER СТИЛЬ API - Django backend руу proxy
// ============================================================================
// Тогтмол өгөгдөл байхгүй - бүгд PostgreSQL-ээс ирнэ
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'

// Django backend-ийн URL хаяг
const BACKEND_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000/api/v1'

// ============================================================================
// GET - Стиль мэдээлэл татах
// ============================================================================
export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/header-style/`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    })

    if (!res.ok) {
      // Стиль олдохгүй бол анхдагч утга буцаана
      return NextResponse.json({
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        hoverColor: '#0d9488',
        height: '80px',
        isSticky: true,
      })
    }

    const data = await res.json()

    // Django жагсаалт буцаадаг
    if (Array.isArray(data) && data.length > 0) {
      const s = data[0]
      return NextResponse.json({
        backgroundColor: s.bgcolor || '#ffffff',
        textColor: s.fontcolor || '#1f2937',
        hoverColor: s.hovercolor || '#0d9488',
        height: `${s.height || 80}px`,
        isSticky: s.sticky === 1,
      })
    }

    return NextResponse.json({
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      hoverColor: '#0d9488',
      height: '80px',
      isSticky: true,
    })
  } catch (error) {
    console.error('Стиль татахад алдаа:', error)
    return NextResponse.json({
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      hoverColor: '#0d9488',
      height: '80px',
      isSticky: true,
    })
  }
}

// ============================================================================
// PUT - Стиль шинэчлэх
// ============================================================================
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Одоо байгаа стилийг шалгах
    const existRes = await fetch(`${BACKEND_URL}/header-style/`, {
      headers: { 'Accept': 'application/json' },
    })
    const existData = existRes.ok ? await existRes.json() : []

    const stylePayload = {
      header: 1, // Анхдагч header ID
      bgcolor: body.backgroundColor || '#ffffff',
      fontcolor: body.textColor || '#1f2937',
      hovercolor: body.hoverColor || '#0d9488',
      height: parseInt(body.height) || 80,
      sticky: body.isSticky ? 1 : 0,
    }

    let result
    if (Array.isArray(existData) && existData.length > 0) {
      // Байгаа стилийг шинэчлэх
      const res = await fetch(`${BACKEND_URL}/header-style/${existData[0].id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stylePayload),
      })
      result = await res.json()
    } else {
      // Шинээр үүсгэх
      const res = await fetch(`${BACKEND_URL}/header-style/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stylePayload),
      })
      result = await res.json()
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Стиль хадгалахад алдаа:', error)
    return NextResponse.json({ error: 'Стиль шинэчлэхэд алдаа' }, { status: 500 })
  }
}
