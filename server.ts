import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from './src/data/initialProducts';
import { Product, Order, OrderStatus, AISizeRequest, AISizeResponse } from './src/types';

// In-Memory Database for Singharoy Shop
let productsStore: Product[] = [...INITIAL_PRODUCTS];
let ordersStore: Order[] = [...INITIAL_ORDERS];

// Initialize Gemini Client Lazily/Safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // -------------------------------------------------------------
  // PRODUCTS REST API
  // -------------------------------------------------------------

  // Get all products with optional filtering
  app.get('/api/products', (req, res) => {
    try {
      let filtered = [...productsStore];
      const { category, search, featured, occasion, maxPrice } = req.query;

      if (category && category !== 'All') {
        filtered = filtered.filter(
          (p) => p.category.toLowerCase() === (category as string).toLowerCase()
        );
      }

      if (featured === 'true') {
        filtered = filtered.filter((p) => p.isFeatured);
      }

      if (occasion && occasion !== 'All') {
        filtered = filtered.filter((p) =>
          p.occasion.some((o) => o.toLowerCase().includes((occasion as string).toLowerCase()))
        );
      }

      if (maxPrice) {
        const cap = Number(maxPrice);
        if (!isNaN(cap)) {
          filtered = filtered.filter((p) => p.price <= cap);
        }
      }

      if (search) {
        const q = (search as string).toLowerCase().trim();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.fabric.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.color.toLowerCase().includes(q)
        );
      }

      res.json({ success: true, count: filtered.length, products: filtered });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get single product details
  app.get('/api/products/:id', (req, res) => {
    const product = productsStore.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, product });
  });

  // Add new product (Admin)
  app.post('/api/products', (req, res) => {
    try {
      const newProd: Product = req.body;
      if (!newProd.name || !newProd.price || !newProd.category) {
        return res.status(400).json({ success: false, error: 'Name, price, and category are required' });
      }

      const id = `prod-${Date.now()}`;
      const totalStock = newProd.sizes
        ? newProd.sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0)
        : Number(newProd.totalStock) || 0;

      const created: Product = {
        ...newProd,
        id,
        totalStock,
        rating: newProd.rating || 4.8,
        reviewsCount: newProd.reviewsCount || 0,
        images: newProd.images?.length
          ? newProd.images
          : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'],
      };

      productsStore.unshift(created);
      res.status(201).json({ success: true, product: created });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update full product details (Admin)
  app.put('/api/products/:id', (req, res) => {
    try {
      const idx = productsStore.findIndex((p) => p.id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }

      const updatedData: Partial<Product> = req.body;
      const current = productsStore[idx];

      const sizes = updatedData.sizes || current.sizes;
      const totalStock = sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);

      const updatedProduct: Product = {
        ...current,
        ...updatedData,
        id: current.id,
        totalStock,
      };

      productsStore[idx] = updatedProduct;
      res.json({ success: true, product: updatedProduct });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Real-time stock / inventory adjustment (Admin)
  app.patch('/api/products/:id/inventory', (req, res) => {
    try {
      const idx = productsStore.findIndex((p) => p.id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }

      const { size, newStock } = req.body; // e.g., { size: '40 (M)', newStock: 15 }
      const current = productsStore[idx];

      const updatedSizes = current.sizes.map((s) =>
        s.size === size ? { ...s, stock: Math.max(0, Number(newStock)) } : s
      );

      const totalStock = updatedSizes.reduce((sum, s) => sum + s.stock, 0);

      productsStore[idx] = {
        ...current,
        sizes: updatedSizes,
        totalStock,
      };

      res.json({ success: true, product: productsStore[idx] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Delete product (Admin)
  app.delete('/api/products/:id', (req, res) => {
    const idx = productsStore.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    const removed = productsStore.splice(idx, 1)[0];
    res.json({ success: true, deletedId: removed.id });
  });

  // -------------------------------------------------------------
  // ORDERS REST API
  // -------------------------------------------------------------

  // Get all orders (Admin or filtering)
  app.get('/api/orders', (req, res) => {
    const { status, search } = req.query;
    let list = [...ordersStore];

    if (status && status !== 'All') {
      list = list.filter((o) => o.status === status);
    }

    if (search) {
      const q = (search as string).toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.trackingNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          o.customer.phone.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: list.length, orders: list });
  });

  // Get order by ID or Tracking Number
  app.get('/api/orders/:id', (req, res) => {
    const queryId = req.params.id.trim().toUpperCase();
    const order = ordersStore.find(
      (o) => o.id.toUpperCase() === queryId || o.trackingNumber.toUpperCase() === queryId
    );

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({ success: true, order });
  });

  // Create new order (Customer Checkout)
  app.post('/api/orders', (req, res) => {
    try {
      const { customer, items, paymentMethod } = req.body;

      if (!customer || !items || !items.length) {
        return res.status(400).json({ success: false, error: 'Customer details and order items are required' });
      }

      // Calculate total & deduct stock in real time
      let totalAmount = 0;
      for (const item of items) {
        totalAmount += Number(item.price) * Number(item.quantity);

        // Deduct inventory
        const product = productsStore.find((p) => p.id === item.productId);
        if (product) {
          const sizeObj = product.sizes.find((s) => s.size === item.size);
          if (sizeObj) {
            sizeObj.stock = Math.max(0, sizeObj.stock - item.quantity);
          }
          product.totalStock = product.sizes.reduce((sum, s) => sum + s.stock, 0);
        }
      }

      const orderId = `SR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const trackingNumber = `DEL-SR-${Math.floor(8000000 + Math.random() * 9000000)}`;
      const nowIso = new Date().toISOString();

      const newOrder: Order = {
        id: orderId,
        customer,
        items,
        totalAmount,
        status: 'Confirmed',
        paymentMethod: paymentMethod || 'UPI',
        createdAt: nowIso,
        trackingNumber,
        statusHistory: [
          { status: 'Pending', timestamp: nowIso, note: 'Order placed at Singharoy Shop' },
          { status: 'Confirmed', timestamp: nowIso, note: 'Payment successfully processed' },
        ],
      };

      ordersStore.unshift(newOrder);

      res.status(201).json({
        success: true,
        order: newOrder,
        message: 'Order created successfully!',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update order status (Admin)
  app.patch('/api/orders/:id/status', (req, res) => {
    try {
      const { status, note } = req.body;
      const order = ordersStore.find((o) => o.id === req.params.id);

      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      order.status = status as OrderStatus;
      order.statusHistory.push({
        status: status as OrderStatus,
        timestamp: new Date().toISOString(),
        note: note || `Status updated to ${status} by admin`,
      });

      res.json({ success: true, order });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // -------------------------------------------------------------
  // ADMIN DASHBOARD STATS
  // -------------------------------------------------------------
  app.get('/api/admin/stats', (_req, res) => {
    const totalRevenue = ordersStore.reduce((sum, o) => (o.status !== 'Cancelled' ? sum + o.totalAmount : sum), 0);
    const totalOrders = ordersStore.length;
    const pendingOrders = ordersStore.filter((o) => o.status === 'Pending' || o.status === 'Processing').length;
    const lowStockItems = productsStore.filter((p) => p.totalStock < 8);
    const outOfStockItems = productsStore.filter((p) => p.totalStock === 0);

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        totalProductsCount: productsStore.length,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
        lowStockProducts: lowStockItems,
      },
    });
  });

  // -------------------------------------------------------------
  // AI SIZING RECOMMENDATION ENGINE (GEMINI API)
  // -------------------------------------------------------------
  app.post('/api/ai/size-recommendation', async (req, res) => {
    try {
      const body: AISizeRequest = req.body;
      const { heightCm, weightKg, chestInches, waistInches, fitPreference, category, occasion } = body;

      const ai = getGeminiClient();

      if (!ai) {
        // Dynamic algorithmic fallback sizing logic for Indian menswear standard tailoring
        let baseSizeNumber = 40;
        let baseSizeTag = '40 (M)';

        if (chestInches <= 37) {
          baseSizeNumber = 38;
          baseSizeTag = '38 (S)';
        } else if (chestInches <= 39) {
          baseSizeNumber = 40;
          baseSizeTag = '40 (M)';
        } else if (chestInches <= 41) {
          baseSizeNumber = 42;
          baseSizeTag = '42 (L)';
        } else if (chestInches <= 43) {
          baseSizeNumber = 44;
          baseSizeTag = '44 (XL)';
        } else {
          baseSizeNumber = 46;
          baseSizeTag = '46 (XXL)';
        }

        // Adjust for fit preference or layered garments like Sherwanis
        let recommended = baseSizeTag;
        if (category === 'Sherwanis' && fitPreference === 'Relaxed Comfort') {
          recommended = `${baseSizeNumber + 2} (${baseSizeNumber === 38 ? 'M' : baseSizeNumber === 40 ? 'L' : baseSizeNumber === 42 ? 'XL' : 'XXL'})`;
        }

        const fallbackResponse: AISizeResponse = {
          recommendedSize: recommended,
          alternativeSize: `${baseSizeNumber} (Standard Fit)`,
          confidence: 'High (Standard Tailoring Matrix)',
          reasoning: `Based on your chest size of ${chestInches}" and waist of ${waistInches}", Singharoy Shop's royal menswear pattern recommends ${recommended} for a ideal drape in ${category}.`,
          fitNotes: [
            `Indian Menswear ${category} allows 3-4 inches of grace breathing room over actual chest measurement.`,
            `If you plan to wear a thick cotton kurta beneath a heavy ${category}, the ${recommended} provides optimal chest freedom.`,
            'All Singharoy Shop garments come with a 2-inch interior seam allowance for easy local master-tailor adjustment.',
          ],
          alterationTip:
            'Churidar pyjamas come with an adjustable drawstring waistband. Length can be gathered at ankles (churi effect).',
        };

        return res.json({ success: true, recommendation: fallbackResponse });
      }

      const prompt = `
You are the Chief Master Tailor and AI Fashion Curator for Singharoy Shop, an exclusive Indian luxury menswear brand.
A customer has requested a personalized sizing recommendation for a ${category}.

Customer Physical Measurements & Preferences:
- Height: ${heightCm} cm
- Weight: ${weightKg} kg
- Chest Measurement: ${chestInches} inches
- Waist Measurement: ${waistInches} inches
- Preferred Fit: ${fitPreference} (options: Tailored Slim, Regular Classic, Relaxed Comfort)
- Garment Category: ${category}
- Occasion / Event: ${occasion || 'Celebration'}

Singharoy Shop Menswear Size Matrix:
- Size 38 (S): Chest 36-37", Shoulder 17.5", Kurta/Sherwani Length 40-42"
- Size 40 (M): Chest 38-39", Shoulder 18.0", Kurta/Sherwani Length 42-44"
- Size 42 (L): Chest 40-41", Shoulder 18.5", Kurta/Sherwani Length 44-45"
- Size 44 (XL): Chest 42-43", Shoulder 19.0", Kurta/Sherwani Length 45-46"
- Size 46 (XXL): Chest 44-45", Shoulder 19.5", Kurta/Sherwani Length 46-47"

Rules for Indian Menswear Tailoring:
1. Sherwanis & Bandhgalas are structured garments with stiff interlining — recommend +1 size higher if customer is between sizes or prefers comfort/layering over a kurta.
2. Kurtas & Nehru Jackets should allow 3 to 4 inches of chest ease over natural body measurement for comfortable movement during dance (Sangeet) and rituals.
3. Provide a clear, respectful, expert recommendation in JSON format.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendedSize: { type: Type.STRING, description: 'e.g., 40 (M)' },
              alternativeSize: { type: Type.STRING, description: 'Alternative option if customer prefers tighter/looser' },
              confidence: { type: Type.STRING, description: 'e.g. High (98%)' },
              reasoning: { type: Type.STRING, description: 'Detailed explanation from Master Tailor perspective' },
              fitNotes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2-3 specific fit points regarding shoulders, length, and chest ease',
              },
              alterationTip: { type: Type.STRING, description: 'Tip regarding interior margin allowance or churidar' },
            },
            required: ['recommendedSize', 'confidence', 'reasoning', 'fitNotes', 'alterationTip'],
          },
        },
      });

      const text = response.text || '';
      const parsed: AISizeResponse = JSON.parse(text);

      res.json({ success: true, recommendation: parsed });
    } catch (err: any) {
      console.error('AI Size recommendation error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // -------------------------------------------------------------
  // AI STYLING & SHOPPING ASSISTANT CHAT
  // -------------------------------------------------------------
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, conversationHistory } = req.body;

      if (!message) {
        return res.status(400).json({ success: false, error: 'Message is required' });
      }

      const ai = getGeminiClient();

      // Catalog Context for recommendations
      const catalogSummary = productsStore
        .map(
          (p) =>
            `- [${p.id}] ${p.name} (${p.category}) | Price: ₹${p.price.toLocaleString('en-IN')} | Color: ${
              p.color
            } | Fabric: ${p.fabric} | Occasions: ${p.occasion.join(', ')} | In Stock: ${p.totalStock > 0 ? 'Yes' : 'No'}`
        )
        .join('\n');

      if (!ai) {
        // Friendly fallback assistant if GEMINI_API_KEY is pending
        const msgLower = message.toLowerCase();
        let reply =
          "Namaste! Welcome to Singharoy Shop. I am your personal Indian Menswear Fashion & Styling Assistant. How may I assist your wardrobe selection today?";

        if (msgLower.includes('wedding') || msgLower.includes('groom') || msgLower.includes('sherwani')) {
          reply =
            "For grand wedding ceremonies and groomwear, our 'Royal Gold & Ivory Zardozi Sherwani Set' (prod-101) or 'Emerald Green Brocade Indo-Western Achkan' (prod-103) are top luxury choices! Pair them with handcrafted Zardozi Mojaris for a complete royal look.";
        } else if (msgLower.includes('haldi') || msgLower.includes('yellow')) {
          reply =
            "For Haldi and morning rituals, our vibrant 'Mustard Yellow Haldi Special Cotton-Silk Kurta Set' (prod-105) provides effortless elegance and comfort!";
        } else if (msgLower.includes('size') || msgLower.includes('fit') || msgLower.includes('measurement')) {
          reply =
            "You can use our 'AI Master Tailor Sizing Tool' on any product page or tell me your chest size and height here! Generally, Indian menswear kurtas are designed with 3-4 inches of ease over natural chest size.";
        }

        return res.json({
          success: true,
          reply,
          recommendedProductIds: ['prod-101', 'prod-102', 'prod-106'],
        });
      }

      const systemInstruction = `
You are "Singharoy Fashion Assistant", an expert stylist and AI advisor for Singharoy Shop — a high-end luxury Indian menswear brand.
You assist men in selecting royal ethnic fashion (Sherwanis, Kurtas, Nehru Jackets, Indo-Western Achkans, Mojari footwear, Safas, and accessories) for weddings, Haldi, Sangeet, Diwali, Receptions, and formal celebrations.

Here is Singharoy Shop's current live inventory catalog:
${catalogSummary}

Guidance:
1. Provide warm, polite, culturally knowledgeable fashion advice in polite English with appropriate traditional terms (e.g. Namaste, Zardozi, Kurta, Sherwani, Royal drape).
2. Recommend specific products from Singharoy Shop catalog with their product IDs whenever applicable.
3. Help customers calculate sizes or choose color combinations (e.g., pairing a Cream Chikankari Kurta with a Midnight Blue Velvet Nehru Jacket).
4. Keep answers concise, elegant, and directly helpful.
5. If the user asks about order tracking or admin policy, explain that they can track orders live via the "Track Order" button or switch to the Admin Portal in the top navigation.
`;

      const contents = [];
      if (Array.isArray(conversationHistory) && conversationHistory.length) {
        for (const turn of conversationHistory.slice(-6)) {
          contents.push({
            role: turn.sender === 'user' ? 'user' : 'model',
            parts: [{ text: turn.text }],
          });
        }
      }
      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || 'Namaste! How may I assist you with Singharoy Shop collections today?';

      // Match product IDs mentioned in reply or relevant to query
      const matchedIds = productsStore
        .filter((p) => reply.includes(p.id) || reply.toLowerCase().includes(p.name.toLowerCase()))
        .map((p) => p.id);

      res.json({
        success: true,
        reply,
        recommendedProductIds: matchedIds.length ? matchedIds : undefined,
      });
    } catch (err: any) {
      console.error('AI Chat Error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // -------------------------------------------------------------
  // VITE MIDDLEWARE SETUP
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Singharoy Shop Server running on http://localhost:${PORT}`);
  });
}

startServer();
