import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Star, ShoppingCart, Minus, Plus, Check, Truck, 
  ShieldCheck, Clock, ShoppingBag, Heart, Share2, ChevronLeft, 
  ChevronRight, MessageSquare, ThumbsUp, CheckCircle, ChevronDown, ChevronUp 
} from 'lucide-react';

// Mock customer reviews data
const mockReviews = [
  {
    id: 1,
    author: 'Dilshod Toshpulatov',
    rating: 5,
    date: '2023-10-15',
    comment: 'Ajoyib mahsulot! Sifatli va qulay. Yetkazib berish ham juda tez bo\'ldi. Tashakkur!',
    likes: 12,
    hasLiked: false,
    images: [
      'https://images.unsplash.com/photo-1556228453-efd6d1f01958?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
    ]
  },
  {
    id: 2,
    author: 'Gulnora Karimova',
    rating: 4,
    date: '2023-10-10',
    comment: 'Yaxshi mahsulot, lekin ranglari rasmdagidan biroz farq qiladi. Umuman olganda qoniqarli.',
    likes: 5,
    hasLiked: true,
    images: []
  },
  {
    id: 3,
    author: 'Javohir Murodov',
    rating: 5,
    date: '2023-10-05',
    comment: 'Barcha kutganimdek chiqdi. Sotuvchilar ham tushunarli va mehribon. Katta rahmat!',
    likes: 8,
    hasLiked: false,
    images: [
      'https://images.unsplash.com/photo-1604061986763978-9a038f0c4fda?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
    ]
  }
];

