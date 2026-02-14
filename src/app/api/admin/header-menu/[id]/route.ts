// ============================================================================
// HEADER ЦЭСНИЙ [id] API - Django backend руу proxy
// ============================================================================
// Тодорхой header-ийг ID-гаар нь татах, шинэчлэх, устгах
// Тогтмол өгөгдөл байхгүй - бүгд PostgreSQL-ээс
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'

// Django backend-ийн URL хаяг
const BACKEND_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000/api/v1'

// ============================================================================
// GET - Тодорхой header-г ID-гаар татах
// ============================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const res = await fetch(`${BACKEND_URL}/headers/${id}/`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Олдсонгүй' }, { status: 404 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Header татахад алдаа:', error)
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 })
  }
}

// ============================================================================
// PUT - Header шинэчлэх (logo, active)
// ============================================================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()

    const res = await fetch(`${BACKEND_URL}/headers/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logo: body.logo || '', active: body.active ?? 1 }),
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Шинэчлэхэд алдаа' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Header шинэчлэхэд алдаа:', error)
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 })
  }
}

// ============================================================================
// DELETE - Header устгах
// ============================================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const res = await fetch(`${BACKEND_URL}/headers/${id}/`, { method: 'DELETE' })

    if (!res.ok && res.status !== 204) {
      return NextResponse.json({ error: 'Устгахад алдаа' }, { status: res.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Header устгахад алдаа:', error)
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 })
  }
}
