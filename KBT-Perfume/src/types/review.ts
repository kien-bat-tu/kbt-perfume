export interface ProductReview {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
}

export type CreateProductReviewInput = Omit<ProductReview, 'id' | 'createdAt'> & {
  createdAt?: string
}
