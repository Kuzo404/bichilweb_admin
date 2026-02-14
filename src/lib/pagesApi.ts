import type { CustomPage, PageType } from '@/data/mockPages';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}


async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
 
  if (data.success === false) {
    throw new Error(data.error || 'Backend API error');
  }

  if (data.success === true && 'data' in data) {
    return data.data as T;
  }
  

  return data as T;
}

function getHeaders(requireAuth: boolean = false): Record<string, string> {

  return {
    'Content-Type': 'application/json',

  };
}


export const pagesApi = {

  getAllPages: async (): Promise<CustomPage[]> => {
    const response = await fetch(`${API_BASE_URL}/admin/pages`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
   
    });
    return handleApiResponse<CustomPage[]>(response);
  },


  getPublishedPages: async (): Promise<CustomPage[]> => {
    const response = await fetch(`${API_BASE_URL}/pages`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleApiResponse<CustomPage[]>(response);
  },

  /**
   * Get page by slug (published only for frontend)
   * Public endpoint, no auth required
   * 
   * @param slug - Page slug
   * @param pageType - Optional page type filter
   */
  getPageBySlug: async (slug: string, pageType?: PageType): Promise<CustomPage | null> => {
    const params = new URLSearchParams();
    if (pageType) params.append('type', pageType);
    
    const response = await fetch(`${API_BASE_URL}/pages/${slug}?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.status === 404) return null;
    return handleApiResponse<CustomPage>(response);
  },

  /**
   * Get pages by type (published only)
   * Public endpoint, no auth required
   * 
   * @param pageType - Type of pages to retrieve
   */
  getPagesByType: async (pageType: PageType): Promise<CustomPage[]> => {
    const response = await fetch(`${API_BASE_URL}/pages?type=${pageType}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleApiResponse<CustomPage[]>(response);
  },

  /**
   * Get pages for header menu (published, specific types)
   * Public endpoint, no auth required
   */
  getHeaderMenuPages: async (): Promise<CustomPage[]> => {
    const response = await fetch(`${API_BASE_URL}/pages/menu`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleApiResponse<CustomPage[]>(response);
  },

  /**
   * Create new page
   * Requires admin authentication
   * 
   * @param pageData - Page data without id, created_at, updated_at
   */
  createPage: async (
    pageData: Omit<CustomPage, 'id' | 'created_at' | 'updated_at'>
  ): Promise<CustomPage> => {
    const response = await fetch(`${API_BASE_URL}/admin/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    
      body: JSON.stringify(pageData),
    });
    return handleApiResponse<CustomPage>(response);
  },

  /**
   * Update existing page
   * Requires admin authentication
   * 
   * @param id - Page ID
   * @param updateData - Partial page data to update
   */
  updatePage: async (
    id: string,
    updateData: Partial<Omit<CustomPage, 'id' | 'created_at'>>
  ): Promise<CustomPage> => {
    const response = await fetch(`${API_BASE_URL}/admin/pages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
  
      body: JSON.stringify(updateData),
    });
    return handleApiResponse<CustomPage>(response);
  },

  /**
   * Delete page
   * Requires admin authentication
   * 
   * @param id - Page ID
   */
  deletePage: async (id: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/admin/pages/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
     
    });
    return response.ok;
  },
};
