import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Star,
  Plus,
  Minus,
  MessageSquare,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCart } from "../../../contexts/CartContext";
import OrderModal from "../../../components/OrderModal";
import OrderConfirmationModal from "../../../components/OrderConfirmationModal";

export default function ProductDetailPage({ params }) {
  const { id } = params;
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showAddedModal, setShowAddedModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    comment: "",
  });
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const queryClient = useQueryClient();
  const { addToCart, getItemCount, cartItems } = useCart();

  // Fallback dataset (synchronous) used when API is unavailable
  const sampleProducts = [
    { id: 1, name: "Zamonaviy divan", price: 4500000, oldPrice: 5000000, description: "Zamonaviy dizayndagi qulay divan", image: "https://images.unsplash.com/photo-1555041463-a586ac61fa67?auto=format&fit=crop&w=1470&q=80", category: "divan", rating: 4.5, reviews: 24 },
    { id: 2, name: "Zamonaviy kreslo", price: 2500000, oldPrice: 3000000, description: "Zamonaviy dizayndagi qulay kreslo", image: "https://images.unsplash.com/photo-1503602642458-232111535657?auto=format&fit=crop&w=1374&q=80", category: "kreslo", rating: 4.8, reviews: 32 },
    { id: 3, name: "Zamonaviy stol", price: 3500000, oldPrice: 4000000, description: "Zamonaviy dizayndagi qulay stol", image: "https://images.unsplash.com/photo-1555041463-a586ac61fa67?auto=format&fit=crop&w=1470&q=80", category: "stol", rating: 4.7, reviews: 18 },
    { id: 4, name: "Minimalist Ofis Stoli 'NOVA'", price: 12500000, oldPrice: 14500000, description: "Zamonaviy minimalist ofis stoli.", image: "https://images.unsplash.com/photo-1595433707802-6b2626ef1b91?auto=format&fit=crop&w=1470&q=80", category: "Ofis mebellari", rating: 4.9, reviews: 42 },
    { id: 5, name: "Eko-charm Divan 'MILANO'", price: 18500000, oldPrice: 21000000, description: "Italiya dizayni bo'yicha ishlangan eko-charm divan.", image: "https://images.unsplash.com/photo-1556228578-9f3b8a869eb0?auto=format&fit=crop&w=1470&q=80", category: "Divanlar", rating: 5.0, reviews: 35 },
    { id: 6, name: "Aqlli Yotoq 'SMART BED' PRO", price: 22500000, oldPrice: 25000000, description: "Aqlli yotoq tizimi.", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1470&q=80", category: "Yotoq xonalari", rating: 4.8, reviews: 28 },
    { id: 7, name: "Premium Oshxona Stol Javoni 'ROYAL'", price: 18400000, oldPrice: 20500000, description: "Zamonaviy oshxona stol javoni.", image: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1470&q=80", category: "Oshxona mebellari", rating: 4.9, reviews: 31 },
    { id: 8, name: "Smart Shkaf 'INVISIBLE' PRO", price: 21500000, oldPrice: 23500000, description: "Aqlli shkaf tizimi.", image: "https://images.unsplash.com/photo-1618220250637-301483e6afc5?auto=format&fit=crop&w=1470&q=80", category: "Yotoq xonalari", rating: 5.0, reviews: 19 },
    { id: 9, name: "Gaming Stul 'PREDATOR X'", price: 6500000, oldPrice: 7500000, description: "Professional geymerlar uchun stul.", image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1470&q=80", category: "Ofis mebellari", rating: 4.7, reviews: 47 },
    { id: 10, name: "Modular Divan 'TRANSFORMER'", price: 17500000, oldPrice: 19500000, description: "Modul tizimida ishlangan divan.", image: "https://images.unsplash.com/photo-1616627561839-0bc5ccb595ec?auto=format&fit=crop&w=1470&q=80", category: "Divanlar", rating: 4.8, reviews: 23 },
    { id: 11, name: "Smart Stul 'ERGONOMIC PRO'", price: 12500000, oldPrice: 14500000, description: "Orqa qismi avtomatik sozlanadigan ofis stuli.", image: "https://images.unsplash.com/photo-1501045661006-fcebeec7ced1?auto=format&fit=crop&w=1471&q=80", category: "Ofis mebellari", rating: 4.9, reviews: 39 }
  ];

  // Mahsulot ma'lumotlarini olish
  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          return data.product;
        }
        throw new Error('API unavailable');
      } catch (e) {
        const pid = parseInt(id, 10);
        return sampleProducts.find(p => p.id === pid) || null;
      }
    },
    enabled: !!id,
  });

  // Mahsulot sharhlarini olish
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => {
      const response = await fetch(`/api/reviews?productId=${id}`);
      if (!response.ok) throw new Error("Sharhlar yuklanmadi");
      const data = await response.json();
      return data.reviews || [];
    },
    enabled: !!id,
  });

  // Sharh qo'shish
  const reviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...reviewData,
          product_id: id,
        }),
      });
      if (!response.ok) throw new Error("Sharh yuborishda xatolik");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews", id]);
      setShowReviewForm(false);
      setReviewForm({ name: "", rating: 5, comment: "" });
      alert("Sharhingiz muvaffaqiyatli qo'shildi!");
    },
  });

  React.useEffect(() => {
    if (product?.colors?.length > 0) {
      setSelectedColor(product.colors[0]);
    }
    if (product?.sizes?.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    // Map product to CartContext shape
    const cartProduct = {
      _id: String(product.id || id),
      name: product.name,
      price: product.price,
      image: product.image || product.image_url,
      description: product.description,
    };
    addToCart(cartProduct, quantity);
    setShowAddedModal(true);
  };

  // Open order modal from cart icon
  const openOrderModal = () => {
    setIsOrderModalOpen(true);
  };

  const calculateTotal = () => {
    return (cartItems || []).reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);
  };

  // Submit order from OrderModal
  const handleOrderFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      const newOrder = {
        id: Date.now(),
        ...formData,
        items: [...(cartItems || [])],
        total: calculateTotal(),
        status: 'Yangi',
        date: new Date().toLocaleString('uz-UZ')
      };
      setOrderDetails(newOrder);
      setIsOrderModalOpen(false);
      setShowConfirmation(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    reviewMutation.mutate(reviewForm);
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Mahsulot topilmadi
          </h2>
          <a href="/products" className="text-green-400 hover:underline">
            Mahsulotlar sahifasiga qaytish
          </a>
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
            <div className="flex items-center space-x-4">
              <a
                href="/products"
                className="p-2 hover:bg-green-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </a>
              <a href="/" className="text-2xl font-bold text-green-400">
                Marhabo Mebellar
              </a>
            </div>
            <button onClick={openOrderModal} className="relative p-2 text-gray-300 hover:text-green-400 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Product Image */}
          <div className="mb-8 lg:mb-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative bg-gradient-to-br from-gray-800 to-black rounded-2xl shadow-2xl overflow-hidden border border-green-700"
            >
              <img
                src={product.image || product.image_url}
                alt={product.name}
                className="w-full h-96 lg:h-[600px] object-cover"
              />
              <button className="absolute top-4 right-4 p-3 bg-black/70 rounded-full hover:bg-green-600 transition-colors">
                <Heart className="w-6 h-6 text-green-400 hover:text-white" />
              </button>
            </motion.div>
          </div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:pl-8"
          >
            {/* Breadcrumb */}
            <div className="mb-4">
              <span className="text-sm text-gray-400">
                <a href="/" className="hover:text-green-400">
                  Bosh sahifa
                </a>{" "}
                ›
                <a href="/products" className="hover:text-green-400">
                  {" "}
                  Mahsulotlar
                </a>{" "}
                ›{product.category}
              </span>
            </div>

            {/* Category Badge */}
            <div className="mb-4">
              <span className="px-3 py-1 text-sm font-semibold text-green-400 bg-green-900/30 rounded-full border border-green-700">
                {product.category}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 font-playfair">
              {product.name}
            </h1>

            {/* Rating */}
            {reviews.length > 0 && (
              <div className="flex items-center mb-6">
                <div className="flex items-center mr-3">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className={`w-5 h-5 ${
                        index < Math.round(averageRating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-300">
                  {averageRating.toFixed(1)} ({reviews.length} sharh)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mb-8">
              <span className="text-4xl font-bold text-green-400">
                {product.price?.toLocaleString()} so'm
              </span>
            </div>

            {/* Description */}
            <div className="mb-8">
              <div className="prose prose-invert text-gray-300 leading-7 text-lg">
                {product.description.split('Savatga qo\'shish').map((part, index) => (
                  <p key={index} className="mb-4">
                    {part.trim()}
                  </p>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            {product.colors?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Rang tanlang
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedColor === color
                          ? "border-green-400 bg-green-900/30 text-green-400"
                          : "border-gray-600 bg-gray-800 text-gray-300 hover:border-green-600"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes?.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-3">
                  O'lcham tanlang
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedSize === size
                          ? "border-green-400 bg-green-900/30 text-green-400"
                          : "border-gray-600 bg-gray-800 text-gray-300 hover:border-green-600"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">Miqdor</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Minus className="w-4 h-4 text-white" />
                </button>
                <span className="text-xl font-semibold px-6 text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Savatga qo'shish</span>
              </motion.button>

              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full flex items-center justify-center space-x-2 border-2 border-green-400 text-green-400 py-4 px-8 rounded-xl font-bold text-lg hover:bg-green-900/30 transition-all shadow-lg"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Sharh qoldirish</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white font-playfair">
              Sharhlar ({reviews.length})
            </h2>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-800 to-black p-8 rounded-2xl shadow-2xl border border-green-700 mb-8"
            >
              <h3 className="text-xl font-bold text-white mb-6">
                Sharh qoldiring
              </h3>
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-green-400 mb-2">
                    Ismingiz *
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewForm.name}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-gray-900 border border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-400 mb-2">
                    Baho *
                  </label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        rating: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-3 bg-gray-900 border border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white"
                  >
                    <option value={5}>5 - A'lo</option>
                    <option value={4}>4 - Yaxshi</option>
                    <option value={3}>3 - O'rta</option>
                    <option value={2}>2 - Yomon</option>
                    <option value={1}>1 - Juda yomon</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-400 mb-2">
                    Izoh
                  </label>
                  <textarea
                    rows={4}
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-gray-900 border border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400"
                    placeholder="Mahsulot haqidagi fikringizni yozing..."
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={reviewMutation.isLoading}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {reviewMutation.isLoading
                      ? "Yuborilmoqda..."
                      : "Sharh yuborish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="border border-gray-600 text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Bekor qilish
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-gradient-to-br from-gray-800 to-black p-6 rounded-2xl shadow-lg border border-green-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {review.customer_name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {review.customer_name}
                      </p>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            className={`w-4 h-4 ${
                              index < review.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(review.created_at).toLocaleDateString("uz-UZ")}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-gray-300 leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>

          {reviews.length === 0 && (
            <div className="text-center py-12">
              <p className="text-green-300 text-lg">Hozircha sharhlar yo'q</p>
              <p className="text-gray-400">
                Birinchi sharh qoldiruvchi bo'ling!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Added to Cart Modal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showAddedModal ? 1 : 0 }}
        style={{ pointerEvents: showAddedModal ? 'auto' : 'none' }}
        className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      >
        <div
          onClick={() => setShowAddedModal(false)}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.95, y: 10, opacity: 0 }}
          animate={{ scale: showAddedModal ? 1 : 0.95, y: showAddedModal ? 0 : 10, opacity: showAddedModal ? 1 : 0 }}
          className="relative max-w-sm w-full rounded-2xl border border-green-500/30 bg-gradient-to-br from-gray-900 to-black p-6 shadow-2xl text-center"
        >
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-green-600/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-green-400"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h3 className="text-white text-lg font-semibold">Mahsulot savatga qo'shildi</h3>
          <p className="text-gray-400 mt-1">{product.name} — {quantity} ta</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowAddedModal(false)}
              className="px-4 py-2 rounded-lg border border-gray-600 text-gray-200 hover:bg-gray-800"
            >
              Davom etish
            </button>
            <a
              href="/?cart=1"
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
            >
              Savatni ko'rish
            </a>
          </div>
        </motion.div>
      </motion.div>

      {/* Order Modal (Buyurtma) */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
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
      )}

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

      <style jsx global>{`
        .font-playfair {
          font-family: 'Playfair Display', Georgia, serif;
        }
      `}</style>
    </div>
  );
}
