export type ProductCategory =
  | 'Sherwanis'
  | 'Kurtas'
  | 'Nehru Jackets'
  | 'Indo-Western'
  | 'Bottoms'
  | 'Footwear'
  | 'Accessories';

export type FitPreference = 'Tailored Slim' | 'Regular Classic' | 'Relaxed Comfort';

export interface SizeStock {
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  description: string;
  fabric: string;
  color: string;
  sizes: SizeStock[];
  totalStock: number;
  images: string[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  occasion: string[];
  care: string;
  rating: number;
  reviewsCount: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  customer: CustomerDetails;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: 'UPI' | 'Card' | 'COD' | 'NetBanking';
  createdAt: string;
  trackingNumber: string;
  statusHistory: StatusHistoryEntry[];
}

export interface AISizeRequest {
  heightCm: number;
  weightKg: number;
  chestInches: number;
  waistInches: number;
  fitPreference: FitPreference;
  category: ProductCategory;
  occasion?: string;
}

export interface AISizeResponse {
  recommendedSize: string;
  alternativeSize?: string;
  confidence: string;
  reasoning: string;
  fitNotes: string[];
  alterationTip: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  recommendedProducts?: Product[];
  sizeRecommendation?: AISizeResponse;
}
