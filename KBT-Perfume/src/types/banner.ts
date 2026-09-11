export interface Banner {
  id: string
  title: string
  subtitle: string
  imageUrl: string
  linkUrl: string
  isActive: boolean
  order: number
  createdAt: string
}

export type BannerInput = Omit<Banner, 'id' | 'createdAt'> & {
  createdAt?: string
}
