import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Heart,
  ShoppingCart,
  Star,
  ChevronDown,
  X,
  StarHalf,
  User,
  MessageSquare,
  Share2,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ProductModal from "../../components/ProductModal";
import CartModal from "../../components/CartModal";
import OrderModal from "../../components/OrderModal";
import FeedbackModal from "../../components/FeedbackModal";
import { useCart } from "../../contexts/CartContext";
import { useNavigate } from "react-router-dom";

// Customer Reviews Component
const CustomerReviews = () => {
  const reviews = [
    {
      id: 1,
      name: "Fayzullayev Jamshid",
      rating: 5,
      date: "2023-10-15",
      comment: "Ajoyib mahsulot, sifatli va qulay. Yetkazib berish ham juda tez bo'ldi. Rahmat!",
      likes: 24,
      images: ["/review1.jpg", "/review2.jpg"]
    },
    {
      id: 2,
      name: "Nodira Xalilova",
      rating: 4,
      date: "2023-09-28",
      comment: "Yaxshi mahsulot, lekin ranglari rasmdagidan biroz farq qiladi.",
      likes: 12,
      images: []
    },
    {
      id: 3,
      name: "Shoxruh Qodirov",
      rating: 5,
      date: "2023-11-05",
      comment: "O'z narxiga juda yaxshi mahsulot. Sifatli ishlangan, yetkazib berish ham tez bo'ldi.",
      likes: 18,
      images: ["/review3.jpg"]
    },
    {
      id: 4,
      name: "Dilfuza Karimova",
      rating: 5,
      date: "2023-10-30",
      comment: "O'zim uchun ajoyib xarid bo'ldi. Uyimga juda mos keldi. Rahmat!",
      likes: 15,
      images: []
    }
  ];

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
      />
    ));
  };

  return (
    <section id="reviews" className="py-12 bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Mijozlarimiz Fikrlari</h2>
          <p className="text-lg text-green-300">Bizning mijozlarimiz biz haqimizda nima deyishadi</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <motion.div 
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: review.id * 0.1 }}
              className="bg-gray-800/50 p-6 rounded-2xl border border-green-700/30 hover:border-green-500/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-green-900/50 flex items-center justify-center text-green-400">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{review.name}</h4>
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                      <span className="text-xs text-gray-400 ml-2">{review.date}</span>
                    </div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-green-400">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-gray-300 mb-4">{review.comment}</p>
              
              {review.images.length > 0 && (
                <div className="flex space-x-2 mb-4">
                  {review.images.map((img, idx) => (
                    <div key={idx} className="w-16 h-16 rounded-md overflow-hidden">
                      <img 
                        src={img} 
                        alt={`Review ${review.id} - ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-400">
                <button className="flex items-center hover:text-green-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  {review.likes} Foydali
                </button>
                <button className="flex items-center hover:text-green-400">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Javob yozish
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
            Barcha sharhlarni ko'rish
          </button>
        </div>
      </div>
    </section>
  );
};

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ open: false, type: 'success', title: '', message: '' });

  // Global cart context
  const { cartItems, addToCart: addToCartCtx, removeFromCart, updateQuantity, getItemCount } = useCart();
  const navigate = useNavigate();
  
  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };
  
  const closeProductModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
  };
  
  const [notification, setNotification] = useState({ show: false, message: '' });

  // Add to global cart and show toast
  const addToCart = (product, quantity = 1) => {
    if (!product) return;
    const mapped = {
      _id: String(product.id ?? product._id ?? Date.now()),
      name: product.name,
      price: product.price,
      image: product.image || product.image_url,
      description: product.description,
    };
    addToCartCtx(mapped, quantity);
    setNotification({ show: true, message: `${quantity} ta "${product.name}" savatga qo'shildi` });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
  };

  // Open order modal from cart without navigating away
  const handleCartCheckout = () => {
    setShowCart(false);
    setIsOrderModalOpen(true);
  };

  // Submit order and stay on this page
  const handleOrderFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      const base = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');
      const res = await fetch(`${base}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.fullName || formData.customerName,
          phone: formData.phone,
          address: formData.address,
          paymentMethod: formData.paymentMethod,
          cardNumber: formData.cardNumber,
          items: (cartItems || []).map(i => ({ productId: i._id, name: i.name, price: i.price, quantity: i.quantity || 1 }))
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Buyurtma xatosi');
      setIsOrderModalOpen(false);
      try { localStorage.removeItem('cart'); } catch {}
      (cartItems || []).forEach(i => removeFromCart(i._id || i.id));
      setFeedback({ open: true, type: 'success', title: 'Muvaffaqiyatli', message: 'Buyurtma muvaffaqiyatli yuborildi!' });
    } catch (e) {
      console.error('Order submit error:', e);
      setFeedback({ open: true, type: 'error', title: 'Xatolik', message: "Buyurtma yuborishda xatolik. Iltimos qaytadan urinib ko'ring." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kategoriyalar
  const categories = [
    { id: "", name: "Barcha mahsulotlar" },
    { id: "divan", name: "Divanlar" },
    { id: "stol", name: "Stollar" },
    { id: "shkaf", name: "Shkaflar" },
    { id: "stul", name: "Stullar" },
    { id: "krovat", name: "Krovatlar" },
    { id: "komod", name: "Komodlar" },
    { id: "jurnallar_ustoni", name: "Jurnallar ustonlari" },
    { id: "tumba", name: "Tumbalar" },
    { id: "shkaf_ichki_qismi", name: "Shkaf ichki qismlari" },
  ];

  // Saralash variantlari
  const sortOptions = [
    { id: "name", name: "Nomi bo'yicha" },
    { id: "price_asc", name: "Narx: pastdan yuqoriga" },
    { id: "price_desc", name: "Narx: yuqoridan pastga" },
    { id: "newest", name: "Eng yangi" },
  ];

  // Namuna mahsulotlar
  const sampleProducts = [
    // Divanlar
    { 
      id: 1, 
      name: "Lyuks divan 'Komfort'", 
      category: "divan", 
      price: 8500000, 
      rating: 4.8, 
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80", 
      description: "Zamonaviy dizayndagi qulay divan. Yumshoq va qulay o'rindiqli, uy va ofis uchun ajoyib tanlov.",
      material: "Mikrofiber mato, yog'och ramka",
      dimensions: "220 x 90 x 85 sm",
      colors: ["qora", "kulrang", "jigarrang"],
      inStock: true,
      sku: "DIV-001"
    },
    { 
      id: 2, 
      name: "Bolg'ali divan 'Premier'", 
      category: "divan", 
      price: 9500000, 
      rating: 4.9, 
      image: "https://images.unsplash.com/photo-1556228453-efd6d1f01958?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80", 
      description: "Bolg'ali, yumshoq o'rinli divan. Keng oilalar uchun ideal yechim.",
      material: "Charm, metall ramka",
      dimensions: "240 x 100 x 90 sm",
      colors: ["qora", "jigarrang", "kok"],
      inStock: true,
      sku: "DIV-002"
    },
    { 
      id: 3, 
      name: "Burchakli divan 'Lyuksor'", 
      category: "divan", 
      price: 12500000, 
      rating: 5.0, 
      image: "https://images.unsplash.com/photo-1604061986763978-9a038f0c4fda?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80", 
      description: "Keng va qulay burchakli divan. Katta xonalar uchun ajoyib tanlov.",
      material: "Jenshen mato, yog'och ramka",
      dimensions: "280 x 180 x 90 sm",
      colors: ["kulrang", "kok", "yashil"],
      inStock: true,
      sku: "DIV-003"
    },
    
    // Stollar
    { 
      id: 4, 
      name: "Dasturxon stoli 'Oq shoh'", 
      category: "stol", 
      price: 3500000, 
      rating: 4.7, 
      image: "https://images.unsplash.com/photo-1567016432779-094069958ea5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80", 
      description: "4 kishilik klassik dasturxon stoli. Zamonaviy va shinam dizayn.",
      material: "MDF, metall oyoqlar",
      dimensions: "140 x 80 x 75 sm",
      colors: ["oq", "yong'oq"],
      inStock: true,
      sku: "STL-001"
    },
    { 
      id: 5, 
      name: "Keng stol 'Grand'", 
      category: "stol", 
      price: 4200000, 
      rating: 4.8, 
      image: "https://images.unsplash.com/photo-1555041469-a5c6f6bcafcc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80", 
      description: "6-8 kishilik keng dasturxon stoli. Katta oilalar va mehmonxonalar uchun ajoyib tanlov.",
      material: "Shisha, metall ramka",
      dimensions: "200 x 100 x 75 sm",
      colors: ["qora", "kumush"],
      inStock: true,
      sku: "STL-002"
    },
    
    // Shkaflar
    { 
      id: 6, 
      name: "Shkaf 'Lider 2.5m'", 
      category: "shkaf", 
      price: 6800000, 
      rating: 4.9, 
      image: "https://images.unsplash.com/photo-1556909211-36987c9697ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80", 
      description: "Keng va zamonaviy shkaf. Barcha kiyimlaringizni saqlash uchun keng joy.",
      material: "MDF, shisha, metall",
      dimensions: "250 x 60 x 200 sm",
      colors: ["oq", "yong'oq", "qora"],
      inStock: true,
      sku: "SHK-001"
    },
    
    // Stullar
    { 
      id: 8, 
      name: "Ofis stuli 'Komfort'", 
      category: "stul", 
      price: 1200000, 
      rating: 4.5, 
      image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80", 
      description: "Qulay ofis stuli. Uzoq vaqt o'tirishda ham qulaylik ta'minlaydi.",
      material: "Nafas oladigan to'qima, metall ramka",
      dimensions: "60 x 60 x 100 sm",
      colors: ["qora", "kok", "qizil"],
      inStock: true,
      sku: "STU-001"
    },
    
    // Krovatlar
    { 
      id: 10, 
      name: "Ikki qavatli krovat 'Yoshligim'", 
      category: "krovat", 
      price: 3800000, 
      rating: 4.7, 
      image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80", 
      description: "Bola xonalari uchun qulay va xavfsiz ikki qavatli krovat.",
      material: "Tabiiy yog'och, ekologik toza bo'yoq",
      dimensions: "200 x 120 x 180 sm",
      colors: ["kok", "yashil", "pushti"],
      inStock: true,
      sku: "KRO-001"
    }
  ];

  // Mahsulotlarni olish
  const {
    data: products = sampleProducts, // Namuna ma'lumotlardan foydalanish
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", searchTerm, selectedCategory, priceRange],
    queryFn: async () => {
      // API orqali ma'lumot o'rniga namuna ma'lumotlardan foydalanish
      let filteredProducts = [...sampleProducts];
      
      // Filtrlash
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredProducts = filteredProducts.filter(
          product => product.name.toLowerCase().includes(term) || 
                    product.description.toLowerCase().includes(term)
        );
      }
      
      if (selectedCategory) {
        filteredProducts = filteredProducts.filter(
          product => product.category === selectedCategory
        );
      }
      
      if (priceRange.min) {
        filteredProducts = filteredProducts.filter(
          product => product.price >= Number(priceRange.min)
        );
      }
      
      if (priceRange.max) {
        filteredProducts = filteredProducts.filter(
          product => product.price <= Number(priceRange.max)
        );
      }
      
      return filteredProducts;
    },
  });

  // Saralangan mahsulotlar
  const sortedProducts = React.useMemo(() => {
    if (!products?.length) return [];

    const sorted = [...products];

    switch (sortBy) {
      case "price_asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "price_desc":
        return sorted.sort((a, b) => b.price - a.price);
      case "newest":
        return sorted.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
      default:
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [products, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setPriceRange({ min: "", max: "" });
    setSortBy("name");
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Xatolik yuz berdi
          </h2>
          <p className="text-gray-600">Mahsulotlarni yuklashda muammo bo'ldi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-black">
      {/* Header */}
      <header className="bg-gradient-to-r from-black to-green-900 shadow-2xl border-b border-green-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="text-2xl font-bold text-green-400">
              Marhabo Mebellar
            </a>

            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="/"
                className="text-gray-300 hover:text-green-400 font-medium transition-colors"
              >
                Bosh sahifa
              </a>
              <span className="text-green-400 font-medium">Mahsulotlar</span>
              <a
                href="/#reviews"
                className="text-gray-300 hover:text-green-400 font-medium transition-colors"
              >
                Sharhlar
              </a>
              <a
                href="/#contact"
                className="text-gray-300 hover:text-green-400 font-medium transition-colors"
              >
                Bog'lanish
              </a>
            </nav>

            <button onClick={() => setShowCart(true)} className="relative p-2 text-gray-300 hover:text-green-400 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {getItemCount && getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 font-playfair">
            Mahsulotlar
          </h1>
          <p className="text-xl text-green-300">
            Barcha mahsulotlarimiz bilan tanishing
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-gradient-to-r from-gray-800 to-black rounded-2xl shadow-2xl border border-green-700 p-6 mb-8">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mb-6">
            <div className="relative">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-green-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Mahsulotlarni qidiring..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-4 py-4 bg-gray-900 border border-green-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg text-white placeholder-gray-400"
              />
            </div>
          </form>

          {/* Filter Toggle - Mobile */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filtrlar</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {/* Filters */}
          <div
            className={`grid grid-cols-1 lg:grid-cols-4 gap-6 ${showFilters || "hidden lg:grid"}`}
          >
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-green-400 mb-2">
                Kategoriya
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-semibold text-green-400 mb-2">
                Narx oralig'i
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange((prev) => ({ ...prev, min: e.target.value }))
                  }
                  className="w-full px-3 py-3 bg-gray-900 border border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange((prev) => ({ ...prev, max: e.target.value }))
                  }
                  className="w-full px-3 py-3 bg-gray-900 border border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-semibold text-green-400 mb-2">
                Saralash
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex flex-col justify-end space-y-2">
              <button
                onClick={clearFilters}
                className="px-4 py-3 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white rounded-lg transition-colors"
              >
                Filtrlarni tozalash
              </button>
            </div>
          </div>
        </div>

        {/* View Mode & Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-green-300">
            {sortedProducts.length} ta mahsulot topildi
          </p>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${viewMode === "grid" ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${viewMode === "list" ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-400 mx-auto"></div>
            <p className="mt-4 text-green-300">Mahsulotlar yuklanmoqda...</p>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-green-300 mb-4">
              Hech qanday mahsulot topilmadi
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Filtrlarni tozalash
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-6"
              }
          >
            {sortedProducts.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => openProductModal(product)}
                className={
                  viewMode === "grid"
                    ? "bg-gradient-to-br from-gray-800 to-black rounded-2xl shadow-2xl overflow-hidden border border-green-700 cursor-pointer transition-all hover:border-green-500"
                    : "bg-gradient-to-br from-gray-800 to-black rounded-2xl shadow-2xl overflow-hidden border border-green-700 flex flex-col sm:flex-row cursor-pointer transition-all hover:border-green-500"
                }
              >
                {viewMode === "grid" ? (
                  <>
                    <div className="relative">
                      <img
                        src={product.image || product.image_url}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      <button className="absolute top-4 right-4 p-2 bg-black/70 rounded-full hover:bg-green-600 transition-colors">
                        <Heart className="w-4 h-4 text-green-400 hover:text-white" />
                      </button>
                      {product.featured && (
                        <span className="absolute top-4 left-4 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                          Tavsiya
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="mb-2">
                        <span className="px-2 py-1 text-xs font-semibold text-green-400 bg-green-900/30 rounded-full border border-green-700">
                          {product.category}
                        </span>
                      </div>

                      <h3 className="font-bold text-white mb-2">
                        {product.name}
                      </h3>
                      <p className="text-gray-300 mb-3 text-sm line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <span className="text-xl sm:text-lg font-bold text-green-400">
                          {product.price?.toLocaleString()} so'm
                        </span>
                        <div className="flex w-full sm:w-auto">
                          <button
                            onClick={(e) => { e.stopPropagation(); openProductModal(product); }}
                            className="w-full sm:w-auto border border-green-600 text-green-400 px-4 py-2 rounded-lg hover:bg-green-600 hover:text-white transition-colors text-sm font-semibold"
                          >
                            Tafsilot
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-full sm:w-48 flex-shrink-0 h-40 sm:h-auto">
                      <img
                        src={product.image || product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <span className="px-3 py-1 text-xs font-semibold text-green-400 bg-green-900/30 rounded-full border border-green-700 mb-2 inline-block">
                            {product.category}
                          </span>
                          {product.featured && (
                            <span className="ml-2 px-3 py-1 text-xs font-semibold bg-green-600 text-white rounded-full">
                              Tavsiya
                            </span>
                          )}
                          <h3 className="text-xl font-bold text-white mb-2 mt-2">
                            {product.name}
                          </h3>
                          <p className="text-gray-300 mb-4">
                            {product.description}
                          </p>
                        </div>
                        <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
                          <Heart className="w-5 h-5 text-green-400 hover:text-white" />
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <span className="text-2xl sm:text-xl font-bold text-green-400">
                          {product.price?.toLocaleString()} so'm
                        </span>
                        <div className="flex w-full sm:w-auto">
                          <button
                            onClick={(e) => { e.stopPropagation(); openProductModal(product); }}
                            className="w-full sm:w-auto border border-green-600 text-green-400 px-5 py-2.5 rounded-lg hover:bg-green-600 hover:text-white transition-colors font-semibold text-sm"
                          >
                            Tafsilot
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <ProductModal 
            product={selectedProduct} 
            isOpen={isModalOpen} 
            onClose={closeProductModal}
            onAddToCart={addToCart}
          />
        )}
      </AnimatePresence>

      {/* Global Cart Modal */}
      <CartModal
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cartItems={cartItems || []}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateQuantity}
        onCheckout={handleCartCheckout}
      />

      {/* Order Modal for checkout on this page */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSubmit={handleOrderFormSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Animated feedback modal */}
      <FeedbackModal
        open={feedback.open}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        onClose={() => setFeedback((s) => ({ ...s, open: false }))}
      />

      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center"
          >
            <Check className="w-5 h-5 mr-2" />
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .font-playfair {
          font-family: 'Playfair Display', Georgia, serif;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
