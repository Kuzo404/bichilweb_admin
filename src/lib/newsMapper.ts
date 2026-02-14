/**
 * Backend Mapper: Transform Admin NewsItem → Frontend NewsItem
 * 
 * Admin stores:
 * - title_mn, title_en, excerpt_mn, excerpt_en, content_mn, content_en
 * - Multiple styling fields (titleTextColor, titleFontSize, etc.)
 * - Pinned flags, gallery settings, social links
 * 
 * Frontend needs:
 * - title, excerpt, content (language-selected)
 * - category as object (not just ID)
 * - publishedAt, readTime, isActive
 */

export interface AdminNewsItem {
  id: string
  title_mn: string
  title_en: string
  slug: string
  excerpt_mn: string
  excerpt_en: string
  content_mn: string
  content_en: string
  titleTextColor?: string
  titleTextSize?: number
  titleFontWeight?: string
  titleFontFamily?: string
  excerptTextColor?: string
  excerptTextSize?: number
  excerptFontWeight?: string
  excerptFontFamily?: string
  contentTextColor?: string
  contentTextSize?: number
  contentFontWeight?: string
  contentFontFamily?: string
  bannerImage: string
  category: number
  publishedAt: string
  readTime: number
  isActive: boolean
  isPinnedNews: boolean
  isPinnedHome: boolean
  socialLinks?: any[]
  galleryWidth?: '1' | '2' | '3' | '4'
  additionalImages?: string[]
  additionalVideos?: string[]
}

export interface FrontendNewsItem {
  id: string
  title: string
  excerpt: string
  content: string
  bannerImage: string
  category: {
    id: number
    slug: string
    label: string
  }
  publishedAt: string
  readTime: number
  isActive: boolean
  isPinnedNews: boolean
  isPinnedHome: boolean
}

interface CategoryMap {
  [key: number]: { id: number; slug: string; label: string }
}

/**
 * Map Admin NewsItem to Frontend NewsItem
 * @param adminNews - Full Admin news item
 * @param language - 'mn' or 'en' for text selection
 * @param categoryMap - Mapping of category ID to { slug, label }
 * @returns Clean Frontend news contract
 */
export function mapAdminNewsToFrontend(
  adminNews: AdminNewsItem,
  language: 'mn' | 'en' = 'mn',
  categoryMap: CategoryMap = {}
): FrontendNewsItem {
  return {
    id: adminNews.id,
    title: language === 'mn' ? adminNews.title_mn : adminNews.title_en,
    excerpt: language === 'mn' ? adminNews.excerpt_mn : adminNews.excerpt_en,
    content: language === 'mn' ? adminNews.content_mn : adminNews.content_en,
    bannerImage: adminNews.bannerImage,
    category: categoryMap[adminNews.category] || {
      id: adminNews.category,
      slug: 'unknown',
      label: 'Unknown Category',
    },
    publishedAt: adminNews.publishedAt,
    readTime: adminNews.readTime,
    isActive: adminNews.isActive,
    isPinnedNews: adminNews.isPinnedNews,
    isPinnedHome: adminNews.isPinnedHome,
    //   NOT included:
    // - Any styling fields (titleTextColor, excerptTextSize, etc.)
    // - CMS-only data (socialLinks, gallery settings, additionalVideos)
    // - Admin-specific metadata (slug, galleryWidth)
  }
}

/**
 * Usage example for API endpoint:
 * 
 * // pages/api/news/[id].ts
 * export async function GET(request, { params }) {
 *   const { id } = params
 *   const lang = request.nextUrl.searchParams.get('lang') || 'mn'
 *   
 *   // Load admin news data and categories
 *   const adminNews = await getAdminNews(id)
 *   const categories = await getCategories() // Maps ID to { slug, label }
 *   
 *   // Transform for Frontend
 *   const frontendNews = mapAdminNewsToFrontend(adminNews, lang, categories)
 *   
 *   return Response.json(frontendNews)
 * }
 */
