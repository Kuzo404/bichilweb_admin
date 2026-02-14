'use client'

import { useState } from 'react'
import { XMarkIcon, DocumentTextIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Translation {
  id: number
  language: number
  label: string
}

interface Document {
  id: number
  translations: Translation[]
}

interface SelectedDocument {
  id: number
  product_relation_id?: number
  label_mn: string
  label_en: string
}

interface DocumentSelectorProps {
  title: string
  selectedDocuments: SelectedDocument[]
  availableDocuments: Document[]
  onAdd: (document: Document) => Promise<boolean>
  onRemove: (documentId: number) => Promise<boolean>
  loading?: boolean
}

const getTranslation = (translations: Translation[], languageId: number): string => {
  const translation = translations.find(t => t.language === languageId)
  return translation?.label || ''
}

export default function DocumentSelector({
  title,
  selectedDocuments,
  availableDocuments,
  onAdd,
  onRemove,
  loading = false
}: DocumentSelectorProps) {
  const [showModal, setShowModal] = useState(false)
  const [processingId, setProcessingId] = useState<number | null>(null)

  const handleAddDocument = async (document: Document) => {
    setProcessingId(document.id)
    try {
      const success = await onAdd(document)
      if (success) {
        setShowModal(false)
      }
    } catch (error: any) {
      alert(`Нэмэхэд алдаа гарлаа: ${error.message}`)
    } finally {
      setProcessingId(null)
    }
  }

  const handleRemoveDocument = async (documentId: number) => {
    setProcessingId(documentId)
    try {
      await onRemove(documentId)
    } catch (error: any) {
      alert(`Устгахад алдаа гарлаа: ${error.message}`)
    } finally {
      setProcessingId(null)
    }
  }

  const availableToAdd = availableDocuments.filter(
    doc => !selectedDocuments.some(selected => selected.id === doc.id)
  )

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedDocuments.length} сонгогдсон
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              disabled={loading || availableToAdd.length === 0 || processingId !== null}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              <PlusIcon className="w-4 h-4" />
              Нэмэх
            </button>
          </div>
        </div>

        <div className="p-6">
          {selectedDocuments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DocumentTextIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-600">Баримт сонгоогүй байна</p>
              <p className="text-xs text-gray-400 mt-1">Дээрх "Нэмэх" товчийг дарж баримт нэмнэ үү</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className={`group relative flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all ${
                    processingId === doc.id ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DocumentTextIcon className="w-5 h-5 text-teal-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{doc.label_mn}</p>
                    <p className="text-sm text-gray-500 truncate mt-0.5">{doc.label_en}</p>
                  </div>

                  <button
                    onClick={() => handleRemoveDocument(doc.id)}
                    disabled={processingId !== null}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Устгах"
                  >
                    {processingId === doc.id ? (
                      <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <TrashIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && processingId === null) {
              setShowModal(false)
            }
          }}
        >
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Баримт сонгох</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {availableToAdd.length} боломжтой баримт
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={processingId !== null}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
                {availableToAdd.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl">✓</span>
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-1">Бүх баримт сонгогдсон</p>
                    <p className="text-sm text-gray-500">Нэмэх баримт байхгүй байна</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableToAdd.map((doc) => {
                      const isProcessing = processingId === doc.id
                      
                      return (
                        <button
                          key={doc.id}
                          onClick={() => handleAddDocument(doc)}
                          disabled={processingId !== null}
                          className={`w-full text-left group relative flex items-center gap-4 p-4 bg-gray-50 hover:bg-teal-50 rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            isProcessing 
                              ? 'bg-teal-50 border-teal-300 shadow-sm' 
                              : 'border-transparent hover:border-teal-200 hover:shadow-sm'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                            isProcessing ? 'bg-teal-100' : 'bg-white group-hover:bg-teal-100'
                          }`}>
                            {isProcessing ? (
                              <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <DocumentTextIcon className="w-6 h-6 text-teal-600" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors truncate">
                              {getTranslation(doc.translations, 2)}
                            </p>
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {getTranslation(doc.translations, 1)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">ID: {doc.id}</p>
                          </div>

                          {!isProcessing && (
                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="px-3 py-1.5 bg-teal-100 text-teal-700 text-xs font-medium rounded-lg">
                                Сонгох
                              </div>
                            </div>
                          )}
                          
                          {isProcessing && (
                            <div className="flex-shrink-0 text-teal-600 text-sm font-medium">
                              Нэмж байна...
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={processingId !== null}
                  className="w-full py-2.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl font-medium text-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Хаах
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}