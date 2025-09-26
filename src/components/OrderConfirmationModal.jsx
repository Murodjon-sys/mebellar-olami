import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';

export default function OrderConfirmationModal({ isOpen, onClose, orderDetails, cartItems, total }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed' }}
        onClick={onClose}
      >
        <motion.div 
          className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              Buyurtma ma'lumotlari
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 -mr-2 transition-colors"
              aria-label="Yopish"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Mijoz ma'lumotlari */}
            <div className="bg-gray-700/50 p-5 rounded-xl border border-gray-600/50">
              <h3 className="font-semibold text-lg mb-3">Mijoz ma'lumotlari</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Ism va Familiya</p>
                  <p className="font-medium">{orderDetails.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefon raqam</p>
                  <p className="font-medium">{orderDetails.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Manzil</p>
                  <p className="font-medium">{orderDetails.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">To'lov usuli</p>
                  <p className="font-medium">
                    {orderDetails.paymentMethod === 'cash' ? 'Naqd pul' : 'Karta orqali'}
                  </p>
                </div>
                {orderDetails.paymentMethod === 'card' && (
                  <div>
                    <p className="text-sm text-gray-500">Karta raqami</p>
                    <p className="font-medium">{orderDetails.cardNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Buyurtma tafsilotlari */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Buyurtma tafsilotlari</h3>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-2">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.quantity} x {item.price.toLocaleString()} so'm</p>
                      </div>
                    </div>
                    <p className="font-medium">{(item.price * item.quantity).toLocaleString()} so'm</p>
                  </div>
                ))}
                
                <div className="border-t pt-3 mt-2">
                  <div className="flex justify-between font-medium text-lg">
                    <span>Jami:</span>
                    <span>{total} so'm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tasdiqlash */}
            <div className="bg-green-900/30 border border-green-500/30 p-4 rounded-xl flex items-start space-x-3">
              <CheckCircle className="text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-300">Buyurtmangiz qabul qilindi!</h3>
                <p className="text-green-400/80 text-sm mt-1">
                  Tez orada siz bilan bog'lanamiz. Rahmat!
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-700/50">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-95"
              >
                Yopish
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
