// ============================================================================
// HEADER ЦЭСНИЙ API - Django backend руу proxy хийнэ
// ============================================================================
// Тогтмол (hardcoded) өгөгдөл байхгүй - бүх өгөгдөл PostgreSQL-ээс ирнэ.
// Admin panel → энэ route → Django backend → PostgreSQL
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'

// Django backend-ийн URL хаяг
const BACKEND_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000/api/v1'

// ============================================================================
// Cloudflare 429 rate limit-ээс зайлсхийх retry helper
// ============================================================================
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  baseDelay = 1500
): Promise<Response> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'User-Agent': 'BichilWebAdmin/1.0',
    ...(options.headers as Record<string, string> || {}),
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, { ...options, headers })

    // Cloudflare 429 rate limit or 503 challenge
    if ((res.status === 429 || res.status === 503) && attempt < retries) {
      const waitTime = baseDelay * Math.pow(2, attempt) // exponential backoff
      console.warn(`⚠️ ${res.status} from ${url}, retrying in ${waitTime}ms (attempt ${attempt + 1}/${retries})`)
      await delay(waitTime)
      continue
    }

    return res
  }

  // Should not reach here, but just in case
  return fetch(url, { ...options, headers })
}

// ============================================================================
// GET - Өгөгдлийн сангаас header мэдээлэл татах
// ============================================================================
// Django-ийн /api/v1/headers/ endpoint нь header + menus + styles + submenus
// + tertiary_menus бүгдийг nested JSON байдлаар буцаадаг
// ============================================================================
export async function GET() {
  try {
    const res = await fetchWithRetry(`${BACKEND_URL}/headers/`, {
      cache: 'no-store',   // Кэш хийхгүй - шинэ өгөгдөл авах
    })

    if (!res.ok) {
      // Header бичлэг байхгүй бол хоосон бүтэц буцаана
      if (res.status === 404) {
        console.warn('⚠️ Django: Header олдсонгүй (404)')
        return NextResponse.json({ id: null, logo: '', active: 1, menus: [], styles: [] })
      }
      // 500 алдаа — Django серверт асуудал (DB баганы алдаа гэх мэт)
      // Алдааны дэлгэрэнгүйг лог хийнэ, хоосон бүтэц буцаана
      const errorBody = await res.text().catch(() => '')
      console.error(`❌ Django backend ${res.status} алдаа:`, errorBody.substring(0, 500))
      return NextResponse.json(
        { id: null, logo: '', active: 1, menus: [], styles: [], _error: `Django ${res.status}: ${errorBody.substring(0, 200)}` },
        { status: 200 } // Admin UI-д 200 буцааж, алдааг _error field-д оруулна
      )
    }

    const data = await res.json()

    // Django REST Framework жагсаалт буцаадаг -> эхний элемент авна
    if (Array.isArray(data) && data.length > 0) {
      return NextResponse.json(data[0])
    }

    // Хоосон бол шинэ хоосон бүтэц
    return NextResponse.json({ id: null, logo: '', active: 1, menus: [], styles: [] })
  } catch (error) {
    console.error('Header татахад алдаа:', error)
    return NextResponse.json({ id: null, logo: '', active: 1, menus: [], styles: [] })
  }
}

