export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  price: number;
  features: string[];
  images: string[];
  longDescription: string; // HTML or Markdown support
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
