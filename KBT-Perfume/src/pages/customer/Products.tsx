import { ChevronDown, ChevronUp, Heart, Search, ShoppingBag, Sparkles, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { subscribeProducts } from '../../services/productService'
import { subscribeBrands, subscribeCategories } from '../../services/taxonomyService'
import { useCartStore } from '../../store/cartStore'
import type { Product } from '../../types/product'
import type { TaxonomyItem } from '../../types/taxonomy'
import { perfumeBrands, perfumeConcentrations, perfumeGenders, perfumeLongevity, perfumeMoods, perfumeOrigins, perfumeProductTypes, perfumeSeasons, perfumeScentFamilies, perfumeSillage, perfumeStyles, perfumeVolumes, perfumeYears } from '../../lib/fragranceOptions'

const filterDefinitions = [
  { key: 'brand', label: 'Thương hiệu nước hoa' },
  { key: 'category', label: 'Danh mục' },
  { key: 'gender', label: 'Giới tính' },
  { key: 'volume', label: 'Dung tích chai' },
  { key: 'scentFamily', label: 'Nhóm hương' },
  { key: 'brandOrigin', label: 'Xuất xứ thương hiệu' },
  { key: 'productType', label: 'Dạng sản phẩm' },
  { key: 'concentration', label: 'Nồng độ' },
  { key: 'longevity', label: 'Lưu hương' },
  { key: 'releaseYear', label: 'Năm phát hành' },
  { key: 'sillage', label: 'Độ tỏa hương' },
  { key: 'style', label: 'Phong cách' },
  { key: 'season', label: 'Mùa' },
  { key: 'scentMood', label: 'Cảm giác mùi hương' },
  { key: 'availability', label: 'Mặt hàng' },
] as const

const fragranceFilterOptions: Record<Exclude<FilterKey, 'brand' | 'category'>, string[]> = {
  gender: perfumeGenders,
  volume: perfumeVolumes,
  scentFamily: perfumeScentFamilies,
  brandOrigin: perfumeOrigins,
  concentration: perfumeConcentrations,
  season: perfumeSeasons,
  scentMood: perfumeMoods,
  productType: perfumeProductTypes,
  longevity: perfumeLongevity,
  releaseYear: perfumeYears,
  sillage: perfumeSillage,
  style: perfumeStyles,
  availability: ['Có sẵn', 'Đặt trước'],
}

type FilterKey = typeof filterDefinitions[number]['key']

function formatPrice(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(safeValue)
}

function normalizeFilterValue(value: unknown) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

function normalizeGenderValue(value: unknown) {
  const raw = String(value ?? '').trim()
  if (!raw) return ''

  const normalized = normalizeFilterValue(raw)
  if (['female', 'nu', 'nữ'].includes(normalized)) return 'Nữ'
  if (['male', 'nam'].includes(normalized)) return 'Nam'
  if (['unisex', 'unix'].includes(normalized)) return 'Unisex'

  return raw.replace(/\s+/g, ' ')
}

function normalizeCategoryValue(value: unknown) {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  if (/^category[\s_-]*\d*$/i.test(raw) || /^gender[\s_-]*\d*$/i.test(raw)) return ''
  return raw.replace(/\s+/g, ' ')
}

function sanitizeCategoryName(value: unknown) {
  const cleaned = normalizeCategoryValue(value)
  return cleaned
}

function isPlaceholderBrand(value: unknown) {
  const text = normalizeFilterValue(value)
  return !text || text === 'brand' || /^brand\s*\d+$/.test(text)
}

const brandAliases: Record<string, string[]> = {
  'Yves Saint Laurent': ['YSL'],
  'Louis Vuitton': ['LV'],
  'Dolce & Gabbana': ['D&G', 'DG'],
  'Christian Louboutin': ['Louboutin'],
  'Chloé': ['Chloe'],
  'Bvlgari': ['BVLGARI'],
  'Tom Ford': ['TF'],
}

function inferBrandFromProduct(product: Product) {
  const storedBrand = String(product.brand ?? '').trim()
  const canonicalStoredBrand = storedBrand && !isPlaceholderBrand(storedBrand)
    ? (storedBrand.toLowerCase() === 'yves saint laurent' || storedBrand.toLowerCase() === 'ysl' ? 'YSL' : storedBrand)
    : ''
  if (canonicalStoredBrand) return canonicalStoredBrand

  const productName = normalizeFilterValue(product.name)
  const matchedBrand = perfumeBrands.find((brand) => {
    const aliases = [brand, ...(brandAliases[brand] ?? [])].map((item) => normalizeFilterValue(item))
    return aliases.some((alias) => productName.includes(alias))
  })
  if (matchedBrand) return matchedBrand.toLowerCase() === 'yves saint laurent' || matchedBrand.toLowerCase() === 'ysl' ? 'YSL' : matchedBrand
  if (storedBrand && !isPlaceholderBrand(storedBrand)) return storedBrand
  return ''
}

function valuesFor(products: Product[], key: FilterKey) {
  const values = new Map<string, string>()
  products.forEach((product) => {
    const rawValue = key === 'brand' ? inferBrandFromProduct(product) : String(product[key as keyof Product] ?? '').trim()
    const value = String(rawValue ?? '').trim()
    if (value && !isPlaceholderBrand(value) && !values.has(normalizeFilterValue(value))) values.set(normalizeFilterValue(value), value)
  })
  return Array.from(values.values()).sort((a, b) => a.localeCompare(b, 'vi'))
}

export default function CustomerProducts() {
  const cartItems = useCartStore((state) => state.items)
  const cartCount = useMemo(() => cartItems.reduce((total, item) => total + item.quantity, 0), [cartItems])
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<TaxonomyItem[]>([])
  const [categories, setCategories] = useState<TaxonomyItem[]>([])
  const [selected, setSelected] = useState<Partial<Record<FilterKey, string[]>>>({})
  const [open, setOpen] = useState<Record<FilterKey | 'price', boolean>>({ brand: true, category: true, gender: true, volume: false, scentFamily: false, brandOrigin: false, concentration: false, season: false, scentMood: false, productType: false, longevity: false, releaseYear: false, sillage: false, style: false, availability: false, price: true })
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  useEffect(() => {
    const unsubscribeProducts = subscribeProducts(setProducts)
    const unsubscribeBrands = subscribeBrands(setBrands)
    const unsubscribeCategories = subscribeCategories(setCategories)
    return () => {
      unsubscribeProducts()
      unsubscribeBrands()
      unsubscribeCategories()
    }
  }, [])

  const catalogProducts = useMemo(() => {
    const brandNames = new Map(brands.map((item) => [item.id, item.name]))
    const categoryNames = new Map(categories.map((item) => [item.id, item.name]))
    return products.map((product) => ({
      ...product,
      brand: product.brandName || brandNames.get(product.brandId ?? '') || product.brand,
      category: product.categoryName || categoryNames.get(product.categoryId ?? '') || product.category,
    })).map((product) => ({ ...product, brand: inferBrandFromProduct(product) }))
  }, [products, brands, categories])

  const options = (key: FilterKey) => {
    if (key === 'brand') {
      return Array.from(new Set(
        catalogProducts
          .map((product) => inferBrandFromProduct(product))
          .filter((brand): brand is string => Boolean(brand) && !isPlaceholderBrand(brand) && brand !== 'Khác')
      )).sort((a, b) => a.localeCompare(b, 'vi'))
    }
    if (key === 'category') {
      const categoryValues = [
        ...categories.filter((item) => item.status !== 'inactive').map((item) => sanitizeCategoryName(item.name)),
        ...catalogProducts.map((product) => sanitizeCategoryName(product.category)),
      ]
      return Array.from(new Set(categoryValues.filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b, 'vi'))
    }
    if (key === 'availability') return fragranceFilterOptions.availability
    if (key === 'gender') {
      return Array.from(new Set(
        catalogProducts
          .map((product) => normalizeGenderValue(product.gender))
          .filter((value): value is string => Boolean(value) && ['Nam', 'Nữ', 'Unisex'].includes(value))
      )).sort((a, b) => a.localeCompare(b, 'vi'))
    }
    return Array.from(new Set([...fragranceFilterOptions[key as Exclude<FilterKey, 'brand' | 'category'>], ...valuesFor(catalogProducts, key)])).sort((a, b) => a.localeCompare(b, 'vi'))
  }

  const matchingCount = (key: FilterKey, value: string) => catalogProducts.filter((product) => {
    if (product.isActive === false) return false
    if (key === 'availability') return (product.stock ?? 0) > 0 ? value === 'Có sẵn' : value === 'Đặt trước'
    if (key === 'gender') {
      return normalizeGenderValue(product.gender) === normalizeGenderValue(value)
    }
    if (key === 'category') {
      return normalizeCategoryValue(product.category) === normalizeCategoryValue(value)
    }
    const productValue = key === 'brand' ? inferBrandFromProduct(product) : String(product[key as keyof Product] ?? '')
    return normalizeFilterValue(productValue) === normalizeFilterValue(value)
  }).length

  const filteredProducts = useMemo(() => catalogProducts.filter((product) => {
    const matchesSearch = !search.trim() || normalizeFilterValue(`${product.name} ${inferBrandFromProduct(product)}`).includes(normalizeFilterValue(search))
    const matchesPrice = (!minPrice || (product.salePrice || product.price) >= Number(minPrice)) && (!maxPrice || (product.salePrice || product.price) <= Number(maxPrice))
    const matchesFilters = filterDefinitions.every(({ key }) => {
      const active = selected[key]
      if (!active?.length) return true
      if (key === 'availability') return active.includes((product.stock ?? 0) > 0 ? 'Có sẵn' : 'Đặt trước')
      if (key === 'gender') {
        return active.some((value) => normalizeGenderValue(product.gender) === normalizeGenderValue(value))
      }
      if (key === 'category') {
        return active.some((value) => normalizeCategoryValue(product.category) === normalizeCategoryValue(value))
      }
      const productValue = key === 'brand' ? inferBrandFromProduct(product) : String(product[key as keyof Product] ?? '')
      return active.some((value) => normalizeFilterValue(value) === normalizeFilterValue(productValue))
    })
    return matchesSearch && matchesPrice && matchesFilters && product.isActive !== false
  }).sort((left, right) => {
    if (sort === 'price-low') return (left.salePrice || left.price) - (right.salePrice || right.price)
    if (sort === 'price-high') return (right.salePrice || right.price) - (left.salePrice || left.price)
    return 0
  }), [catalogProducts, search, selected, sort, minPrice, maxPrice])

  const toggleOption = (key: FilterKey, value: string) => {
    setSelected((current) => {
      const values = current[key] ?? []
      return { ...current, [key]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value] }
    })
  }

  const toggleSection = (key: FilterKey | 'price') => setOpen((current) => ({ ...current, [key]: !current[key] }))

  return (
    <main className="shop-page catalog-page">
      <header className="shop-header">
        <Link className="shop-brand" to="/customer"><span className="shop-brand-mark"><Sparkles size={15} /></span> KBT Perfume</Link>
        <nav className="shop-nav" aria-label="Điều hướng chính"><Link to="/customer">Trang chủ</Link><Link to="/customer/products">Sản phẩm</Link><a href="/customer#about">Về chúng tôi</a><a href="/customer#brands">Thương hiệu</a><Link to="/customer/ai-consultation">Tư vấn AI</Link></nav>
        <div className="shop-actions"><Link className="shop-cart-link" to="/customer/cart"><ShoppingBag size={16} /> Giỏ hàng <span className="shop-cart-count">{cartCount}</span></Link><Link className="shop-account-pill" to="/customer/profile"><UserRound size={14} /> Tài khoản <span>⌄</span></Link></div>
      </header>

      <section className="catalog-layout">
        <aside className="catalog-sidebar">
          <div className="catalog-filter-title"><strong><Search size={16} /> Lọc sản phẩm</strong><button type="button" onClick={() => { setSelected({}); setSearch(''); setMinPrice(''); setMaxPrice('') }}>Xóa lọc</button></div>
          <label className="catalog-search"><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm kiếm" /></label>
          {filterDefinitions.map(({ key, label }) => {
            const sectionOptions = options(key)
            return <section className="catalog-filter-section" key={key}>
              <button type="button" className="catalog-filter-heading" onClick={() => toggleSection(key)}><span>{label}</span>{open[key] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}</button>
              {open[key] && <div className="catalog-filter-options">{sectionOptions.length === 0 ? <small>Chưa có dữ liệu</small> : sectionOptions.map((value) => { const count = matchingCount(key, value); return <label className={count === 0 ? 'catalog-option-disabled' : ''} key={value}><input type="checkbox" checked={(selected[key] ?? []).includes(value)} onChange={() => toggleOption(key, value)} disabled={count === 0} /><span>{value}</span><em>{count}</em></label> })}</div>}
            </section>
          })}
          <section className="catalog-filter-section catalog-price-filter"><button type="button" className="catalog-filter-heading" onClick={() => toggleSection('price')}><span>Khoảng giá</span>{open.price ? <ChevronUp size={13} /> : <ChevronDown size={13} />}</button>{open.price && <div className="catalog-price-inputs"><input type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="Từ" /><input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Đến" /></div>}</section>
        </aside>

        <section className="catalog-results">
          <div className="catalog-results-heading"><div><p className="eyebrow">KBT Perfume collection</p><h1>Nước hoa</h1></div><label className="catalog-sort">↕ Sắp xếp: <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Mới nhất</option><option value="price-low">Giá thấp đến cao</option><option value="price-high">Giá cao đến thấp</option></select></label></div>
          <p className="catalog-count">{filteredProducts.length} sản phẩm</p>
          {filteredProducts.length === 0 ? <div className="empty-state"><h3>Không có sản phẩm phù hợp</h3><p>Hãy thử bỏ bớt bộ lọc để xem thêm sản phẩm.</p></div> : <div className="catalog-product-grid">{filteredProducts.map((product) => { const discount = product.salePrice && product.salePrice < product.price ? Math.round((1 - product.salePrice / product.price) * 100) : 0; return <article className="catalog-product-card" key={product.id}><Link to={`/customer/products/${product.id}`}><div className="catalog-product-image">{discount > 0 && <span className="catalog-discount">-{discount}%</span>}{product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <span className="product-placeholder"><ShoppingBag size={35} /><strong>{product.brand}</strong></span>}<span className="catalog-heart"><Heart size={16} /></span></div><div className="catalog-product-info"><p>{product.brand}</p><h2>{product.name}</h2><div className="catalog-rating">★ 4.8/5 <span>(0)</span></div><div className="catalog-price">{product.salePrice && product.salePrice < product.price && <del>{formatPrice(product.price)}</del>}<strong>{formatPrice(product.salePrice || product.price)}</strong></div><span className="catalog-detail-button">Xem chi tiết</span></div></Link></article> })}</div>}
        </section>
      </section>
    </main>
  )
}
