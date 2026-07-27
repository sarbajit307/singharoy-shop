import React, { useState, useEffect } from 'react';
import { Product, Order, OrderStatus } from './types';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AISizeModal } from './components/AISizeModal';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { CartDrawer, CartItem } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { AdminPortal } from './components/AdminPortal';
import {
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Crown,
  Truck,
  RotateCcw,
  Star,
  Award,
  ChevronRight,
  Filter,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'store' | 'admin' | 'track'>('store');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [occasionFilter, setOccasionFilter] = useState<string>('All');

  // Cart
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [checkoutDiscount, setCheckoutDiscount] = useState<number>(0);
  const [checkoutPromoCode, setCheckoutPromoCode] = useState<string>('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [aiSizeProduct, setAiSizeProduct] = useState<Product | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState<boolean>(false);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState<boolean>(false);

  // Fetch Live Products & Orders from Backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, ordRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
      ]);

      const prodData = await prodRes.json();
      const ordData = await ordRes.json();

      if (prodData.success) {
        setProducts(prodData.products);
      }
      if (ordData.success) {
        setOrders(ordData.orders);
      }
    } catch (err) {
      console.error('Failed to fetch store data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Cart Handlers
  const handleAddToCart = (product: Product, selectedSize: string) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.product.id === product.id && i.selectedSize === selectedSize
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      }
      return [...prev, { product, selectedSize, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, size: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId && item.selectedSize === size) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveCartItem = (productId: string, size: string) => {
    setCartItems((prev) =>
      prev.filter((i) => !(i.product.id === productId && i.selectedSize === size))
    );
  };

  const handleProceedToCheckout = (discount: number, promo: string) => {
    setCheckoutDiscount(discount);
    setCheckoutPromoCode(promo);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleExpressBuy = (product: Product, size: string) => {
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    fetchData(); // Refresh product stock levels
  };

  // Admin Operations
  const handleAdminAddProduct = async (newProduct: Product) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  const handleAdminUpdateProduct = async (updated: Product) => {
    try {
      const res = await fetch(`/api/products/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Error updating product:', err);
    }
  };

  const handleAdminDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleAdminUpdateStock = async (productId: string, size: string, newStock: number) => {
    try {
      const res = await fetch(`/api/products/${productId}/inventory`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ size, newStock }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Error updating stock:', err);
    }
  };

  const handleAdminUpdateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    note?: string
  ) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  // Filter products for storefront
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      p.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesOccasion =
      occasionFilter === 'All' ||
      p.occasion.some((o) => o.toLowerCase().includes(occasionFilter.toLowerCase()));

    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.fabric.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.color.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesOccasion && matchesSearch;
  });

  const lowStockCount = products.filter((p) => p.totalStock < 8).length;
  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'Pending' || o.status === 'Processing' || o.status === 'Confirmed'
  ).length;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans selection:bg-amber-800 selection:text-amber-100">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'track') {
            setIsOrderTrackerOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        cartCount={cartItems.reduce((sum, i) => sum + i.quantity, 0)}
        setIsCartOpen={setIsCartOpen}
        setIsAIChatOpen={setIsAIChatOpen}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        lowStockCount={lowStockCount}
        pendingOrdersCount={pendingOrdersCount}
      />

      {/* Main View Area */}
      {activeTab === 'admin' ? (
        <main className="flex-1 bg-stone-100">
          <AdminPortal
            products={products}
            orders={orders}
            onRefreshData={fetchData}
            onAddProduct={handleAdminAddProduct}
            onUpdateProduct={handleAdminUpdateProduct}
            onDeleteProduct={handleAdminDeleteProduct}
            onUpdateStock={handleAdminUpdateStock}
            onUpdateOrderStatus={handleAdminUpdateOrderStatus}
          />
        </main>
      ) : (
        /* Storefront View */
        <main className="flex-1">
          {/* Hero Banner Section */}
          <section className="relative bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-amber-50 overflow-hidden border-b border-amber-800">
            <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-xl text-center lg:text-left">
                <div className="inline-flex items-center space-x-2 bg-amber-800/80 border border-amber-500/40 px-3 py-1 rounded-full text-xs text-amber-200 font-semibold mb-4 shadow-sm">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>The Royal Festive Collection 2026</span>
                </div>
                <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-wide text-amber-100 leading-tight mb-4">
                  SINGHAROY SHOP
                </h1>
                <p className="text-amber-200/90 text-sm sm:text-base leading-relaxed mb-6">
                  Handcrafted Zardozi Sherwanis, Lucknowi Chikankari Kurtas, Plush Velvet Nehru Jackets & Royal Mojaris tailored for the modern Indian gentleman.
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <button
                    onClick={() => setSelectedCategory('Sherwanis')}
                    className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg transition-all active:scale-98 flex items-center space-x-2"
                  >
                    <span>Explore Sherwanis</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsAIChatOpen(true)}
                    className="bg-amber-900/90 hover:bg-amber-800 border border-amber-400/50 text-amber-100 font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>AI Master Tailor Advisor</span>
                  </button>
                </div>
              </div>

              {/* Showcase Cards Grid */}
              <div className="grid grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-amber-500/30 group">
                  <img
                    src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800"
                    alt="Sherwani"
                    className="w-36 sm:w-44 h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-950/90 via-transparent to-transparent p-3 flex flex-col justify-end">
                    <span className="font-serif font-bold text-xs text-amber-200">Zardozi Sherwanis</span>
                  </div>
                </div>
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-amber-500/30 group mt-4">
                  <img
                    src="https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=800"
                    alt="Nehru Jacket"
                    className="w-36 sm:w-44 h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-950/90 via-transparent to-transparent p-3 flex flex-col justify-end">
                    <span className="font-serif font-bold text-xs text-amber-200">Velvet Nehru Jackets</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Value Badges Banner */}
          <section className="bg-amber-900/10 border-b border-amber-900/10 py-4 px-4 text-amber-950">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs">
              <div className="flex items-center justify-center space-x-2">
                <Award className="w-5 h-5 text-amber-800" />
                <span className="font-bold">100% Authentic Handloom Silk</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Truck className="w-5 h-5 text-amber-800" />
                <span className="font-bold">Pan-India Express Shipping</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-800" />
                <span className="font-bold">AI Master Tailor Sizing</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <RotateCcw className="w-5 h-5 text-amber-800" />
                <span className="font-bold">Hassle-Free Size Exchanges</span>
              </div>
            </div>
          </section>

          {/* Main Catalog View */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Catalog Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-amber-900/10">
              <div>
                <h2 className="font-serif text-2xl font-bold text-amber-950">
                  {selectedCategory === 'All' ? 'All Menswear Collections' : `${selectedCategory} Collection`}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Showing {filteredProducts.length} royal garments ready for dispatch
                </p>
              </div>

              {/* Occasion Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-amber-800" />
                <span className="text-xs font-semibold text-amber-950">Occasion:</span>
                <select
                  value={occasionFilter}
                  onChange={(e) => setOccasionFilter(e.target.value)}
                  className="bg-white border border-amber-900/20 rounded-lg px-3 py-1.5 text-xs font-medium text-amber-950 focus:outline-none"
                >
                  <option value="All">All Ceremonies</option>
                  <option value="Wedding">Wedding / Groom</option>
                  <option value="Sangeet">Sangeet / Cocktails</option>
                  <option value="Haldi">Haldi Rituals</option>
                  <option value="Diwali">Festive & Diwali</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-12">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-amber-100/50 rounded-xl aspect-[3/4] animate-pulse"></div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-amber-50 border border-amber-900/15 rounded-2xl p-12 text-center my-8">
                <ShoppingBag className="w-12 h-12 text-amber-800/40 mx-auto mb-3" />
                <h3 className="font-serif font-bold text-amber-950 text-xl">No garments found</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your search query or switching categories.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                    setOccasionFilter('All');
                  }}
                  className="mt-4 bg-amber-900 text-amber-50 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelectProduct={setSelectedProduct}
                    onAddToCart={handleAddToCart}
                    onOpenAISizeModal={setAiSizeProduct}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onOpenAISizeModal={(prod) => {
          setSelectedProduct(null);
          setAiSizeProduct(prod);
        }}
        onExpressBuy={handleExpressBuy}
      />

      <AISizeModal
        product={aiSizeProduct}
        onClose={() => setAiSizeProduct(null)}
        onSelectSize={(size) => {
          if (aiSizeProduct) {
            handleAddToCart(aiSizeProduct, size);
          }
        }}
      />

      <AIAssistantDrawer
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        products={products}
        onSelectProduct={setSelectedProduct}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        discountAmount={checkoutDiscount}
        promoCode={checkoutPromoCode}
        onOrderSuccess={handleOrderSuccess}
      />

      <OrderTrackerModal
        isOpen={isOrderTrackerOpen}
        onClose={() => setIsOrderTrackerOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-amber-950 text-amber-200 border-t border-amber-900 mt-12 py-10 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
          <div>
            <h3 className="font-serif text-lg font-bold text-amber-100 mb-2">SINGHAROY SHOP</h3>
            <p className="text-stone-400 leading-relaxed">
              Curators of luxury Indian menswear fashion and traditional accessories. Crafted with royal heritage tailoring and modern finesse.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-amber-100 uppercase tracking-wider mb-2">Garment Categories</h4>
            <ul className="space-y-1 text-stone-400">
              <li><button onClick={() => setSelectedCategory('Sherwanis')} className="hover:text-amber-200">Zardozi Sherwanis</button></li>
              <li><button onClick={() => setSelectedCategory('Kurtas')} className="hover:text-amber-200">Lucknowi Chikankari Kurtas</button></li>
              <li><button onClick={() => setSelectedCategory('Nehru Jackets')} className="hover:text-amber-200">Micro-Velvet Nehru Jackets</button></li>
              <li><button onClick={() => setSelectedCategory('Footwear')} className="hover:text-amber-200">Handcrafted Mojari Juttis</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-amber-100 uppercase tracking-wider mb-2">Store Owner Portal</h4>
            <p className="text-stone-400 mb-3">
              Access real-time product management, pricing controls, inventory restocks, and logistics status updates.
            </p>
            <button
              onClick={() => setActiveTab('admin')}
              className="bg-amber-800 hover:bg-amber-700 text-amber-100 px-4 py-2 rounded-lg font-bold border border-amber-600/40"
            >
              Open Admin Portal
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-amber-900/60 mt-8 pt-4 text-center text-[10px] text-stone-500">
          © {new Date().getFullYear()} Singharoy Shop. All Rights Reserved. Indian Menswear & Royal Fashion.
        </div>
      </footer>
    </div>
  );
}
