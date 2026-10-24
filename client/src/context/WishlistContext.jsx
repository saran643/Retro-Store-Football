import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistService } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      return;
    }

    try {
      setLoading(true);
      const res = await wishlistService.getWishlist();
      if (res.data.success) {
        setWishlistItems(res.data.items);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.product_id === Number(productId));
  };

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      showToast('Please log in to save items to your wishlist.', 'info');
      return false;
    }

    try {
      if (isInWishlist(productId)) {
        await wishlistService.removeItem(productId);
        showToast('Removed from wishlist.', 'info');
      } else {
        const res = await wishlistService.addItem(productId);
        showToast(res.data.message || 'Saved to wishlist!', 'success');
      }
      await fetchWishlist();
      return true;
    } catch (err) {
      showToast('Could not update wishlist.', 'error');
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await wishlistService.removeItem(productId);
      showToast('Removed from wishlist.', 'info');
      await fetchWishlist();
    } catch (err) {
      showToast('Could not remove item.', 'error');
    }
  };

  const value = {
    wishlistItems,
    wishlistCount: wishlistItems.length,
    loading,
    isInWishlist,
    toggleWishlist,
    removeFromWishlist,
    fetchWishlist
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
