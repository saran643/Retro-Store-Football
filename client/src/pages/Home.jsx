import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Trophy, 
  Flame, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Layers,
  Tag
} from 'lucide-react';
import { productService } from '../services/api';
import ProductCard from '../components/ProductCard';
import ProductImage from '../components/ProductImage';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [budgetProducts, setBudgetProducts] = useState([]);
  const [jerseys, setJerseys] = useState([]);
  const [boots, setBoots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHomeData() {
      try {
        setLoading(true);
        const [catRes, featRes, budgetRes, jerseyRes, bootRes] = await Promise.all([
          productService.getCategories(),
          productService.getFeatured(8),
          productService.getBudget(8),
          productService.getProducts({ category: 'Classic Football Jerseys', limit: 4 }),
          productService.getProducts({ category: 'Football Boots', limit: 4 })
        ]);

        if (catRes.data.success) setCategories(catRes.data.categories);
        if (featRes.data.success) setFeaturedProducts(featRes.data.products);
        if (budgetRes.data.success) setBudgetProducts(budgetRes.data.products);
        if (jerseyRes.data.success) setJerseys(jerseyRes.data.products);
        if (bootRes.data.success) setBoots(bootRes.data.products);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHomeData();
  }, []);

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-tag">
                <Trophy size={14} /> THE FOOTBALL HERITAGE ARCHIVE
              </div>
              <h1 className="hero-headline">
                THE BEAUTIFUL GAME. <span>FOREVER.</span>
              </h1>
              <p className="hero-subtitle">
                Classic kits. Everyday essentials. Football culture, reimagined. Handpicked vintage match shirts, modern boots, and anti-slip grip essentials at affordable Indian prices.
              </p>
              <div className="hero-cta">
                <Link to="/shop" className="btn btn-burgundy btn-lg">
                  <span>Shop Collection</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/shop?category=Retro+Football+Jerseys" className="btn btn-gold btn-lg">
                  Explore Retro Jerseys
                </Link>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-image-frame">
                <img
                  src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1000&q=80"
                  alt="Classic 1998 Football Jersey Heritage"
                />
              </div>
              <div className="hero-badge-overlay">
                <div>MATCHDAY CLASSIC</div>
                <div style={{ color: 'var(--color-gold)', fontSize: '0.7rem', marginTop: '2px' }}>
                  PARIS 1998 • YOKOHAMA 2002
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Shop by Category */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-cream-light)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">ARCHIVE DIVISIONS</span>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">
              From historic tournament shirts to training cones and grip socks, discover gear curated for pitch warriors.
            </p>
          </div>

          <div className="category-grid">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.category_id}
                to={`/shop?category=${encodeURIComponent(cat.category_name)}`}
                className="category-card"
              >
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=600&q=80'}
                  alt={cat.category_name}
                  className="category-card-img"
                  loading="lazy"
                />
                <div className="category-card-content">
                  <h3 className="category-card-title">{cat.category_name}</h3>
                  <span className="category-card-count">{cat.product_count || 'View'} Items</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured / Best Sellers Collection */}
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="section-tag">THE VAULT</span>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Iconic Retro & Match Kits</h2>
            </div>
            <Link to="/shop?featured=true" className="btn btn-outline-burgundy btn-sm">
              <span>View All Iconic Kits</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="product-grid">
              {featuredProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.product_id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Promotional Banner */}
      <section style={{ backgroundColor: 'var(--color-black-pure)', color: 'var(--color-warm-white)', padding: '4.5rem 0', position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '650px' }}>
            <span style={{ color: 'var(--color-gold)', fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>
              LIMITED RESTOCK
            </span>
            <h2 style={{ color: 'var(--color-cream-light)', fontSize: '2.5rem', margin: '0.75rem 0 1rem 0' }}>
              The 1998 Zidane #10 & 1999 Treble Jerseys
            </h2>
            <p style={{ color: 'var(--color-soft-grey)', marginBottom: '1.75rem', fontSize: '1rem', lineHeight: '1.6' }}>
              Relive the greatest football moments. High-density embroidery, vintage jacquard knit collars, and authentic retro cuts at under ₹1,299.
            </p>
            <Link to="/shop?category=Retro+Football+Jerseys" className="btn btn-burgundy btn-lg">
              Explore Retro Archive
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Football Boots Section */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-cream-light)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="section-tag">BOOT ROOM</span>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Matchday & Turf Cleats</h2>
            </div>
            <Link to="/shop?category=Football+Boots" className="btn btn-outline-burgundy btn-sm">
              <span>View All Boots</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="product-grid">
            {boots.map((p) => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Budget Picks (Affordable Indian Pricing Section under ₹500) */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-tag" style={{ borderColor: 'var(--color-burgundy)' }}>AFFORDABLE ESSENTIALS</span>
            <h2 className="section-title">Budget Picks (Under ₹500)</h2>
            <p className="section-subtitle">
              Engineered for grassroots athletes and collegiate players. Anti-slip grip socks, ultra-light shin guards, match whistles, and accessories at accessible Indian student pricing.
            </p>
          </div>

          <div className="product-grid">
            {budgetProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/shop?maxPrice=500" className="btn btn-outline btn-lg">
              <span>Browse All Picks Under ₹500</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
