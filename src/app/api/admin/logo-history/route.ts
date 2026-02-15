// ============================================================================
// LOGO HISTORY API - PostgreSQL дээр логоны түүхийг хадгалах
// ============================================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

// Хүснэгт үүсгэх (байхгүй бол)
async function ensureTable() {
  const pool = getPool()
  if (!pool) return false
  await pool.query(`
    CREATE TABLE IF NOT EXISTS header_logo_history (
      id BIGSERIAL PRIMARY KEY,
      url TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  return true
}

// GET - Бүх логоны түүхийг авах
export async function GET() {
  try {
    const ok = await ensureTable()
    if (!ok) return NextResponse.json([])
    const pool = getPool()
    if (!pool) return NextResponse.json([])
    const result = await pool.query(
      'SELECT id, url, created_at FROM header_logo_history ORDER BY created_at DESC LIMIT 20'
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Logo history fetch error:', error)
    return NextResponse.json([], { status: 200 })
  }
}

// POST - Шинэ лого нэмэх
export async function POST(request: NextRequest) {
  try {
    const ok = await ensureTable()
    if (!ok) return NextResponse.json({ error: 'DATABASE_URL тохируулаагүй' }, { status: 503 })
    const { url } = await request.json()
    if (!url) {
      return NextResponse.json({ error: 'URL шаардлагатай' }, { status: 400 })
    }

    const pool = getPool()
    if (!pool) return NextResponse.json({ error: 'DB холболтгүй' }, { status: 503 })
    // Давхардахгүй байлгах
    const existing = await pool.query('SELECT id FROM header_logo_history WHERE url = $1', [url])
    if (existing.rows.length > 0) {
      return NextResponse.json({ id: existing.rows[0].id, url, message: 'already_exists' })
    }

    const result = await pool.query(
      'INSERT INTO header_logo_history (url) VALUES ($1) RETURNING id, url, created_at',
      [url]
    )
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Logo history save error:', error)
    return NextResponse.json({ error: 'Хадгалахад алдаа' }, { status: 500 })
  }
}

// DELETE - Логог түүхээс устгах
export async function DELETE(request: NextRequest) {
  try {
    const ok = await ensureTable()
    if (!ok) return NextResponse.json({ error: 'DB холболтгүй' }, { status: 503 })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID шаардлагатай' }, { status: 400 })
    }

    const pool = getPool()
    if (!pool) return NextResponse.json({ error: 'DB холболтгүй' }, { status: 503 })
    await pool.query('DELETE FROM header_logo_history WHERE id = $1', [Number(id)])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logo history delete error:', error)
    return NextResponse.json({ error: 'Устгахад алдаа' }, { status: 500 })
  }
}
