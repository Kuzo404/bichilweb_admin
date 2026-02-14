'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { Input, Textarea, PageHeader, Select } from '@/components/FormElements'
import ProductPage from '@/components/ProductPage'
import DocumentSelector from '@/components/DocumentSelector'
import { axiosInstance } from '@/lib/axios'

interface Translation {
  id: number
  language: number
  label: string
}

interface Document {
  id: number
  translations: Translation[]
}

interface ProductType {
  id: number
  category: number
  translations: Translation[]
}

interface Category {
  id: number
  translations: Translation[]
  product_types: any[]
}

interface SelectedDocument {
  id: number
  label_mn: string
  label_en: string
}

interface ProductDetailsForm {
  amount: string
  feeType: string
  fee_percent: string
  min_interest_rate: string
  max_interest_rate: string
  term_months: string
  processing_time_minutes: string
  // Calculator styling
  calcBtnColor: string
  calcBtnFontSize: string
  calcBtnText: string
  requestBtnColor: string
  requestBtnFontSize: string
  requestBtnText: string
  requestBtnUrl: string
  disclaimerColor: string
  disclaimerFontSize: string
  disclaimerText: string
}

interface ProductData {
  product_type: number | ''
  name_mn: string
  name_en: string
  category_mn: string
  category_en: string
  description_mn: string
  description_en: string
  details: ProductDetailsForm
  documents: SelectedDocument[]
  collaterals: SelectedDocument[]
  conditions: SelectedDocument[]
}

const getTranslation = (translations: Translation[], languageId: number): string => {
  const translation = translations.find(t => t.language === languageId)
  return translation?.label || ''
}

const createDefaultData = (): ProductData => ({
  product_type: '',
  name_mn: '',
  name_en: '',
  category_mn: 'Бизнес · Санхүүжилт',
  category_en: 'Business · Financing',
  description_mn: '',
  description_en: '',
  details: {
    amount: '0',
    feeType: 'fee',
    fee_percent: '0',
    min_interest_rate: '0',
    max_interest_rate: '0',
    term_months: '0',
    processing_time_minutes: '0',
    calcBtnColor: '#0d9488',
    calcBtnFontSize: '14px',
    calcBtnText: 'Тооцоолох',
    requestBtnColor: '#2563eb',
    requestBtnFontSize: '14px',
    requestBtnText: 'Хүсэлт илгээх',
    requestBtnUrl: '',
    disclaimerColor: '#92400e',
    disclaimerFontSize: '10px',
    disclaimerText: 'Энэхүү тооцоолуур нь зөвхөн мэдээллийн зорилготой бөгөөд бодит зээлийн нөхцөл өөр байж болно.',
  },
  documents: [],
  collaterals: [],
  conditions: [],
})

