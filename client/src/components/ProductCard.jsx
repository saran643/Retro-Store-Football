import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { formatINR } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductImage from './ProductImage';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isFavorited = isInWishlist(product.product_id);
  const price = parseFloat(product.price);
  const originalPrice = product.original_price ? parseFloat(product.original_price) : null;
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const isOutOfStock = product.stock_quantity <= 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product.product_id, null, 1);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.product_id);
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.product_id}`} className="product-card-media">
        <ProductImage src={product.image_url} alt={product.product_name} />
        
        {/* Badges */}
        <div className="product-badges">
          {product.is_featured === 1 && (
            <span className="badge badge-burgundy">ICONIC</span>
          )}
          {hasDiscount && (
            <span className="badge badge-gold">SAVE {discountPercent}%</span>
          )}
          {isOutOfStock ? (
            <span className="badge badge-danger">SOLD OUT</span>
          ) : product.stock_quantity < 10 ? (
            <span className="badge badge-warning">ONLY {product.stock_quantity} LEFT</span>
          ) : null}
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className={`wishlist-toggle-btn ${isFavorited ? 'active' : ''}`}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} fill={isFavorited ? '#721C32' : 'none'} />
        </button>
      </Link>

      <div className="product-card-body">
        <span className="product-category-tag">{product.category_name}</span>
        
        <Link to={`/product/${product.product_id}`} title={product.product_name}>
          <h3 className="product-title">{product.product_name}</h3>
        </Link>

        <div className="product-pricing">
          <span className="current-price">{formatINR(price)}</span>
          {hasDiscount && (
            <span className="original-price">{formatINR(originalPrice)}</span>
          )}
        </div>

        <div className="product-actions">
          <button
            type="button"
            className="btn btn-burgundy btn-sm"
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
          >
            <ShoppingBag size={14} />
            <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
          
          <Link
            to={`/product/${product.product_id}`}
            className="btn btn-outline btn-sm"
            style={{ padding: '0.5rem 0.75rem' }}
            title="View Details"
          >
            <Eye size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
