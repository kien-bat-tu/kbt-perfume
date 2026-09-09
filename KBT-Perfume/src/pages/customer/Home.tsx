import { FirebaseError } from 'firebase/app'
import { Heart, LogOut, Search, ShoppingBag, Sparkles, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getProducts } from '../../services/productService'
import { getBrands, getCategories } from '../../services/taxonomyService'
import type { Product } from '../../types/product'

const categories = ['Tất cả', 'Nước hoa nữ', 'Nước hoa nam', 'Unisex']

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

export default function CustomerHome() {
  const { signOutUser } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    getProducts()
      .then(async (loadedProducts) => {
        if (!isMounted) return
        const [brands, loadedCategories] = await Promise.all([
          getBrands().catch(() => []),
          getCategories().catch(() => []),
        ])
        const brandNames = new Map(brands.map((brand) => [brand.id, brand.name]))
        const categoryNames = new Map(loadedCategories.map((category) => [category.id, category.name]))
        setProducts(loadedProducts.map((product) => ({
          ...product,
          brand: product.brandName || brandNames.get(product.brandId ?? '') || product.brand,
          category: product.categoryName || categoryNames.get(product.categoryId ?? '') || product.category,
        })))
      })
      .catch((error: unknown) => {
        if (!isMounted) return
        setErrorMessage(
          error instanceof FirebaseError && error.code === 'permission-denied'
            ? 'Firestore đang từ chối đọc products. Hãy đăng xuất, đăng nhập lại rồi refresh trang.'
            : error instanceof FirebaseError
              ? `Không thể tải sản phẩm (${error.code}). Vui lòng thử lại sau.`
              : 'Không thể tải sản phẩm lúc này. Vui lòng thử lại sau.',
        )
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'Tất cả' || product.category === selectedCategory
      const matchesSearch = !normalizedSearch || `${product.name} ${product.brand}`.toLowerCase().includes(normalizedSearch)
      return matchesCategory && matchesSearch
    })
  }, [products, search, selectedCategory])

  return (
    <main className="shop-page">
      <header className="shop-header">
        <a className="shop-brand" href="/customer"><Sparkles size={18} /> KBT Perfume</a>
        <nav className="shop-nav" aria-label="Điều hướng chính"><a href="#products">Sản phẩm</a><a href="#categories">Danh mục</a><a href="#about">Về KBT</a></nav>
        <div className="shop-actions"><button className="icon-button" aria-label="Yêu thích"><Heart size={18} /></button><button className="icon-button" aria-label="Tài khoản"><UserRound size={18} /></button><button className="ghost-button" onClick={signOutUser}><LogOut size={16} /> Đăng xuất</button></div>
      </header>

      <section className="shop-hero"><div><p className="eyebrow">KBT Perfume · Curated scents</p><h1>Mùi hương kể câu chuyện của riêng bạn.</h1><p>Những lựa chọn tinh tế cho mỗi khoảnh khắc, được tuyển chọn từ các thương hiệu được yêu thích.</p><a className="primary-button hero-button" href="#products">Khám phá bộ sưu tập <ShoppingBag size={17} /></a></div><div className="hero-orbit" aria-hidden="true"><span>SCENT<br />LIBRARY</span></div></section>

      <section className="category-strip" id="categories"><div><p className="eyebrow">Shop by mood</p><h2>Chọn nốt hương của bạn</h2></div><div className="category-list">{categories.map((category) => <button className={selectedCategory === category ? 'category-button active' : 'category-button'} key={category} onClick={() => setSelectedCategory(category)}>{category}</button>)}</div></section>

      <section className="product-section" id="products"><div className="product-heading"><div><p className="eyebrow">The collection</p><h2>Sản phẩm nổi bật</h2></div><label className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm nước hoa, thương hiệu..." aria-label="Tìm sản phẩm" /></label></div>
        {isLoading && <p className="empty-state">Đang tải bộ sưu tập...</p>}
        {errorMessage && <p className="error-banner" role="alert">{errorMessage}</p>}
        {!isLoading && !errorMessage && filteredProducts.length === 0 && <div className="empty-state"><h3>Chưa có sản phẩm phù hợp</h3><p>Hãy thêm dữ liệu vào collection <strong>products</strong> trong Firestore.</p></div>}
        <div className="product-grid">{filteredProducts.map((product) => <article className="product-card" key={product.id}><Link className="product-card-link" to={`/customer/products/${product.id}`}><div className="product-image">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <span>{product.brand}</span>}<button className="card-heart" aria-label={`Thêm ${product.name} vào yêu thích`} onClick={(event) => event.preventDefault()}><Heart size={17} /></button></div><div className="product-info"><p className="product-brand">{product.brand}</p><h3>{product.name}</h3><p className="product-category">{product.category}</p><strong>{formatPrice(product.price)}</strong></div></Link></article>)}</div>
      </section>
      <footer className="shop-footer" id="about">KBT Perfume · Những dấu ấn lưu lại trên da.</footer>
    </main>
  )
}
