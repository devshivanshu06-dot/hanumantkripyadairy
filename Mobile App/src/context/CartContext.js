import React, { createContext, useState, useEffect, useContext } from 'react';
import { cartAPI } from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [user]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await cartAPI.getCart();
      setCart(response.data);
    } catch (error) {
      console.error('Failed to fetch cart', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity) => {
    try {
      const response = await cartAPI.addItem(productId, quantity);
      setCart(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to add to cart', error);
      throw error;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await cartAPI.updateQuantity(productId, quantity);
      setCart(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to update quantity', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCart({ items: [], totalAmount: 0 });
    } catch (error) {
      console.error('Failed to clear cart', error);
    }
  };

  const cartCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ 
      cart, 
      loading, 
      fetchCart, 
      addToCart, 
      updateQuantity, 
      clearCart,
      cartCount 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
