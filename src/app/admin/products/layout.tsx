'use client'

import { ProductProvider } from "@/contexts/productContext"

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProductProvider>{children}</ProductProvider>
}
