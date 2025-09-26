"use client";

import React from 'react';
import { Menu } from 'lucide-react';

export default function AdminNavbar({ title = 'Admin Panel' }) {
  const handleToggle = () => {
    if (typeof window !== 'undefined' && typeof window.__adminToggleSidebar === 'function') {
      window.__adminToggleSidebar();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-gray-900/85 backdrop-blur border-b border-gray-800 md:hidden">
      <div className="px-4 py-3 flex items-center justify-between">
        <button
          onClick={handleToggle}
          className="md:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700"
          aria-label="Menyuni ochish"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        <div className="w-6 h-6" aria-hidden="true" />
      </div>
    </header>
  );
}
