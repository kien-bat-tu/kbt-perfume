import type { Product } from '../types/product'

export interface ConsultationResult {
  message: string
  products: Product[]
}

const moodKeywords: Record<string, string[]> = {
  ngọt: ['ngọt', 'vanilla', 'vani', 'gourmand'],
  tươi: ['tươi', 'fresh', 'citrus', 'cam', 'chanh', 'mát'],
  gỗ: ['gỗ', 'woody', 'wood', 'ấm', 'trầm'],
  hoa: ['hoa', 'floral', 'rose', 'hồng', 'jasmine', 'nhài'],
  nam: ['nam', 'men', 'masculine'],
  nữ: ['nữ', 'women', 'feminine'],
  unisex: ['unisex', 'cả hai', 'ai cũng'],
}

function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function getConsultationResult(question: string, products: Product[]): ConsultationResult {
  const normalizedQuestion = normalize(question)
  const matchedMoods = Object.entries(moodKeywords)
    .filter(([, keywords]) => keywords.some((keyword) => normalizedQuestion.includes(normalize(keyword))))
    .map(([mood]) => mood)

  const budgetMatch = question.replace(/\D/g, '')
  const budget = budgetMatch ? Number(budgetMatch) : null
  const rankedProducts = products
    .map((product) => {
      const searchable = normalize(`${product.name} ${product.brand} ${product.category} ${product.gender ?? ''} ${product.scentFamily ?? ''} ${product.description ?? ''}`)
      const moodScore = matchedMoods.reduce((score, mood) => score + (searchable.includes(normalize(mood)) ? 3 : 0), 0)
      const budgetScore = budget && product.price <= budget ? 2 : 0
      return { product, score: moodScore + budgetScore }
    })
    .sort((first, second) => second.score - first.score || first.product.price - second.product.price)

  const recommendations = rankedProducts.filter((item) => item.score > 0).slice(0, 3).map((item) => item.product)
  const fallback = rankedProducts.slice(0, 3).map((item) => item.product)
  const selectedProducts = recommendations.length > 0 ? recommendations : fallback

  if (selectedProducts.length === 0) {
    return {
      message: 'Hiện chưa có dữ liệu sản phẩm để tư vấn. Bạn hãy thử lại sau khi quản trị viên cập nhật bộ sưu tập.',
      products: [],
    }
  }

  const preference = matchedMoods.length > 0 ? ` theo phong cách ${matchedMoods.join(', ')}` : ''
  const budgetText = budget ? ` trong khoảng ngân sách bạn nhập` : ''

  return {
    message: `Dựa trên nhu cầu${preference}${budgetText}, KBT gợi ý bạn tham khảo các lựa chọn dưới đây. Bạn có thể mở từng sản phẩm để xem chi tiết và đánh giá từ khách hàng.`,
    products: selectedProducts,
  }
}
