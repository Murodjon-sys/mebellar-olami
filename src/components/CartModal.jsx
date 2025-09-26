import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart } from 'lucide-react';

export default function CartModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  onRemoveItem, 
  onUpdateQuantity,
  onCheckout
}) {
  if (!isOpen) return null;

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        try { document.body.style.overflow = 'auto'; } catch {}
        onClose && onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  // Handle navigation to products section
  const handleViewProducts = () => {
    // Close the cart and re-enable scrolling
    onClose();
    // Ensure body scroll is re-enabled (in case it was locked)
    document.body.style.overflow = 'auto';
    // Scroll to products section after a small delay to ensure the cart is closed
    setTimeout(() => {
      const productsSection = document.getElementById('products');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div key="cart-overlay" className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {/* Fixed Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Cart Modal */}
          <motion.div
            className="absolute top-0 right-0 h-full w-full sm:max-w-md md:max-w-lg bg-gradient-to-br from-green-900 via-black to-black shadow-2xl border-l border-green-500/30 overflow-y-auto safe-top safe-bottom"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <div className="sticky top-0 z-10 bg-gradient-to-r from-green-900 to-black/90 backdrop-blur-sm p-5 border-b border-green-500/30 shadow-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                  <ShoppingCart className="w-6 h-6 text-green-400" />
                  <span>Savat</span>
                  {cartItems.length > 0 && (
                    <span className="bg-green-500 text-white text-xs md:text-sm font-bold px-2.5 py-0.5 rounded-full">
                      {cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                    </span>
                  )}
                </h3>
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); try { document.body.style.overflow = 'auto'; } catch {}; onClose && onClose(); }}
                  className="p-2 text-gray-300 hover:text-white hover:bg-green-600/30 transition-all rounded-full"
                  aria-label="Yopish"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {cartItems.length > 0 ? (
                <>
                  <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {cartItems.map((item) => (
                      <div key={item._id || item.id} className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-900/30 to-black/40 hover:from-green-800/40 hover:to-black/50 rounded-xl transition-all border border-green-500/20 overflow-hidden">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-base md:text-lg font-semibold text-white leading-snug truncate">{item.name}</h4>
                            <button 
                              onClick={() => onRemoveItem(item._id || item.id)}
                              className="text-gray-400 hover:text-red-400 transition-colors p-1 -m-1"
                              aria-label="O'chirish"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-3 bg-gray-700/50 rounded-md px-3 py-1.5">
                              <button 
                                onClick={() => onUpdateQuantity(item._id || item.id, item.quantity - 1)}
                                className="text-gray-300 hover:text-white transition-colors"
                                disabled={item.quantity <= 1}
                                aria-label="Kamaytirish"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                              </button>
                              <span className="text-base font-semibold w-6 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => onUpdateQuantity(item._id || item.id, item.quantity + 1)}
                                className="text-gray-300 hover:text-white transition-colors"
                                aria-label="Ko'paytirish"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="12" y1="5" x2="12" y2="19"></line>
                                  <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                              </button>
                            </div>
                            <div className="text-right">
                              <span className="text-base md:text-lg text-green-400 font-bold">
                                {(item.price * item.quantity).toLocaleString()} so'm
                              </span>
                              {item.oldPrice && (
                                <div className="text-xs text-gray-400 line-through">
                                  {item.oldPrice.toLocaleString()} so'm
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="sticky bottom-0 bg-gradient-to-t from-black/90 via-black/80 to-transparent pt-5 pb-7 px-2 -mx-1">
                    <div className="bg-gradient-to-r from-green-900/40 to-black/60 backdrop-blur-sm rounded-xl p-5 border border-green-500/20">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-300 text-sm md:text-base">Mahsulotlar soni:</span>
                        <span className="font-semibold text-white">
                          {cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)} ta
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-300 text-sm md:text-base">Jami:</span>
                        <div className="text-right">
                          <div className="text-2xl md:text-3xl font-extrabold text-green-400 tracking-tight">
                            {calculateTotal().toLocaleString()} so'm
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={onCheckout}
                        disabled={cartItems.length === 0}
                        className={`w-full py-3.5 px-5 rounded-xl font-semibold text-white transition-all ${
                          cartItems.length > 0 
                            ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-green-500/20' 
                            : 'bg-gray-600 cursor-not-allowed'
                        }`}
                      >
                        Buyurtma berish
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
                  <ShoppingCart className="w-20 h-20 text-gray-500 mb-5" />
                  <h4 className="text-gray-200 font-semibold text-xl">Savat bo'sh</h4>
                  <p className="text-base text-gray-400 mt-3 mb-7">Mahsulot qo'shish uchun pastdagi tugmani bosing</p>
                  <button
                    onClick={handleViewProducts}
                    className="px-7 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-xl font-semibold transition-all shadow-md"
                  >
                    Mahsulotlarni ko'rish
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
