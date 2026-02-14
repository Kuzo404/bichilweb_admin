'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import Modal from '@/components/Modal'
import { Input, PageHeader, Button, Select } from '@/components/FormElements'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { axiosInstance } from '@/lib/axios'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'

/* --- TYPES --- */
interface CategoryTranslation { id?: number; language: number; label: string }
interface CategoryAPI { id: number; translations: CategoryTranslation[]; product_types: any[] }
interface CategoryItem { id: number; label_mn: string; label_en: string }

interface ProductTypeTranslation { id?: number; language: number; label: string }
interface ProductTypeAPI { id: number; category: number; translations: ProductTypeTranslation[] }
interface ProductTypeItem { id: number; category: number; label_mn: string; label_en: string }

/* --- HELPERS --- */
const getTranslation = <T extends { language: number; label: string }>(
  translations: T[], language: number
) => translations.find(t => t.language === language)

/* --- MAP API TO ITEM --- */
const mapApiToCategory = (item: CategoryAPI): CategoryItem => {
  const en = getTranslation(item.translations, 1)
  const mn = getTranslation(item.translations, 2)
  return { id: item.id, label_mn: mn?.label || '', label_en: en?.label || '' }
}

const mapApiToProductType = (item: ProductTypeAPI): ProductTypeItem => {
  const en = getTranslation(item.translations, 1)
  const mn = getTranslation(item.translations, 2)
  return { id: item.id, category: item.category, label_mn: mn?.label || '', label_en: en?.label || '' }
}

