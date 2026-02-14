
type LocalizedItem = {
  id?: string
  mn: string
  en: string
}

type AdminProductData = {
  id: string
  name_mn: string
  name_en: string
  name_style?: any
  category_mn: string
  category_en: string
  category_style?: any
  description_mn: string
  description_en: string
  description_style?: any
  blocks?: any[]
  stats: { interest: string; decision: string; term: string }
  statsLabelStyle?: any
  statsValueStyle?: any
  details: { amount: string; fee: string; interest: string; term: string; decision: string }
  detailsSectionTitle_mn?: string
  detailsSectionTitle_en?: string
  detailsSectionTitleStyle?: any
  detailsSubtitle_mn?: string
  detailsSubtitle_en?: string
  detailsSubtitleStyle?: any
  metricsLabelStyle?: any
  metricsValueStyle?: any
  materials: LocalizedItem[]
  materialsTitle_mn?: string
  materialsTitle_en?: string
  materialsTitleStyle?: any
  materialsTextStyle?: any
  materialsIconColor?: string
  collateral: LocalizedItem[]
  collateralTitle_mn?: string
  collateralTitle_en?: string
  collateralTitleStyle?: any
  collateralTextStyle?: any
  collateralIconColor?: string
  conditions: LocalizedItem[]
  conditionsTitle_mn?: string
  conditionsTitle_en?: string
  conditionsTitleStyle?: any
  conditionsTextStyle?: any
  conditionsIconColor?: string
  status: 'draft' | 'published'
}

export type FrontendProductData = {
  id?: string
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
  details: {
    amount: string
    fee: string
    interest: string
    term: string
    decision: string
  }
  materials: string[]
  collateral?: string[]
  conditions?: string[]
}

/**
 * Map Admin ProductData to Frontend ProductData
 * @param adminData - Full Admin product structure
 * @param language - 'mn' or 'en' for string selection
 * @returns Clean Frontend product contract
 */
export function mapAdminProductToFrontend(
  adminData: AdminProductData,
  language: 'mn' | 'en' = 'mn'
): FrontendProductData {
  return {
    id: adminData.id,
    name_mn: adminData.name_mn,
    name_en: adminData.name_en,
    category_mn: adminData.category_mn,
    category_en: adminData.category_en,
    description_mn: adminData.description_mn,
    description_en: adminData.description_en,
    stats: {
      interest: adminData.stats.interest,
      decision: adminData.stats.decision,
      term: adminData.stats.term,
    },
    details: {
      amount: adminData.details.amount,
      fee: adminData.details.fee,
      interest: adminData.details.interest,
      term: adminData.details.term,
      decision: adminData.details.decision,
    },
    // Transform LocalizedItem[] to string[] based on language
    materials: adminData.materials.map((item) =>
      language === 'mn' ? item.mn : item.en
    ),
    collateral: adminData.collateral.map((item) =>
      language === 'mn' ? item.mn : item.en
    ),
    conditions: adminData.conditions.map((item) =>
      language === 'mn' ? item.mn : item.en
    ),
    //   NOT included:
    // - Any styling fields (name_style, materials_style, etc.)
    // - Any CMS-only data (blocks, section titles, etc.)
    // - Admin-specific metadata
  }
}

/**
 * Usage example for API endpoint:
 * 
 * // pages/api/products/[id].ts
 * export async function GET(request, { params }) {
 *   const { id } = params
 *   const lang = request.nextUrl.searchParams.get('lang') || 'mn'
 *   
 *   // Load admin product data from storage/database
 *   const adminProduct = await getAdminProduct(id)
 *   
 *   // Transform for Frontend
 *   const frontendProduct = mapAdminProductToFrontend(adminProduct, lang)
 *   
 *   return Response.json(frontendProduct)
 * }
 */
