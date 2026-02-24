// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'

export interface HeroSlideAPI {
  type: 'image' | 'video'
  file: string
  time: number
  index: number
  visible: boolean
}

export interface HeroSlide {
  id: string
  type: 'image' | 'video'
  src: string
  duration: number
  order: number
  isActive: boolean
}

function transformFromAPI(apiSlide: HeroSlideAPI): HeroSlide {
  return {
    id: apiSlide.index.toString(),
    type: apiSlide.type,
    src: apiSlide.file,
    duration: apiSlide.time,
    order: apiSlide.index,
    isActive: apiSlide.visible,
  }
}

function transformToAPI(slide: HeroSlide): HeroSlideAPI {
  return {
    type: slide.type,
    file: slide.src,
    time: slide.duration,
    index: slide.order,
    visible: slide.isActive,
  }
}

export const heroAPI = {
  async getSlides(): Promise<HeroSlide[]> {
    const response = await fetch(`${API_BASE_URL}/hero-slides`)
    if (!response.ok) throw new Error('Failed to fetch slides')
    const raw = await response.json()
    const data: HeroSlideAPI[] = Array.isArray(raw) ? raw : []
    return data.map(transformFromAPI)
  },

  async createSlide(slide: Omit<HeroSlide, 'id'>): Promise<HeroSlide> {
    const apiData = transformToAPI({ ...slide, id: '' })
    const response = await fetch(`${API_BASE_URL}/hero-slides`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiData),
    })
    if (!response.ok) throw new Error('Failed to create slide')
    const data: HeroSlideAPI = await response.json()
    return transformFromAPI(data)
  },

  // Слайд шинэчлэх
  async updateSlide(id: string, slide: HeroSlide): Promise<HeroSlide> {
    const apiData = transformToAPI(slide)
    const response = await fetch(`${API_BASE_URL}/hero-slides/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiData),
    })
    if (!response.ok) throw new Error('Failed to update slide')
    const data: HeroSlideAPI = await response.json()
    return transformFromAPI(data)
  },

  // Слайд устгах
  async deleteSlide(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/hero-slides/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete slide')
  },
}