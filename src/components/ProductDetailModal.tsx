import React, { useState } from 'react';
import { Product } from '../types';
import { X, Sparkles, ShoppingBag, ShieldCheck, Truck, RefreshCw, Star, Heart } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: string) => void;
  onOpenAISizeModal: (product: Product) => void;
  onExpressBuy: (product: Product, size: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onOpenAISizeModal,
  onExpressBuy,
}) => {
  if (!product) return null;

  const [selectedImage, setSelectedImage] = useState<string>(product.images[0] || '');
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes.find((s) => s.stock > 0)?.size || product.sizes[0]?.size || '38 (S)'
  );
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const isOutOfStock = product.totalStock === 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-amber-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative bg-amber-50 border border-amber-900/20 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-amber-900/80 hover:bg-amber-950 text-amber-100 p-2 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Gallery Column */}
        <div className="w-full md:w-1/2 bg-amber-100/50 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-amber-900/10">
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-amber-900/10 shadow-inner bg-white mb-4">
            <img
              src={selectedImage || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-20 rounded-md overflow-hidden border-2 transition-all ${
                    selectedImage === img ? 'border-amber-800 scale-105 shadow-sm' : 'border-amber-200/80 opacity-70'
                  }`}
                >
                  <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Column */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Category & Rating */}
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="bg-amber-900 text-amber-100 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider text-[10px]">
                {product.category}
              </span>
              <div className="flex items-center space-x-1 text-amber-700">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="font-bold">{product.rating}</span>
                <span className="text-stone-500">({product.reviewsCount} reviews)</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-amber-950 mb-2 leading-snug">
              {product.name}
            </h2>

            {/* Price section */}
            <div className="flex items-baseline space-x-3 mb-4">
              <span className="text-2xl font-bold text-amber-950">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-stone-400 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-xs text-stone-500">(Inclusive of all Taxes)</span>
            </div>

            {/* AI Sizing recommendation CTA callout */}
            <div className="bg-gradient-to-r from-amber-900/10 via-amber-800/5 to-amber-900/10 border border-amber-800/20 rounded-xl p-3.5 mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-900 text-amber-300 rounded-lg">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-950">Not sure about Indian Sizing?</h4>
                  <p className="text-[11px] text-stone-600">Get AI Master Tailor sizing recommendation in 10s</p>
                </div>
              </div>
              <button
                onClick={() => onOpenAISizeModal(product)}
                className="bg-amber-900 hover:bg-amber-800 text-amber-100 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs whitespace-nowrap"
              >
                Get AI Size
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-stone-700 leading-relaxed mb-4">{product.description}</p>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-amber-100/60 rounded-xl text-xs text-stone-700 mb-6 border border-amber-900/10">
              <div>
                <span className="font-semibold text-amber-950 block">Fabric:</span>
                <span>{product.fabric}</span>
              </div>
              <div>
                <span className="font-semibold text-amber-950 block">Color Palette:</span>
                <span>{product.color}</span>
              </div>
              <div>
                <span className="font-semibold text-amber-950 block">Occasion:</span>
                <span>{product.occasion.join(', ')}</span>
              </div>
              <div>
                <span className="font-semibold text-amber-950 block">Garment Care:</span>
                <span>{product.care}</span>
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-amber-950">Select Garment Size:</span>
                <span className="text-stone-500 font-medium">
                  Selected Stock:{' '}
                  {product.sizes.find((s) => s.size === selectedSize)?.stock || 0} units
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => {
                  const out = s.stock === 0;
                  return (
                    <button
                      key={s.size}
                      disabled={out}
                      onClick={() => setSelectedSize(s.size)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                        out
                          ? 'bg-stone-100 text-stone-400 border-stone-200 line-through cursor-not-allowed'
                          : selectedSize === s.size
                          ? 'bg-amber-900 text-amber-100 border-amber-900 shadow-md ring-2 ring-amber-500/30'
                          : 'bg-white text-amber-950 border-amber-900/20 hover:border-amber-900'
                      }`}
                    >
                      {s.size} {s.stock < 5 && s.stock > 0 ? `(${s.stock} left)` : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-amber-900/10">
            <div className="flex gap-3">
              <button
                disabled={isOutOfStock}
                onClick={handleAdd}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
                  isOutOfStock
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                    : added
                    ? 'bg-emerald-700 text-white'
                    : 'bg-amber-900 hover:bg-amber-800 text-amber-50 shadow-md active:scale-98'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{added ? 'Added to Bag!' : 'Add to Shopping Bag'}</span>
              </button>

              <button
                disabled={isOutOfStock}
                onClick={() => {
                  onAddToCart(product, selectedSize);
                  onExpressBuy(product, selectedSize);
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-amber-950 py-3 px-4 rounded-xl text-sm font-bold shadow-md transition-all active:scale-98 border border-amber-600/50"
              >
                Express Buy
              </button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] text-stone-600 text-center">
              <div className="flex flex-col items-center p-1.5 bg-amber-100/40 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-amber-800 mb-0.5" />
                <span>100% Authentic Handloom</span>
              </div>
              <div className="flex flex-col items-center p-1.5 bg-amber-100/40 rounded-lg">
                <Truck className="w-4 h-4 text-amber-800 mb-0.5" />
                <span>Pan-India Express Express</span>
              </div>
              <div className="flex flex-col items-center p-1.5 bg-amber-100/40 rounded-lg">
                <RefreshCw className="w-4 h-4 text-amber-800 mb-0.5" />
                <span>Easy Size Exchange</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
