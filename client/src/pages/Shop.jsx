import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { productService, formatINR } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Query parameters state
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';
  const initialFeatured = searchParams.get('featured') || '';
  const initialMaxPrice = searchParams.get('maxPrice') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [sort, setSort] = useState(initialFeatured ? 'featured' : 'newest');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state if URL search params change
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat !== null) setSelectedCategory(cat);

    const q = searchParams.get('search');
    if (q !== null) setSearch(q);

    const max = searchParams.get('maxPrice');
    if (max !== null) setMaxPrice(max);

    const feat = searchParams.get('featured');
    if (feat) setSort('featured');
  }, [searchParams]);

  // Load categories
  useEffect(() => {
    async function loadCats() {
      try {
        const res = await productService.getCategories();
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCats();
  }, []);

  // Fetch products whenever filters or page change
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const params = {
          page,
          limit: 12,
          sort
        };

        if (search.trim()) params.search = search.trim();
        if (selectedCategory) params.category = selectedCategory;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (inStockOnly) params.inStock = true;

        const res = await productService.getProducts(params);
        if (res.data.success) {
          setProducts(res.data.products);
          setTotalProducts(res.data.pagination.total);
          setTotalPages(res.data.pagination.totalPages);
        }
      } catch (err) {
        console.error('Failed to load shop products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [search, selectedCategory, minPrice, maxPrice, sort, inStockOnly, page]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setInStockOnly(false);
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="section-padding">
      <div className="container">
        {/* Page Title & Breadcrumb */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="section-tag">CATALOG ARCHIVE</span>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            {selectedCategory || (search ? `Search: "${search}"` : 'Football Vault')}
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Showing {totalProducts} verified football kits, boots, and match accessories in Indian Rupees (₹).
          </p>
        </div>

        {/* Layout Grid: Sidebar Filters + Products Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2.5rem', alignItems: 'start' }}>
          
          {/* Desktop Filters Sidebar */}
          <aside className="shop-filters retro-box" style={{ padding: '1.5rem', position: 'sticky', top: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                <SlidersHorizontal size={16} color="var(--color-burgundy)" />
                <span>Filters</span>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                style={{ fontSize: '0.75rem', color: 'var(--color-burgundy)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            {/* Category Filter */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-control form-select"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_name}>
                    {c.category_name} ({c.product_count})
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="form-group">
              <label className="form-label">Price Range (₹)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <input
                  type="number"
                  placeholder="Min ₹"
                  className="form-control"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                />
                <input
                  type="number"
                  placeholder="Max ₹"
                  className="form-control"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            {/* Quick Price Shortcuts */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                className={`badge ${maxPrice === '500' ? 'badge-burgundy' : 'badge-outline'}`}
                onClick={() => { setMinPrice('0'); setMaxPrice('500'); setPage(1); }}
              >
                Under ₹500
              </button>
              <button
                type="button"
                className={`badge ${maxPrice === '1000' ? 'badge-burgundy' : 'badge-outline'}`}
                onClick={() => { setMinPrice('500'); setMaxPrice('1000'); setPage(1); }}
              >
                ₹500 - ₹1,000
              </button>
              <button
                type="button"
                className={`badge ${minPrice === '1000' ? 'badge-burgundy' : 'badge-outline'}`}
                onClick={() => { setMinPrice('1000'); setMaxPrice('2000'); setPage(1); }}
              >
                ₹1,000 - ₹2,000
              </button>
            </div>

            {/* Stock Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => {
                    setInStockOnly(e.target.checked);
                    setPage(1);
                  }}
                  style={{ accentColor: 'var(--color-burgundy)' }}
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </aside>

          {/* Product Results Column */}
          <div>
            {/* Top Bar: Live Counter + Sort Dropdown */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              backgroundColor: 'var(--color-warm-white)',
              padding: '0.75rem 1.25rem',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                <strong>{totalProducts}</strong> products found
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Sort by:</label>
                <select
                  className="form-control form-select"
                  style={{ width: 'auto', padding: '0.4rem 2rem 0.4rem 0.75rem', fontSize: '0.85rem' }}
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="featured">Featured / Iconic</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading football gear...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <Search className="empty-state-icon" />
                <h3 className="empty-state-title">No products match your criteria</h3>
                <p className="empty-state-desc">
                  Try clearing your search terms, expanding your price range, or browsing our full collection.
                </p>
                <button type="button" className="btn btn-burgundy" onClick={handleResetFilters}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {products.map((p) => (
                    <ProductCard key={p.product_id} product={p} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '3.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={page <= 1}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 0.75rem' }}>
                      Page {page} of {totalPages}
                    </span>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
