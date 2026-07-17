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

// ── Categories ─────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parent_id: string | null
  type: 'blog' | 'service' | 'product' | 'project' | 'general'
  icon: string | null
  color: string | null
  sort_order: number
  created_at: string
  updated_at: string
  children?: Category[]
  parent?: Category | null
}

// ── Projects ───────────────────────────────────────────────

export interface Project {
  id: string
  title: string
  slug: string
  description: string
  long_description: string | null
  featured_image: string | null
  images: string[]
  category_id: string | null
  tags: string[]
  tech_stack: string[]
  is_free: boolean
  price: number | null
  preview_url: string | null
  download_url: string | null
  status: 'draft' | 'published'
  is_featured: boolean
  stripe_price_id: string | null
  created_at: string
  updated_at: string
  category?: Category | null
}

export interface ProjectPurchase {
  id: string
  user_id: string
  project_id: string
  stripe_session_id: string | null
  stripe_payment_intent_id: string | null
  amount: number | null
  status: 'pending' | 'paid' | 'failed'
  created_at: string
}

// ── Comments ───────────────────────────────────────────────

export type CommentEntityType = 'blog' | 'service' | 'product' | 'project'

export interface Comment {
  id: string
  user_id: string
  entity_type: CommentEntityType
  entity_id: string
  parent_id: string | null
  content: string
  is_pinned: boolean
  is_edited: boolean
  likes_count: number
  dislikes_count: number
  created_at: string
  updated_at: string
  author?: {
    full_name: string | null
    avatar_url: string | null
  }
  replies?: Comment[]
  user_vote?: 'like' | 'dislike' | null
}

export interface CommentVote {
  id: string
  user_id: string
  comment_id: string
  vote_type: 'like' | 'dislike'
  created_at: string
}

// ── Database ───────────────────────────────────────────────

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
      categories: { Row: Category; Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Category, 'id'>> }
      projects: { Row: Project; Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Project, 'id'>> }
      project_purchases: { Row: ProjectPurchase; Insert: Omit<ProjectPurchase, 'id' | 'created_at'>; Update: Partial<Omit<ProjectPurchase, 'id'>> }
      comments: { Row: Comment; Insert: Omit<Comment, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Comment, 'id'>> }
      comment_votes: { Row: CommentVote; Insert: Omit<CommentVote, 'id' | 'created_at'>; Update: Partial<Omit<CommentVote, 'id'>> }
    }
  }
}
