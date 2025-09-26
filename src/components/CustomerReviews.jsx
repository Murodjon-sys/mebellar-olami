'use client';

import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const CustomerReviews = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const reviews = [
    {
      id: 1,
      name: 'Dilfuza Rahimova',
      rating: 5,
      date: '15 Iyul, 2024',
      comment: 'Ajoyib mahsulot! Sifatli va qulay. Yetkazib berish ham juda tez bo\'ldi. Tashakkur!',
      product: 'Lyuks divan "Komfort"',
      productImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
    },
    {
      id: 2,
      name: 'Javohir Toshpulatov',
      rating: 4,
      date: '10 Iyul, 2024',
      comment: 'Yaxshi mahsulot, lekin ranglari rasmdagidan biroz farq qiladi. Umuman olganda qoniqarli.',
      product: 'Bolg\'ali divan "Premier"',
      productImage: 'https://images.unsplash.com/photo-1556228453-efd6d1f01958?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
    },
    {
      id: 3,
      name: 'Gulnora Karimova',
      rating: 5,
      date: '5 Iyul, 2024',
      comment: 'Barcha kutganimdek chiqdi. Sotuvchilar ham tushunarli va mehribon. Katta rahmat!',
      product: 'Burchakli divan "Lyuksor"',
      productImage: 'https://images.unsplash.com/photo-1604061986763978-9a038f0c4fda?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
    },
    {
      id: 4,
      name: 'Shahzod Murodov',
      rating: 5,
      date: '1 Iyul, 2024',
      comment: 'O\'zbekistondagi eng yaxshi mebel do\'koni. Har doim sifatli mahsulotlar va yaxshi xizmat.',
      product: 'Dasturxon stoli "Oq shoh"',
      productImage: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
    },
    {
      id: 5,
      name: 'Dilshod Toshpulatov',
      rating: 4,
      date: '25 Iyun, 2024',
      comment: 'Yetkazib berish vaqti aniq edi. Mahsulot sifatli, lekin o\'rnatish bo\'yicha qo\'llanma yo\'q edi.',
      product: 'Shkaf "Lider 2.5m"',
      productImage: 'https://images.unsplash.com/photo-1556909211-36987c9697ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === Math.ceil(reviews.length / 2) - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? Math.ceil(reviews.length / 2) - 1 : prev - 1));
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  // Split reviews into pairs for carousel
  const reviewPairs = [];
  for (let i = 0; i < reviews.length; i += 2) {
    reviewPairs.push(reviews.slice(i, i + 2));
  }

  return (
    <section id="reviews" className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Mijozlarimiz Fikrlari</h2>
          <div className="w-20 h-1 bg-green-500 mx-auto"></div>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Bizning mijozlarimiz biz haqimizda nima deyishadi. Siz ham fikringizni qoldiring!
          </p>
        </div>

      

      <div className="relative mt-12">
        {reviewPairs.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white p-2 rounded-full shadow-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white p-2 rounded-full shadow-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Next review"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        <div className="overflow-hidden">
          <motion.div
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
              width: `${reviewPairs.length * 100}%`,
            }}
          >
            {reviewPairs.map((pair, index) => (
              <div key={index} className="w-full flex-shrink-0 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {pair.map((review) => (
                    <div key={review.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <div className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                          <span className="ml-2 text-sm text-gray-500">{review.date}</span>
                        </div>
                        
                        <p className="text-gray-700 italic mb-4 relative">
                          <Quote className="w-6 h-6 text-green-100 absolute -top-2 -left-2" />
                          <span className="relative z-10">{review.comment}</span>
                        </p>
                        
                        <div className="flex items-center mt-6">
                          <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-4">
                            <img 
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=4CAF50&color=fff`} 
                              alt={review.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{review.name}</h4>
                            <p className="text-sm text-gray-500">{review.product} xaridori</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-md overflow-hidden mr-3">
                              <img 
                                src={review.productImage} 
                                alt={review.product}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{review.product}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
        
        {reviewPairs.length > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {reviewPairs.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-green-500' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
    </section>
  );
};

export default CustomerReviews;
