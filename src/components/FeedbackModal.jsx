import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function FeedbackModal({
  open,
  onClose,
  title = 'Xabar',
  message = '',
  type = 'success', // 'success' | 'error'
}) {
  if (!open) return null;
  const isSuccess = type === 'success';
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`relative w-full max-w-md rounded-2xl border shadow-2xl p-6 ${
              isSuccess
                ? 'bg-gradient-to-br from-emerald-900/80 via-black to-black border-emerald-600/40'
                : 'bg-gradient-to-br from-red-900/80 via-black to-black border-red-600/40'
            }`}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-gray-300 hover:text-white p-1 rounded-full hover:bg-white/10"
              onClick={onClose}
              aria-label="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              {isSuccess ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <XCircle className="w-6 h-6 text-red-400" />
              )}
              <h3 className="text-xl font-semibold text-white">{title}</h3>
            </div>
            <p className="text-gray-200 leading-relaxed">{message}</p>
            <div className="mt-6 text-right">
              <button
                onClick={onClose}
                className={`px-5 py-2 rounded-lg font-semibold text-white ${
                  isSuccess
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Yopish
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