// ============================================================================
// POST - Header өгөгдлийг өгөгдлийн санд хадгалах
// ============================================================================
// Бүтэц: { id?, logo, active, styles: [...], menus: [{ translations, submenus }] }
// Алхам:
//   1. Header бичлэг үүсгэх/шинэчлэх
//   2. Хуучин цэснүүдийг устгах
//   3. Шинэ цэснүүдийг нэг нэгээр үүсгэх (translations-тай)
//   4. Стиль хадгалах
//   5. Бүрэн шинэчлэгдсэн header буцаах
// ============================================================================
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  try {
    const body = await request.json()

    // ── 1. Header бичлэг үүсгэх / шинэчлэх ──
    let headerId = body.id

    if (headerId) {
      // Байгаа header-г шинэчлэх
      const headerUpdateRes = await fetchWithRetry(`${BACKEND_URL}/headers/${headerId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo: body.logo || '', active: body.active ?? 1 }),
      })
      if (!headerUpdateRes.ok) {
        const errText = await headerUpdateRes.text()
        console.error('❌ Header шинэчлэхэд алдаа:', headerUpdateRes.status, errText)
        throw new Error(`Header шинэчлэхэд алдаа: ${headerUpdateRes.status} ${errText}`)
      }
    } else {
      // Шинэ header үүсгэх
      const headerRes = await fetchWithRetry(`${BACKEND_URL}/headers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo: body.logo || '', active: body.active ?? 1 }),
      })
      if (!headerRes.ok) {
        const errText = await headerRes.text()
        console.error('❌ Header үүсгэхэд алдаа:', headerRes.status, errText)
        throw new Error(`Header үүсгэхэд алдаа: ${headerRes.status} ${errText}`)
      }
      const headerData = await headerRes.json()
      headerId = headerData.id
    }

    // ── 2. Хуучин цэснүүдийг устгах (шинэ цэснүүд байгаа үед л) ──
    // ⚠️ Хамгаалалт: Хэрвээ шинэ цэс 0 бол хуучныг устгахгүй (санамсаргүй устгалтаас сэргийлнэ)
    const hasNewMenus = body.menus && body.menus.length > 0

    if (hasNewMenus) {
    // CASCADE: HeaderMenu устгахад submenu + tertiary автоматаар устгагдана
    const bulkDelRes = await fetchWithRetry(`${BACKEND_URL}/header-menu/bulk_delete/?header_id=${headerId}`, {
      method: 'DELETE',
    })
    await delay(500) // Cloudflare rate limit-ээс зайлсхийх
    } // hasNewMenus if блок хаалт

    // ── 3. Шинэ цэснүүдийг үүсгэх ──
    if (body.menus && body.menus.length > 0) {
      for (const menu of (body.menus || [])) {
        // 1-р түвшин: Үндсэн цэс
        const menuPayload = {
          header: headerId,
          path: menu.path || '',
          font: typeof menu.font === 'string' ? 0 : (menu.font || 0),
          index: menu.index ?? 0,
          visible: menu.visible ?? 1,
          // Django serializer: 'translations' field нэрийг хүлээн авна (source нь дотоод маппинг)
          translations: (menu.translations || []).map((t: { label: string; language_id: number }) => ({
            language: t.language_id,
            label: t.label || '',
          })),
        }

        await delay(300) // Cloudflare rate limit-ээс зайлсхийх
        const menuRes = await fetchWithRetry(`${BACKEND_URL}/header-menu/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(menuPayload),
        })

        if (!menuRes.ok) {
          const errText = await menuRes.text()
          console.error('Цэс үүсгэхэд алдаа:', errText)
          continue
        }

        const menuData = await menuRes.json()
        const newMenuId = menuData.id

        // 2-р түвшин: Дэд цэснүүд
        for (const submenu of (menu.submenus || [])) {
          const subPayload = {
            header_menu: newMenuId,
            path: submenu.path || '',
            font: typeof submenu.font === 'string' ? 0 : (submenu.font || 0),
            index: submenu.index ?? 0,
            visible: submenu.visible ?? 1,
            // Submenu translations
            translations: (submenu.translations || []).map((t: { label: string; language_id: number }) => ({
              language: t.language_id,
              label: t.label || '',
            })),
          }

          await delay(300)
          const subRes = await fetchWithRetry(`${BACKEND_URL}/header-submenu/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subPayload),
          })

          if (!subRes.ok) {
            const errText = await subRes.text()
            console.error('Дэд цэс үүсгэхэд алдаа:', subPayload, errText)
            throw new Error(`Дэд цэс үүсгэхэд алдаа: ${subRes.status} ${errText}`)
          }

          const subData = await subRes.json()
          const newSubId = subData.id

          // 3-р түвшин: Гуравдагч цэснүүд
          for (const tertiary of (submenu.tertiary_menus || [])) {
            const terPayload = {
              header_submenu: newSubId,
              path: tertiary.path || '',
              font: tertiary.font || '',
              index: tertiary.index ?? 0,
              visible: tertiary.visible ?? 1,
              // Tertiary serializer: language_id field-ийг ашиглана
              translations: (tertiary.translations || []).map((t: { label: string; language_id: number }) => ({
                language_id: t.language_id,
                label: t.label || '',
              })),
            }

            await delay(300)
            const terRes = await fetchWithRetry(`${BACKEND_URL}/header-tertiary/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(terPayload),
            })

            if (!terRes.ok) {
              const errText = await terRes.text()
              console.error('3-р түвшний цэс үүсгэхэд алдаа:', terPayload, errText)
              throw new Error(`3-р түвшний цэс үүсгэхэд алдаа: ${terRes.status} ${errText}`)
            }
          }
        }
      }
    }

    // ── 4. Стиль хадгалах ──
    if (body.styles && body.styles.length > 0) {
      const style = body.styles[0]

      // Хуучин стиль байгаа эсэхийг шалгах
      await delay(300)
      const existStyleRes = await fetchWithRetry(`${BACKEND_URL}/header-style/`)
      const existStyles = existStyleRes.ok ? await existStyleRes.json() : []
      const matchStyle = Array.isArray(existStyles)
        ? existStyles.find((s: { header: number }) => s.header === headerId)
        : null

      const stylePayload = {
        header: headerId,
        bgcolor: style.bgcolor || '#ffffff',
        fontcolor: style.fontcolor || '#1f2937',
        hovercolor: style.hovercolor || '#0d9488',
        height: style.height || 80,
        sticky: style.sticky ?? 1,
        max_width: style.max_width || '1240px',
        logo_size: style.logo_size || 44,
      }

      if (matchStyle) {
        await fetchWithRetry(`${BACKEND_URL}/header-style/${matchStyle.id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stylePayload),
        })
      } else {
        await fetchWithRetry(`${BACKEND_URL}/header-style/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stylePayload),
        })
      }
    }

    // ── 5. Шинэчлэгдсэн бүрэн header буцаах ──
    await delay(300)
    const updatedRes = await fetchWithRetry(`${BACKEND_URL}/headers/${headerId}/`)
    
    if (!updatedRes.ok) {
      console.error('❌ Updated header fetch failed:', updatedRes.status)
      // Still return successful response with the created header ID
      return NextResponse.json({ id: headerId, logo: body.logo, active: body.active ?? 1, menus: [], styles: [] }, { status: 200 })
    }
    
    const updatedData = await updatedRes.json()

    return NextResponse.json(updatedData, { status: 200 })
  } catch (error) {
    console.error('Header хадгалахад алдаа:', error)
    return NextResponse.json(
      { error: `Хадгалахад алдаа: ${error instanceof Error ? error.message : 'Тодорхойгүй'}` },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Цэсийг өгөгдлийн сангаас устгах
// ============================================================================
// Query params: type (menu|submenu|tertiary), id (number)
// Жишээ: DELETE /api/admin/header-menu?type=menu&id=5
// ============================================================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // menu | submenu | tertiary
    const id = searchParams.get('id')

    if (!type || !id) {
      return NextResponse.json(
        { error: 'type болон id параметр шаардлагатай' },
        { status: 400 }
      )
    }

    const endpointMap: Record<string, string> = {
      'menu': 'header-menu',
      'submenu': 'header-submenu',
      'tertiary': 'header-tertiary',
    }

    const endpoint = endpointMap[type]
    if (!endpoint) {
      return NextResponse.json(
        { error: `Тодорхойгүй төрөл: ${type}. menu, submenu, tertiary байх ёстой.` },
        { status: 400 }
      )
    }

    // CASCADE устгалт: menu → submenus → tertiary_menus автоматаар устгагдана
    const delRes = await fetchWithRetry(`${BACKEND_URL}/${endpoint}/${id}/`, {
      method: 'DELETE',
    })

    if (!delRes.ok && delRes.status !== 404) {
      const errText = await delRes.text()
      console.error(`❌ ${type} устгахад алдаа:`, delRes.status, errText)
      return NextResponse.json(
        { error: `Устгахад алдаа: ${delRes.status} ${errText}` },
        { status: delRes.status }
      )
    }

    return NextResponse.json({ success: true, deleted: { type, id: Number(id) } })
  } catch (error) {
    console.error('Цэс устгахад алдаа:', error)
    return NextResponse.json(
      { error: `Устгахад алдаа: ${error instanceof Error ? error.message : 'Тодорхойгүй'}` },
      { status: 500 }
    )
  }
}
