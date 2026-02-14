import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: process.env.BACKEND_API_URL || 'http://127.0.0.1:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = process.env.API_TOKEN
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`
//     }
    
//     console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
//     return config
//   },
//   (error) => {
//     console.error('[API Request Error]', error)
//     return Promise.reject(error)
//   }
// )

// Response interceptor
// axiosInstance.interceptors.response.use(
//   (response) => {
//     console.log(`[API Response] ${response.status} ${response.config.url}`)
//     return response
//   },
//   (error) => {
//     console.error('[API Response Error]', error.response?.status, error.message)
//     return Promise.reject(error)
//   }
// )

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { mode, ...data } = body

    const productData = {
      id: data.id,
      product_type: data.product_type || 3,
      translations: [
        {
          language: 1,
          label: data.name_mn
        },
        {
          language: 2,
          label: data.name_en
        }
      ],
      details: data.details ? [
        {
          amount: data.details.amount || "0.00",
          min_fee_percent: data.details.min_fee_percent || "0.00",
          max_fee_percent: data.details.max_fee_percent || "0.00",
          min_interest_rate: data.details.min_interest_rate || "0.00",
          max_interest_rate: data.details.max_interest_rate || "0.00",
          term_months: data.details.term_months || 1,
          min_processing_hours: data.details.min_processing_hours || 0,
          max_processing_hours: data.details.max_processing_hours || 0
        }
      ] : [],
      documents: data.documents?.map((doc: any) => ({
        document: {
          id: doc.id,
          translations: [
            {
              language: 1,
              label: doc.label_mn
            },
            {
              language: 2,
              label: doc.label_en
            }
          ]
        }
      })) || [],
      collaterals: data.collaterals?.map((col: any) => ({
        collateral: {
          id: col.id,
          translations: [
            {
              language: 1,
              label: col.label_mn
            },
            {
              language: 2,
              label: col.label_en
            }
          ]
        }
      })) || [],
      conditions: data.conditions?.map((cond: any) => ({
        condition: {
          id: cond.id,
          translations: [
            {
              language: 1,
              label: cond.label_mn
            },
            {
              language: 2,
              label: cond.label_en
            }
          ]
        }
      })) || []
    }

    const response = await axiosInstance.post('/product/', productData)
    
    console.log(`[${mode === 'auto' ? 'AUTO-SAVE' : 'MANUAL SAVE'}]`, {
      id: productData.id,
      name_mn: data.name_mn,
      name_en: data.name_en,
      product_type: productData.product_type,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ 
      success: true, 
      message: mode === 'auto' ? 'Auto-saved' : 'Saved successfully',
      data: response.data 
    })
  } catch (error) {
    console.error('Save error:', error)
    
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.response?.data?.message || 'Failed to save',
          details: error.response?.data
        },
        { status: error.response?.status || 500 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to save' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Fetch from database via axios
    const response = await axiosInstance.get(`/product/${id}`)
    const product = response.data

    // Transform database result to frontend format
    const transformedData = product ? {
      id: product.id,
      product_type: product.product_type,
      name_mn: product.translations?.find((t: any) => t.language === 1)?.label || '',
      name_en: product.translations?.find((t: any) => t.language === 2)?.label || '',
      details: product.details?.[0] || null,
      documents: product.documents?.map((d: any) => ({
        id: d.document.id,
        label_mn: d.document.translations?.find((t: any) => t.language === 1)?.label || '',
        label_en: d.document.translations?.find((t: any) => t.language === 2)?.label || ''
      })) || [],
      collaterals: product.collaterals?.map((c: any) => ({
        id: c.collateral.id,
        label_mn: c.collateral.translations?.find((t: any) => t.language === 1)?.label || '',
        label_en: c.collateral.translations?.find((t: any) => t.language === 2)?.label || ''
      })) || [],
      conditions: product.conditions?.map((c: any) => ({
        id: c.condition.id,
        label_mn: c.condition.translations?.find((t: any) => t.language === 1)?.label || '',
        label_en: c.condition.translations?.find((t: any) => t.language === 2)?.label || ''
      })) || []
    } : null
    
    return NextResponse.json({ 
      success: true,
      data: transformedData
    })
  } catch (error) {
    console.error('Fetch error:', error)
    
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.response?.data?.message || 'Failed to fetch',
          details: error.response?.data
        },
        { status: error.response?.status || 500 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch' },
      { status: 500 }
    )
  }
}