export default function ProductCreatePage() {
  const router = useRouter()
  
  const [data, setData] = useState<ProductData>(createDefaultData())
  const [previewLang, setPreviewLang] = useState<'mn' | 'en'>('mn')
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  
  const [categories, setCategories] = useState<Category[]>([])
  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  const [availableDocuments, setAvailableDocuments] = useState<Document[]>([])
  const [availableCollaterals, setAvailableCollaterals] = useState<Document[]>([])
  const [availableConditions, setAvailableConditions] = useState<Document[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        const [categoriesRes, productTypesRes, docsRes, collsRes, condsRes] = await Promise.all([
          axiosInstance.get<Category[]>('/categories/'),
          axiosInstance.get<ProductType[]>('/product-type/'),
          axiosInstance.get<Document[]>('/document/'),
          axiosInstance.get<Document[]>('/collateral/'),
          axiosInstance.get<Document[]>('/condition/')
        ])
        
        setCategories(categoriesRes.data)
        setProductTypes(productTypesRes.data)
        setAvailableDocuments(docsRes.data)
        setAvailableCollaterals(collsRes.data)
        setAvailableConditions(condsRes.data)
        
      } catch (err: any) {
        console.error('Failed to fetch data:', err)
        alert(`Алдаа гарлаа: ${err.response?.data?.message || err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const updateData = (updater: (prev: ProductData) => ProductData) => {
    setData(updater)
  }

  const handleAddDocument = async (document: Document): Promise<boolean> => {
    try {
      const newDoc: SelectedDocument = {
        id: document.id,
        label_mn: getTranslation(document.translations, 2),
        label_en: getTranslation(document.translations, 1),
      }
      setData(prev => ({ ...prev, documents: [...prev.documents, newDoc] }))
      return true
    } catch (error: any) {
      console.error('Failed to add document:', error)
      throw new Error('Баримт нэмэхэд алдаа гарлаа')
    }
  }

  const handleRemoveDocument = async (documentId: number): Promise<boolean> => {
    try {
      setData(prev => ({ ...prev, documents: prev.documents.filter(d => d.id !== documentId) }))
      return true
    } catch (error: any) {
      console.error('Failed to remove document:', error)
      throw new Error('Баримт устгахад алдаа гарлаа')
    }
  }

  const handleAddCollateral = async (collateral: Document): Promise<boolean> => {
    try {
      const newColl: SelectedDocument = {
        id: collateral.id,
        label_mn: getTranslation(collateral.translations, 2),
        label_en: getTranslation(collateral.translations, 1),
      }
      setData(prev => ({ ...prev, collaterals: [...prev.collaterals, newColl] }))
      return true
    } catch (error: any) {
      console.error('Failed to add collateral:', error)
      throw new Error('Барьцаа нэмэхэд алдаа гарлаа')
    }
  }

  const handleRemoveCollateral = async (collateralId: number): Promise<boolean> => {
    try {
      setData(prev => ({ ...prev, collaterals: prev.collaterals.filter(c => c.id !== collateralId) }))
      return true
    } catch (error: any) {
      console.error('Failed to remove collateral:', error)
      throw new Error('Барьцаа устгахад алдаа гарлаа')
    }
  }

  const handleAddCondition = async (condition: Document): Promise<boolean> => {
    try {
      const newCond: SelectedDocument = {
        id: condition.id,
        label_mn: getTranslation(condition.translations, 2),
        label_en: getTranslation(condition.translations, 1),
      }
      setData(prev => ({ ...prev, conditions: [...prev.conditions, newCond] }))
      return true
    } catch (error: any) {
      console.error('Failed to add condition:', error)
      throw new Error('Нөхцөл нэмэхэд алдаа гарлаа')
    }
  }

  const handleRemoveCondition = async (conditionId: number): Promise<boolean> => {
    try {
      setData(prev => ({ ...prev, conditions: prev.conditions.filter(c => c.id !== conditionId) }))
      return true
    } catch (error: any) {
      console.error('Failed to remove condition:', error)
      throw new Error('Нөхцөл устгахад алдаа гарлаа')
    }
  }

  const handleCreate = async () => {
    if (!data.name_mn || !data.name_en) {
      alert('❌ Бүтээгдэхүүний нэр заавал оруулна уу!')
      return
    }

    if (data.product_type === '') {
      alert('❌ Бүтээгдэхүүний төрөл сонгоно уу!')
      return
    }

    setIsCreating(true)
    try {
      const createPayload = {
        product_type: data.product_type,
        translations: [
          { language: 1, label: data.name_en },
          { language: 2, label: data.name_mn }
        ],
        details: {
          amount: parseFloat(data.details.amount) || 0,
          min_fee_percent: parseFloat(data.details.fee_percent) || 0,
          max_fee_percent: parseFloat(data.details.fee_percent) || 0,
          min_interest_rate: parseFloat(data.details.min_interest_rate) || 0,
          max_interest_rate: parseFloat(data.details.max_interest_rate) || 0,
          term_months: parseInt(data.details.term_months) || 0,
          processing_time_minutes: parseInt(data.details.processing_time_minutes) || 0,
          fee_type: data.details.feeType,
          calc_btn_color: data.details.calcBtnColor,
          calc_btn_font_size: data.details.calcBtnFontSize,
          calc_btn_text: data.details.calcBtnText,
          request_btn_color: data.details.requestBtnColor,
          request_btn_font_size: data.details.requestBtnFontSize,
          request_btn_text: data.details.requestBtnText,
          request_btn_url: data.details.requestBtnUrl,
          disclaimer_color: data.details.disclaimerColor,
          disclaimer_font_size: data.details.disclaimerFontSize,
          disclaimer_text: data.details.disclaimerText,
        },
        documents: data.documents.map(doc => ({ document: doc.id })),
        collaterals: data.collaterals.map(coll => ({ collateral: coll.id })),
        conditions: data.conditions.map(cond => ({ condition: cond.id }))
      }


      const response = await axiosInstance.post('/product/', createPayload)
      
      alert('Бүтээгдэхүүн амжилттай үүсгэгдлээ!')
      router.push(`/admin/products/${response.data.id}`)
      
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail 
        || error.response?.data?.message 
        || error.message 
        || 'Тодорхойгүй алдаа'
      alert(`Алдаа: ${errorMsg}`)
    } finally {
      setIsCreating(false)
    }
  }

  const previewStats = {
    interest: `${data.details.min_interest_rate}% - ${data.details.max_interest_rate}%`,
    decision: `${data.details.processing_time_minutes} минут`,
    term: `${data.details.term_months} сар`,
  }

  const previewDetails = {
    amount: `${parseFloat(data.details.amount || '0').toLocaleString()}₮`,
    fee: `${data.details.fee_percent}%`,
    feeLabel: data.details.feeType === 'down_payment' ? 'Урьдчилгаа төлбөр /%/' : 'Шимтгэл /%/',
    feeLabelEn: data.details.feeType === 'down_payment' ? 'Down Payment' : 'Fee',
    interest: `${data.details.min_interest_rate}% - ${data.details.max_interest_rate}%`,
    term: `${data.details.term_months} сар`,
    decision: `${data.details.processing_time_minutes} минут`,
  }

  const getCategoryLabel = (productTypeId: number | '', lang: 'mn' | 'en'): string => {
    if (productTypeId === '') return ''
    const productType = productTypes.find(pt => pt.id === productTypeId)
    if (!productType) return ''
    const category = categories.find(cat => cat.id === productType.category)
    if (!category) return ''
    return getTranslation(category.translations, lang === 'mn' ? 2 : 1)
  }

  if (loading) {
    return (
      <AdminLayout title="Шинэ бүтээгдэхүүн">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Уншиж байна...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Шинэ бүтээгдэхүүн">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Шинэ бүтээгдэхүүн нэмэх"
          description="Бүх талбарыг бөглөж, 'Үүсгэх' товч дарна уу"
          action={
            <div className="flex gap-3">
              <button
                onClick={() => router.back()}
                disabled={isCreating}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-sm"
              >
                ← Буцах
              </button>
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-sm"
              >
                {isCreating ? ' Үүсгэж байна...' : 'Үүсгэх'}
              </button>
            </div>
          }
        />

        <div className="mb-8 rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-b from-slate-100 to-slate-50 shadow-sm">
          <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-white/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Live Preview</span>
            </div>
            
            <div className="flex bg-slate-200/80 p-1 rounded-lg">
               <button 
                 onClick={() => setPreviewLang('mn')}
                 className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${previewLang === 'mn' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 MN
               </button>
               <button 
                 onClick={() => setPreviewLang('en')}
                 className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${previewLang === 'en' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 EN
               </button>
            </div>
          </div>
          
          <div className="bg-white">
            <ProductPage 
              data={{
                name_mn: data.name_mn,
                name_en: data.name_en,
                category_mn: getCategoryLabel(data.product_type, 'mn') || data.category_mn,
                category_en: getCategoryLabel(data.product_type, 'en') || data.category_en,
                description_mn: data.description_mn,
                description_en: data.description_en,
                stats: previewStats,
                details: previewDetails,
                materials: data.documents.map(doc => ({ id: doc.id.toString(), mn: doc.label_mn, en: doc.label_en })),
                collateral: data.collaterals.map(coll => ({ id: coll.id.toString(), mn: coll.label_mn, en: coll.label_en })),
                conditions: data.conditions.map(cond => ({ id: cond.id.toString(), mn: cond.label_mn, en: cond.label_en })),
                name_style: { color: '#0f172a', fontSize: { mobile: 24, desktop: 32 }, fontWeight: 'bold', align: 'center' },
                category_style: { color: '#64748b', fontSize: { mobile: 12, desktop: 14 }, fontWeight: 'normal', align: 'center' },
                description_style: { color: '#334155', fontSize: { mobile: 14, desktop: 16 }, fontWeight: 'normal', align: 'center' },
                statsLabelStyle: { color: '#64748b', fontSize: { mobile: 10, desktop: 11 }, fontWeight: 'normal', align: 'center' },
                statsValueStyle: { color: '#0d9488', fontSize: { mobile: 14, desktop: 16 }, fontWeight: 'bold', align: 'center' },
                detailsSectionTitle_mn: 'Бүтээгдэхүүний үндсэн нөхцөл',
                detailsSectionTitle_en: 'Product conditions',
                detailsSectionTitleStyle: { color: '#64748b', fontSize: { mobile: 11, desktop: 12 }, fontWeight: 'normal', align: 'left' },
                detailsSubtitle_mn: data.name_mn,
                detailsSubtitle_en: data.name_en,
                detailsSubtitleStyle: { color: '#0f172a', fontSize: { mobile: 20, desktop: 24 }, fontWeight: 'bold', align: 'left' },
                metricsLabelStyle: { color: '#64748b', fontSize: { mobile: 11, desktop: 11 }, fontWeight: 'normal', align: 'left' },
                metricsValueStyle: { color: '#0f172a', fontSize: { mobile: 14, desktop: 16 }, fontWeight: 'bold', align: 'left' },
                materialsTitle_mn: 'Шаардагдах материал',
                materialsTitle_en: 'Required Documents',
                materialsTitleStyle: { color: '#0f172a', fontSize: { mobile: 14, desktop: 14 }, fontWeight: 'bold', align: 'left' },
                materialsTextStyle: { color: '#334155', fontSize: { mobile: 12, desktop: 12 }, fontWeight: 'normal', align: 'left' },
                materialsIconColor: '#0d9488',
                collateralTitle_mn: 'Барьцаа хөрөнгө',
                collateralTitle_en: 'Collateral',
                collateralTitleStyle: { color: '#0f172a', fontSize: { mobile: 14, desktop: 14 }, fontWeight: 'bold', align: 'left' },
                collateralTextStyle: { color: '#334155', fontSize: { mobile: 12, desktop: 12 }, fontWeight: 'normal', align: 'left' },
                collateralIconColor: '#0d9488',
                conditionsTitle_mn: 'Нөхцөл',
                conditionsTitle_en: 'Conditions',
                conditionsTitleStyle: { color: '#0f172a', fontSize: { mobile: 14, desktop: 14 }, fontWeight: 'bold', align: 'left' },
                conditionsTextStyle: { color: '#334155', fontSize: { mobile: 12, desktop: 12 }, fontWeight: 'normal', align: 'left' },
                conditionsIconColor: '#f97316',
                blocks: [],
                // Calculator styling
                calcBtnColor: data.details.calcBtnColor,
                calcBtnFontSize: data.details.calcBtnFontSize,
                calcBtnText: data.details.calcBtnText,
                requestBtnColor: data.details.requestBtnColor,
                requestBtnFontSize: data.details.requestBtnFontSize,
                requestBtnText: data.details.requestBtnText,
                requestBtnUrl: data.details.requestBtnUrl,
                disclaimerColor: data.details.disclaimerColor,
                disclaimerFontSize: data.details.disclaimerFontSize,
                disclaimerText: data.details.disclaimerText,
                // Product details for calculator
                maxAmount: parseFloat(data.details.amount) || 100000000,
                minRate: parseFloat(data.details.min_interest_rate) || 0.5,
                maxRate: parseFloat(data.details.max_interest_rate) || 5.0,
                maxTerm: parseInt(data.details.term_months) || 60,
                downPaymentPercent: data.details.feeType === 'down_payment' ? (parseFloat(data.details.fee_percent) || 0) : 0,
                feeType: data.details.feeType || 'fee',
              }} 
              forceLang={previewLang} 
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              Үндсэн мэдээлэл / Basic Information
              <span className="text-red-500 text-sm">*</span>
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <Select
                  label="Бүтээгдэхүүний төрөл / Product Type"
                  value={data.product_type}
                  onChange={(e) => updateData((prev) => ({ ...prev, product_type: e.target.value === '' ? '' : parseInt(e.target.value) }))}
                  required
                >
                  <option value="">Сонгох / Select</option>
                  {categories.map(category => {
                    const categoryProductTypes = productTypes.filter(pt => pt.category === category.id)
                    if (categoryProductTypes.length === 0) return null
                    return (
                      <optgroup key={category.id} label={`${getTranslation(category.translations, 2)} / ${getTranslation(category.translations, 1)}`}>
                        {categoryProductTypes.map(productType => (
                          <option key={productType.id} value={productType.id}>
                            {getTranslation(productType.translations, 2)} / {getTranslation(productType.translations, 1)}
                          </option>
                        ))}
                      </optgroup>
                    )
                  })}
                </Select>
                {data.product_type === '' && <p className="text-xs text-red-500 mt-1">Заавал сонгоно уу</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <Input
                    label="Нэр (MN)"
                    value={data.name_mn}
                    onChange={(e) => updateData((prev) => ({ ...prev, name_mn: e.target.value }))}
                    placeholder="Бүтээгдэхүүний нэр монгол хэлээр..."
                    required
                  />
                  {!data.name_mn && <p className="text-xs text-red-500 mt-1">Заавал бөглөнө үү</p>}
                </div>
                <div>
                  <Input
                    label="Name (EN)"
                    value={data.name_en}
                    onChange={(e) => updateData((prev) => ({ ...prev, name_en: e.target.value }))}
                    placeholder="Product name in English..."
                    required
                  />
                  {!data.name_en && <p className="text-xs text-red-500 mt-1">Заавал бөглөнө үү</p>}
                </div>
              </div>

              {/* <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <Textarea
                  label="Тайлбар (MN)"
                  value={data.description_mn}
                  onChange={(e) => updateData((prev) => ({ ...prev, description_mn: e.target.value }))}
                  rows={3}
                  placeholder="Дэлгэрэнгүй тайлбар..."
                />
                <Textarea
                  label="Description (EN)"
                  value={data.description_en}
                  onChange={(e) => updateData((prev) => ({ ...prev, description_en: e.target.value }))}
                  rows={3}
                  placeholder="Detailed description..."
                />
              </div> */}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              Дэлгэрэнгүй мэдээлэл / Product Details
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <Input
                  label="Дүн / Amount"
                  value={data.details.amount}
                  onChange={(e) => updateData((prev) => ({ ...prev, details: { ...prev.details, amount: e.target.value } }))}
                  placeholder="0"
                  type="number"
                />
              </div>

              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Төрөл / Type
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="feeType"
                        value="fee"
                        checked={data.details.feeType === 'fee'}
                        onChange={() => updateData((prev) => ({
                          ...prev,
                          details: { ...prev.details, feeType: 'fee' }
                        }))}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">Шимтгэл /%/</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="feeType"
                        value="down_payment"
                        checked={data.details.feeType === 'down_payment'}
                        onChange={() => updateData((prev) => ({
                          ...prev,
                          details: { ...prev.details, feeType: 'down_payment' }
                        }))}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">Урьдчилгаа төлбөр /%/</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {data.details.feeType === 'down_payment' ? 'Урьдчилгаа төлбөр %' : 'Шимтгэл %'} / Percent
                  </label>
                  <Input
                    value={data.details.fee_percent}
                    onChange={(e) => updateData((prev) => ({
                      ...prev,
                      details: { ...prev.details, fee_percent: e.target.value }
                    }))}
                    placeholder="0"
                    type="number"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <Input
                  label="Хүү хамгийн бага % / Min Interest %"
                  value={data.details.min_interest_rate}
                  onChange={(e) => updateData((prev) => ({ ...prev, details: { ...prev.details, min_interest_rate: e.target.value } }))}
                  placeholder="0"
                  type="number"
                  step="0.01"
                />
                <Input
                  label="Хүү хамгийн их % / Max Interest %"
                  value={data.details.max_interest_rate}
                  onChange={(e) => updateData((prev) => ({ ...prev, details: { ...prev.details, max_interest_rate: e.target.value } }))}
                  placeholder="0"
                  type="number"
                  step="0.01"
                />
              </div>

              <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
                <Input
                  label="Хугацаа (сар) / Term (months)"
                  value={data.details.term_months}
                  onChange={(e) => updateData((prev) => ({ ...prev, details: { ...prev.details, term_months: e.target.value } }))}
                  placeholder="0"
                  type="number"
                />
              </div>

              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Шийдвэрлэх хугацаа (минут) / Processing Time (minutes)
                </label>
                <Input
                  value={data.details.processing_time_minutes}
                  onChange={(e) => updateData((prev) => ({
                    ...prev,
                    details: { ...prev.details, processing_time_minutes: e.target.value }
                  }))}
                  placeholder="0"
                  type="number"
                />
              </div>
            </div>
          </div>

          <DocumentSelector
            title="Шаардагдах материал / Required Documents"
            selectedDocuments={data.documents}
            availableDocuments={availableDocuments}
            onAdd={handleAddDocument}
            onRemove={handleRemoveDocument}
            loading={false}
          />

          <DocumentSelector
            title="Барьцаа хөрөнгө / Collateral"
            selectedDocuments={data.collaterals}
            availableDocuments={availableCollaterals}
            onAdd={handleAddCollateral}
            onRemove={handleRemoveCollateral}
            loading={false}
          />

          <DocumentSelector
            title="Нөхцөл / Conditions"
            selectedDocuments={data.conditions}
            availableDocuments={availableConditions}
            onAdd={handleAddCondition}
            onRemove={handleRemoveCondition}
            loading={false}
          />

          {/* Calculator Styling */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <span>🔢</span>
              Тооцоолуур тохиргоо / Calculator Settings
            </h3>
            <div className="space-y-5">
              {/* Тооцоолох товч */}
              <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Тооцоолох товч</h4>
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Текст</label>
                    <Input
                      value={data.details.calcBtnText}
                      onChange={(e) => updateData((prev) => ({
                        ...prev,
                        details: { ...prev.details, calcBtnText: e.target.value }
                      }))}
                      placeholder="Тооцоолох"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Өнгө</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={data.details.calcBtnColor}
                        onChange={(e) => updateData((prev) => ({
                          ...prev,
                          details: { ...prev.details, calcBtnColor: e.target.value }
                        }))}
                        className="w-9 h-9 rounded border border-gray-200 cursor-pointer"
                      />
                      <Input
                        value={data.details.calcBtnColor}
                        onChange={(e) => updateData((prev) => ({
                          ...prev,
                          details: { ...prev.details, calcBtnColor: e.target.value }
                        }))}
                        placeholder="#0d9488"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Фонт хэмжээ</label>
                    <select
                      value={data.details.calcBtnFontSize}
                      onChange={(e) => updateData((prev) => ({
                        ...prev,
                        details: { ...prev.details, calcBtnFontSize: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                    >
                      <option value="12px">12px</option>
                      <option value="14px">14px</option>
                      <option value="16px">16px</option>
                      <option value="18px">18px</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-[10px] text-gray-400 mb-1">Урьдчилан харах:</p>
                  <button
                    type="button"
                    style={{ backgroundColor: data.details.calcBtnColor, fontSize: data.details.calcBtnFontSize }}
                    className="w-full rounded-lg px-4 py-2.5 font-medium text-white"
                  >
                    {data.details.calcBtnText}
                  </button>
                </div>
              </div>

              {/* Хүсэлт илгээх товч */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Хүсэлт илгээх товч</h4>
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Текст</label>
                    <Input
                      value={data.details.requestBtnText}
                      onChange={(e) => updateData((prev) => ({
                        ...prev,
                        details: { ...prev.details, requestBtnText: e.target.value }
                      }))}
                      placeholder="Хүсэлт илгээх"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Өнгө</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={data.details.requestBtnColor}
                        onChange={(e) => updateData((prev) => ({
                          ...prev,
                          details: { ...prev.details, requestBtnColor: e.target.value }
                        }))}
                        className="w-9 h-9 rounded border border-gray-200 cursor-pointer"
                      />
                      <Input
                        value={data.details.requestBtnColor}
                        onChange={(e) => updateData((prev) => ({
                          ...prev,
                          details: { ...prev.details, requestBtnColor: e.target.value }
                        }))}
                        placeholder="#2563eb"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Фонт хэмжээ</label>
                    <select
                      value={data.details.requestBtnFontSize}
                      onChange={(e) => updateData((prev) => ({
                        ...prev,
                        details: { ...prev.details, requestBtnFontSize: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="12px">12px</option>
                      <option value="14px">14px</option>
                      <option value="16px">16px</option>
                      <option value="18px">18px</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">URL (линк)</label>
                  <Input
                    value={data.details.requestBtnUrl}
                    onChange={(e) => updateData((prev) => ({
                      ...prev,
                      details: { ...prev.details, requestBtnUrl: e.target.value }
                    }))}
                    placeholder="https://example.com/apply"
                  />
                </div>
                <div className="mt-3">
                  <p className="text-[10px] text-gray-400 mb-1">Урьдчилан харах:</p>
                  <button
                    type="button"
                    style={{ backgroundColor: data.details.requestBtnColor, fontSize: data.details.requestBtnFontSize }}
                    className="w-full rounded-lg px-4 py-2.5 font-medium text-white"
                  >
                    {data.details.requestBtnText}
                  </button>
                </div>
              </div>

              {/* Анхааруулга */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Анхааруулга</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Текст</label>
                    <Textarea
                      value={data.details.disclaimerText}
                      onChange={(e) => updateData((prev) => ({
                        ...prev,
                        details: { ...prev.details, disclaimerText: e.target.value }
                      }))}
                      rows={2}
                      placeholder="Анхааруулга текст..."
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Өнгө</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={data.details.disclaimerColor}
                          onChange={(e) => updateData((prev) => ({
                            ...prev,
                            details: { ...prev.details, disclaimerColor: e.target.value }
                          }))}
                          className="w-9 h-9 rounded border border-gray-200 cursor-pointer"
                        />
                        <Input
                          value={data.details.disclaimerColor}
                          onChange={(e) => updateData((prev) => ({
                            ...prev,
                            details: { ...prev.details, disclaimerColor: e.target.value }
                          }))}
                          placeholder="#92400e"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Фонт хэмжээ</label>
                      <select
                        value={data.details.disclaimerFontSize}
                        onChange={(e) => updateData((prev) => ({
                          ...prev,
                          details: { ...prev.details, disclaimerFontSize: e.target.value }
                        }))}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                      >
                        <option value="9px">9px</option>
                        <option value="10px">10px</option>
                        <option value="11px">11px</option>
                        <option value="12px">12px</option>
                        <option value="14px">14px</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1">Урьдчилан харах:</p>
                    <div
                      className="rounded-lg border border-amber-200 bg-amber-50 p-2.5"
                      style={{ color: data.details.disclaimerColor, fontSize: data.details.disclaimerFontSize }}
                    >
                      <p className="font-medium mb-0.5">Анхааруулга</p>
                      <p>{data.details.disclaimerText}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">Бэлэн болсон уу?</h4>
                <p className="text-sm text-gray-600">Бүх мэдээлэл зөв эсэхийг шалгаад "Үүсгэх" товч дарна уу</p>
              </div>
              <button
                onClick={handleCreate}
                disabled={isCreating || !data.name_mn || !data.name_en || data.product_type === ''}
                className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-lg hover:shadow-xl text-lg"
              >
                {isCreating ? ' Үүсгэж байна...' : 'Үүсгэх'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}