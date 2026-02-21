/**
 * Page types for admin panel
 * Backend integration schema
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

export interface CustomPage {
  id: string;
  page_type: PageType;
  template: PageTemplate;
  slug: string;
  title_mn: string;
  title_en: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  content_mn?: string;
  content_en?: string;
  meta_description_mn?: string;
  meta_description_en?: string;
  image_url?: string;
  title_color?: string;
  title_size?: number;
  title_weight?: string;
  title_family?: string;
  content_color?: string;
  content_size?: number;
  content_weight?: string;
  content_family?: string;
  sections?: Array<{
    type?: 'header' | 'product' | 'services' | 'custom';
    title_mn: string;
    title_en: string;
    content_mn: string;
    content_en: string;
  }>;
  faqs?: Array<{
    question_mn: string;
    question_en: string;
    answer_mn: string;
    answer_en: string;
  }>;
  timeline_events?: Array<{
    year: string;
    title_mn: string;
    title_en: string;
    description_mn: string;
    description_en: string;
  }>;
  comparison_items?: Array<{
    name_mn: string;
    name_en: string;
    features: Record<string, string>;
  }>;
  testimonials?: Array<{
    quote_mn: string;
    quote_en: string;
    author_mn: string;
    author_en: string;
    title_mn?: string;
    title_en?: string;
  }>;
  gallery_images?: Array<{
    url: string;
    caption_mn?: string;
    caption_en?: string;
  }>;
}
