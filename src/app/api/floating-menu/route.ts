// ============================================================================
// FLOATING MENU API - Django backend руу proxy хийнэ (УНШИХ)
// ============================================================================
// Admin panel → энэ route → Django backend → PostgreSQL
// Django-ийн float-menu endpoint дээрээс өгөгдөл уншиж admin формат руу хөрвүүлнэ
// ============================================================================

import { NextResponse } from 'next/server'

// Django backend-ийн URL хаяг
const BACKEND_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000/api/v1'

// ============================================================================
// Django формат → Admin формат хөрвүүлэгч
// ============================================================================
// Django FloatMenu = Admin Category (бүлэг)
// Django FloatMenuSubmenu = Admin Item (цэс)
// ============================================================================
function djangoToAdminFormat(djangoData: any[]) {
  const categories: any[] = []
  const items: any[] = []

  djangoData.forEach((floatMenu: any, index: number) => {
    // FloatMenu → Category
    const mnTranslation = floatMenu.translations?.find((t: any) => t.language === 2) || {}
    const enTranslation = floatMenu.translations?.find((t: any) => t.language === 1) || {}

    const category = {
      id: `db-${floatMenu.id}`,
      dbId: floatMenu.id,  // Django ID хадгалах
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

    // FloatMenuSubmenus → Items
    if (floatMenu.submenus) {
      floatMenu.submenus.forEach((submenu: any, subIndex: number) => {
        const subMnTranslation = submenu.translations?.find((t: any) => t.language === 2) || {}
        const subEnTranslation = submenu.translations?.find((t: any) => t.language === 1) || {}

        items.push({
          id: `db-item-${submenu.id}`,
          dbId: submenu.id,  // Django ID хадгалах
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
// GET - Өгөгдлийн сангаас floating menu мэдээлэл татах
// ============================================================================
export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/float-menu/`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    })

    if (!res.ok) {
      console.error(`Django backend алдаа: ${res.status}`)
      return NextResponse.json({ categories: [], items: [] })
    }

    const djangoData = await res.json()
    const adminData = djangoToAdminFormat(djangoData)

    return NextResponse.json(adminData)
  } catch (error) {
    console.error('Floating menu татахад алдаа:', error)
    return NextResponse.json({ categories: [], items: [] })
  }
}
