'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import Modal from '@/components/Modal'
import { Input, PageHeader, Button } from '@/components/FormElements'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { axiosInstance } from '@/lib/axios'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'

/* --- TYPES --- */
interface CollateralTranslation { id?: number; language: number; label: string }
interface CollateralAPI { id: number; translations: CollateralTranslation[] }
interface CollateralItem { id: number; label_mn: string; label_en: string }

interface ConditionTranslation { id?: number; language: number; label: string }
interface ConditionAPI { id: number; translations: ConditionTranslation[] }
interface ConditionItem { id: number; label_mn: string; label_en: string }

interface DocumentTranslation { id?: number; language: number; label: string }
interface DocumentAPI { id: number; translations: DocumentTranslation[] }
interface DocumentItem { id: number; label_mn: string; label_en: string }

/* --- HELPERS --- */
const getTranslation = <T extends { language: number; label: string }>(
  translations: T[], language: number
) => translations.find(t => t.language === language)

/* --- MAP API TO ITEM --- */
const mapApiToCollateral = (item: CollateralAPI): CollateralItem => {
  const en = getTranslation(item.translations, 1)
  const mn = getTranslation(item.translations, 2)
  return { id: item.id, label_mn: mn?.label || '', label_en: en?.label || '' }
}

const mapApiToCondition = (item: ConditionAPI): ConditionItem => {
  const en = getTranslation(item.translations, 1)
  const mn = getTranslation(item.translations, 2)
  return { id: item.id, label_mn: mn?.label || '', label_en: en?.label || '' }
}

const mapApiToDocument = (item: DocumentAPI): DocumentItem => {
  const en = getTranslation(item.translations, 1)
  const mn = getTranslation(item.translations, 2)
  return { id: item.id, label_mn: mn?.label || '', label_en: en?.label || '' }
}

