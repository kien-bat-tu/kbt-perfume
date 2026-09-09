export interface Product {
  id: string
  name: string
  brand: string
  category: string
  price: number
  imageUrl: string
  description?: string
  isFeatured?: boolean
  stock?: number
  brandId?: string
  categoryId?: string
  salePrice?: number
  gender?: string
  scentFamily?: string
  brandName?: string
  categoryName?: string
}