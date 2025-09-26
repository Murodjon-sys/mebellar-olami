import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function OrderModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '+998 ',
    address: '',
    paymentMethod: 'cash',
    cardNumber: ''
  });

  // Lock background scroll when order modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev || 'auto'; };
  }, [isOpen]);

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    const groups = digits.match(/.{1,4}/g) || [];
    return groups.join(' ');
  };

  const formatUzPhone = (value) => {
    // Keep only digits, but preserve + for display
    const digits = value.replace(/\D/g, '');
    // Remove possible leading 998 to avoid duplication
    let rest = digits.startsWith('998') ? digits.slice(3) : digits;
    // Limit to 9 digits after country code
    rest = rest.slice(0, 9);
    const op = rest.slice(0, 2);
    const p1 = rest.slice(2, 5);
    const p2 = rest.slice(5, 7);
    const p3 = rest.slice(7, 9);
    let out = '+998';
    if (op.length) out += ` (${op}${op.length === 2 ? ')' : ''}`;
    if (p1.length) out += ` ${p1}`;
    if (p2.length) out += ` ${p2}`;
    if (p3.length) out += ` ${p3}`;
    // Ensure trailing space after +998 if nothing else
    if (!op.length && !p1.length && !p2.length && !p3.length) out += ' ';
    return out;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') {
      const formatted = formatCardNumber(value);
      setFormData(prev => ({ ...prev, cardNumber: formatted }));
      return;
    }
    if (name === 'phone') {
      const formatted = formatUzPhone(value);
      setFormData(prev => ({ ...prev, phone: formatted }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => { try { document.body.style.overflow = 'auto'; } catch {}; onClose && onClose(); }}
      >
        <motion.div 
          className="bg-gradient-to-br from-gray-900 via-black to-green-900/80 rounded-xl p-6 md:p-7 w-full max-w-md max-h-[90vh] overflow-y-auto relative shadow-2xl border border-green-500/20"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          <button 
            onClick={() => { try { document.body.style.overflow = 'auto'; } catch {}; onClose && onClose(); }}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-green-500/20"
          >
            <X size={24} />
          </button>
          
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Buyurtma berish</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Ism va Familiya</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Telefon raqam</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400 tracking-wide"
                placeholder="+998 (__) ___ __ __"
                inputMode="numeric"
                maxLength={22}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Manzil</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">To'lov usuli</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-500 focus:ring-green-500 border-gray-600 bg-gray-800"
                  />
                  <span className="ml-2 text-gray-200">Naqd pul</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-500 focus:ring-green-500 border-gray-600 bg-gray-800"
                  />
                  <span className="ml-2 text-gray-200">Karta orqali</span>
                </label>
              </div>
            </div>
            
            {formData.paymentMethod === 'card' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Karta raqami</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400 tracking-wider"
                  placeholder="8600 1234 5678 9012"
                  inputMode="numeric"
                  maxLength={19}
                />
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg hover:from-green-500 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 font-medium transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Yuborilmoqda...' : 'Buyurtma berish'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
