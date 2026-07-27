import React, { useState } from 'react';
import { Product } from '../types';
import { Sparkles, ShoppingBag, Star, Eye, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, selectedSize: string) => void;
  onOpenAISizeModal: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onAddToCart,
  onOpenAISizeModal,
}) => {
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes.find((s) => s.stock > 0)?.size || product.sizes[0]?.size || '38 (S)'
  );
  const [added, setAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const isLowStock = product.totalStock > 0 && product.totalStock <= 8;
  const isOutOfStock = product.totalStock === 0;

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group relative bg-amber-50/80 border border-amber-900/10 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] bg-amber-100/50 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.isFeatured && (
            <span className="bg-amber-800 text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow">
              Featured Royal
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-emerald-800 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow">
              New Arrival
            </span>
          )}
          {isLowStock && (
            <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow animate-pulse">
              Only {product.totalStock} Left
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-stone-800 text-stone-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow">
              Sold Out
            </span>
          )}
        </div>

        {/* AI Size Trigger overlay button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenAISizeModal(product);
          }}
          className="absolute top-3 right-3 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-400/50 p-2 rounded-full shadow-md backdrop-blur-sm transition-transform active:scale-95 flex items-center justify-center group/btn"
          title="Get AI Master Tailor Size Advice"
        >
          <Sparkles className="w-4 h-4 text-amber-400 group-hover/btn:animate-spin" />
        </button>

        {/* Quick View overlay on hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-amber-950/90 via-amber-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="bg-amber-100 text-amber-950 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1 hover:bg-white shadow"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-amber-800 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-amber-900/80">
              {product.category}
            </span>
            <div className="flex items-center space-x-1 text-amber-600">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span className="font-semibold">{product.rating}</span>
              <span className="text-amber-700/60 text-[10px]">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-serif font-bold text-amber-950 text-base line-clamp-1 group-hover:text-amber-800 transition-colors">
            {product.name}
          </h3>

          {/* Fabric info */}
          <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">{product.fabric}</p>

          {/* Price */}
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-lg font-bold text-amber-950">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-stone-400 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            {product.originalPrice && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                SAVE ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        {/* Size Selection & Add to Cart */}
        <div className="mt-4 pt-3 border-t border-amber-900/10" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between text-[11px] text-stone-600 mb-1.5">
            <span className="font-medium">Select Size:</span>
            <button
              onClick={() => onOpenAISizeModal(product)}
              className="text-amber-800 font-semibold text-[10px] hover:underline flex items-center space-x-0.5"
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>AI Size Help</span>
            </button>
          </div>

          {/* Sizes Pills */}
          <div className="flex flex-wrap gap-1 mb-3">
            {product.sizes.map((s) => {
              const disabled = s.stock === 0;
              return (
                <button
                  key={s.size}
                  disabled={disabled}
                  onClick={() => setSelectedSize(s.size)}
                  className={`px-2 py-1 text-[11px] rounded border transition-all ${
                    disabled
                      ? 'bg-stone-100 text-stone-400 border-stone-200 line-through cursor-not-allowed'
                      : selectedSize === s.size
                      ? 'bg-amber-900 text-amber-100 border-amber-900 font-bold shadow-xs'
                      : 'bg-white text-amber-950 border-amber-900/20 hover:border-amber-900'
                  }`}
                >
                  {s.size}
                </button>
              );
            })}
          </div>

          <button
            disabled={isOutOfStock}
            onClick={handleQuickAdd}
            className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              isOutOfStock
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : added
                ? 'bg-emerald-700 text-white'
                : 'bg-amber-900 hover:bg-amber-800 text-amber-50 active:scale-98 shadow-sm'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Bag!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Shopping Bag'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
