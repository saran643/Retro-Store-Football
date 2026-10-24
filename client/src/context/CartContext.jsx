import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [itemCount, setItemCount] = useState(0);
  const [summary, setSummary] = useState({
    subtotal: 0,
    deliveryCharge: 0,
    discount: 0,
    total: 0,
    freeDeliveryThreshold: 999
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setItemCount(0);
      setSummary({ subtotal: 0, deliveryCharge: 0, discount: 0, total: 0, freeDeliveryThreshold: 999 });
      return;
    }

    try {
      setLoading(true);
      const res = await cartService.getCart();
      if (res.data.success) {
        setItems(res.data.items);
        setItemCount(res.data.itemCount);
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, variantId = null, quantity = 1) => {
    if (!isAuthenticated) {
      showToast('Please log in or register to add items to your cart.', 'info');
      return false;
    }

    try {
      const res = await cartService.addToCart({
        product_id: productId,
        variant_id: variantId,
        quantity
      });

      if (res.data.success) {
        showToast(res.data.message, 'success');
        await fetchCart();
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not add item to cart.';
      showToast(msg, 'error');
      return false;
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const res = await cartService.updateQuantity(cartItemId, quantity);
      if (res.data.success) {
        await fetchCart();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not update quantity.';
      showToast(msg, 'error');
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      const res = await cartService.removeItem(cartItemId);
      if (res.data.success) {
        showToast('Item removed from cart.', 'info');
        await fetchCart();
      }
    } catch (err) {
      showToast('Could not remove item.', 'error');
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      await fetchCart();
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const value = {
    items,
    itemCount,
    summary,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
