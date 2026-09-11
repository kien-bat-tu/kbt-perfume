import { FirebaseError } from 'firebase/app'
import { Heart, LogOut, PackageCheck, ShoppingBag, Sparkles, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getProducts } from '../../services/productService'
import { getBrands, getCategories } from '../../services/taxonomyService'
import { useCartStore } from '../../store/cartStore'
import type { Product } from '../../types/product'

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

export default function CustomerHome() {
  const { profile, signOutUser } = useAuth()
  const cartItems = useCartStore((state) => state.items)
  const cartCount = useMemo(() => cartItems.reduce((total, item) => total + item.quantity, 0), [cartItems])
  const [products, setProducts] = useState<Product[]>([])
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

  const featuredProducts = useMemo(() => {
    const featured = products.filter((product) => product.isFeatured)
    return (featured.length > 0 ? featured : products).slice(0, 3)
  }, [products])

  return (
    <main className="shop-page">
      <div className="storefront-topline">
        <span>FreeShip toàn quốc với đơn từ 1,5 triệu</span>
        <span>Hotline: 1900 1234</span>
      </div>
      <header className="shop-header">
        <Link className="shop-brand" to="/customer"><span className="shop-brand-mark"><Sparkles size={15} /></span> KBT Perfume</Link>
        <nav className="shop-nav" aria-label="Điều hướng chính">
          <a href="/customer">Trang chủ</a>
          <a href="#products">Sản phẩm</a>
          <a href="#about">Về chúng tôi</a>
          <a href="#brands">Thương hiệu</a>
          <Link to="/customer/ai-consultation">Tư vấn AI</Link>
        </nav>
        <div className="shop-actions">
          <Link className="shop-cart-link" to="/customer/cart"><ShoppingBag size={16} /> Giỏ hàng <span className="shop-cart-count">{cartCount}</span></Link>
          <Link className="shop-account-pill" to="/customer/profile"><UserRound size={14} /> {profile?.fullName || 'abc1'} <span>⌄</span></Link>
          <button className="shop-logout" onClick={() => void signOutUser()} aria-label="Đăng xuất" title="Đăng xuất"><LogOut size={15} /></button>
        </div>
      </header>

      <section className="shop-hero storefront-reference-hero">
        <div className="storefront-hero-inner">
          <p className="storefront-hero-badge">NƯỚC HOA CHÍNH HÃNG</p>
          <h1>Khám phá thế giới hương thơm</h1>
          <p>Các sản phẩm nước hoa chính hãng từ các thương hiệu hàng đầu thế giới</p>
          <div className="hero-actions">
            <a className="primary-button hero-button" href="#products">Khám phá ngay</a>
            <Link className="hero-outline-button" to="/customer/ai-consultation">Tư vấn AI</Link>
          </div>
        </div>
      </section>

      <section className="storefront-benefits" aria-label="Cam kết của KBT Perfume">
        <span><span className="benefit-icon">▣</span> FreeShip toàn quốc</span>
        <span><span className="benefit-icon">♙</span> 100% chính hãng</span>
        <span><span className="benefit-icon">◉</span> Hỗ trợ 24/7</span>
      </section>

      <section className="product-section storefront-products" id="products">
        <div className="product-heading"><h2>Xem nhiều sản phẩm</h2><Link to="/customer/products">Xem nhiều sản phẩm</Link></div>
        {isLoading && <p className="empty-state">Đang tải bộ sưu tập...</p>}
        {errorMessage && <p className="error-banner" role="alert">{errorMessage}</p>}
        {!isLoading && !errorMessage && featuredProducts.length === 0 && <div className="empty-state"><h3>Chưa có sản phẩm</h3><p>Hãy thêm sản phẩm trong khu vực quản trị.</p></div>}
        <div className="product-grid">{featuredProducts.map((product) => {
          const salePercent = product.salePrice && product.salePrice < product.price ? Math.round((1 - product.salePrice / product.price) * 100) : 0
          return <article className="product-card storefront-product-card" key={product.id}><Link className="product-card-link" to={`/customer/products/${product.id}`}>
            <div className="product-image">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <span className="product-placeholder"><PackageCheck size={38} /><strong>{product.brand}</strong></span>}<button className="card-heart" aria-label={`Thêm ${product.name} vào yêu thích`} onClick={(event) => event.preventDefault()}><Heart size={17} /></button></div>
            <div className="product-info"><p className="product-brand">{product.brand}</p><h3>{product.name}</h3><p className="product-description">{product.description || 'Hương thơm tinh tế, lưu hương bền lâu và phù hợp cho mọi phong cách.'}</p><p className="product-rating">★ 4.8/5</p>{salePercent > 0 && <del>{formatPrice(product.price)}</del>}<strong className="product-sale-price">{formatPrice(product.salePrice || product.price)}</strong><span className="product-detail-button">Xem chi tiết</span></div>
          </Link></article>
        })}</div>
      </section>
      <footer className="shop-footer storefront-reference-footer" id="about"><div className="footer-brand"><strong><span className="shop-brand-mark"><Sparkles size={13} /></span> KBT Perfume</strong><p>Thương hiệu nước hoa cao cấp dành cho mọi phong cách.</p></div><div><strong>LIÊN KẾT</strong><a href="/customer">Trang chủ</a><a href="#products">Sản phẩm</a><Link to="/customer/products">Xem nhiều sản phẩm</Link><a href="#about">Về chúng tôi</a></div><div><strong>HỖ TRỢ</strong><a href="/customer/support">Liên hệ</a><Link to="/customer/ai-consultation">Tư vấn AI</Link><a href="/login">Đăng nhập</a></div><div><strong>LIÊN HỆ</strong><span>☎ 1900 1234</span><span>✉ hello@kbtperfume.vn</span><span>⌖ 123 Nguyễn Huệ, Q1, TP.HCM</span></div><small>© 2026 KBT Perfume. Bảo lưu mọi quyền.</small></footer>
    </main>
  )
}
