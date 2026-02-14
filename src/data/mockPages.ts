/**
 * Mock pages data for admin - To be integrated with backend
 * 
 * FINAL SCHEMA FOR BACKEND INTEGRATION
 * Backend developer must implement this exact interface
 */

export type PageType = 'about' | 'products' | 'services' | 'faq' | 'custom';

export type PageTemplate = 
  | 'default'
  | 'landing' 
  | 'article' 
  | 'image' 
  | 'legal' 
  | 'minimal'
  | 'sectioned' 
  | 'faq' 
  | 'timeline' 
  | 'comparison' 
  | 'testimonial' 
  | 'gallery';

/**
 * Core page object structure
 * All required fields must be present from backend
 * Optional fields can be null/undefined
 */
export interface CustomPage {
  // ========== REQUIRED FIELDS ==========
  /** Unique identifier - backend generates (MongoDB ObjectId, UUID, etc) */
  id: string;
  
  /** Page category/type */
  page_type: PageType;
  
  /** Template layout type */
  template: PageTemplate;
  
  /** URL-friendly page slug (must be unique per page_type) */
  slug: string;
  
  /** Mongolian page title */
  title_mn: string;
  
  /** English page title */
  title_en: string;
  
  /** Publication status - controls frontend visibility */
  is_published: boolean;
  
  /** ISO 8601 creation timestamp - backend sets */
  created_at: string;
  
  /** ISO 8601 last update timestamp - backend updates */
  updated_at: string;

  // ========== OPTIONAL FIELDS ==========
  /** Mongolian main content body */
  content_mn?: string;
  
  /** English main content body */
  content_en?: string;
  
  /** SEO meta description (Mongolian) */
  meta_description_mn?: string;
  
  /** SEO meta description (English) */
  meta_description_en?: string;
  
  /**
   * Hero/featured image URL
   * NOTE: Backend upload endpoint returns this URL
   * Frontend should NOT store base64 - always use image_url from backend
   */
  image_url?: string;

  // ========== STYLING FIELDS ==========
  /** Heading color (hex or rgba) */
  title_color?: string;
  
  /** Heading font size in pixels */
  title_size?: number;
  
  /** Heading font weight (normal, 600, 700, bold, etc) */
  title_weight?: string;
  
  /** Heading font family (CSS font-family value) */
  title_family?: string;
  
  /** Body text color (hex or rgba) */
  content_color?: string;
  
  /** Body text font size in pixels */
  content_size?: number;
  
  /** Body text font weight */
  content_weight?: string;
  
  /** Body text font family (CSS font-family value) */
  content_family?: string;

  // ========== TEMPLATE-SPECIFIC CONTENT BLOCKS ==========
  /**
   * Sectioned/Multi-block template
   * For pages with multiple content sections
   */
  sections?: Array<{
    type?: 'header' | 'product' | 'services' | 'custom';
    title_mn: string;
    title_en: string;
    content_mn: string;
    content_en: string;
  }>;
  
  /**
   * FAQ/Accordion template
   * For question-answer pages
   */
  faqs?: Array<{
    question_mn: string;
    question_en: string;
    answer_mn: string;
    answer_en: string;
  }>;
  
  /**
   * Timeline/History template
   * For chronological content
   */
  timeline_events?: Array<{
    year: string;
    title_mn: string;
    title_en: string;
    description_mn: string;
    description_en: string;
  }>;
  
  /**
   * Comparison/Table template
   * For feature comparison layouts
   */
  comparison_items?: Array<{
    name_mn: string;
    name_en: string;
    features: Record<string, string>;
  }>;
  
  /**
   * Testimonial/Quotes template
   * For customer testimonials
   */
  testimonials?: Array<{
    quote_mn: string;
    quote_en: string;
    author_mn: string;
    author_en: string;
    title_mn?: string;
    title_en?: string;
  }>;
  
  /**
   * Gallery/Masonry template
   * For image galleries
   */
  gallery_images?: Array<{
    url: string;
    caption_mn?: string;
    caption_en?: string;
  }>;
}

