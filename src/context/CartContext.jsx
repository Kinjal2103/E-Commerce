import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('lumina_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('lumina_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((product, quantity, color, size) => {
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(
        (item) =>
          (item.product.id === product.id || item.product._id === product._id) &&
          item.selectedColor === color &&
          item.selectedSize === size
      );

      if (existingIdx > -1) {
        const updated = [...prevCart];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        return [...prevCart, { product, quantity, selectedColor: color, selectedSize: size }];
      }
    });
  }, []);

  const quickAdd = useCallback((product) => {
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0].name : 'Default';
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'One Size';
    addToCart(product, 1, defaultColor, defaultSize);
    setIsCartOpen(true);
  }, [addToCart]);

  const updateQuantity = useCallback((index, quantity) => {
    setCart((prevCart) => {
      const updated = [...prevCart];
      if (index >= 0 && index < updated.length) {
        updated[index].quantity = Math.max(1, quantity);
      }
      return updated;
    });
  }, []);

  const removeItem = useCallback((index) => {
    setCart((prevCart) => prevCart.filter((_, idx) => idx !== index));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const contextValue = useMemo(() => ({
    cart,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    quickAdd,
    updateQuantity,
    removeItem,
    clearCart,
  }), [cart, isCartOpen, addToCart, quickAdd, updateQuantity, removeItem, clearCart]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
