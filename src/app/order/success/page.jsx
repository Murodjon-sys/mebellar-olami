'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(!!orderId);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setError('Buyurtma raqami topilmadi');
      setIsLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error('Buyurtma ma\'lumotlari topilmadi');
        }
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err.message || 'Xatolik yuz berdi');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mt-3 text-lg font-medium text-gray-900">Xatolik</h2>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Bosh sahifaga qaytish
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircleIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Buyurtmangiz qabul qilindi!
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Buyurtma raqami: {order?._id || orderId}
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Xaridingiz uchun rahmat!</h4>
                <p className="mt-1 text-sm text-gray-900">
                  Tez orada siz bilan bog'lanamiz. Buyurtma holatini buyurtma raqami orqali tekshirishingiz mumkin.
                </p>
              </div>
              
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      Operatorlarimiz sizga {order?.phone || 'kiritgan telefon raqamingiz'} orqali qo'ng'iroq qilishadi. Iltimos, telefon qo'ng'iroqlariga e'tibor bering.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500">Buyurtma tafsilotlari</h4>
                <dl className="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
                  <div className="py-3 flex justify-between text-sm font-medium">
                    <dt className="text-gray-500">Buyurtma raqami</dt>
                    <dd className="text-gray-900">{order?._id || orderId}</dd>
                  </div>
                  <div className="py-3 flex justify-between text-sm font-medium">
                    <dt className="text-gray-500">Sana</dt>
                    <dd className="text-gray-900">
                      {order ? new Date(order.createdAt).toLocaleDateString('uz-UZ') : new Date().toLocaleDateString('uz-UZ')}
                    </dd>
                  </div>
                  <div className="py-3 flex justify-between text-sm font-medium">
                    <dt className="text-gray-500">To'lov usuli</dt>
                    <dd className="text-gray-900">
                      {order?.paymentMethod === 'cash' ? 'Naqd pul' : 'Karta orqali'}
                    </dd>
                  </div>
                  <div className="py-3 flex justify-between text-sm font-medium">
                    <dt className="text-gray-500">Jami to'lov</dt>
                    <dd className="text-gray-900">
                      {order?.total?.toLocaleString() || '0'} so'm
                    </dd>
                  </div>
                </dl>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => router.push('/')}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Bosh sahifaga qaytish
                </button>
                <button
                  onClick={() => router.push('/orders')}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Mening buyurtmalarim
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
