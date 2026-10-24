import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatINR } from '../services/api';
import ProductImage from '../components/ProductImage';

export default function Wishlist() {
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p>Loading your saved wishlist...</p>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="section-padding">
        <div className="container">
          <div className="empty-state" style={{ maxWidth: '600px', margin: '3rem auto' }}>
            <Heart className="empty-state-icon" />
            <h2 className="empty-state-title">Your wishlist is empty</h2>
            <p className="empty-state-desc">
              Save your favorite retro kits, matchday cleats, and gear to your wishlist for later.
            </p>
            <Link to="/shop" className="btn btn-burgundy btn-lg">
              Explore Collections
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container">
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="section-tag">SAVED VAULT</span>
          <h1 style={{ fontSize: '2.25rem' }}>My Wishlist ({wishlistItems.length})</h1>
        </div>

        <div className="product-grid">
          {wishlistItems.map((item) => {
            const price = parseFloat(item.price);
            const isOutOfStock = item.stock_quantity <= 0;

            return (
              <div key={item.wishlist_id} className="product-card">
                <Link to={`/product/${item.product_id}`} className="product-card-media">
                  <ProductImage src={item.image_url} alt={item.product_name} />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      removeFromWishlist(item.product_id);
                    }}
                    className="wishlist-toggle-btn active"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </Link>

                <div className="product-card-body">
                  <span className="product-category-tag">{item.category_name}</span>
                  <Link to={`/product/${item.product_id}`}>
                    <h3 className="product-title">{item.product_name}</h3>
                  </Link>

                  <div className="product-pricing">
                    <span className="current-price">{formatINR(price)}</span>
                  </div>

                  <div className="product-actions" style={{ gridTemplateColumns: '1fr' }}>
                    <button
                      type="button"
                      className="btn btn-burgundy btn-sm"
                      onClick={() => addToCart(item.product_id, null, 1)}
                      disabled={isOutOfStock}
                    >
                      <ShoppingBag size={14} />
                      <span>{isOutOfStock ? 'Out of Stock' : 'Move to Cart'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
