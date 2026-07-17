import type { Service, Product, BlogPost, Order, ContactInquiry, Project, Category } from '@/types'

const API_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function getFeaturedServices(): Promise<Service[]> {
  try {
    const res = await fetch(`${API_BASE}/api/services?featured=true`, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch (e) {
    return []
  }
}

export async function getServices(): Promise<Service[]> {
  try {
    const res = await fetch(`${API_BASE}/api/services`, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch (e) {
    return []
  }
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  try {
    const res = await fetch(`${API_BASE}/api/services/${slug}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch (e) {
    return null
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/api/products?featured=true`, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch (e) {
    return []
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/api/products`, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch (e) {
    return []
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE}/api/products/${slug}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch (e) {
    return null
  }
}

export async function getRecentPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_BASE}/api/blog?status=published&limit=3`, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch (e) {
    return []
  }
}

export async function getPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_BASE}/api/blog?status=published`, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch (e) {
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_BASE}/api/blog/${slug}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch (e) {
    return null
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    const res = await fetch(`${API_BASE}/api/projects`, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function getFeaturedProjects(): Promise<Project[]> {
  try {
    const res = await fetch(`${API_BASE}/api/projects?featured=true`, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const res = await fetch(`${API_BASE}/api/projects/${slug}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function getCategories(type?: string): Promise<Category[]> {
  try {
    const url = type ? `${API_BASE}/api/categories?type=${type}` : `${API_BASE}/api/categories`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}
