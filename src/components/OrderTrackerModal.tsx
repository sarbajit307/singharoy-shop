import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { X, Search, PackageCheck, Truck, CheckCircle2, Clock, MapPin, AlertCircle } from 'lucide-react';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('SR-2026-9101');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setOrder(null);
        setError(data.error || 'No matching order found for this Reference / Tracking Number');
      }
    } catch (err) {
      setError('Connection error while contacting logistics system');
    } finally {
      setLoading(false);
    }
  };

  const steps: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered',
  ];

  const getStepIndex = (status: OrderStatus) => {
    return steps.indexOf(status);
  };

  const currentIdx = order ? getStepIndex(order.status) : -1;

  return (
    <div className="fixed inset-0 z-50 bg-amber-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative bg-amber-50 border border-amber-900/20 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl my-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-amber-900/10 hover:bg-amber-900/20 text-amber-950 p-2 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6 border-b border-amber-900/10 pb-4">
          <div className="p-2.5 bg-amber-900 text-amber-300 rounded-xl">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-amber-950">Track Royal Order</h3>
            <p className="text-xs text-stone-600">Enter your Singharoy Order ID or Delhivery Tracking Number</p>
          </div>
        </div>

        {/* Search Input */}
        <form onSubmit={handleTrack} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="e.g. SR-2026-9101 or DEL-SR-8849201"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white border border-amber-900/20 rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono font-bold text-amber-950 uppercase placeholder:normal-case placeholder:font-normal focus:outline-none focus:border-amber-900"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-900 hover:bg-amber-800 text-amber-50 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all shrink-0"
          >
            {loading ? 'Searching...' : 'Track Live'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs flex items-center space-x-2 mb-4">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Order Details View */}
        {order && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header info */}
            <div className="bg-amber-100/70 border border-amber-900/15 rounded-xl p-4 flex flex-wrap justify-between items-center gap-2 text-xs">
              <div>
                <span className="text-stone-500 block text-[10px]">Order Reference:</span>
                <span className="font-mono font-bold text-amber-950 text-sm">{order.id}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[10px]">Tracking Number:</span>
                <span className="font-mono font-bold text-amber-900">{order.trackingNumber}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[10px]">Current Status:</span>
                <span className="bg-amber-900 text-amber-100 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase">
                  {order.status}
                </span>
              </div>
            </div>

            {/* Timeline Bar */}
            <div>
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-3">
                Live Fulfillment Progress
              </h4>

              <div className="relative flex items-center justify-between px-2">
                {/* Connecting Line */}
                <div className="absolute top-4 left-6 right-6 h-1 bg-amber-200 -z-0">
                  <div
                    className="h-full bg-amber-800 transition-all duration-500"
                    style={{
                      width: `${Math.max(0, (currentIdx / (steps.length - 1)) * 100)}%`,
                    }}
                  />
                </div>

                {steps.map((st, idx) => {
                  const isCompleted = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div key={st} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-amber-900 text-amber-300 ring-4 ring-amber-400/30 scale-110 shadow-md'
                            : isCompleted
                            ? 'bg-amber-800 text-white'
                            : 'bg-white border-2 border-amber-300 text-stone-400'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span className={`text-[9px] font-bold mt-1 max-w-[60px] text-center ${
                        isCurrent ? 'text-amber-950' : 'text-stone-500'
                      }`}>
                        {st}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items Purchased */}
            <div>
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-2">
                Items in this Package:
              </h4>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2.5 bg-white border border-amber-900/10 rounded-xl"
                  >
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-10 h-12 object-cover rounded-lg border shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <h5 className="font-serif font-bold text-amber-950 truncate">
                        {item.productName}
                      </h5>
                      <span className="text-stone-500 text-[11px]">
                        Size: <strong>{item.size}</strong> | Qty: {item.quantity}
                      </span>
                    </div>
                    <span className="font-bold text-xs text-amber-950">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status History */}
            {order.statusHistory.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-2">
                  Status Log:
                </h4>
                <div className="space-y-2 border-l-2 border-amber-900/20 ml-2 pl-3">
                  {order.statusHistory.map((h, idx) => (
                    <div key={idx} className="text-xs text-stone-700">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-amber-950">{h.status}</span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(h.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {h.note && <p className="text-[11px] text-stone-500 mt-0.5">{h.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
