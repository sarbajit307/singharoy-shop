import React from 'react';
import { ShoppingBag, Sparkles, ShieldCheck, Search, SlidersHorizontal, PackageCheck, UserCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: 'store' | 'admin' | 'track';
  setActiveTab: (tab: 'store' | 'admin' | 'track') => void;
  cartCount: number;
  setIsCartOpen: (open: boolean) => void;
  setIsAIChatOpen: (open: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  lowStockCount: number;
  pendingOrdersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  setIsCartOpen,
  setIsAIChatOpen,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  lowStockCount,
  pendingOrdersCount,
}) => {
  const categories = [
    'All',
    'Sherwanis',
    'Kurtas',
    'Nehru Jackets',
    'Indo-Western',
    'Bottoms',
    'Footwear',
    'Accessories',
  ];

  return (
    <header className="sticky top-0 z-40 bg-amber-950 text-amber-50 shadow-md">
      {/* Top Banner */}
      <div className="bg-amber-900 border-b border-amber-800/60 px-4 py-1.5 text-xs text-amber-100 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="bg-amber-700/80 text-amber-100 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold">
            Royal Festive Collection
          </span>
          <span className="hidden sm:inline">Free Express Pan-India Delivery on orders above ₹2,999</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsAIChatOpen(true)}
            className="flex items-center space-x-1.5 text-amber-200 hover:text-white transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="font-medium">AI Sizing & Stylist</span>
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`flex items-center space-x-1 hover:text-white transition-colors ${
              activeTab === 'track' ? 'text-amber-300 font-semibold' : 'text-amber-200'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Track Order</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Identity */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('store')}>
          <div className="w-10 h-10 rounded-full bg-amber-800 border-2 border-amber-400/80 flex items-center justify-center text-amber-300 shadow-inner">
            <span className="font-serif text-xl font-bold tracking-tighter">S</span>
          </div>
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-amber-100 flex items-center gap-1.5">
              SINGHAROY SHOP
            </h1>
            <p className="text-[10px] text-amber-300/80 tracking-widest uppercase font-medium">
              Royal Indian Menswear & Accessories
            </p>
          </div>
        </div>

        {/* Store / Admin Mode Toggles */}
        <div className="flex items-center space-x-2 bg-amber-900/80 p-1 rounded-lg border border-amber-800">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'store'
                ? 'bg-amber-500 text-amber-950 font-semibold shadow-sm'
                : 'text-amber-200 hover:text-white'
            }`}
          >
            Storefront
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'admin'
                ? 'bg-amber-500 text-amber-950 font-semibold shadow-sm'
                : 'text-amber-200 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Portal</span>
            {(pendingOrdersCount > 0 || lowStockCount > 0) && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {pendingOrdersCount + lowStockCount}
              </span>
            )}
          </button>
        </div>

        {/* Search & Cart Actions */}
        <div className="flex items-center space-x-3">
          {activeTab === 'store' && (
            <div className="relative hidden md:block w-48 lg:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-amber-300/70" />
              <input
                type="text"
                placeholder="Search sherwanis, kurtas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-amber-900/60 border border-amber-800 rounded-full pl-9 pr-3 py-1.5 text-xs text-amber-100 placeholder-amber-400/60 focus:outline-none focus:border-amber-400 focus:bg-amber-900"
              />
            </div>
          )}

          <button
            onClick={() => setIsAIChatOpen(true)}
            className="hidden sm:flex items-center space-x-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-950 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md border border-amber-400/50 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Advisor</span>
          </button>

          {activeTab === 'store' && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-full bg-amber-900 border border-amber-800 hover:bg-amber-800 text-amber-200 transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-amber-300" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-amber-950 font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-amber-950">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Bar for Store View */}
      {activeTab === 'store' && (
        <div className="bg-amber-900/70 border-t border-amber-800/80 px-4 py-2 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-400 shrink-0 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-amber-950 font-bold shadow-sm'
                    : 'text-amber-200 hover:bg-amber-800/70 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
