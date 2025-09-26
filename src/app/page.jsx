import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, X, CheckCircle, Star, Phone, Mail, MapPin } from "lucide-react";
import OrderModal from "../components/OrderModal";
import OrderConfirmationModal from "../components/OrderConfirmationModal";
import Navbar from "../components/Navbar";
import CartModal from "../components/CartModal";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "../contexts/CartContext";

export default function HomePage() {
  // State for mobile menu and product modal
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { cartItems, addToCart: addToCartCtx, removeFromCart, updateQuantity } = useCart();
  const [showCart, setShowCart] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  
  // Toggle cart with proper z-index handling and body scroll lock
  const toggleCart = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowCart(prev => {
      if (!prev) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
      return !prev;
    });
  };
  
  // Clean up scroll lock on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Open cart if URL contains ?cart=1 (used by detail page quick open)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('cart') === '1') {
        setShowCart(true);
        document.body.style.overflow = 'hidden';
        // Clean URL
        params.delete('cart');
        const newUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ''}${window.location.hash}`;
        window.history.replaceState({}, '', newUrl);
      }
    } catch {}
  }, []);
  
  // Close cart
  const closeCart = () => {
    setShowCart(false);
    // Always restore body scroll when cart closes
    try { document.body.style.overflow = 'auto'; } catch {}
  };
  
  // Cart modal ref for click outside
  const cartRef = useRef(null);
  
  // Handle checkout from cart
  const handleCartCheckout = () => {
    if (cartItems.length === 0) {
      alert("Savat bo'sh! Iltimos, avval mahsulot qo'shing.");
      return;
    }
    closeCart();
    setIsOrderModalOpen(true);
  };
  
  // Close cart when clicking outside
  useEffect(() => {
    if (!showCart) return;
    
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        // Check if click is not on cart icon
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon && !cartIcon.contains(event.target)) {
          closeCart();
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCart]);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState(["Barchasi", "Divan", "Kreslo", "Stol"]);
  const [activeCategory, setActiveCategory] = useState("Barchasi");
  
  // Products fetched from API
  const [products, setProducts] = useState([]);
  // Fallback products to guarantee at least 10 cards on the homepage
  const defaultProducts = [
    { id: 101, name: 'SMART BED PRO', price: 5990000, description: 'Massaj va yoritish tizimiga ega aqlli yotoq.', category: 'Yotoq', image: 'https://images.unsplash.com/photo-1505692794403-34d4982fd1d9?w=600&h=400&fit=crop' },
    { id: 102, name: 'MILANO DIVAN', price: 3290000, description: 'Zamonaviy dizayndagi eko-charm divan.', category: 'Divan', image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=600&h=400&fit=crop' },
    { id: 103, name: 'ERGONOMIC PRO', price: 1290000, description: 'Ofis uchun ergonomik stul.', category: 'Stul', image: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=600&h=400&fit=crop' },
    { id: 104, name: 'ROYAL STOL', price: 2190000, description: 'Premium oshxona stoli.', category: 'Stol', image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08b?w=600&h=400&fit=crop' },
    { id: 105, name: 'KIDS COMFORT', price: 1490000, description: 'Bolalar xonasi uchun qulay to‘plam.', category: 'To‘plam', image: 'https://images.unsplash.com/photo-1598300053654-32c43b0c146b?w=600&h=400&fit=crop' },
    { id: 106, name: 'NORDIC CHAIR', price: 690000, description: 'Skandinaviya uslubidagi stul.', category: 'Stul', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=400&fit=crop' },
    { id: 107, name: 'OAK TABLE', price: 2790000, description: 'Tabiiy eman yog‘ochidan stol.', category: 'Stol', image: 'https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?w=600&h=400&fit=crop' },
    { id: 108, name: 'COMFY SOFA', price: 2590000, description: 'Yumshoq va qulay uch kishilik divan.', category: 'Divan', image: 'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=600&h=400&fit=crop' },
    { id: 109, name: 'MINI COUCH', price: 1190000, description: 'Kichik xonalar uchun ixcham divan.', category: 'Divan', image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600&h=400&fit=crop' },
    { id: 110, name: 'WARDROBE PRO', price: 3890000, description: 'Katta sig‘imli zamonaviy shkaf.', category: 'Shkaf', image: 'https://images.unsplash.com/photo-1555041469-869dc6fdaac6?w=600&h=400&fit=crop' },
  ];
  // Load products from backend
  useEffect(() => {
    const load = async () => {
      try {
        const base = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const fetchProducts = async () => {
          const res = await fetch(`${base}/api/products?available=all`);
          const data = await res.json();
          return (data.data || []).map((p) => ({
            id: p._id,
            name: p.name,
            price: p.price,
            description: p.description,
            category: p.category,
            image: p.image_url || p.imageUrl,
            rating: p.rating || 4.8,
            reviews: p.reviews || 0,
          }));
        };

        let list = await fetchProducts();

        // If there are not enough products in DB, seed demo data then refetch
        if (!list || list.length < 10) {
          try {
            await fetch(`${base}/api/products/seed`, { method: 'POST' });
            list = await fetchProducts();
          } catch (error) {
            console.error('Error seeding demo data:', error);
          }
        }
        const merged = (list && list.length >= 10)
          ? list
          : [...list, ...defaultProducts].slice(0, Math.max(10, list.length || 10));
        setProducts(merged);
      } catch (e) {
        console.error('Error loading products:', e);
      }
    };
    load();
  }, []);
  
  // Filter products by category
  const filteredProducts = activeCategory === "Barchasi" 
    ? products 
    : products.filter(product => product.category && product.category.toLowerCase() === activeCategory.toLowerCase());
  
  // State for order confirmation
  const [orderDetails, setOrderDetails] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Handle order form submission
  const handleOrderFormSubmit = async (formData) => {
    document.body.style.overflow = 'auto'; // Ensure scroll is re-enabled after order
    try {
      setIsSubmitting(true);
      
      // Create order object
      const newOrder = {
        id: Date.now(),
        ...formData,
        items: [...cartItems],
        total: calculateTotal(),
        status: 'pending',
        date: new Date().toLocaleString('uz-UZ')
      };
      
      const base = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${base}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.fullName || formData.customerName,
          phone: formData.phone,
          address: formData.address,
          paymentMethod: formData.paymentMethod,
          cardNumber: formData.cardNumber,
          items: cartItems.map(i => ({ productId: i._id, name: i.name, price: i.price, quantity: i.quantity || 1 }))
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Buyurtma xatosi');
      
      // Save order details and show confirmation
      setOrderDetails({ ...newOrder, id: data.data?._id || newOrder.id });
      setIsOrderModalOpen(false);
      setShowConfirmation(true);
      
      // Clear cart after successful order
      try { localStorage.removeItem('cart'); } catch {}
      removeFromCart('ALL');
      
      // Reset form
      setIsSubmitting(false);
      
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Buyurtma yuborishda xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.');
      setIsSubmitting(false);
    }
  };

  // Add to cart function (uses global CartContext)
  const addToCart = (product) => {
    if (!product) return;
    const mapped = {
      _id: String(product.id ?? product._id ?? Date.now()),
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
    };
    addToCartCtx(mapped, 1);
  };

  // Remove item from cart (CartContext)
  const handleRemoveFromCart = (productId) => {
    removeFromCart(String(productId));
  };

  // Update item quantity in cart (CartContext)
  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(String(productId), newQuantity);
  };

  // Remove from cart and update quantity functions are now handled by 
  // handleRemoveFromCart and handleUpdateQuantity

  // Calculate total
  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + (item.price * (item.quantity || 1)),
      0
    );
  };

  // Handle checkout
  const handleCheckout = async (orderData) => {
    if (cartItems.length === 0) {
      alert("Savat bo'sh! Iltimos, avval mahsulot qo'shing.");
      return;
    }
    try {
      setIsSubmitting(true);
      
      // Create order object
      const newOrder = {
        id: Date.now(),
        ...orderData,
        items: [...cartItems],
        total: calculateTotal(),
        status: 'Yangi',
        date: new Date().toLocaleString('uz-UZ'),
        paymentMethod: orderData.paymentMethod || 'cash',
        cardNumber: orderData.cardNumber || ''
      };
      
      // In a real app, you would send this to your backend
      // await fetch('/api/orders', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newOrder)
      // });
      
      // Save order details and show confirmation
      setOrderDetails(newOrder);
      setIsOrderModalOpen(false);
      setShowConfirmation(true);
      
      // Clear cart after successful order
      setCartItems([]);
      
    } catch (error) {
      console.error('Xatolik yuz berdi:', error);
      setContactStatus({
        type: 'error',
        message: 'Xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };  

  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [contactStatus, setContactStatus] = useState({ type: "", message: "" });

  // Animatsiyali matnlar
  const heroTexts = [
    "Sifatli va zamonaviy mebellar",
    "Sizning uyingiz uchun eng yaxshisi",
    "Qulay narxlarda yuqori sifat",
    "Marhabo Mebellar - ishonchli tanlov",
  ];

  // Typing effect
  useEffect(() => {
    const currentText = heroTexts[currentTextIndex];
    let timeout;

    if (isTyping && !isDeleting) {
      if (displayText.length < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        }, 100);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    } else if (isDeleting) {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 50);
      } else {
        setIsDeleting(false);
        setCurrentTextIndex((prev) => (prev + 1) % heroTexts.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, isDeleting, currentTextIndex, heroTexts]);

  // Smooth scroll funksiyasi
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  // Removed hidden admin access logic

  // Mock reviews data
  const mockReviews = [
    {
      id: 1,
      name: 'Dilshodbek Rahimov',
      rating: 5,
      comment: 'Ajoyib sifat! SMART BED PRO yotog\'im endi to\'liq dam olish maskaniga aylandi. Massaj funksiyasi ayniqsa yoqdi, orqa og\'riqlarim sezilarli darajada kamaydi. Yetkazib berish ham juda tez bo\'ldi.',
      date: '2023-09-15',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      customer_name: 'Dilshodbek Rahimov',
      product_name: 'Aqlli Yotoq "SMART BED" PRO',
      purchase_date: '2023-08-20',
      verified_purchase: true
    },
    {
      id: 2,
      name: 'Gulnora Xasanova',
      rating: 5,
      comment: 'Milano divani haqiqatan ham ajoyib! Uyimga zamonaviy va shinamlik bag\'ishladi. Eko-charm material juda yumshoq va sifatli. O\'ylaganimdan ham tezroq yetkazib berishdi.',
      date: '2023-09-10',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      customer_name: 'Gulnora Xasanova',
      product_name: 'Eko-charm Divan "MILANO"',
      purchase_date: '2023-08-15',
      verified_purchase: true
    },
    {
      id: 3,
      name: 'Javlon Karimov',
      rating: 4,
      comment: 'ERGONOMIC PRO stul ish joyimdagi eng yaxshi investitsiya bo\'ldi. Kun davomida ishlashimda orqa og\'riqlarim butunlay yo\'qoldi. Yagona kamchiligi - narfi biroz yuqori, lekin sifatiga ko\'ra arziydi.',
      date: '2023-09-05',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      customer_name: 'Javlon Karimov',
      product_name: 'Smart Stul "ERGONOMIC PRO"',
      purchase_date: '2023-08-10',
      verified_purchase: true
    },
    {
      id: 4,
      name: 'Sevara Ismoilova',
      rating: 5,
      comment: 'ROYAL oshxona stoli butun oilamga yoqdi. Sifati, dizayni va funksionalligi ajoyib. Oshpazlik qilish endi zavqga aylandi. Yetkazib berish va o\'rnatish xizmati ham yuqori darajada edi.',
      date: '2023-09-01',
      avatar: 'https://randomuser.me/api/portraits/women/63.jpg',
      customer_name: 'Sevara Ismoilova',
      product_name: 'Premium Oshxona Stol Javoni "ROYAL"',
      purchase_date: '2023-08-05',
      verified_purchase: true
    },
    {
      id: 5,
      name: 'Farrux Tursunov',
      rating: 5,
      comment: 'INVISIBLE PRO shkaf haqiqatan ham zamonaviy yechim. Sensorli eshiklar va ichki yoritish tizimi juda qulay. Kiyim-kechaklarim endi tartibli va hammasi ko\'z oldimda. Narxi biroz yuqori bo\'lishi mumkin, lekin bunaqa sifat va qulaylik uchun arziydi.',
      date: '2023-08-25',
      avatar: 'https://randomuser.me/api/portraits/men/51.jpg',
      customer_name: 'Farrux Tursunov',
      product_name: 'Smart Shkaf "INVISIBLE" PRO',
      purchase_date: '2023-08-01',
      verified_purchase: true
    },
    {
      id: 6,
      name: 'Dilfuza Karimova',
      rating: 4,
      comment: 'TRANSFORMER divanimiz butun oila a\'zolarining sevimli joyiga aylandi. Modulli tizimi tufayli xonani har doim yangicha tartibga keltirish mumkin. Yagona tavsiyam - yumshoqroq variantlari ham bo\'lgan bo\'lsa yaxshi bo\'lardi.',
      date: '2023-08-20',
      avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
      customer_name: 'Dilfuza Karimova',
      product_name: 'Modular Divan "TRANSFORMER"',
      purchase_date: '2023-07-25',
      verified_purchase: true
    }
  ];

  // Featured mahsulotlarni olish
  const featuredProducts = products;


  // Kontakt forma submit qilish
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setContactStatus({ type: "", message: "" });

    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${base}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();

      if (data.success) {
        setContactStatus({ type: "success", message: data.message });
        setContactForm({ name: "", email: "", phone: "", message: "" });
      } else {
        setContactStatus({ type: "error", message: data.error });
      }
    } catch (error) {
      console.error("Kontakt forma xatoligi:", error);
      setContactStatus({
        type: "error",
        message: "Xatolik yuz berdi. Qayta urinib ko'ring.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-black font-inter">
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      
      {/* Header */}
      <Navbar 
        cartItems={cartItems} 
        onCartClick={toggleCart} 
        onNavClick={scrollToSection}
      />
      {/* Subtle divider below header for visual separation */}
      <div className="h-6 bg-gradient-to-b from-emerald-900/60 via-emerald-900/30 to-transparent"></div>

      {/* Main Content */}
      <main className="pt-24 sm:pt-28 lg:pt-32">
        {/* Hero Section */}
        <section 
          id="hero"
          className="relative bg-gradient-to-br from-emerald-950 via-gray-900 to-black py-20 lg:py-32"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-green-900/70"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
              <div className="mb-12 lg:mb-0 max-w-2xl mx-auto lg:mx-0">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 font-playfair leading-tight tracking-tight text-center lg:text-left"
                >
                  Marhabo <span className="text-green-400">Mebellar</span>
                </motion.h1>

                <div className="mb-8">
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg sm:text-xl lg:text-2xl text-green-300 mb-6 leading-relaxed max-w-xl mx-auto lg:mx-0 text-center lg:text-left"
                  >
                    {displayText}
                    <span className="animate-pulse">|</span>
                  </motion.p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-center lg:justify-start">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => scrollToSection("products")}
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-full font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-900/30 text-center"
                  >
                    Mahsulotlarni ko'rish
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => scrollToSection("contact")}
                    className="w-full sm:w-auto bg-gradient-to-r from-transparent to-transparent text-green-300 px-8 py-4 rounded-full font-semibold border-2 border-emerald-500/60 hover:text-white hover:from-emerald-600/20 hover:to-green-700/20 transition-all shadow-lg shadow-emerald-900/20 text-center"
                  >
                    Bog'lanish
                  </motion.button>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative group max-w-xl mx-auto lg:mx-0"
              >
                <img
                  src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop"
                  alt="Zamonaviy mebel"
                  className="rounded-2xl shadow-2xl w-full h-96 object-cover border border-emerald-600/50 ring-1 ring-emerald-500/30 transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section
          id="products"
          className="py-16 lg:py-24 bg-gradient-to-br from-gray-900 to-black"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 font-playfair">
                Tavsiya etiladigan mahsulotlar
              </h2>
              <p className="text-xl text-green-300 max-w-3xl mx-auto">
                Eng sifatli va zamonaviy mebellarimiz bilan tanishing
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-gradient-to-br from-gray-800 to-black rounded-2xl shadow-2xl overflow-hidden border border-green-700 cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-64 object-cover"
                    />
                    <button className="absolute top-4 right-4 p-2 bg-black/70 rounded-full hover:bg-green-600 transition-colors">
                      <Heart className="w-5 h-5 text-green-400 hover:text-white" />
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="mb-2">
                      <span className="px-3 py-1 text-xs font-semibold text-green-400 bg-green-900/30 rounded-full border border-green-700">
                        {product.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-300 mb-4 text-sm line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <span className="text-2xl font-bold text-green-400">
                        {product.price?.toLocaleString()} so'm
                      </span>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                          className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold shadow-lg"
                        >
                          Savatga
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                          className="flex-1 sm:flex-none border border-green-600 text-green-400 px-4 py-2 rounded-lg hover:bg-green-600 hover:text-white transition-all text-sm font-semibold"
                        >
                          Tafsilot
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* View more products button */}
            <div className="text-center mt-12">
              <motion.a
                href="/products"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all"
              >
                Barcha mahsulotlarni ko'rish 
              </motion.a>
            </div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section id="reviews" className="py-16 lg:py-24 bg-gradient-to-br from-gray-900 to-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Mijozlarimiz Fikrlari
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-green-400 to-blue-500 mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mockReviews.slice(0, 3).map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:border-green-500 transition-all"
                >
                  <div className="flex items-center mb-4">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-green-500"
                    />
                    <div>
                      <h4 className="font-semibold text-white">{review.name}</h4>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                        <span className="text-xs text-gray-400 ml-2">
                          {review.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">"{review.comment}"</p>
                  {review.verified_purchase && (
                    <div className="mt-3 flex items-center text-xs text-green-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Tasdiqlangan xarid
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section
          id="contact"
          className="py-16 lg:py-24 bg-gradient-to-br from-gray-900 to-black"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="mb-12 lg:mb-0">
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 font-playfair">
                  Biz bilan bog'laning
                </h2>
                <p className="text-xl text-green-300 mb-8">
                  Savollaringiz bormi? Biz sizga yordam berishga tayyormiz!
                </p>

                <div className="space-y-6">
                  <div className="flex items-center">
                    <Phone className="w-6 h-6 text-green-400 mr-4" />
                    <a href="tel:+998934268607" className="text-gray-300 hover:text-green-400 transition-colors">
                      +998 93 426 86 07
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-6 h-6 text-green-400 mr-4" />
                    <a href="mailto:marhabomebellar.uz" className="text-gray-300 hover:text-green-400 transition-colors">
                      marhabomebellar.uz
                    </a>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-6 h-6 text-green-400 mr-4" />
                    <span className="text-gray-300">
                      Buxoro viloyati, G'ijduvon tumani, Ipaddrom bozori oldida !!!
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-black p-8 rounded-2xl border border-green-700 shadow-2xl">
                {/* Status message */}
                {contactStatus.message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-6 p-4 rounded-lg border ${
                      contactStatus.type === "success"
                        ? "bg-green-900/30 border-green-500 text-green-300"
                        : "bg-red-900/30 border-red-500 text-red-300"
                    }`}
                  >
                    {contactStatus.message}
                  </motion.div>
                )}

                <form className="space-y-6" onSubmit={handleContactSubmit}>
                  <div>
                    <label className="block text-sm font-semibold text-green-400 mb-2">
                      Ismingiz *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) =>
                        setContactForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-gray-900 border border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-500"
                      placeholder="Ismingizni kiriting"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-green-400 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-gray-900 border border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-500"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-green-400 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) =>
                        setContactForm((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-gray-900 border border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-500"
                      placeholder="+998 93 426 86 07"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-green-400 mb-2">
                      Xabar *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-gray-900 border border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-500"
                      placeholder="Xabaringizni yozing..."
                    ></textarea>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Yuborilmoqda..." : "Xabarni yuborish"}
                  </motion.button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative overflow-hidden bg-gradient-to-r from-black via-green-950 to-green-900 text-white py-14 border-t border-green-700">
        {/* Animated background blobs */}
        <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 bg-green-600/20 blur-3xl rounded-full animate-blob" />
        <div className="pointer-events-none absolute -bottom-10 left-1/3 w-72 h-72 bg-emerald-400/10 blur-3xl rounded-full animate-blob animation-delay-2000" />
        <div className="pointer-events-none absolute -top-10 right-0 w-72 h-72 bg-green-300/10 blur-3xl rounded-full animate-blob animation-delay-4000" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:col-span-2"
            >
              <h3 className="text-2xl font-bold text-green-400 mb-4">
                Marhabo Mebellar
              </h3>
              <p className="text-gray-300 mb-6">
                Yuqori sifatli va zamonaviy mebellar bilan sizning uyingizni
                ajoyib qilamiz. Bizning ishonchli mahsulotlarimiz bilan qulay va
                chiroyli makon yarating.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h4 className="font-semibold mb-4 text-green-400">
                Tezkor havolalar
              </h4>
              <div className="mt-4">
                <ul className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3">
                  <li>
                    <button
                      onClick={() => scrollToSection("hero")}
                      className="w-full inline-flex justify-center items-center h-10 px-4 rounded-full text-sm font-medium ring-1 ring-green-600/40 text-gray-200 bg-white/5 hover:bg-green-600/20 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50"
                    >
                      Bosh sahifa
                    </button>
                  </li>
                  <li>
                    <a
                      href="/products"
                      className="w-full inline-flex justify-center items-center h-10 px-4 rounded-full text-sm font-medium ring-1 ring-green-600/40 text-gray-200 bg-white/5 hover:bg-green-600/20 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50"
                    >
                      Mahsulotlar
                    </a>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("reviews")}
                      className="w-full inline-flex justify-center items-center h-10 px-4 rounded-full text-sm font-medium ring-1 ring-green-600/40 text-gray-200 bg-white/5 hover:bg-green-600/20 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50"
                    >
                      Sharhlar
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("contact")}
                      className="w-full inline-flex justify-center items-center h-10 px-4 rounded-full text-sm font-medium ring-1 ring-green-600/40 text-gray-200 bg-white/5 hover:bg-green-600/20 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50"
                    >
                      Bog'lanish
                    </button>
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h4 className="font-semibold mb-4 text-green-400">Aloqa</h4>
              <div className="space-y-2 text-gray-300">
                <p>
                  <a href="tel:+998934268607" className="hover:text-green-400 transition-colors">+998 93 426 86 07</a>
                </p>
                <p>marhabomebellar.uz</p>
                <p>Buxoro viloyati, G'ijduvon tumani, Ipaddrom bozori oldida !!!</p>
              </div>
            </motion.div>
          </div>

          <div className="mt-10">
            <div className="h-px w-full animated-border"></div>
            <p className="text-gray-400 text-center mt-6">
              © 2025 Marhabo Mebellar. Barcha huquqlar himoyalangan.
            </p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .font-inter {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        .font-playfair {
          font-family: 'Playfair Display', Georgia, serif;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Typing cursor animation */
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>

      {/* Product Details Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold text-white">{selectedProduct.name}</h2>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-800 rounded-xl overflow-hidden">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-auto object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-green-400">
                          {selectedProduct.price.toLocaleString()} so'm
                        </p>
                        {selectedProduct.oldPrice && (
                          <p className="text-gray-400 line-through">
                            {selectedProduct.oldPrice.toLocaleString()} so'm
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="text-gray-300">
                          {selectedProduct.rating} ({selectedProduct.reviews} sharhlar)
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 text-gray-300">{selectedProduct.description}</p>

                    <div className="mt-6 space-y-4">
                      <h3 className="text-lg font-semibold text-white">Texnik xususiyatlari:</h3>
                      <ul className="space-y-2 text-gray-400">
                        <li>• Material: {selectedProduct.material || 'MDF, DKP'}</li>
                        <li>• O'lchami: {selectedProduct.dimensions || '120x60x75 sm'}</li>
                        <li>• Rangi: {selectedProduct.color || 'Oq, Qora'}</li>
                        <li>• Kafolat: {selectedProduct.warranty || '24 oy'}</li>
                      </ul>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-800">
                      <h3 className="text-lg font-semibold mb-3">Tavsif</h3>
                      <ul className="space-y-2 text-gray-400">
                        <li>• Material: {selectedProduct.material || 'MDF, DKP'}</li>
                        <li>• O'lchami: {selectedProduct.dimensions || '120x60x75 sm'}</li>
                        <li>• Rangi: {selectedProduct.color || 'Oq, Qora'}</li>
                        <li>• Kafolat: {selectedProduct.warranty || '24 oy'}</li>
                      </ul>
                    </div>

                    {/* Single Add to Cart button */}
                    <div className="mt-6">
                      <button
                        onClick={() => {
                          addToCart(selectedProduct);
                          setSelectedProduct(null);
                        }}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Savatga qo'shish
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Form Modal */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isOrderModalOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOrderModalOpen(false)} />
        <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-green-700/30">
          <OrderModal 
            isOpen={isOrderModalOpen}
            onClose={() => setIsOrderModalOpen(false)}
            onSubmit={handleOrderFormSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
      
      {/* Order Confirmation Modal */}
      {orderDetails && (
        <OrderConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          orderDetails={orderDetails}
          cartItems={orderDetails.items}
          total={orderDetails.total}
        />
      )}
      
      {/* Cart Modal */}
      <CartModal 
        isOpen={showCart} 
        onClose={closeCart}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
        onCheckout={handleCartCheckout}
      />
    </div>
  );
}