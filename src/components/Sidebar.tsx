'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  HomeIcon,
  CurrencyDollarIcon,
  CubeIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  RectangleStackIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import {axiosInstance} from '@/lib/axios' 

interface ProductTranslation {
  id: number
  language: number
  label: string
}

interface Product {
  id: number
  product_type: number
  translations: ProductTranslation[]
}

interface ServiceTranslation {
  id: number
  language: number
  title: string
  description: string | null
}

interface Service {
  id: number
  translations: ServiceTranslation[]
  cards: any[]
  collaterals: any[]
  conditions: any[]
  documents: any[]
}

const staticNavigation = [
  { name: 'Хянах самбар', href: '/', icon: HomeIcon },
  {
    name: 'Сайтын бүтэц',
    icon: RectangleStackIcon,
    children: [
      { name: 'Header', href: '/admin/header' },
      { name: 'Hero Slider', href: '/admin/hero' },
      { name: 'CTA Slider', href: '/admin/cta' },
      { name: 'Floating Menu', href: '/admin/floating-menu' },
      { name: 'Footer', href: '/admin/footer' },
      { name: 'App Download', href: '/admin/app-download' },
    ],
  },
  {
    name: 'Байгууллага',
    icon: BuildingOfficeIcon,
    children: [
      { name: 'Бидний тухай', href: '/admin/about' },
      { name: 'Салбарууд', href: '/admin/branches' },
    ],
  },
  {
    name: 'Контент',
    icon: DocumentTextIcon,
    children: [
      { name: 'Мэдээ', href: '/admin/news' },
    ],
  },
  { name: 'Хуудас удирдах', href: '/admin/pages', icon: DocumentDuplicateIcon },
  { name: 'Хүний нөөц', href: '/admin/hr', icon: UserGroupIcon },
  {
    name: 'Санхүү',
    icon: CurrencyDollarIcon,
    children: [
      { name: 'Валютын ханш', href: '/admin/rates' },
    ],
  },
  {
    name: 'Хэрэглэгдэхүүн',
    icon: CurrencyDollarIcon,
    children: [{ name: 'Мэдээлэл', href: '/admin/utilities' }],
  },
]

function getProductLabel(product: Product): string {
  const mn = product.translations.find((t) => t.language === 2)
  const en = product.translations.find((t) => t.language === 1)
  return mn?.label || en?.label || `Бүтээгдэхүүн #${product.id}`
}

function getServiceTitle(service: Service): string {
  const mn = service.translations.find((t) => t.language === 2)
  const en = service.translations.find((t) => t.language === 1)
  return mn?.title || en?.title || `Үйлчилгээ #${service.id}`
}

export default function Sidebar() {
  const pathname = usePathname()
  const [products, setProducts] = useState<Product[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingServices, setLoadingServices] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get('/product/')
        setProducts(response.data)
      } catch (error) {
        console.error('Бүтээгдэхүүн татахад алдаа гарлаа:', error)
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axiosInstance.get('/services/')
        setServices(response.data)
      } catch (error) {
        console.error('Үйлчилгээ татахад алдаа гарлаа:', error)
      } finally {
        setLoadingServices(false)
      }
    }
    fetchServices()
  }, [])

  const productNavItem = {
    name: 'Бүтээгдэхүүн',
    icon: CubeIcon,
    children: [
      { name: 'Бүтээгдхүүн удирдлага', href: '/admin/products-setting' },
      { name: 'Бүтээгдхүүн нэмэх', href: '/admin/product-add' },
      ...products.map((product) => ({
        name: getProductLabel(product),
        href: `/admin/products/${product.id}`,
      })),
    ],
  }

  const serviceNavItem = {
    name: 'Үйлчилгээ',
    icon: BriefcaseIcon,
    children: [
      { name: 'Үйлчилгээ нэмэх', href: '/admin/service-add' },
      ...services.map((service) => ({
        name: getServiceTitle(service),
        href: `/admin/services/${service.id}`,
      })),
    ],
  }

  const navigation = [
    staticNavigation[0], 
    staticNavigation[1],
    productNavItem,      
    serviceNavItem,     
    ...staticNavigation.slice(2), 
  ]

  const getInitialExpanded = () => {
    const expanded: string[] = []
    if (
      pathname?.startsWith('/admin/header') ||
      pathname?.startsWith('/admin/hero') ||
      pathname?.startsWith('/admin/cta') ||
      pathname?.startsWith('/admin/floating-menu') ||
      pathname?.startsWith('/admin/footer') ||
      pathname?.startsWith('/admin/app-download')
    ) {
      expanded.push('Сайтын бүтэц')
    }
    if (pathname?.startsWith('/admin/products')) {
      expanded.push('Бүтээгдэхүүн')
    }
    if (pathname?.startsWith('/admin/services')) {
      expanded.push('Үйлчилгээ')
    }
    if (
      pathname?.startsWith('/admin/about') ||
      pathname?.startsWith('/admin/branches')
    ) {
      expanded.push('Байгууллага')
    }
    if (
      pathname?.startsWith('/admin/news') ||
      pathname?.startsWith('/admin/pages')
    ) {
      expanded.push('Контент')
    }
    if (
      pathname?.startsWith('/admin/rates') ||
      pathname?.startsWith('/admin/calculator')
    ) {
      expanded.push('Санхүү')
    }
    return expanded
  }

  const [expandedItems, setExpandedItems] = useState<string[]>(getInitialExpanded)

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    )
  }

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 px-3 py-4">
      <div className="mb-6 flex items-center gap-2 px-3 py-2">
        <div className="h-8 w-8 rounded-lg bg-indigo-500" />
        <span className="text-lg font-semibold text-white">Admin</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const hasChildren = 'children' in item && item.children
          const isExpanded = expandedItems.includes(item.name)
          const isActive = item.href
            ? pathname === item.href ||
              (item.href !== '/' && pathname?.startsWith(item.href))
            : hasChildren &&
              item.children?.some((child) => pathname?.startsWith(child.href))

          const isLoadingItem = 
            (item.name === 'Бүтээгдэхүүн' && loadingProducts) ||
            (item.name === 'Үйлчилгээ' && loadingServices)

          return (
            <div key={item.name}>
              {hasChildren ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.name)}
                    className={`w-full group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-white border-l-2 border-indigo-500'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span>{item.name}</span>
                      {isLoadingItem && (
                        <svg
                          className="h-3 w-3 animate-spin text-indigo-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                      )}
                    </div>
                    <ChevronDownIcon
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-3">
                      {item.children.map((child) => {
                        const isChildActive = pathname?.startsWith(child.href)
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                              isChildActive
                                ? 'bg-indigo-500/20 text-indigo-300 font-medium'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            {child.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href!}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-white border-l-2 border-indigo-500'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              )}
            </div>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="mt-4 border-t border-gray-700 pt-4">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-200">
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <span>Гарах</span>
        </button>
      </div>
    </div>
  )
}