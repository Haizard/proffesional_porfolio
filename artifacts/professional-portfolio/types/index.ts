export type ServiceCategory =
  | 'ai-automation'
  | 'marketing'
  | 'web-development'
  | 'saas-development'
  | 'b2b-delivery'
  | 'forex-bots'
  | 'computer-building'
  | 'ai-machines'
  | 'ai-configuration'
  | 'server-setup'

export interface Service {
  id: string
  name: string
  slug: string
  description: string
  long_description: string | null
  icon: string | null
  category: ServiceCategory | string
  features: string[]
  price_from: number | null
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string | null
  excerpt: string | null
  featured_image: string | null
  category: string | null
  tags: string[]
  status: 'draft' | 'published'
  author_id: string | null
  related_service_slugs: string[]
  related_product_slugs: string[]
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  long_description: string | null
  price: number
  compare_at_price: number | null
  images: string[]
  category: string
  tags: string[]
  stock: number
  features: string[]
  specs: Record<string, string>
  is_featured: boolean
  is_active: boolean
  related_service_slugs: string[]
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string | null
  customer_email: string
  customer_name: string
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  stripe_payment_intent_id: string | null
  stripe_session_id: string | null
  shipping_address: ShippingAddress | null
  notes: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_image: string | null
  quantity: number
  price: number
  created_at: string
}

export interface ShippingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface ContactInquiry {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  service_category: string | null
  subject: string | null
  message: string
  status: 'new' | 'contacted' | 'converted' | 'closed'
  created_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  role: 'customer' | 'admin'
  created_at: string
  updated_at: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Database {
  public: {
    Tables: {
      services: { Row: Service; Insert: Omit<Service, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Service, 'id'>> }
      blog_posts: { Row: BlogPost; Insert: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<BlogPost, 'id'>> }
      products: { Row: Product; Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Product, 'id'>> }
      orders: { Row: Order; Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Order, 'id'>> }
      order_items: { Row: OrderItem; Insert: Omit<OrderItem, 'id' | 'created_at'>; Update: Partial<Omit<OrderItem, 'id'>> }
      contact_inquiries: { Row: ContactInquiry; Insert: Omit<ContactInquiry, 'id' | 'created_at'>; Update: Partial<Omit<ContactInquiry, 'id'>> }
      profiles: { Row: Profile; Insert: Omit<Profile, 'created_at' | 'updated_at'>; Update: Partial<Omit<Profile, 'id'>> }
    }
  }
}
