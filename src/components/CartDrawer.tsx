import React, { useState } from 'react';
import { Product } from '../types';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, ShieldCheck } from 'lucide-react';

export interface CartItem {
  product: Product;
  selectedSize: string;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, size: string, delta: number) => void;
  onRemoveItem: (productId: string, size: string) => void;
  onProceedToCheckout: (discountAmount: number, promoCode: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const [promoInput, setPromoInput] = useState('');
  const [appliedCode, setAppliedCode] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string>('');

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (code === 'ROYAL10' || code === 'SINGHAROY10') {
      const disc = Math.round(subtotal * 0.1);
      setDiscount(disc);
      setAppliedCode(code);
      setPromoMessage('10% Royal Festive discount applied!');
    } else if (code === 'WELCOME500') {
      const disc = Math.min(500, subtotal);
      setDiscount(disc);
      setAppliedCode(code);
      setPromoMessage('₹500 Welcome discount applied!');
    } else {
      setPromoMessage('Invalid coupon code. Try ROYAL10');
    }
  };

  const shipping = subtotal >= 2999 || subtotal === 0 ? 0 : 250;
  const grandTotal = Math.max(0, subtotal - discount + shipping);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-amber-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-amber-50 w-full max-w-md h-full flex flex-col shadow-2xl border-l border-amber-900/20">
        {/* Header */}
        <div className="bg-amber-950 text-amber-50 p-4 border-b border-amber-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-amber-300" />
            <h3 className="font-serif font-bold text-base text-amber-100">Your Shopping Bag</h3>
            <span className="bg-amber-800 text-amber-200 text-xs px-2 py-0.5 rounded-full font-bold">
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-amber-900 rounded-full text-amber-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="bg-amber-900/10 px-4 py-2 border-b border-amber-900/10 text-xs text-amber-950 flex items-center justify-between">
          {subtotal >= 2999 ? (
            <span className="font-bold text-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>You unlocked FREE Express Delivery!</span>
            </span>
          ) : (
            <span>
              Add <strong className="text-amber-900">₹{(2999 - subtotal).toLocaleString('en-IN')}</strong> more for Free Express Shipping
            </span>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8 opacity-60" />
              </div>
              <h4 className="font-serif font-bold text-amber-950 text-lg">Your bag is empty</h4>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                Explore Singharoy Shop royal sherwanis, chikankari kurtas, and velvet Nehru jackets.
              </p>
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <div
                key={`${item.product.id}-${item.selectedSize}-${idx}`}
                className="bg-white border border-amber-900/10 rounded-xl p-3 flex gap-3 shadow-2xs relative group"
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-16 h-20 object-cover rounded-lg border border-amber-900/10 shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h5 className="font-serif font-bold text-amber-950 text-xs truncate">
                      {item.product.name}
                    </h5>
                    <div className="flex items-center space-x-2 text-[11px] text-stone-500 mt-0.5">
                      <span>Size: <strong className="text-amber-950">{item.selectedSize}</strong></span>
                      <span>•</span>
                      <span>₹{item.product.price.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-1.5 border border-amber-900/20 rounded-lg p-0.5 bg-amber-50">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, -1)}
                        className="p-1 hover:bg-amber-200 rounded text-amber-950"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold px-1.5 text-amber-950">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, 1)}
                        className="p-1 hover:bg-amber-200 rounded text-amber-950"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-amber-950">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => onRemoveItem(item.product.id, item.selectedSize)}
                        className="text-stone-400 hover:text-red-600 p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Summary */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-amber-100/60 border-t border-amber-900/15 space-y-3">
            {/* Coupon Code input */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Promo Code (e.g. ROYAL10)"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="w-full bg-white border border-amber-900/20 rounded-lg pl-8 pr-2 py-1.5 text-xs text-amber-950 uppercase placeholder:normal-case focus:outline-none focus:border-amber-900"
                />
              </div>
              <button
                type="submit"
                className="bg-amber-900 text-amber-50 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-800"
              >
                Apply
              </button>
            </form>
            {promoMessage && (
              <p className={`text-[10px] font-semibold ${appliedCode ? 'text-emerald-700' : 'text-red-600'}`}>
                {promoMessage}
              </p>
            )}

            {/* Calculations */}
            <div className="space-y-1.5 text-xs text-stone-700 pt-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-amber-950">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Festive Discount ({appliedCode}):</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Express Delivery Fee:</span>
                <span>{shipping === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-amber-900/10 text-sm font-bold text-amber-950">
                <span>Grand Total:</span>
                <span className="text-base text-amber-950">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => onProceedToCheckout(discount, appliedCode)}
              className="w-full bg-amber-900 hover:bg-amber-800 text-amber-50 py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 active:scale-98"
            >
              <span>Proceed to Express Checkout</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