const ProductModal = ({ product, isOpen, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlist, setIsWishlist] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [expandedReviews, setExpandedReviews] = useState({});
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', name: '', email: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Load reviews when component mounts
  useEffect(() => {
    // In a real app, you would fetch reviews for this product
    setReviews(mockReviews);
  }, [product?.id]);

  if (!isOpen || !product) return null;

  // Generate product images array with main image and additional images
  const productImages = [
    product.image,
    ...(product.additionalImages || []),
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    'https://images.unsplash.com/photo-1600585154518-3ddf5250f8ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
  ].filter(Boolean);

  // Product features
  const features = [
    { icon: <Truck className="w-5 h-5 text-green-400" />, text: "Bepul yetkazib berish" },
    { icon: <ShieldCheck className="w-5 h-5 text-blue-400" />, text: "2 yil kafolat" },
    { icon: <Clock className="w-5 h-5 text-amber-400" />, text: "Tez yetkazib berish" },
    { icon: <ShoppingBag className="w-5 h-5 text-purple-400" />, text: "Muddatli to'lov imkoniyati" }
  ];

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  // Handle image navigation
  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  // Handle quantity changes
  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  // Handle add to cart
  const handleAddToCart = () => {
    onAddToCart({ ...product, quantity });
    // Reset quantity after adding to cart
    setQuantity(1);
  };

  // Toggle review expansion
  const toggleReviewExpansion = (reviewId) => {
    setExpandedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  // Handle review like
  const handleLikeReview = (reviewId) => {
    setReviews(prev => 
      prev.map(review => 
        review.id === reviewId 
          ? { 
              ...review, 
              likes: review.hasLiked ? review.likes - 1 : review.likes + 1,
              hasLiked: !review.hasLiked 
            } 
          : review
      )
    );
  };

  // Handle review form input change
  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setNewReview(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle review submission
  const handleSubmitReview = (e) => {
    e.preventDefault();
    const newReviewObj = {
      id: Date.now(),
      author: newReview.name || 'Anonim',
      rating: parseInt(newReview.rating, 10),
      date: new Date().toISOString().split('T')[0],
      comment: newReview.comment,
      likes: 0,
      hasLiked: false,
      images: []
    };
    
    setReviews(prev => [newReviewObj, ...prev]);
    setNewReview({ rating: 5, comment: '', name: '', email: '' });
    setShowReviewForm(false);
  };

  // Render star rating
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  // Render product color options
  const renderColorOptions = () => {
    return product.colors?.map((color, index) => (
      <div key={index} className="flex items-center mr-4 mb-2">
        <div 
          className={`w-6 h-6 rounded-full border-2 border-gray-200 mr-2 cursor-pointer ${selectedImage === index ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
          style={{ backgroundColor: color === 'qora' ? '#000' : 
                             color === 'oq' ? '#fff' :
                             color === 'kulrang' ? '#808080' :
                             color === 'jigarrang' ? '#8B4513' :
                             color === 'kok' ? '#0000FF' :
                             color === 'yashil' ? '#008000' :
                             color === 'pushti' ? '#FFC0CB' :
                             color === 'kumush' ? '#C0C0C0' :
                             color === 'yong\'oq' ? '#F5DEB3' : '#fff' }}
          onClick={() => setSelectedImage(index)}
        />
        <span className="text-sm text-gray-600 capitalize">{color}</span>
      </div>
    ));
  };

  // Render product specifications
  const renderSpecifications = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Asosiy xususiyatlar</h4>
          <div className="text-sm text-gray-600">
            <p><span className="font-medium">Mahsulot turi:</span> {product.category}</p>
            <p><span className="font-medium">Material:</span> {product.material || 'Mavjud emas'}</p>
            <p><span className="font-medium">Hajmi:</span> {product.dimensions || 'Mavjud emas'}</p>
            <p><span className="font-medium">Rang:</span> {product.colors?.join(', ') || 'Mavjud emas'}</p>
            <p><span className="font-medium">SKU:</span> {product.sku || 'Mavjud emas'}</p>
          </div>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Qo'shimcha ma'lumot</h4>
          <div className="text-sm text-gray-600">
            <p><span className="font-medium">Kafolat:</span> 24 oy</p>
            <p><span className="font-medium">Yetkazib berish:</span> 3-5 ish kuni</p>
            <p><span className="font-medium">To'lov usullari:</span> Naqd, karta, muddatli to'lov</p>
            <p><span className="font-medium">Mavjudligi:</span> {product.inStock ? 'Sotuvda mavjud' : 'Tugab qolgan'}</p>
          </div>
        </div>
      </div>
    );
  };

  // Render reviews section
  const renderReviews = () => {
    return (
      <div className="mt-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Mijozlar fikrlari</h3>
            <div className="flex items-center mt-1">
              <div className="flex">
                {renderStars(Math.round(averageRating))}
              </div>
              <span className="ml-2 text-sm text-gray-600">{averageRating} ({reviews.length} ta fikr)</span>
            </div>
          </div>
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Fikr qoldirish
          </button>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="text-lg font-medium mb-4">Fikr qoldirish</h4>
            <form onSubmit={handleSubmitReview}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Ismingiz</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newReview.name}
                    onChange={handleReviewChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ismingiz"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email (ixtiyoriy)</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newReview.email}
                    onChange={handleReviewChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Baholash</label>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      className="focus:outline-none"
                    >
                      <Star 
                        className={`w-6 h-6 ${star <= newReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Fikr-mulohaza</label>
                <textarea
                  id="comment"
                  name="comment"
                  rows="4"
                  value={newReview.comment}
                  onChange={handleReviewChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mahsulot haqida fikringiz..."
                  required
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Yuborish
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <div className="flex justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{review.author}</h4>
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                      <span className="ml-2 text-xs text-gray-500">{review.date}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleLikeReview(review.id)}
                    className={`flex items-center text-sm ${review.hasLiked ? 'text-blue-600' : 'text-gray-500'} hover:text-blue-600`}
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    <span>{review.likes}</span>
                  </button>
                </div>
                <div className="mt-2">
                  <p className={`text-sm text-gray-600 ${!expandedReviews[review.id] && 'line-clamp-3'}`}>
                    {review.comment}
                  </p>
                  {review.comment.length > 200 && (
                    <button
                      onClick={() => toggleReviewExpansion(review.id)}
                      className="mt-1 text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
                    >
                      {expandedReviews[review.id] ? 'Kamroq ko\'rsatish' : 'Ko\'proq o\'qish'}
                    </button>
                  )}
                </div>
                
                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="mt-3 flex space-x-2 overflow-x-auto pb-2">
                    {review.images.map((img, idx) => (
                      <div key={idx} className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border border-gray-200">
                        <img 
                          src={img} 
                          alt={`Review ${review.id} image ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Hozircha fikrlar mavjud emas</h3>
            <p className="mt-1 text-sm text-gray-500">Birinchi bo'lib fikr bildiring!</p>
            <div className="mt-6">
              <button
                onClick={() => setShowReviewForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Fikr qoldirish
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render the main modal content
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div className="inline-block align-bottom bg-gradient-to-br from-gray-900 to-black rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full border border-green-700">
          <div className="bg-gradient-to-br from-gray-900 to-black p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold text-white">{product.name}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Images */}
              <div>
                <div className="relative h-96 bg-gray-800 rounded-xl overflow-hidden mb-4">
                  <img
                    src={productImages[selectedImage] || product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <button className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70">
                    <Star className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {productImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${selectedImage === idx ? 'border-green-500' : 'border-transparent'}`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {renderStars(product.rating)}
                    <span className="ml-2 text-sm text-gray-400">
                      {product.rating.toFixed(1)} (24 sharh)
                    </span>
                  </div>
                  <span className="mx-2 text-gray-600">|</span>
                  <span className="text-green-400 text-sm font-medium">Sotuvda mavjud</span>
                </div>

                <div className="text-3xl font-bold text-white mb-6">
                  {product.price.toLocaleString()} so'm
                </div>

                <p className="text-gray-300 mb-6">{product.description}</p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center">
                    <div className="w-32 text-gray-400">Rangi:</div>
                    <div className="flex space-x-2">
                      {['Oq', 'Qora', 'Kulrang', 'Jigarrang'].map((color, idx) => (
                        <button
                          key={idx}
                          className="w-8 h-8 rounded-full border-2 border-transparent hover:border-green-500"
                          style={{ backgroundColor: color.toLowerCase() }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-32 text-gray-400">Miqdori:</div>
                    <div className="flex items-center border border-gray-700 rounded-lg">
                      <button
                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        className="px-3 py-1 text-gray-300 hover:bg-gray-800 h-full"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center text-white">{quantity}</span>
                      <button
                        onClick={() => setQuantity(prev => prev + 1)}
                        className="px-3 py-1 text-gray-300 hover:bg-gray-800 h-full"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onAddToCart(product, quantity)}
                  className="w-full flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 px-6 rounded-lg transition-all shadow-lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Savatga qo'shish
                </button>

                <div className="mt-6 pt-6 border-t border-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-3">Afzalliklar</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        {feature.icon}
                        <span className="text-sm text-gray-300">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-8 border-b border-gray-800">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {['description', 'specifications', 'reviews'].map((tab) => {
                  const tabNames = {
                    description: 'Tavsifi',
                    specifications: 'Texnik xususiyatlari',
                    reviews: 'Sharhlar',
                  };
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                        activeTab === tab
                          ? 'border-green-500 text-green-400'
                          : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {tabNames[tab]}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Panels */}
            <div className="py-6">
              {activeTab === 'description' && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Mahsulot haqida</h3>
                  <p className="text-gray-300">
                    {product.description} Ushbu mahsulot zamonaviy dizaynga ega bo'lib, uy va ofis uchun ajoyib tanlov hisoblanadi. Yuqori sifatli materiallardan tayyorlangan bo'lib, uzoq muddat xizmat qiladi.
                  </p>
                  <ul className="mt-4 space-y-2 text-gray-300">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Yuqori sifatli materiallar</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Zamonaviy dizayn</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Qulaylik va qulaylik</span>
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-white mb-3">Asosiy xususiyatlar</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between border-b border-gray-800 pb-2">
                        <span className="text-gray-400">Brend</span>
                        <span className="text-white">Marhabo Mebellar</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-800 pb-2">
                        <span className="text-gray-400">Model</span>
                        <span className="text-white">{product.name.split("'")[1]?.replace("'", "") || 'Standard'}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-800 pb-2">
                        <span className="text-gray-400">Rangi</span>
                        <span className="text-white">Oq, Qora, Jigarrang</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-800 pb-2">
                        <span className="text-gray-400">Material</span>
                        <span className="text-white">MDF, DVP, Ekokozhir</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-3">O'lchamlari</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between border-b border-gray-800 pb-2">
                        <span className="text-gray-400">Balandligi</span>
                        <span className="text-white">85 sm</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-800 pb-2">
                        <span className="text-gray-400">Kengligi</span>
                        <span className="text-white">120 sm</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-800 pb-2">
                        <span className="text-gray-400">Chuqurligi</span>
                        <span className="text-white">60 sm</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-800 pb-2">
                        <span className="text-gray-400">Og'irligi</span>
                        <span className="text-white">25 kg</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-white">Mijozlar fikrlari</h3>
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
                      Sharh qoldirish
                    </button>
                  </div>

                  <div className="space-y-6">
                    {[1, 2].map((review) => (
                      <div key={review} className="bg-gray-800/50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-white">
                              {review === 1 ? 'Fayzullayev Jamshid' : 'Nodira Xalilova'}
                            </h4>
                            <div className="flex items-center mt-1">
                              {renderStars(review === 1 ? 5 : 4)}
                              <span className="text-xs text-gray-400 ml-2">
                                {review === 1 ? '2023-10-15' : '2023-09-28'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="mt-2 text-gray-300">
                          {review === 1 
                            ? "Ajoyib mahsulot, sifatli va qulay. Yetkazib berish ham juda tez bo'ldi. Rahmat!"
                            : "Yaxshi mahsulot, lekin ranglari rasmdagidan biroz farq qiladi."}
                        </p>
                        <div className="flex items-center mt-4 text-sm text-gray-400 space-x-4">
                          <button className="flex items-center hover:text-green-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            {review === 1 ? '24' : '12'} Foydali
                          </button>
                          <button className="flex items-center hover:text-red-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            Foydali emas
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
