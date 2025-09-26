'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Types for better type safety
/**
 * @typedef {Object} CartItem
 * @property {string} _id - The unique identifier of the product
 * @property {string} name - The name of the product
 * @property {number} price - The price of the product
 * @property {number} quantity - The quantity in cart
 * @property {string} [image] - Optional image URL
 * @property {string} [description] - Optional product description
 */

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const navigate = useNavigate();

  // Set client flag on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load cart from localStorage on initial render (client-side only)
  useEffect(() => {
    if (!isClient) return;
    
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Basic validation of cart items
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        } else {
          console.warn('Invalid cart data in localStorage, resetting...');
          localStorage.removeItem('cart');
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      localStorage.removeItem('cart');
    }
  }, [isClient]);

  // Save cart to localStorage whenever it changes (client-side only)
  useEffect(() => {
    if (!isClient) return;
    
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems, isClient]);

  /**
   * Adds a product to the cart or updates its quantity if already in cart
   * @param {CartItem} product - The product to add to cart
   * @param {number} [quantity=1] - Optional quantity to add (defaults to 1)
   */
  const addToCart = (product, quantity = 1) => {
    if (!product?._id || !product?.price) {
      console.error('Invalid product data:', product);
      return;
    }

    const qty = Math.max(1, Number(quantity) || 1);
    
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item._id === product._id);
      
      if (existingItem) {
        // If item already in cart, update quantity
        return prevItems.map((item) =>
          item._id === product._id
            ? { 
                ...item, 
                quantity: Math.max(1, item.quantity + qty),
                // Ensure we don't accidentally override important fields
                name: item.name || product.name,
                price: item.price || product.price
              }
            : item
        );
      }
      
      // Add new item to cart with required fields
      return [
        ...prevItems, 
        { 
          _id: product._id,
          name: product.name,
          price: product.price,
          quantity: qty,
          image: product.image,
          description: product.description
        }
      ];
    });
  };

  /**
   * Removes a product from the cart
   * @param {string} productId - The ID of the product to remove
   */
  const removeFromCart = (productId) => {
    if (!productId) return;
    if (productId === 'ALL') {
      clearCart();
      return;
    }
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
  };

  /**
   * Updates the quantity of a product in the cart
   * @param {string} productId - The ID of the product to update
   * @param {number} quantity - The new quantity (must be at least 1)
   */
  const updateQuantity = (productId, quantity) => {
    if (!productId) return;
    
    const newQuantity = Math.max(1, Math.floor(Number(quantity)) || 1);
    
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  /**
   * Clears all items from the cart
   */
  const clearCart = () => {
    setCartItems([]);
    if (isClient) {
      try {
        localStorage.removeItem('cart');
      } catch (error) {
        console.error('Error clearing cart from localStorage:', error);
      }
    }
  };

  /**
   * Calculates the total cost of all items in the cart
   * @returns {number} The total cost
   */
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const quantity = Math.max(1, Number(item.quantity) || 0);
      return total + (price * quantity);
    }, 0);
  };

  /**
   * Gets the total number of items in the cart
   * @returns {number} The total item count
   */
  const getItemCount = () => {
    return cartItems.reduce((count, item) => {
      return count + (Math.max(1, Number(item.quantity) || 0));
    }, 0);
  };

  /**
   * Navigates to the checkout page
   */
  const checkout = () => {
    if (cartItems.length === 0) {
      console.warn('Cannot checkout with an empty cart');
      return;
    }
    navigate('/checkout');
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getItemCount,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
