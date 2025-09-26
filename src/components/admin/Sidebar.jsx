'use client';

import { useState, useEffect, useCallback } from 'react';
import { Home, ShoppingCart, Package, Users, Menu, X } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { name: 'Boshqaruv', href: '/admin', icon: Home },
  { name: 'Buyurtmalar', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Mahsulotlar', href: '/admin/products', icon: Package },
  { name: 'Mijozlar', href: '/admin/customers', icon: Users },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if the screen is mobile on component mount and window resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is the 'md' breakpoint in Tailwind
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (!isMobile) return; // only for mobile
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen, isMobile]);

  const toggleMenu = useCallback(() => {
    setIsOpen((v) => !v);
  }, []);

  // Expose global toggler for top navbar button
  useEffect(() => {
    window.__adminToggleSidebar = toggleMenu;
    return () => {
      if (window.__adminToggleSidebar === toggleMenu) delete window.__adminToggleSidebar;
    };
  }, [toggleMenu]);

  // Close mobile menu when a link is clicked
  const closeMobileMenu = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Desktop sidebar
  const desktopSidebar = (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-80 flex-col border-r border-gray-800 bg-gradient-to-b from-gray-900 to-green-900 text-white md:flex">
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <NavLink to="/" className="flex items-center gap-2 font-semibold">
          <Package className="h-6 w-6 text-green-400" />
          <span>Admin Panel</span>
        </NavLink>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
              onClick={closeMobileMenu}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );

  // Mobile menu button
  const mobileMenuButton = (
    <div className="fixed top-4 left-4 z-30 md:hidden">
      <button
        onClick={toggleMenu}
        className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
        aria-expanded="false"
      >
        <span className="sr-only">Menyuni ochish</span>
        {isOpen ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Menu className="h-6 w-6" aria-hidden="true" />
        )}
      </button>
    </div>
  );

  // Mobile menu overlay and sidebar
  const mobileMenu = (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={closeMobileMenu}
        ></div>
      )}
      
      {/* Mobile Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-20 w-64 transform bg-gradient-to-b from-gray-900 to-green-900 text-white transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6 text-green-400" />
            <span>Admin Panel</span>
          </NavLink>
          {/* Removed duplicate close button; use the floating top-left toggle */}
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`
                }
                onClick={closeMobileMenu}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </>
  );

  return (
    <>
      {mobileMenuButton}
      {mobileMenu}
      {desktopSidebar}
    </>
  );
}
