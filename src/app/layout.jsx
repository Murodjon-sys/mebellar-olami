'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from '../contexts/CartContext';
import './globals.css';

// Using standard Google Fonts import
const inter = { className: 'font-sans' };

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout({ children }) {
  return (
    <div className={inter.className}>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          {children}
        </CartProvider>
      </QueryClientProvider>
    </div>
  );
}