// Empty default data - all pages will come from backend
const defaultPages: CustomPage[] = [];

// Generate unique ID
function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

/**
 * DEPRECATED: Mock Pages Service
 * 
 * ⚠️ THIS IS TEMPORARY - Replace with pagesApi from @/lib/pagesApi
 * 
 * When backend is ready:
 * 1. Switch imports from mockPagesService to pagesApi
 * 2. Remove this file after migration
 * 
 * Frontend components should use: import { pagesApi } from '@/lib/pagesApi'
 */
export const mockPagesService = {
  // Get all pages (admin view - includes drafts)
  getAllPages: async (): Promise<CustomPage[]> => {
    // TODO: Replace with backend API call
    // const response = await fetch('/api/admin/pages');
    // if (!response.ok) throw new Error('Failed to fetch pages');
    // return response.json();
    return defaultPages;
  },

  // Get published pages only (frontend view)
  getPublishedPages: async (): Promise<CustomPage[]> => {
    // TODO: Replace with backend API call
    // const response = await fetch('/api/pages?published=true');
    // if (!response.ok) throw new Error('Failed to fetch published pages');
    // return response.json();
    return defaultPages.filter(page => page.is_published);
  },

  // Get page by slug and page_type (published only for frontend)
  getPageBySlug: async (slug: string, pageType?: PageType): Promise<CustomPage | null> => {
    // TODO: Replace with backend API call
    // const response = await fetch(`/api/pages/${slug}?type=${pageType}`);
    // if (!response.ok) return null;
    // return response.json();
    const page = defaultPages.find(p => 
      p.slug === slug && 
      p.is_published && 
      (!pageType || p.page_type === pageType)
    );
    return page || null;
  },

  // Get pages for header menu (dynamically loaded)
  getHeaderMenuPages: async (): Promise<CustomPage[]> => {
    // TODO: Replace with backend API call
    // const response = await fetch('/api/pages/menu');
    // if (!response.ok) throw new Error('Failed to fetch menu pages');
    // return response.json();
    return defaultPages.filter(p => 
      p.is_published && 
      ['about', 'products', 'services', 'faq'].includes(p.page_type || 'custom')
    );
  },

  // Get pages by type
  getPagesByType: async (pageType: PageType): Promise<CustomPage[]> => {
    // TODO: Replace with backend API call
    // const response = await fetch(`/api/pages?type=${pageType}`);
    // if (!response.ok) return [];
    // return response.json();
    return defaultPages.filter(p => p.is_published && p.page_type === pageType);
  },

  // Create new page
  createPage: async (pageData: Omit<CustomPage, 'id' | 'created_at' | 'updated_at'>): Promise<CustomPage> => {
    // TODO: Replace with backend API call
    // const response = await fetch('/api/admin/pages', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(pageData)
    // });
    // if (!response.ok) throw new Error('Failed to create page');
    // return response.json();
    
    const newPage: CustomPage = {
      ...pageData,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return newPage;
  },

  // Update page
  updatePage: async (id: string, updateData: Partial<Omit<CustomPage, 'id' | 'created_at'>>): Promise<CustomPage | null> => {
    // TODO: Replace with backend API call
    // const response = await fetch(`/api/admin/pages/${id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(updateData)
    // });
    // if (!response.ok) return null;
    // return response.json();
    
    return null;
  },

  // Delete page
  deletePage: async (id: string): Promise<boolean> => {
    // TODO: Replace with backend API call
    // const response = await fetch(`/api/admin/pages/${id}`, {
    //   method: 'DELETE'
    // });
    // return response.ok;
    
    return false;
  }
};

// Direct access functions (for frontend) - deprecated, use mockPagesService instead
export function getMockPages(): CustomPage[] {
  console.warn('getMockPages is deprecated, use mockPagesService.getPublishedPages() instead');
  return defaultPages.filter(page => page.is_published);
}

export function getMockPageBySlug(slug: string): CustomPage | undefined {
  console.warn('getMockPageBySlug is deprecated, use mockPagesService.getPageBySlug() instead');
  return defaultPages.find(page => page.slug === slug && page.is_published);
}