/* --- COMPONENT --- */
export default function AdminCategoriesProductTypes() {
  const { language, t } = useLanguage()

  /* --- STATES --- */
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [productTypes, setProductTypes] = useState<ProductTypeItem[]>([])

  /* Category modal */
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null)
  const [catLabelMn, setCatLabelMn] = useState('')
  const [catLabelEn, setCatLabelEn] = useState('')

  /* Product Type modal */
  const [productTypeModalOpen, setProductTypeModalOpen] = useState(false)
  const [editingProductType, setEditingProductType] = useState<ProductTypeItem | null>(null)
  const [ptLabelMn, setPtLabelMn] = useState('')
  const [ptLabelEn, setPtLabelEn] = useState('')
  const [ptCategory, setPtCategory] = useState<number | ''>('')

  const [isSaving, setIsSaving] = useState(false)

  /* --- FETCH DATA --- */
  useEffect(() => {
    fetchCategories()
    fetchProductTypes()
  }, [])

  const fetchCategories = async () => {
    try { 
      const res = await axiosInstance.get<CategoryAPI[]>('/categories/')
      setCategories(res.data.map(mapApiToCategory))
    } catch (err) { console.error(err) }
  }

  const fetchProductTypes = async () => {
    try { 
      const res = await axiosInstance.get<ProductTypeAPI[]>('/product-type/')
      setProductTypes(res.data.map(mapApiToProductType))
    } catch (err) { console.error(err) }
  }

  /* --- CATEGORY HANDLERS --- */
  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    const payload = { translations: [{ language: 1, label: catLabelEn }, { language: 2, label: catLabelMn }] }
    try {
      if (editingCategory) await axiosInstance.put(`/categories/${editingCategory.id}/`, payload)
      else await axiosInstance.post('/categories/', payload)
      await fetchCategories()
      closeCategoryModal()
    } finally { setIsSaving(false) }
  }

  const handleEditCategory = (item: CategoryItem) => {
    setEditingCategory(item); setCatLabelMn(item.label_mn); setCatLabelEn(item.label_en)
    setCategoryModalOpen(true)
  }

  const handleDeleteCategory = async (id: number) => {
    if (!confirm(t('Устгах уу?', 'Are you sure to delete?'))) return
    await axiosInstance.delete(`/categories/${id}/`)
    fetchCategories()
  }

  const closeCategoryModal = () => { 
    setCategoryModalOpen(false); setEditingCategory(null); setCatLabelMn(''); setCatLabelEn('') 
  }

  /* --- PRODUCT TYPE HANDLERS --- */
  const handleSubmitProductType = async (e: React.FormEvent) => {
    e.preventDefault()
    if (ptCategory === '') return
    setIsSaving(true)
    const payload = { 
      category: ptCategory,
      translations: [{ language: 1, label: ptLabelEn }, { language: 2, label: ptLabelMn }] 
    }
    try {
      if (editingProductType) await axiosInstance.put(`/product-type/${editingProductType.id}/`, payload)
      else await axiosInstance.post('/product-type/', payload)
      await fetchProductTypes()
      closeProductTypeModal()
    } finally { setIsSaving(false) }
  }

  const handleEditProductType = (item: ProductTypeItem) => {
    setEditingProductType(item)
    setPtLabelMn(item.label_mn)
    setPtLabelEn(item.label_en)
    setPtCategory(item.category)
    setProductTypeModalOpen(true)
  }

  const handleDeleteProductType = async (id: number) => {
    if (!confirm(t('Устгах уу?', 'Are you sure to delete?'))) return
    await axiosInstance.delete(`/product-type/${id}/`)
    fetchProductTypes()
  }

  const closeProductTypeModal = () => { 
    setProductTypeModalOpen(false)
    setEditingProductType(null)
    setPtLabelMn('')
    setPtLabelEn('')
    setPtCategory('')
  }

  /* --- RENDER --- */
  const getCategoryLabel = (categoryId: number) => {
    const cat = categories.find(c => c.id === categoryId)
    if (!cat) return ''
    return language === 'mn' ? cat.label_mn || cat.label_en : cat.label_en || cat.label_mn
  }

  return (
    <AdminLayout title={t('Ангилал & Бүтээгдхүүний төрөл', 'Categories & Product Types')}>
      <div className="max-w-6xl mx-auto p-6 space-y-12">

        {/* CATEGORY */}
        <PageHeader
          title={t('Ангилал', 'Categories')}
          description={t('Ангилал удирдах', 'Manage Categories')}
          action={
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Button variant="dark" onClick={() => setCategoryModalOpen(true)} icon={<PlusIcon className="h-4 w-4" />}>
                {t('Шинэ ангилал', 'Add Category')}
              </Button>
            </div>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {categories.map(item => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm p-5 group hover:shadow-lg transition">
              <div className="flex justify-between">
                <h3 className="font-semibold text-sm">
                  {language === 'mn' ? item.label_mn || item.label_en : item.label_en || item.label_mn}
                </h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => handleEditCategory(item)} className="p-2 bg-gray-100 rounded-lg">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteCategory(item.id)} className="p-2 bg-red-100 rounded-lg">
                    <TrashIcon className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PRODUCT TYPE */}
        <PageHeader
          title={t('Бүтээгдхүүний төрөл', 'Product Types')}
          description={t('Бүтээгдхүүний төрөл удирдах', 'Manage Product Types')}
          action={
            <div className="flex items-center gap-3">
              <Button variant="dark" onClick={() => setProductTypeModalOpen(true)} icon={<PlusIcon className="h-4 w-4" />}>
                {t('Шинэ төрөл', 'Add Product Type')}
              </Button>
            </div>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {productTypes.map(item => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm p-5 group hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-sm">
                    {language === 'mn' ? item.label_mn || item.label_en : item.label_en || item.label_mn}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{getCategoryLabel(item.category)}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => handleEditProductType(item)} className="p-2 bg-gray-100 rounded-lg">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteProductType(item.id)} className="p-2 bg-red-100 rounded-lg">
                    <TrashIcon className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORY MODAL */}
      <Modal 
        isOpen={categoryModalOpen} 
        onClose={closeCategoryModal} 
        title={editingCategory ? t('Ангилал засах', 'Edit Category') : t('Шинэ ангилал', 'Add Category')}
      >
        <form onSubmit={handleSubmitCategory} className="space-y-4">
          <Input 
            label={t('Нэр (Монгол)', 'Name (Mongolian)')} 
            value={catLabelMn} 
            onChange={(e) => setCatLabelMn(e.target.value)} 
            required
          />
          <Input 
            label={t('Нэр (Англи)', 'Name (English)')} 
            value={catLabelEn} 
            onChange={(e) => setCatLabelEn(e.target.value)} 
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeCategoryModal} className="px-4 py-2 border rounded-lg">
              {t('Цуцлах', 'Cancel')}
            </button>
            <button type="submit" disabled={isSaving} className="px-6 py-2 bg-teal-600 text-white rounded-lg">
              {isSaving ? t('Хадгалж байна...', 'Saving...') : editingCategory ? t('Шинэчлэх', 'Update') : t('Нэмэх', 'Add')}
            </button>
          </div>
        </form>
      </Modal>

      {/* PRODUCT TYPE MODAL */}
      <Modal 
        isOpen={productTypeModalOpen} 
        onClose={closeProductTypeModal} 
        title={editingProductType ? t('Төрөл засах', 'Edit Product Type') : t('Шинэ төрөл', 'Add Product Type')}
      >
        <form onSubmit={handleSubmitProductType} className="space-y-4">
          <Select
            label={t('Ангилал', 'Category')}
            value={ptCategory}
            onChange={(e) => setPtCategory(Number(e.target.value))}
            required
          >
            <option value="">{t('Сонгох', 'Select')}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {language === 'mn' ? cat.label_mn || cat.label_en : cat.label_en || cat.label_mn}
              </option>
            ))}
          </Select>
          <Input 
            label={t('Нэр (Монгол)', 'Name (Mongolian)')} 
            value={ptLabelMn} 
            onChange={(e) => setPtLabelMn(e.target.value)} 
            required
          />
          <Input 
            label={t('Нэр (Англи)', 'Name (English)')} 
            value={ptLabelEn} 
            onChange={(e) => setPtLabelEn(e.target.value)} 
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeProductTypeModal} className="px-4 py-2 border rounded-lg">
              {t('Цуцлах', 'Cancel')}
            </button>
            <button type="submit" disabled={isSaving} className="px-6 py-2 bg-teal-600 text-white rounded-lg">
              {isSaving ? t('Хадгалж байна...', 'Saving...') : editingProductType ? t('Шинэчлэх', 'Update') : t('Нэмэх', 'Add')}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  )
}