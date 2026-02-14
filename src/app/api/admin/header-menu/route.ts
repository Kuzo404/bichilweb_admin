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
// GET - Өгөгдлийн сангаас header мэдээлэл татах
// ============================================================================
// Django-ийн /api/v1/headers/ endpoint нь header + menus + styles + submenus
// + tertiary_menus бүгдийг nested JSON байдлаар буцаадаг
// ============================================================================
export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/headers/`, {
      cache: 'no-store',   // Кэш хийхгүй - шинэ өгөгдөл авах
      headers: { 'Accept': 'application/json' },
    })

    if (!res.ok) {
      // Header бичлэг байхгүй бол хоосон бүтэц буцаана
      if (res.status === 404) {
        return NextResponse.json({ id: null, logo: '', active: 1, menus: [], styles: [] })
      }
      throw new Error(`Django backend алдаа: ${res.status}`)
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
    console.log('='.repeat(60))
    console.log('Header хадгалж байна... Цаг:', new Date().toLocaleTimeString())
    console.log('Menu items:', body.menus?.length || 0)
    console.log('Source ID:', body.id)
    console.log('Logo URL:', body.logo ? body.logo.substring(0, 50) + '...' : 'No logo')
    console.log('='.repeat(60))

    // ── 1. Header бичлэг үүсгэх / шинэчлэх ──
    let headerId = body.id

    if (headerId) {
      // Байгаа header-г шинэчлэх
      console.log(`📝 Header ${headerId} шинэчлэж байна...`)
      const headerUpdateRes = await fetch(`${BACKEND_URL}/headers/${headerId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo: body.logo || '', active: body.active ?? 1 }),
      })
      if (!headerUpdateRes.ok) {
        const errText = await headerUpdateRes.text()
        console.error('❌ Header шинэчлэхэд алдаа:', headerUpdateRes.status, errText)
        throw new Error(`Header шинэчлэхэд алдаа: ${headerUpdateRes.status} ${errText}`)
      }
      console.log('✅ Header шинэчлэгдлээ')
    } else {
      // Шинэ header үүсгэх
      console.log('➕ Шинэ Header үүсгэж байна...')
      const headerRes = await fetch(`${BACKEND_URL}/headers/`, {
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
      console.log('✅ Header үүсгэгдлээ. ID:', headerId)
    }

    // Logo-only save: if no menus/styles, skip menu/style logic
    if (body.menus && body.menus.length > 0) {
      // ── 2. Хуучин цэснүүдийг устгах ──
      console.log('🗑️ Хуучин цэснүүдийг устгаж байна...')
      const existingRes = await fetch(`${BACKEND_URL}/headers/${headerId}/`, {
        headers: { 'Accept': 'application/json' },
      })

      if (existingRes.ok) {
        const existing = await existingRes.json()
        const existingMenus = existing.menus || []
        let deletedCount = { tertiary: 0, submenu: 0, menu: 0 }

        // Гүнзгийрүүлж устгах: tertiary → submenu → menu
        for (const menu of existingMenus) {
          for (const sub of (menu.submenus || [])) {
            for (const ter of (sub.tertiary_menus || [])) {
              const delRes = await fetch(`${BACKEND_URL}/header-tertiary/${ter.id}/`, { method: 'DELETE' })
              if (delRes.ok) deletedCount.tertiary++
            }
            const delRes = await fetch(`${BACKEND_URL}/header-submenu/${sub.id}/`, { method: 'DELETE' })
            if (delRes.ok) deletedCount.submenu++
          }
          const delRes = await fetch(`${BACKEND_URL}/header-menu/${menu.id}/`, { method: 'DELETE' })
          if (delRes.ok) deletedCount.menu++
        }
        console.log(`  ✅ Устгагдлаа: ${deletedCount.menu} меню, ${deletedCount.submenu} дэд цэс, ${deletedCount.tertiary} 3-р цэс`)
      } else {
        console.log('  ℹ️ Хуучин цэс олдсонгүй')
      }

      // ── 3. Шинэ цэснүүдийг үүсгэх ──
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

        const menuRes = await fetch(`${BACKEND_URL}/header-menu/`, {
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

          const subRes = await fetch(`${BACKEND_URL}/header-submenu/`, {
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

            const terRes = await fetch(`${BACKEND_URL}/header-tertiary/`, {
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
      const existStyleRes = await fetch(`${BACKEND_URL}/header-style/`, {
        headers: { 'Accept': 'application/json' },
      })
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
        await fetch(`${BACKEND_URL}/header-style/${matchStyle.id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stylePayload),
        })
      } else {
        await fetch(`${BACKEND_URL}/header-style/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stylePayload),
        })
      }
    }

    // ── 5. Шинэчлэгдсэн бүрэн header буцаах ──
    const updatedRes = await fetch(`${BACKEND_URL}/headers/${headerId}/`, {
      headers: { 'Accept': 'application/json' },
    })
    
    if (!updatedRes.ok) {
      console.error('❌ Updated header fetch failed:', updatedRes.status)
      // Still return successful response with the created header ID
      return NextResponse.json({ id: headerId, logo: body.logo, active: body.active ?? 1, menus: [], styles: [] }, { status: 200 })
    }
    
    const updatedData = updatedRes.json()
    console.log('✅ Шинэчлэгдсэн header буцаалаа:', JSON.stringify(updatedData, null, 2))

    return NextResponse.json(updatedData, { status: 200 })
  } catch (error) {
    console.error('Header хадгалахад алдаа:', error)
    return NextResponse.json(
      { error: `Хадгалахад алдаа: ${error instanceof Error ? error.message : 'Тодорхойгүй'}` },
      { status: 500 }
    )
  }
}
