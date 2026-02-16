// ============================================================================
// FLOATING MENU ADMIN API - Django backend руу proxy хийнэ (ХАДГАЛАХ)
// ============================================================================
// Admin panel → энэ route → Django backend → PostgreSQL
// Admin формат → Django формат руу хөрвүүлж хадгална
// Хадгалсны дараа DB-ийн шинэ state-ийг admin формат-аар буцаана
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'

// Django backend-ийн URL хаяг
const BACKEND_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000/api/v1'

// ============================================================================
// Django формат → Admin формат хөрвүүлэгч
// ============================================================================
function djangoToAdminFormat(djangoData: any[]) {
  const categories: any[] = []
  const items: any[] = []

  djangoData.forEach((floatMenu: any, index: number) => {
    const mnTranslation = floatMenu.translations?.find((t: any) => t.language === 2) || {}
    const enTranslation = floatMenu.translations?.find((t: any) => t.language === 1) || {}

    const category = {
      id: `db-${floatMenu.id}`,
      dbId: floatMenu.id,
      name: {
        mn: mnTranslation.label || '',
        en: enTranslation.label || '',
      },
      icon: '',
      iconUrl: floatMenu.image_url || '',
      iconSvg: floatMenu.svg || '',
      color: floatMenu.iconcolor || '#3b82f6',
      order: index + 1,
      type: 'other' as const,
      font: floatMenu.fontfamily || 'font-sans',
      bgColor: floatMenu.bgcolor || '#ffffff',
      textColor: floatMenu.fontcolor || '#374151',
    }
    categories.push(category)

    if (floatMenu.submenus) {
      floatMenu.submenus.forEach((submenu: any, subIndex: number) => {
        const subMnTranslation = submenu.translations?.find((t: any) => t.language === 2) || {}
        const subEnTranslation = submenu.translations?.find((t: any) => t.language === 1) || {}

        items.push({
          id: `db-item-${submenu.id}`,
          dbId: submenu.id,
          label: {
            mn: subMnTranslation.title || '',
            en: subEnTranslation.title || '',
          },
          icon: '',
          iconUrl: submenu.file_url || '',
          iconSvg: submenu.svg || '',
          href: submenu.url || '',
          categoryId: `db-${floatMenu.id}`,
          order: subIndex + 1,
          isActive: true,
          font: submenu.fontfamily || 'font-sans',
          bgColor: submenu.bgcolor || '#ffffff',
          textColor: submenu.fontcolor || '#374151',
        })
      })
    }
  })

  return { categories, items }
}

// ============================================================================
// PUT - Floating menu-г өгөгдлийн санд хадгалах
// ============================================================================
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { categories = [], items = [], socials = [] } = body

    // 1. Одоо байгаа бүх FloatMenu-г авах
    const existingRes = await fetch(`${BACKEND_URL}/float-menu/`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    })
    const existingMenus = existingRes.ok ? await existingRes.json() : []

    // 2. Хуучин FloatMenu-нүүдийг устгах
    for (const menu of existingMenus) {
      try {
        await fetch(`${BACKEND_URL}/float-menu/${menu.id}/`, {
          method: 'DELETE',
        })
      } catch (e) {
        console.error(`FloatMenu ${menu.id} устгахад алдаа:`, e)
      }
    }

    // 3. Шинэ FloatMenu-нүүд үүсгэх (категори тус бүрт)
    const errors: string[] = []
    // Хуучин ID → Шинэ ID mapping (socials-ийн float_menu FK шинэчлэхэд хэрэглэнэ)
    const idMap: Record<number, number> = {}

    for (const category of categories) {
      // Хуучин dbId авах (db-123 → 123)
      const oldDbId = category.dbId || (typeof category.id === 'string' && category.id.startsWith('db-')
        ? Number(category.id.replace('db-', ''))
        : null)

      // Энэ категори дотор байгаа item-ууд олох
      const categoryItems = items.filter((item: any) => item.categoryId === category.id)

      // Django формат руу хөрвүүлэх
      const djangoData: Record<string, any> = {
        iconcolor: category.color || '',
        fontfamily: category.font || '',
        bgcolor: category.bgColor || '',
        fontcolor: category.textColor || '',
        svg: category.iconSvg || '',
        translations: [
          { language: 2, label: category.name?.mn || '' },
          { language: 1, label: category.name?.en || '' },
        ],
        submenus: categoryItems.map((item: any) => ({
          url: item.href || '',
          svg: item.iconSvg || '',
          fontfamily: item.font || '',
          bgcolor: item.bgColor || '',
          fontcolor: item.textColor || '',
          translations: [
            { language: 2, title: item.label?.mn || '' },
            { language: 1, title: item.label?.en || '' },
          ],
        })),
      }

      // Django руу POST хийх
      const createRes = await fetch(`${BACKEND_URL}/float-menu/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(djangoData),
      })

      if (!createRes.ok) {
        const errorText = await createRes.text()
        console.error(`FloatMenu үүсгэхэд алдаа: ${createRes.status}`, errorText)
        errors.push(`Категори "${category.name?.mn}" хадгалахад алдаа: ${createRes.status}`)
      } else {
        // Шинэ ID-г авч mapping-д хадгалах
        const created = await createRes.json()
        if (oldDbId && created?.id) {
          idMap[oldDbId] = created.id
        }
      }
    }

    // 4. Socials хадгалах (bulk replace)
    // Хуучин float_menu ID-г шинэ ID-аар солих
    const mappedSocials = socials.map((s: any) => ({
      ...s,
      float_menu: s.float_menu && idMap[s.float_menu] ? idMap[s.float_menu] : s.float_menu,
    }))

    try {
      await fetch(`${BACKEND_URL}/float-menu-socials/bulk_update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ socials: mappedSocials }),
      })
    } catch (e) {
      console.error('Float menu socials хадгалахад алдаа:', e)
    }

    // 5. Хадгалсны дараа DB-ийн шинэ state-ийг дахин унших
    const freshRes = await fetch(`${BACKEND_URL}/float-menu/`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    })
    const freshData = freshRes.ok ? await freshRes.json() : []
    const adminData = djangoToAdminFormat(freshData)

    // Socials-г дахин унших
    let freshSocials: any[] = []
    try {
      const socialsRes = await fetch(`${BACKEND_URL}/float-menu-socials/`, {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' },
      })
      if (socialsRes.ok) {
        freshSocials = await socialsRes.json()
      }
    } catch (e) {
      console.error('Socials дахин уншихад алдаа:', e)
    }

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: errors.join('; '),
        ...adminData,
        socials: freshSocials,
      }, { status: 207 })
    }

    return NextResponse.json({
      success: true,
      message: 'Floating menu амжилттай хадгалагдлаа',
      ...adminData,
      socials: freshSocials,
    })
  } catch (error) {
    console.error('Floating menu хадгалахад алдаа:', error)
    return NextResponse.json(
      { success: false, error: 'Хадгалахад алдаа гарлаа', categories: [], items: [], socials: [] },
      { status: 500 }
    )
  }
}
