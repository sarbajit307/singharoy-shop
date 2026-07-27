import React, { useState } from 'react';
import { CartItem } from './CartDrawer';
import { Order, CustomerDetails } from '../types';
import { X, ShieldCheck, CheckCircle2, Truck, Copy, PackageCheck, CreditCard } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  discountAmount: number;
  promoCode: string;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  discountAmount,
  promoCode,
  onOrderSuccess,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('Sarbajit Singharoy');
  const [email, setEmail] = useState('singharoy.s@example.com');
  const [phone, setPhone] = useState('+91 98300 12345');
  const [address, setAddress] = useState('12 Royal Park Avenue, 3rd Floor');
  const [city, setCity] = useState('Kolkata');
  const [state, setState] = useState('West Bengal');
  const [pincode, setPincode] = useState('700019');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'COD' | 'NetBanking'>('UPI');

  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= 2999 || subtotal === 0 ? 0 : 250;
  const grandTotal = Math.max(0, subtotal - discountAmount + shipping);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const customer: CustomerDetails = {
      name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
    };

    const items = cartItems.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      size: item.selectedSize,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.images[0],
    }));

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          items,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setPlacedOrder(data.order);
        onOrderSuccess(data.order);
      } else {
        alert(data.error || 'Failed to submit order');
      }
    } catch (err) {
      alert('Network error while placing order');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-amber-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative bg-amber-50 border border-amber-900/20 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-amber-900/10 hover:bg-amber-900/20 text-amber-950 p-2 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!placedOrder ? (
          <div>
            <div className="flex items-center space-x-3 mb-6 border-b border-amber-900/10 pb-4">
              <div className="p-2.5 bg-amber-900 text-amber-300 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-amber-950">Express Checkout</h3>
                <p className="text-xs text-stone-600">Singharoy Shop Royal Pan-India Delivery</p>
              </div>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {/* Customer Info Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  1. Shipping & Contact Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-amber-950 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-amber-900/20 rounded-lg px-3 py-2 text-xs text-amber-950 focus:outline-none focus:border-amber-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-amber-950 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-amber-900/20 rounded-lg px-3 py-2 text-xs text-amber-950 focus:outline-none focus:border-amber-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-amber-950 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-amber-900/20 rounded-lg px-3 py-2 text-xs text-amber-950 focus:outline-none focus:border-amber-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-amber-950 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full bg-white border border-amber-900/20 rounded-lg px-3 py-2 text-xs text-amber-950 focus:outline-none focus:border-amber-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-950 mb-1">
                    Complete Shipping Address
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white border border-amber-900/20 rounded-lg px-3 py-2 text-xs text-amber-950 focus:outline-none focus:border-amber-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-amber-950 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-white border border-amber-900/20 rounded-lg px-3 py-2 text-xs text-amber-950 focus:outline-none focus:border-amber-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-950 mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-white border border-amber-900/20 rounded-lg px-3 py-2 text-xs text-amber-950 focus:outline-none focus:border-amber-900"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-2">
                  2. Select Payment Option
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['UPI', 'Card', 'NetBanking', 'COD'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === method
                          ? 'bg-amber-900 text-amber-100 border-amber-900 shadow-sm'
                          : 'bg-white text-stone-800 border-amber-900/20 hover:border-amber-900'
                      }`}
                    >
                      <span>{method === 'UPI' ? 'GPay / PhonePe UPI' : method}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Summary box */}
              <div className="bg-amber-100/60 border border-amber-900/10 rounded-xl p-3.5 text-xs text-stone-700 space-y-1">
                <div className="flex justify-between">
                  <span>Items Total ({cartItems.length}):</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({promoCode}):</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Express Delivery:</span>
                  <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-amber-900/10 font-bold text-sm text-amber-950">
                  <span>Total Payable:</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-900 hover:bg-amber-800 text-amber-50 py-3.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-98"
              >
                {loading ? (
                  <span>Processing Royal Order...</span>
                ) : (
                  <span>Place Royal Order (₹{grandTotal.toLocaleString('en-IN')})</span>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Confirmation Receipt View */
          <div className="text-center space-y-5 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                Order Confirmed!
              </span>
              <h3 className="font-serif text-2xl font-bold text-amber-950 mt-2">
                Thank You for Shopping at Singharoy Shop
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                We are preparing your handcrafted order for dispatch.
              </p>
            </div>

            {/* Tracking Card */}
            <div className="bg-amber-100/70 border border-amber-900/15 rounded-xl p-4 text-left text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-stone-500 font-medium">Order Reference ID:</span>
                <span className="font-mono font-bold text-amber-950 text-sm">{placedOrder.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500 font-medium">Delhivery Tracking Number:</span>
                <div className="flex items-center space-x-1.5 font-mono font-bold text-amber-900">
                  <span>{placedOrder.trackingNumber}</span>
                  <button
                    onClick={() => copyToClipboard(placedOrder.trackingNumber)}
                    className="p-1 hover:bg-amber-200 rounded text-stone-600"
                    title="Copy Tracking ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {copied && (
                <p className="text-[10px] text-emerald-700 font-semibold text-right">
                  Tracking Number Copied!
                </p>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-amber-900/10">
                <span className="text-stone-500">Shipping Address:</span>
                <span className="font-medium text-amber-950 text-right">
                  {placedOrder.customer.city}, {placedOrder.customer.state} ({placedOrder.customer.pincode})
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-amber-900 hover:bg-amber-800 text-amber-50 py-3 rounded-xl text-xs font-bold shadow-md transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
