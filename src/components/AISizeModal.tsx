import React, { useState } from 'react';
import { Product, AISizeRequest, AISizeResponse, FitPreference, ProductCategory } from '../types';
import { X, Sparkles, Ruler, CheckCircle2, AlertCircle, Shirt } from 'lucide-react';

interface AISizeModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectSize: (size: string) => void;
}

export const AISizeModal: React.FC<AISizeModalProps> = ({ product, onClose, onSelectSize }) => {
  if (!product) return null;

  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightKg, setWeightKg] = useState<number>(72);
  const [chestInches, setChestInches] = useState<number>(40);
  const [waistInches, setWaistInches] = useState<number>(34);
  const [fitPreference, setFitPreference] = useState<FitPreference>('Regular Classic');
  const [category, setCategory] = useState<ProductCategory>(product?.category || 'Kurtas');
  const [occasion, setOccasion] = useState<string>(product?.occasion[0] || 'Wedding / Celebration');

  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<AISizeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: AISizeRequest = {
      heightCm,
      weightKg,
      chestInches,
      waistInches,
      fitPreference,
      category,
      occasion,
    };

    try {
      const res = await fetch('/api/ai/size-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.recommendation) {
        setRecommendation(data.recommendation);
      } else {
        setError(data.error || 'Failed to generate sizing advice');
      }
    } catch (err: any) {
      setError('Connection error while contacting AI Master Tailor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-amber-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative bg-amber-50 border border-amber-900/20 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl overflow-hidden my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-amber-900/10 hover:bg-amber-900/20 text-amber-950 p-2 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6 border-b border-amber-900/10 pb-4">
          <div className="p-3 bg-amber-900 text-amber-300 rounded-xl shadow-md">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-amber-950">
              AI Master Tailor Sizing Tool
            </h3>
            <p className="text-xs text-stone-600">
              {product ? `Custom sizing recommendation for: ${product.name}` : 'Personalized Indian Menswear Sizing Advisor'}
            </p>
          </div>
        </div>

        {/* Form */}
        {!recommendation ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center justify-between">
                  <span>Chest Size (Inches):</span>
                  <span className="text-amber-800 font-semibold">{chestInches}"</span>
                </label>
                <input
                  type="range"
                  min="32"
                  max="52"
                  step="0.5"
                  value={chestInches}
                  onChange={(e) => setChestInches(Number(e.target.value))}
                  className="w-full accent-amber-900"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                  <span>32" (XS)</span>
                  <span>42" (L)</span>
                  <span>52" (3XL)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center justify-between">
                  <span>Waist Size (Inches):</span>
                  <span className="text-amber-800 font-semibold">{waistInches}"</span>
                </label>
                <input
                  type="range"
                  min="28"
                  max="48"
                  step="0.5"
                  value={waistInches}
                  onChange={(e) => setWaistInches(Number(e.target.value))}
                  className="w-full accent-amber-900"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                  <span>28"</span>
                  <span>38"</span>
                  <span>48"</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-amber-950 mb-1">
                  Height (cm):
                </label>
                <input
                  type="number"
                  min="140"
                  max="210"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full bg-white border border-amber-900/20 rounded-lg px-3 py-2 text-xs font-medium text-amber-950 focus:outline-none focus:border-amber-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-950 mb-1">
                  Weight (kg):
                </label>
                <input
                  type="number"
                  min="40"
                  max="150"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full bg-white border border-amber-900/20 rounded-lg px-3 py-2 text-xs font-medium text-amber-950 focus:outline-none focus:border-amber-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">
                Fit Preference:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Tailored Slim', 'Regular Classic', 'Relaxed Comfort'] as FitPreference[]).map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => setFitPreference(pref)}
                    className={`py-2 px-2 text-[11px] font-bold rounded-lg border transition-all ${
                      fitPreference === pref
                        ? 'bg-amber-900 text-amber-100 border-amber-900 shadow-sm'
                        : 'bg-white text-stone-700 border-amber-900/20 hover:border-amber-900'
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">
                Garment Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full bg-white border border-amber-900/20 rounded-lg px-3 py-2 text-xs font-medium text-amber-950 focus:outline-none focus:border-amber-900"
              >
                <option value="Sherwanis">Sherwanis & Achkans</option>
                <option value="Kurtas">Kurta Sets & Chikankari</option>
                <option value="Nehru Jackets">Nehru Jackets & Bandhgalas</option>
                <option value="Indo-Western">Indo-Western Fusion Wear</option>
                <option value="Footwear">Juttis & Mojaris</option>
                <option value="Accessories">Safas, Stoles & Accessories</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-900 hover:bg-amber-800 text-amber-50 py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 active:scale-98"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                  <span>AI Master Tailor Analyzing Pattern...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Calculate Recommended Garment Size</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Recommendation View */
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="bg-gradient-to-br from-amber-900 to-amber-950 text-amber-50 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
              <span className="text-[10px] font-bold tracking-widest uppercase bg-amber-800 text-amber-200 px-3 py-1 rounded-full border border-amber-600/40 inline-block mb-2">
                Recommended Size
              </span>
              <div className="text-4xl font-serif font-extrabold text-amber-300 my-1">
                {recommendation.recommendedSize}
              </div>
              <div className="text-xs text-amber-200/80 font-medium">
                Tailor Match Confidence: <span className="text-emerald-300 font-bold">{recommendation.confidence}</span>
              </div>
              {recommendation.alternativeSize && (
                <div className="text-[11px] text-amber-300/80 mt-2">
                  Alternative Option: {recommendation.alternativeSize}
                </div>
              )}
            </div>

            {/* Reasoning */}
            <div className="bg-amber-100/60 border border-amber-900/10 rounded-xl p-4 text-xs text-stone-800 space-y-2">
              <h4 className="font-bold text-amber-950 text-sm flex items-center space-x-1.5">
                <Shirt className="w-4 h-4 text-amber-800" />
                <span>Master Tailor Analysis</span>
              </h4>
              <p className="leading-relaxed">{recommendation.reasoning}</p>
            </div>

            {/* Fit Points */}
            <div className="space-y-1.5 text-xs text-stone-700">
              <span className="font-bold text-amber-950 text-xs block">Key Fit Notes:</span>
              {recommendation.fitNotes.map((note, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>{note}</span>
                </div>
              ))}
            </div>

            {/* Alteration Tip */}
            <div className="bg-amber-900/5 border border-amber-900/20 rounded-xl p-3 text-xs text-stone-800">
              <span className="font-bold text-amber-950 block mb-0.5">Custom Alteration Allowance:</span>
              <p className="text-[11px] text-stone-600">{recommendation.alterationTip}</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  if (product) {
                    onSelectSize(recommendation.recommendedSize);
                  }
                  onClose();
                }}
                className="flex-1 bg-amber-900 hover:bg-amber-800 text-amber-50 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all"
              >
                Apply Size {recommendation.recommendedSize}
              </button>
              <button
                onClick={() => setRecommendation(null)}
                className="px-4 py-2.5 border border-amber-900/30 text-amber-950 hover:bg-amber-100 rounded-xl text-xs font-bold transition-all"
              >
                Recalculate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
