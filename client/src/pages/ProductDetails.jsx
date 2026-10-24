import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  ArrowLeft,
  Star 
} from 'lucide-react';
import { productService, formatINR } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import ProductImage from '../components/ProductImage';
import ProductCard from '../components/ProductCard';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await productService.getProductById(id);
        if (res.data.success) {
          const prod = res.data.product;
          setProduct(prod);
          setSelectedImage(prod.image_url);

          // Default to first variant with stock, or first variant
          if (prod.variants && prod.variants.length > 0) {
            const inStockVar = prod.variants.find((v) => v.stock_quantity > 0) || prod.variants[0];
            setSelectedVariant(inStockVar);
          }
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
        showToast('Product not found or unavailable.', 'error');
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  if (loading || !product) {
    return (
      <div className="loading-container" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p>Loading matchday gear...</p>
      </div>
    );
  }

  const price = parseFloat(product.price);
  const originalPrice = product.original_price ? parseFloat(product.original_price) : null;
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  // Determine stock based on selected variant or product stock
  const currentStock = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity;
  const isOutOfStock = currentStock <= 0;
  const isFavorited = isInWishlist(product.product_id);

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setAddingToCart(true);
    await addToCart(product.product_id, selectedVariant ? selectedVariant.variant_id : null, quantity);
    setAddingToCart(false);
  };

  return (
    <div className="section-padding">
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <Link to="/" style={{ color: 'var(--color-text-light)' }}>Home</Link>
          <span>/</span>
          <Link to="/shop" style={{ color: 'var(--color-text-light)' }}>Shop</Link>
          <span>/</span>
          <Link to={`/shop?category=${encodeURIComponent(product.category_name)}`} style={{ color: 'var(--color-text-light)' }}>
            {product.category_name}
          </Link>
          <span>/</span>
          <span style={{ fontWeight: 600 }}>{product.product_name}</span>
        </div>

        {/* Product Hero Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3.5rem', marginBottom: '4.5rem' }}>
          
          {/* Left Column: Image Gallery */}
          <div>
            <div style={{
              position: 'relative',
              width: '100%',
              paddingTop: '100%',
              backgroundColor: '#EDE7DC',
              border: '2px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              marginBottom: '1rem'
            }}>
              <ProductImage src={selectedImage} alt={product.product_name} />
              
              {product.is_featured === 1 && (
                <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 3 }}>
                  <span className="badge badge-burgundy">MATCHDAY ICONIC</span>
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            {product.images && product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {product.images.map((img) => (
                  <button
                    key={img.image_id}
                    type="button"
                    onClick={() => setSelectedImage(img.image_url)}
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      border: selectedImage === img.image_url ? '2px solid var(--color-burgundy)' : '1px solid var(--color-border)',
                      cursor: 'pointer',
                      flexShrink: 0,
                      opacity: selectedImage === img.image_url ? 1 : 0.7
                    }}
                  >
                    <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Information & Purchase Controls */}
          <div>
            <span className="section-tag">{product.category_name}</span>
            <h1 style={{ fontSize: '2.25rem', margin: '0.5rem 0 1rem 0', lineHeight: 1.15 }}>
              {product.product_name}
            </h1>

            {/* Price block */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-burgundy)', fontFamily: 'var(--font-heading)' }}>
                {formatINR(price)}
              </span>
              {hasDiscount && (
                <>
                  <span style={{ fontSize: '1.15rem', color: 'var(--color-text-light)', textDecoration: 'line-through' }}>
                    {formatINR(originalPrice)}
                  </span>
                  <span className="badge badge-gold">SAVE {discountPercent}%</span>
                </>
              )}
            </div>

            {/* Stock indicator */}
            <div style={{ marginBottom: '1.5rem' }}>
              {isOutOfStock ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-danger)', fontWeight: 600, fontSize: '0.9rem' }}>
                  <AlertCircle size={16} /> Currently Out of Stock
                </div>
              ) : currentStock < 10 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-warning)', fontWeight: 600, fontSize: '0.9rem' }}>
                  <AlertCircle size={16} /> Only {currentStock} units available in stock!
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-success)', fontWeight: 600, fontSize: '0.9rem' }}>
                  <Check size={16} /> In Stock & Ready for Dispatch
                </div>
              )}
            </div>

            {/* Variants / Sizes selector */}
            {product.variants && product.variants.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <label className="form-label" style={{ marginBottom: '0.75rem' }}>
                  Select Size / Variant: {selectedVariant ? <strong style={{ color: 'var(--color-burgundy)' }}>{selectedVariant.size}</strong> : ''}
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant && selectedVariant.variant_id === v.variant_id;
                    const vOutOfStock = v.stock_quantity <= 0;

                    return (
                      <button
                        key={v.variant_id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        disabled={vOutOfStock}
                        style={{
                          padding: '0.6rem 1.25rem',
                          border: isSelected ? '2px solid var(--color-burgundy)' : '1px solid var(--color-border)',
                          backgroundColor: isSelected ? 'var(--color-burgundy)' : 'var(--color-warm-white)',
                          color: isSelected ? 'var(--color-warm-white)' : 'var(--color-black)',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: vOutOfStock ? 'not-allowed' : 'pointer',
                          opacity: vOutOfStock ? 0.4 : 1,
                          textDecoration: vOutOfStock ? 'line-through' : 'none',
                          boxShadow: isSelected ? '2px 2px 0px var(--color-black)' : 'none',
                          transition: 'var(--transition-smooth)'
                        }}
                      >
                        {v.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector + Add to Cart + Wishlist */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-warm-white)' }}>
                <button
                  type="button"
                  style={{ padding: '0.75rem 1rem', fontSize: '1.1rem', fontWeight: 700 }}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                >
                  -
                </button>
                <span style={{ padding: '0.75rem 1rem', fontWeight: 700, minWidth: '40px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  style={{ padding: '0.75rem 1rem', fontSize: '1.1rem', fontWeight: 700 }}
                  onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                  disabled={quantity >= currentStock || isOutOfStock}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="btn btn-burgundy btn-lg"
                style={{ flex: 1, minWidth: '200px' }}
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
              >
                <ShoppingBag size={18} />
                <span>{isOutOfStock ? 'Sold Out' : addingToCart ? 'Adding...' : 'Add to Cart'}</span>
              </button>

              <button
                type="button"
                className="btn btn-outline"
                style={{
                  padding: '1rem',
                  borderColor: isFavorited ? 'var(--color-burgundy)' : 'var(--color-border)',
                  color: isFavorited ? 'var(--color-burgundy)' : 'inherit'
                }}
                onClick={() => toggleWishlist(product.product_id)}
                title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart size={20} fill={isFavorited ? '#721C32' : 'none'} />
              </button>
            </div>

            {/* Description Paragraph */}
            <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-warm-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Item Overview & Pedigree
              </h4>
              <p style={{ lineHeight: '1.7', color: 'var(--color-black)' }}>
                {product.description}
              </p>
            </div>

            {/* Highlights Box */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
                <Truck size={18} color="var(--color-burgundy)" />
                <span>Pan-India Delivery (3-5 days)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
                <ShieldCheck size={18} color="var(--color-burgundy)" />
                <span>Cash on Delivery Available</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
                <RefreshCw size={18} color="var(--color-burgundy)" />
                <span>7-Day Size Exchange</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
                <Check size={18} color="var(--color-burgundy)" />
                <span>Verified Matchday Quality</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {product.related && product.related.length > 0 && (
          <div style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '2px solid var(--color-border)' }}>
            <div style={{ marginBottom: '2rem' }}>
              <span className="section-tag">SIMILAR GEAR</span>
              <h2 className="section-title">Related Products from this Division</h2>
            </div>

            <div className="product-grid">
              {product.related.map((rp) => (
                <ProductCard key={rp.product_id} product={rp} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