/* --- COMPONENT --- */
export default function AdminCollateralsConditionsDocuments() {
  const { language, t } = useLanguage()

  /* --- STATES --- */
  const [collaterals, setCollaterals] = useState<CollateralItem[]>([])
  const [conditions, setConditions] = useState<ConditionItem[]>([])
  const [documents, setDocuments] = useState<DocumentItem[]>([])

  /* Collateral modal */
  const [collateralModalOpen, setCollateralModalOpen] = useState(false)
  const [editingCollateral, setEditingCollateral] = useState<CollateralItem | null>(null)
  const [collLabelMn, setCollLabelMn] = useState('')
  const [collLabelEn, setCollLabelEn] = useState('')

  /* Condition modal */
  const [conditionModalOpen, setConditionModalOpen] = useState(false)
  const [editingCondition, setEditingCondition] = useState<ConditionItem | null>(null)
  const [condLabelMn, setCondLabelMn] = useState('')
  const [condLabelEn, setCondLabelEn] = useState('')

  /* Document modal */
  const [documentModalOpen, setDocumentModalOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState<DocumentItem | null>(null)
  const [docLabelMn, setDocLabelMn] = useState('')
  const [docLabelEn, setDocLabelEn] = useState('')

  const [isSaving, setIsSaving] = useState(false)

  /* --- FETCH DATA --- */
  useEffect(() => {
    fetchCollaterals()
    fetchConditions()
    fetchDocuments()
  }, [])

  const fetchCollaterals = async () => {
    try { const res = await axiosInstance.get<CollateralAPI[]>('/collateral/')
      setCollaterals(res.data.map(mapApiToCollateral))
    } catch (err) { console.error(err) }
  }

  const fetchConditions = async () => {
    try { const res = await axiosInstance.get<ConditionAPI[]>('/condition')
      setConditions(res.data.map(mapApiToCondition))
    } catch (err) { console.error(err) }
  }

  const fetchDocuments = async () => {
    try { const res = await axiosInstance.get<DocumentAPI[]>('/document')
      setDocuments(res.data.map(mapApiToDocument))
    } catch (err) { console.error(err) }
  }

  /* --- COLLATERAL HANDLERS --- */
  const handleSubmitCollateral = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    const payload = [{ language: 1, label: collLabelEn }, { language: 2, label: collLabelMn }]
    try {
      if (editingCollateral) await axiosInstance.put(`/collateral/${editingCollateral.id}/`, { translations: payload })
      else await axiosInstance.post('/collateral/', { translations: payload })
      await fetchCollaterals()
      closeCollateralModal()
    } finally { setIsSaving(false) }
  }

  const handleEditCollateral = (item: CollateralItem) => {
    setEditingCollateral(item); setCollLabelMn(item.label_mn); setCollLabelEn(item.label_en)
    setCollateralModalOpen(true)
  }

  const handleDeleteCollateral = async (id: number) => {
    if (!confirm(t('Устгах уу?', 'Are you sure to delete?'))) return
    await axiosInstance.delete(`/collateral/${id}/`)
    fetchCollaterals()
  }

  const closeCollateralModal = () => { setCollateralModalOpen(false); setEditingCollateral(null); setCollLabelMn(''); setCollLabelEn('') }

  /* --- CONDITION HANDLERS --- */
  const handleSubmitCondition = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    const payload = [{ language: 1, label: condLabelEn }, { language: 2, label: condLabelMn }]
    try {
      if (editingCondition) await axiosInstance.put(`/condition/${editingCondition.id}/`, { translations: payload })
      else await axiosInstance.post('/condition/', { translations: payload })
      await fetchConditions()
      closeConditionModal()
    } finally { setIsSaving(false) }
  }

  const handleEditCondition = (item: ConditionItem) => {
    setEditingCondition(item); setCondLabelMn(item.label_mn); setCondLabelEn(item.label_en)
    setConditionModalOpen(true)
  }

  const handleDeleteCondition = async (id: number) => {
    if (!confirm(t('Устгах уу?', 'Are you sure to delete?'))) return
    await axiosInstance.delete(`/condition/${id}/`)
    fetchConditions()
  }

  const closeConditionModal = () => { setConditionModalOpen(false); setEditingCondition(null); setCondLabelMn(''); setCondLabelEn('') }

  /* --- DOCUMENT HANDLERS --- */
  const handleSubmitDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    const payload = [{ language: 1, label: docLabelEn }, { language: 2, label: docLabelMn }]
    try {
      if (editingDocument) await axiosInstance.put(`/document/${editingDocument.id}/`, { translations: payload })
      else await axiosInstance.post('/document/', { translations: payload })
      await fetchDocuments()
      closeDocumentModal()
    } finally { setIsSaving(false) }
  }

  const handleEditDocument = (item: DocumentItem) => {
    setEditingDocument(item); setDocLabelMn(item.label_mn); setDocLabelEn(item.label_en)
    setDocumentModalOpen(true)
  }

  const handleDeleteDocument = async (id: number) => {
    if (!confirm(t('Устгах уу?', 'Are you sure to delete?'))) return
    await axiosInstance.delete(`/document/${id}/`)
    fetchDocuments()
  }

  const closeDocumentModal = () => { setDocumentModalOpen(false); setEditingDocument(null); setDocLabelMn(''); setDocLabelEn('') }

  /* --- RENDER --- */
  return (
    <AdminLayout title={t('Барьцаа, Condition & Document', 'Collaterals, Conditions & Documents')}>
      <div className="max-w-6xl mx-auto p-6 space-y-12">

        {/* COLLATERAL */}
        <PageHeader
          title={t('Барьцаа', 'Collaterals')}
          description={t('Барьцаа удирдах', 'Manage Collaterals')}
          action={<div className="flex items-center gap-3"><LanguageSwitcher /><Button variant="dark" onClick={() => setCollateralModalOpen(true)} icon={<PlusIcon className="h-4 w-4" />}>{t('Шинэ барьцаа', 'Add Collateral')}</Button></div>}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {collaterals.map(item => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm p-5 group hover:shadow-lg transition">
              <div className="flex justify-between">
                <h3 className="font-semibold text-sm">{language==='mn'?item.label_mn||item.label_en:item.label_en||item.label_mn}</h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => handleEditCollateral(item)} className="p-2 bg-gray-100 rounded-lg"><PencilIcon className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteCollateral(item.id)} className="p-2 bg-red-100 rounded-lg"><TrashIcon className="w-4 h-4 text-red-600" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CONDITION */}
        <PageHeader
          title={t('Condition', 'Conditions')}
          description={t('Condition удирдах', 'Manage Conditions')}
          action={<div className="flex items-center gap-3"><Button variant="dark" onClick={() => setConditionModalOpen(true)} icon={<PlusIcon className="h-4 w-4" />}>{t('Шинэ Condition', 'Add Condition')}</Button></div>}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {conditions.map(item => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm p-5 group hover:shadow-lg transition">
              <div className="flex justify-between">
                <h3 className="font-semibold text-sm">{language==='mn'?item.label_mn||item.label_en:item.label_en||item.label_mn}</h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => handleEditCondition(item)} className="p-2 bg-gray-100 rounded-lg"><PencilIcon className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteCondition(item.id)} className="p-2 bg-red-100 rounded-lg"><TrashIcon className="w-4 h-4 text-red-600" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DOCUMENT */}
        <PageHeader
          title={t('Document', 'Documents')}
          description={t('Document удирдах', 'Manage Documents')}
          action={<div className="flex items-center gap-3"><Button variant="dark" onClick={() => setDocumentModalOpen(true)} icon={<PlusIcon className="h-4 w-4" />}>{t('Шинэ Document', 'Add Document')}</Button></div>}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {documents.map(item => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm p-5 group hover:shadow-lg transition">
              <div className="flex justify-between">
                <h3 className="font-semibold text-sm">{language==='mn'?item.label_mn||item.label_en:item.label_en||item.label_mn}</h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => handleEditDocument(item)} className="p-2 bg-gray-100 rounded-lg"><PencilIcon className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteDocument(item.id)} className="p-2 bg-red-100 rounded-lg"><TrashIcon className="w-4 h-4 text-red-600" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODALS */}
      <Modal isOpen={collateralModalOpen} onClose={closeCollateralModal} title={editingCollateral?t('Барьцаа засах','Edit Collateral'):t('Шинэ барьцаа','Add Collateral')}>
        <form onSubmit={handleSubmitCollateral} className="space-y-4">
          <Input label={t('Нэр (Монгол)','Name (Mongolian)')} value={collLabelMn} onChange={(e)=>setCollLabelMn(e.target.value)} required/>
          <Input label={t('Нэр (Англи)','Name (English)')} value={collLabelEn} onChange={(e)=>setCollLabelEn(e.target.value)} required/>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeCollateralModal} className="px-4 py-2 border rounded-lg">{t('Цуцлах','Cancel')}</button>
            <button type="submit" disabled={isSaving} className="px-6 py-2 bg-teal-600 text-white rounded-lg">{isSaving?t('Хадгалж байна...','Saving...'):editingCollateral?t('Шинэчлэх','Update'):t('Нэмэх','Add')}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={conditionModalOpen} onClose={closeConditionModal} title={editingCondition?t('Condition засах','Edit Condition'):t('Шинэ Condition','Add Condition')}>
        <form onSubmit={handleSubmitCondition} className="space-y-4">
          <Input label={t('Нэр (Монгол)','Name (Mongolian)')} value={condLabelMn} onChange={(e)=>setCondLabelMn(e.target.value)} required/>
          <Input label={t('Нэр (Англи)','Name (English)')} value={condLabelEn} onChange={(e)=>setCondLabelEn(e.target.value)} required/>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeConditionModal} className="px-4 py-2 border rounded-lg">{t('Цуцлах','Cancel')}</button>
            <button type="submit" disabled={isSaving} className="px-6 py-2 bg-teal-600 text-white rounded-lg">{isSaving?t('Хадгалж байна...','Saving...'):editingCondition?t('Шинэчлэх','Update'):t('Нэмэх','Add')}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={documentModalOpen} onClose={closeDocumentModal} title={editingDocument?t('Document засах','Edit Document'):t('Шинэ Document','Add Document')}>
        <form onSubmit={handleSubmitDocument} className="space-y-4">
          <Input label={t('Нэр (Монгол)','Name (Mongolian)')} value={docLabelMn} onChange={(e)=>setDocLabelMn(e.target.value)} required/>
          <Input label={t('Нэр (Англи)','Name (English)')} value={docLabelEn} onChange={(e)=>setDocLabelEn(e.target.value)} required/>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeDocumentModal} className="px-4 py-2 border rounded-lg">{t('Цуцлах','Cancel')}</button>
            <button type="submit" disabled={isSaving} className="px-6 py-2 bg-teal-600 text-white rounded-lg">{isSaving?t('Хадгалж байна...','Saving...'):editingDocument?t('Шинэчлэх','Update'):t('Нэмэх','Add')}</button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  )
}
