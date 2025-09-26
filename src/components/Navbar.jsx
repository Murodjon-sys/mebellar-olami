import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ cartItems = [], onCartClick, onAdminAccess, onNavClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [adminClicks, setAdminClicks] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  // Prevent body scroll when menu is open
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

  // Ensure portal target is available
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Handle admin access with 5 clicks
  const handleAdminAccessClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newClicks = adminClicks + 1;
    setAdminClicks(newClicks);
    
    if (newClicks >= 5) {
      // Admin panelga yo'naltirish
      window.location.href = '/admin';
      setAdminClicks(0);
    } else if (newClicks === 1) {
      // Reset counter after 3 seconds if not enough clicks
      setTimeout(() => {
        setAdminClicks(0);
      }, 3000);
    }
  };

  const menuRef = useRef(null);
  const cartRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onCartClick) {
      onCartClick(e); // Pass the event to the parent handler
    } else {
      console.error('onCartClick handler is not provided');
    }
  };

  const navItems = [
    { label: 'Bosh sahifa', section: 'hero' },
    { label: 'Mahsulotlar', section: 'products' },
    { label: 'Sharhlar', section: 'reviews' },
    { label: 'Bog\'lanish', section: 'contact' },
  ];

  // Animation variants for mobile menu items
  const listVariants = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -12 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-gradient-to-r from-black/80 via-emerald-900/50 to-black/80 backdrop-blur border-b border-emerald-800/40 shadow-[0_2px_10px_rgba(16,185,129,0.12)]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={handleAdminAccessClick}
              className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent cursor-pointer select-none"
                
            >
              Marhabo Mebellar
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.section}
                onClick={() => onNavClick && onNavClick(item.section)}
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile menu and cart */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <div ref={cartRef} className="relative">
              <button 
                onClick={handleCartClick}
                className="p-2 text-gray-300 hover:text-green-400 transition-colors cart-icon"
                aria-label="Savatcha"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItems && cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.reduce((total, item) => total + (item.quantity || 1), 0)}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="md:hidden p-2 text-gray-300 hover:text-green-400 transition-colors"
              aria-label="Menyu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu via Portal to body to guarantee full-page coverage */}
        {mounted && createPortal(
          (
            <AnimatePresence>
              {isOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-black/50 z-[90]"
                    onClick={() => setIsOpen(false)}
                  />

                  {/* Menu */}
                  <motion.div
                    initial={{ x: '-100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '-100%', opacity: 0 }}
                    transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
                    className="fixed inset-0 h-full w-full bg-gray-900 z-[100] shadow-2xl overflow-y-auto safe-top safe-bottom"
                    ref={menuRef}
                  >
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                      <h2 className="text-xl font-bold text-white">Menyu</h2>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 text-gray-400 hover:text-white"
                        aria-label="Yopish"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    <motion.nav
                      className="flex flex-col p-4 space-y-3 min-h-[calc(100vh-56px)]"
                      variants={listVariants}
                      initial="hidden"
                      animate="show"
                    >
                      {navItems.map((item) => (
                        <motion.button
                          key={item.section}
                          variants={itemVariants}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            onNavClick && onNavClick(item.section);
                            setIsOpen(false);
                          }}
                          className="w-full inline-flex justify-center items-center menu-animated-btn text-white rounded-full h-11 px-5 text-sm font-semibold ring-1 ring-green-500/40 shadow-lg"
                        >
                          {item.label}
                        </motion.button>
                      ))}
                    </motion.nav>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          ),
          document.body
        )}
      </div>
    </header>
  );
};

export default Navbar;