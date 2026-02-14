/**
 * Backend Mapper: Transform Admin ServiceData → Frontend ServiceData
 * 
 * Admin stores:
 * - name_mn, name_en, category_mn, category_en
 * - description_mn, description_en
 * - materials, collateral, conditions as LocalizedItem[]
 * - Multiple styling fields for different sections
 * - Content blocks (admin-specific)
 * 
 * Frontend needs:
 * - name, category, description (language-selected)
 * - materials, collateral, conditions as string[]
 * - stats and details objects
 */

type LocalizedItem = {
  id?: string
  mn: string
  en: string
  style?: any
}

export interface AdminServiceData {
  id: string
  name_mn: string
  name_en: string
  category_mn: string
  category_en: string
  description_mn: string
  description_en: string
  stats: { interest: string; decision: string; term: string }
  materials: LocalizedItem[]
  collateral: LocalizedItem[]
  conditions: LocalizedItem[]
  blocks?: any[]
  status: 'draft' | 'published'
  // All the styling fields...
  [key: string]: any
}

export interface FrontendServiceData {
  name_mn: string
  name_en: string
  category_mn: string
  category_en: string
  description_mn: string
  description_en: string
  stats: {
    interest: string
    decision: string
    term: string
  }
  details?: {
    amount?: string
    fee?: string
    interest?: string
    term?: string
    decision?: string
  }
  materials: string[]
  collateral: string[]
  conditions: string[]
}

/**
 * Map Admin ServiceData to Frontend ServiceData
 * @param adminService - Full Admin service structure
 * @param language - 'mn' or 'en' for string selection
 * @returns Clean Frontend service contract
 */
export function mapAdminServiceToFrontend(
  adminService: AdminServiceData,
  language: 'mn' | 'en' = 'mn'
): FrontendServiceData {
  return {
    name_mn: adminService.name_mn,
    name_en: adminService.name_en,
    category_mn: adminService.category_mn,
    category_en: adminService.category_en,
    description_mn: adminService.description_mn,
    description_en: adminService.description_en,
    stats: {
      interest: adminService.stats.interest,
      decision: adminService.stats.decision,
      term: adminService.stats.term,
    },
    // Transform LocalizedItem[] to string[] based on language
    materials: adminService.materials.map((item) =>
      language === 'mn' ? item.mn : item.en
    ),
    collateral: adminService.collateral.map((item) =>
      language === 'mn' ? item.mn : item.en
    ),
    conditions: adminService.conditions.map((item) =>
      language === 'mn' ? item.mn : item.en
    ),
    //   NOT included:
    // - Any styling fields (name_style, materials_style, etc.)
    // - CMS-only data (blocks, section titles, content blocks)
    // - Admin-specific UI configuration
  }
}

/**
 * Usage example for API endpoint:
 * 
 * // pages/api/services/[id].ts
 * export async function GET(request, { params }) {
 *   const { id } = params
 *   const lang = request.nextUrl.searchParams.get('lang') || 'mn'
 *   
 *   // Load admin service data from storage/database
 *   const adminService = await getAdminService(id)
 *   
 *   // Transform for Frontend
 *   const frontendService = mapAdminServiceToFrontend(adminService, lang)
 *   
 *   return Response.json(frontendService)
 * }
 */
