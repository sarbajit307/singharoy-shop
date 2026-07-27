import React, { useState, useRef, useEffect } from 'react';
import { Product, ChatMessage } from '../types';
import { X, Sparkles, Send, Bot, User, ShoppingBag, ArrowRight } from 'lucide-react';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: string) => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Namaste! Welcome to Singharoy Shop. I am your Royal Stylist & AI Sizing Advisor. Tell me about your event (Wedding, Sangeet, Haldi, Diwali) or ask for size recommendations!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          conversationHistory: messages,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Find matched products
        const matchedProds = data.recommendedProductIds
          ? products.filter((p) => data.recommendedProductIds.includes(p.id))
          : [];

        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendedProducts: matchedProds.length ? matchedProds : undefined,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-err-${Date.now()}`,
            sender: 'assistant',
            text: 'I apologize, I experienced a brief connectivity glitch. Please ask again!',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'assistant',
          text: 'I am currently unable to reach the Singharoy servers. Please check your internet connection.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'What should I wear for a Sangeet night?',
    'Haldi ceremony outfits under ₹6,000',
    'How do I select my Sherwani size?',
    'Suggest accessories for a Velvet Nehru Jacket',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-amber-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-amber-50 w-full max-w-md h-full flex flex-col shadow-2xl border-l border-amber-900/20">
        {/* Header */}
        <div className="bg-amber-950 text-amber-50 p-4 border-b border-amber-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-800 text-amber-300 rounded-lg border border-amber-600/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-amber-100 flex items-center gap-1.5">
                Singharoy AI Stylist
              </h3>
              <p className="text-[10px] text-amber-300/80">Sizing & Festive Fashion Guidance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-amber-900 rounded-full text-amber-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts Bar */}
        <div className="p-2 bg-amber-900/10 border-b border-amber-900/10 flex gap-1.5 overflow-x-auto scrollbar-none">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-900/15 rounded-full text-[10px] font-semibold text-amber-950 whitespace-nowrap shadow-2xs transition-colors shrink-0"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-amber-900 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-amber-900 text-amber-50 rounded-tr-none'
                    : 'bg-white border border-amber-900/10 text-stone-800 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                <span className={`text-[9px] block text-right mt-1.5 ${
                  msg.sender === 'user' ? 'text-amber-300/70' : 'text-stone-400'
                }`}>
                  {msg.timestamp}
                </span>

                {/* Recommended products inline cards */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-amber-900/10 space-y-2">
                    <span className="text-[10px] font-bold text-amber-950 uppercase tracking-wider block">
                      Recommended Collection Items:
                    </span>
                    <div className="space-y-2">
                      {msg.recommendedProducts.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-900/10 rounded-xl hover:bg-amber-100/70 transition-colors"
                        >
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-12 h-14 object-cover rounded-lg shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-serif font-bold text-amber-950 text-xs truncate">
                              {p.name}
                            </h5>
                            <span className="text-[11px] font-bold text-amber-900 block">
                              ₹{p.price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[9px] text-stone-500">{p.fabric}</span>
                          </div>
                          <button
                            onClick={() => {
                              onSelectProduct(p);
                              onClose();
                            }}
                            className="p-1.5 bg-amber-900 text-amber-100 rounded-lg hover:bg-amber-800 shrink-0"
                            title="View Garment"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-amber-700 text-amber-100 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-full bg-amber-900 text-amber-300 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="bg-white border border-amber-900/10 text-stone-600 rounded-2xl rounded-tl-none p-3 text-xs flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
                <span>Crafting personal fashion advise...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-amber-100/80 border-t border-amber-900/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about sizing, outfit styling, occasions..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-white border border-amber-900/20 rounded-full px-4 py-2 text-xs text-amber-950 placeholder-stone-400 focus:outline-none focus:border-amber-900"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 bg-amber-900 hover:bg-amber-800 text-amber-50 rounded-full disabled:opacity-50 transition-all shadow-md shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
