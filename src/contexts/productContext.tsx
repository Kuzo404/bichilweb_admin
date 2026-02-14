'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { axiosInstance } from '@/lib/axios'

interface ProductDetail {
  amount: string
  min_fee_percent: string
  max_fee_percent: string
  min_interest_rate: string
  max_interest_rate: string
  term_months: number
  min_processing_hours: number
  max_processing_hours: number
}

interface Document {
  id: number
  label_mn: string
  label_en: string
}

interface Collateral {
  id: number
  label_mn: string
  label_en: string
}

interface Condition {
  id: number
  label_mn: string
  label_en: string
}

interface Product {
  id: number
  product_type: number
  name_mn: string
  name_en: string
  details: ProductDetail | null
  documents: Document[]
  collaterals: Collateral[]
  conditions: Condition[]
  isActive?: boolean
}

interface ProductContextType {
  products: Product[]
  loading: boolean
  error: string | null
  fetchProducts: () => Promise<void>
  getProductById: (id: number) => Product | undefined
  createProduct: (product: Omit<Product, 'id'>) => Promise<Product | null>
  updateProduct: (id: number, product: Partial<Product>) => Promise<Product | null>
  deleteProduct: (id: number) => Promise<boolean>
  refreshProducts: () => Promise<void>
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await axiosInstance.get('/product/')

      console.log(response)

      if (response.data) {
        setProducts(response?.data)
      } else {
        setProducts([])
      }
    } catch (err: any) {
      console.error('Бүтээгдэхүүн татахад алдаа:', err)
      setError(err.response?.data?.error || 'Бүтээгдэхүүн татахад алдаа гарлаа')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  const getProductById = useCallback((id: number) => {
    return products.find(product => product.id === id)
  }, [products])

  const createProduct = useCallback(async (product: Omit<Product, 'id'>): Promise<Product | null> => {
    try {
      setError(null)
      
      const response = await axiosInstance.post('/product/', {
        mode: 'manual',
        ...product
      })

      if (response.data.success) {
        await fetchProducts()
        return response.data.data
      }
      
      return null
    } catch (err: any) {
      console.error('Бүтээгдэхүүн үүсгэхэд алдаа:', err)
      setError(err.response?.data?.error || 'Бүтээгдэхүүн үүсгэхэд алдаа гарлаа')
      return null
    }
  }, [fetchProducts])

  const updateProduct = useCallback(async (id: number, product: Partial<Product>): Promise<Product | null> => {
    try {
      setError(null)
      
      const response = await axiosInstance.put(`/product/${id}`, {
        mode: 'manual',
        ...product
      })

      if (response.data.success) {
        await fetchProducts()
        return response.data.data
      }
      
      return null
    } catch (err: any) {
      console.error('Бүтээгдэхүүн засахад алдаа:', err)
      setError(err.response?.data?.error || 'Бүтээгдэхүүн засахад алдаа гарлаа')
      return null
    }
  }, [fetchProducts])

  const deleteProduct = useCallback(async (id: number): Promise<boolean> => {
    try {
      setError(null)
      
      const response = await axiosInstance.delete(`/product/${id}`)

      if (response.data.success) {
        await fetchProducts()
        return true
      }
      
      return false
    } catch (err: any) {
      console.error('Бүтээгдэхүүн устгахад алдаа:', err)
      setError(err.response?.data?.error || 'Бүтээгдэхүүн устгахад алдаа гарлаа')
      return false
    }
  }, [fetchProducts])

  const refreshProducts = useCallback(async () => {
    await fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const value: ProductContextType = {
    products,
    loading,
    error,
    fetchProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
  }

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductContext)
  
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider')
  }
  
  return context
}

export function useProduct(id: number) {
  const { products, loading, error, getProductById } = useProducts()
  
  return {
    product: getProductById(id),
    loading,
    error,
  }
}