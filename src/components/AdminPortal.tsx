import React, { useState, useEffect } from 'react';
import { Product, Order, OrderStatus, ProductCategory } from '../types';
import {
  ShieldCheck,
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Truck,
  Eye,
  X,
  Tag,
  DollarSign,
  Layers,
} from 'lucide-react';

interface AdminPortalProps {
  products: Product[];
  orders: Order[];
  onRefreshData: () => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateStock: (productId: string, size: string, newStock: number) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  products,
  orders,
  onRefreshData,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateStock,
  onUpdateOrderStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'inventory' | 'orders'>('dashboard');
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');

  // Modal states for Add/Edit product
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Modal for Viewing Order Details
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Form Fields for Product Add/Edit
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('Sherwanis');
  const [formPrice, setFormPrice] = useState<number>(9999);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number>(12999);
  const [formDescription, setFormDescription] = useState('');
  const [formFabric, setFormFabric] = useState('');
  const [formColor, setFormColor] = useState('');
  const [formCare, setFormCare] = useState('Dry Clean Only.');
  const [formOccasion, setFormOccasion] = useState('Wedding, Sangeet, Festive');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsNewArrival, setFormIsNewArrival] = useState(true);

  // Sizes state
  const [formSizes, setFormSizes] = useState<Array<{ size: string; stock: number }>>([
    { size: '38 (S)', stock: 5 },
    { size: '40 (M)', stock: 8 },
    { size: '42 (L)', stock: 6 },
    { size: '44 (XL)', stock: 3 },
  ]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Sherwanis');
    setFormPrice(9999);
    setFormOriginalPrice(12999);
    setFormDescription('Luxury handcrafted Indian menswear garment with intricate embroidery.');
    setFormFabric('Pure Raw Silk');
    setFormColor('Royal Gold');
    setFormCare('Dry Clean Only.');
    setFormOccasion('Wedding, Sangeet, Reception');
    setFormImageUrl('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800');
    setFormIsFeatured(true);
    setFormIsNewArrival(true);
    setFormSizes([
      { size: '38 (S)', stock: 5 },
      { size: '40 (M)', stock: 8 },
      { size: '42 (L)', stock: 6 },
      { size: '44 (XL)', stock: 3 },
    ]);
    setIsProductModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormPrice(p.price);
    setFormOriginalPrice(p.originalPrice || p.price);
    setFormDescription(p.description);
    setFormFabric(p.fabric);
    setFormColor(p.color);
    setFormCare(p.care);
    setFormOccasion(p.occasion.join(', '));
    setFormImageUrl(p.images[0] || '');
    setFormIsFeatured(!!p.isFeatured);
    setFormIsNewArrival(!!p.isNewArrival);
    setFormSizes(p.sizes.length ? p.sizes : [{ size: '38 (S)', stock: 5 }]);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const totalStock = formSizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: formName,
      category: formCategory,
      price: Number(formPrice),
      originalPrice: formOriginalPrice ? Number(formOriginalPrice) : undefined,
      description: formDescription,
      fabric: formFabric,
      color: formColor,
      sizes: formSizes,
      totalStock,
      images: [formImageUrl],
      isFeatured: formIsFeatured,
      isNewArrival: formIsNewArrival,
      occasion: formOccasion.split(',').map((o) => o.trim()),
      care: formCare,
      rating: editingProduct ? editingProduct.rating : 4.9,
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 12,
    };

    if (editingProduct) {
      onUpdateProduct(productPayload);
    } else {
      onAddProduct(productPayload);
    }

    setIsProductModalOpen(false);
  };

  // KPI Computations
  const totalRevenue = orders.reduce(
    (sum, o) => (o.status !== 'Cancelled' ? sum + o.totalAmount : sum),
    0
  );
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'Pending' || o.status === 'Processing' || o.status === 'Confirmed'
  ).length;
  const lowStockProducts = products.filter((p) => p.totalStock < 8);

  // Product Filtering
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Order Filtering
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.trackingNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.email.toLowerCase().includes(orderSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Admin Title & Quick Sync */}
      <div className="bg-amber-950 text-amber-50 rounded-2xl p-6 mb-6 shadow-xl border border-amber-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-800 rounded-xl text-amber-300 border border-amber-600/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-2xl font-bold tracking-wide">SINGHAROY ADMIN PORTAL</h2>
              <span className="bg-amber-500 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                Owner Dashboard
              </span>
            </div>
            <p className="text-xs text-amber-300/80 mt-0.5">
              Real-Time Product Catalog, Price Management, Stock Adjustments & Order Tracking
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRefreshData}
            className="bg-amber-900 hover:bg-amber-800 border border-amber-700/60 text-amber-100 px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync Live Store</span>
          </button>
          <button
            onClick={openAddModal}
            className="bg-amber-500 hover:bg-amber-400 text-amber-950 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Garment</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-amber-50 border border-amber-900/15 p-4 rounded-xl shadow-xs">
          <div className="flex justify-between items-start text-amber-900">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                Total Store Revenue
              </span>
              <h3 className="font-serif text-2xl font-bold text-amber-950 mt-1">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="p-2 bg-amber-200/60 rounded-lg">
              <TrendingUp className="w-5 h-5 text-amber-900" />
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-900/15 p-4 rounded-xl shadow-xs">
          <div className="flex justify-between items-start text-amber-900">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                Active / Total Orders
              </span>
              <h3 className="font-serif text-2xl font-bold text-amber-950 mt-1">
                {pendingOrdersCount} / {totalOrdersCount}
              </h3>
            </div>
            <div className="p-2 bg-amber-200/60 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-amber-900" />
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-900/15 p-4 rounded-xl shadow-xs">
          <div className="flex justify-between items-start text-amber-900">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                Total Garments
              </span>
              <h3 className="font-serif text-2xl font-bold text-amber-950 mt-1">
                {products.length} Items
              </h3>
            </div>
            <div className="p-2 bg-amber-200/60 rounded-lg">
              <Package className="w-5 h-5 text-amber-900" />
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-900/15 p-4 rounded-xl shadow-xs">
          <div className="flex justify-between items-start text-amber-900">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                Low Stock Alerts
              </span>
              <h3 className="font-serif text-2xl font-bold text-amber-950 mt-1">
                {lowStockProducts.length} Items
              </h3>
            </div>
            <div className="p-2 bg-amber-200/60 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex space-x-2 border-b border-amber-900/15 mb-6 overflow-x-auto pb-1">
        {[
          { id: 'dashboard', label: 'Dashboard Overview', icon: Layers },
          { id: 'products', label: 'Manage Products & Prices', icon: Tag },
          { id: 'inventory', label: 'Real-Time Inventory Stock', icon: Package },
          { id: 'orders', label: 'Order Tracking & Dispatch', icon: Truck },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-900 text-amber-100 border-t border-x border-amber-800 shadow-sm'
                  : 'text-stone-600 hover:text-amber-950 hover:bg-amber-100/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === 'orders' && pendingOrdersCount > 0 && (
                <span className="bg-amber-500 text-amber-950 px-1.5 py-0.2 rounded-full text-[10px]">
                  {pendingOrdersCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: PRODUCTS & PRICES */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3 bg-amber-100/60 p-3.5 rounded-xl border border-amber-900/10">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search products by title or ID..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full bg-white border border-amber-900/20 rounded-lg pl-9 pr-3 py-1.5 text-xs text-amber-950 focus:outline-none focus:border-amber-900"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-amber-900/20 rounded-lg px-3 py-1.5 text-xs font-medium text-amber-950 focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Sherwanis">Sherwanis</option>
                <option value="Kurtas">Kurtas</option>
                <option value="Nehru Jackets">Nehru Jackets</option>
                <option value="Indo-Western">Indo-Western</option>
                <option value="Bottoms">Bottoms</option>
                <option value="Footwear">Footwear</option>
                <option value="Accessories">Accessories</option>
              </select>

              <button
                onClick={openAddModal}
                className="bg-amber-900 hover:bg-amber-800 text-amber-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 whitespace-nowrap shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>New Item</span>
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-xl border border-amber-900/15 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-amber-900 text-amber-100 font-serif uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">Garment Item</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price (₹)</th>
                    <th className="p-3">Stock Overview</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-900/10 text-stone-800">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-10 h-12 object-cover rounded border border-amber-900/10 shrink-0"
                          />
                          <div>
                            <span className="font-serif font-bold text-amber-950 block">{p.name}</span>
                            <span className="text-[10px] text-stone-400 font-mono">{p.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-semibold text-[11px]">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-amber-950">
                        ₹{p.price.toLocaleString('en-IN')}
                        {p.originalPrice && (
                          <span className="block text-[10px] text-stone-400 line-through font-normal">
                            ₹{p.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {p.sizes.map((s) => (
                            <span
                              key={s.size}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                s.stock === 0
                                  ? 'bg-red-100 text-red-700 border-red-200'
                                  : s.stock <= 3
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-stone-100 text-stone-700 border-stone-200'
                              }`}
                            >
                              {s.size}: {s.stock}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] text-stone-500 font-semibold block mt-1">
                          Total: {p.totalStock} units
                        </span>
                      </td>
                      <td className="p-3">
                        {p.totalStock === 0 ? (
                          <span className="bg-stone-800 text-stone-100 text-[10px] font-bold px-2 py-0.5 rounded">
                            Out of Stock
                          </span>
                        ) : p.totalStock <= 8 ? (
                          <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                            Low Stock
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 hover:bg-amber-100 text-amber-900 rounded-lg transition-colors"
                            title="Edit Garment"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete garment "${p.name}"?`)) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                            title="Delete Garment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: REAL-TIME INVENTORY STOCK */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="bg-amber-100/70 border border-amber-900/15 p-4 rounded-xl text-xs text-amber-950 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-amber-950">Real-Time Garment Stock Management</h4>
              <p className="text-stone-600 mt-0.5">Adjust stock levels per size directly in real-time.</p>
            </div>
            <button
              onClick={onRefreshData}
              className="bg-amber-900 text-amber-50 px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Stock</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-amber-900/15 rounded-xl p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-12 h-14 object-cover rounded-md border"
                    />
                    <div>
                      <h4 className="font-serif font-bold text-amber-950 text-sm">{p.name}</h4>
                      <span className="text-[11px] text-stone-500 font-semibold">{p.category} • ₹{p.price.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-amber-900/10 pt-3">
                    <span className="text-xs font-bold text-amber-950 block">Stock per Size:</span>
                    {p.sizes.map((s) => (
                      <div key={s.size} className="flex items-center justify-between text-xs bg-amber-50/60 p-2 rounded-lg border border-amber-900/10">
                        <span className="font-semibold text-stone-800">{s.size}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onUpdateStock(p.id, s.size, Math.max(0, s.stock - 1))}
                            className="w-6 h-6 bg-amber-200 text-amber-950 font-bold rounded flex items-center justify-center hover:bg-amber-300"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-bold text-amber-950">{s.stock}</span>
                          <button
                            onClick={() => onUpdateStock(p.id, s.size, s.stock + 1)}
                            className="w-6 h-6 bg-amber-200 text-amber-950 font-bold rounded flex items-center justify-center hover:bg-amber-300"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-amber-900/10 flex justify-between items-center text-xs text-stone-500">
                  <span>Total Inventory: <strong className="text-amber-950">{p.totalStock} units</strong></span>
                  {p.totalStock < 8 && (
                    <span className="text-red-600 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3 bg-amber-100/60 p-3.5 rounded-xl border border-amber-900/10">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search orders by ID, tracking number, or customer name..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full bg-white border border-amber-900/20 rounded-lg pl-9 pr-3 py-1.5 text-xs text-amber-950 focus:outline-none focus:border-amber-900"
              />
            </div>

            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="bg-white border border-amber-900/20 rounded-lg px-3 py-1.5 text-xs font-medium text-amber-950"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl border border-amber-900/15 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-amber-900 text-amber-100 font-serif uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">Order Ref / Tracking</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Items Summary</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-900/10 text-stone-800">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-3">
                        <span className="font-mono font-bold text-amber-950 block">{o.id}</span>
                        <span className="text-[10px] text-stone-400 font-mono">{o.trackingNumber}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-amber-950 block">{o.customer.name}</span>
                        <span className="text-[10px] text-stone-500">{o.customer.city}, {o.customer.phone}</span>
                      </td>
                      <td className="p-3 max-w-xs">
                        <span className="font-semibold text-stone-800 block truncate">
                          {o.items.map((i) => `${i.productName} (${i.size}) x${i.quantity}`).join(', ')}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-amber-950">
                        ₹{o.totalAmount.toLocaleString('en-IN')}
                        <span className="block text-[10px] text-stone-500 font-normal">{o.paymentMethod}</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          o.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.status === 'Shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="p-1.5 hover:bg-amber-100 text-amber-900 rounded-lg"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <select
                            value={o.status}
                            onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                            className="bg-amber-50 border border-amber-900/20 rounded-lg px-2 py-1 text-[11px] font-bold text-amber-950 focus:outline-none"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD OVERVIEW DEFAULT TAB */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alerts Box */}
          <div className="bg-white border border-amber-900/15 rounded-2xl p-5 shadow-xs">
            <h3 className="font-serif font-bold text-base text-amber-950 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
              <span>Low Inventory Stock Warnings (&lt; 8 Units)</span>
            </h3>
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-stone-500 py-4 text-center">All garment items have sufficient stock levels.</p>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-900/10 text-xs"
                  >
                    <div className="flex items-center space-x-2.5">
                      <img src={p.images[0]} alt={p.name} className="w-9 h-11 object-cover rounded border" />
                      <div>
                        <h4 className="font-bold text-amber-950">{p.name}</h4>
                        <span className="text-[10px] text-stone-500">{p.category} • ₹{p.price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded block">
                        {p.totalStock} left
                      </span>
                      <button
                        onClick={() => setActiveTab('inventory')}
                        className="text-[10px] text-amber-900 font-bold hover:underline mt-1 block"
                      >
                        Restock Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders Action Box */}
          <div className="bg-white border border-amber-900/15 rounded-2xl p-5 shadow-xs">
            <h3 className="font-serif font-bold text-base text-amber-950 flex items-center gap-2 mb-3">
              <ShoppingBag className="w-5 h-5 text-amber-900" />
              <span>Recent Royal Customer Orders</span>
            </h3>
            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {orders.slice(0, 5).map((o) => (
                <div
                  key={o.id}
                  className="p-3 bg-amber-50 rounded-xl border border-amber-900/10 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono font-bold text-amber-950">{o.id}</span>
                    <span className="text-[11px] text-stone-600 block">{o.customer.name} ({o.customer.city})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-950">₹{o.totalAmount.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] bg-amber-200 text-amber-950 px-2 py-0.5 rounded font-bold block mt-0.5">
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-amber-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-amber-50 border border-amber-900/20 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-stone-500 hover:text-amber-950"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl font-bold text-amber-950 mb-4">
              {editingProduct ? 'Edit Royal Garment Details' : 'Add New Garment to Store'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-amber-950 mb-1">Garment Name / Title</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-white border rounded-lg p-2 text-amber-950"
                  placeholder="e.g. Royal Gold Zardozi Sherwani"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-amber-950 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                    className="w-full bg-white border rounded-lg p-2 text-amber-950"
                  >
                    <option value="Sherwanis">Sherwanis</option>
                    <option value="Kurtas">Kurtas</option>
                    <option value="Nehru Jackets">Nehru Jackets</option>
                    <option value="Indo-Western">Indo-Western</option>
                    <option value="Bottoms">Bottoms</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-amber-950 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-white border rounded-lg p-2 text-amber-950"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-950 mb-1">MRP / Original (₹)</label>
                  <input
                    type="number"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(Number(e.target.value))}
                    className="w-full bg-white border rounded-lg p-2 text-amber-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-amber-950 mb-1">Fabric Details</label>
                  <input
                    type="text"
                    required
                    value={formFabric}
                    onChange={(e) => setFormFabric(e.target.value)}
                    className="w-full bg-white border rounded-lg p-2 text-amber-950"
                    placeholder="e.g. Pure Raw Silk with Gold Zari"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-950 mb-1">Color Palette</label>
                  <input
                    type="text"
                    required
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-full bg-white border rounded-lg p-2 text-amber-950"
                    placeholder="e.g. Ivory & Gold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-amber-950 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-white border rounded-lg p-2 text-amber-950"
                />
              </div>

              <div>
                <label className="block font-bold text-amber-950 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full bg-white border rounded-lg p-2 text-amber-950"
                />
              </div>

              {/* Sizes and Stock Matrix */}
              <div>
                <label className="block font-bold text-amber-950 mb-1">Sizes & Stock Levels</label>
                <div className="grid grid-cols-2 gap-2">
                  {formSizes.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border">
                      <span className="font-bold w-16">{s.size}</span>
                      <input
                        type="number"
                        min="0"
                        value={s.stock}
                        onChange={(e) => {
                          const updated = [...formSizes];
                          updated[idx].stock = Number(e.target.value);
                          setFormSizes(updated);
                        }}
                        className="w-full bg-amber-50 border p-1 rounded font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                  />
                  <span>Mark Featured Royal</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={formIsNewArrival}
                    onChange={(e) => setFormIsNewArrival(e.target.checked)}
                  />
                  <span>Mark New Arrival</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-900 text-amber-50 py-3 rounded-xl font-bold shadow-md hover:bg-amber-800"
              >
                Save Garment to Store
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-amber-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-amber-50 border border-amber-900/20 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-2 text-stone-500 hover:text-amber-950"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-bold text-amber-950 mb-1">
              Order Details ({selectedOrder.id})
            </h3>
            <p className="text-xs text-stone-500 mb-4">Tracking: {selectedOrder.trackingNumber}</p>

            <div className="space-y-3 text-xs">
              <div className="bg-white p-3 rounded-xl border space-y-1">
                <h4 className="font-bold text-amber-950">Customer Shipping Address</h4>
                <p>{selectedOrder.customer.name}</p>
                <p>{selectedOrder.customer.address}</p>
                <p>{selectedOrder.customer.city}, {selectedOrder.customer.state} - {selectedOrder.customer.pincode}</p>
                <p>Phone: {selectedOrder.customer.phone} | Email: {selectedOrder.customer.email}</p>
              </div>

              <div className="bg-white p-3 rounded-xl border space-y-2">
                <h4 className="font-bold text-amber-950">Items Ordered</h4>
                {selectedOrder.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span>{i.productName} ({i.size}) x{i.quantity}</span>
                    <span className="font-bold">₹{(i.price * i.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="pt-2 border-t font-bold flex justify-between text-sm text-amber-950">
                  <span>Total Paid ({selectedOrder.paymentMethod}):</span>
                  <span>₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
