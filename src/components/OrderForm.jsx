'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export default function OrderForm() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const [formData, setFormData] = useState({
  customerName: '',
    phone: '',
    address: '',
    paymentMethod: 'cash',
    note: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.phone || !formData.address) {
      setError('Iltimos, barcha maydonlarni to\'ldiring');
      return;
    }

    if (cartItems.length === 0) {
      setError('Savat bo\'sh');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const orderData = {
        ...formData,
        items: cartItems.map((item) => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Buyurtma yuborishda xatolik yuz berdi');
      }

      const result = await response.json();
      
      // Clear cart and redirect to success page
      clearCart();
      navigate(`/order/success?orderId=${result.data._id}`);
      
    } catch (err) {
      console.error('Order submission error:', err);
      setError(err.message || 'Xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If cart is empty, redirect to home
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/');
    }
  }, [cartItems, navigate]);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Savat bo'sh</h2>
          <p>Siz hali hech qanday mahsulot qo'shmagansiz</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
              Buyurtma ma'lumotlari
            </h3>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
                  Ismingiz <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <input
                    type="text"
                    name="customerName"
                    id="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Telefon raqamingiz <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Manzil <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <textarea
                    name="address"
                    id="address"
                    rows={3}
                    value={formData.address}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <label className="block text-sm font-medium text-gray-700">
                  To'lov usuli <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="cash"
                        name="paymentMethod"
                        type="radio"
                        value="cash"
                        checked={formData.paymentMethod === 'cash'}
                        onChange={handleChange}
                        className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300"
                      />
                      <label htmlFor="cash" className="ml-3 block text-sm font-medium text-gray-700">
                        Naqd pul orqali
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="card"
                        name="paymentMethod"
                        type="radio"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={handleChange}
                        className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300"
                      />
                      <label htmlFor="card" className="ml-3 block text-sm font-medium text-gray-700">
                        Karta orqali
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                  Qo'shimcha izoh
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <textarea
                    name="note"
                    id="note"
                    rows={3}
                    value={formData.note}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Qo'shimcha izoh yozishingiz mumkin..."
                  />
                </div>
              </div>

              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                {error && (
                  <p className="text-red-500 text-sm mb-4">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${isSubmitting ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                >
                  {isSubmitting ? 'Yuborilmoqda...' : 'Buyurtma berish'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Buyurtma xulosasi
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              {cartItems.map((item) => (
                <div key={item._id} className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    {item.name}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {item.quantity} x {item.price.toLocaleString()} so'm = {(item.quantity * item.price).toLocaleString()} so'm
                  </dd>
                </div>
              ))}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-lg font-bold text-gray-900">
                  Jami:
                </dt>
                <dd className="mt-1 text-lg font-bold text-gray-900 sm:mt-0 sm:col-span-2">
                  {cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()} so'm
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
