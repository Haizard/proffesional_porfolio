'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Menu, X, User } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { itemCount } = useCart()
  const { user, isAdmin, loading } = useAuth()

  const navLinks = [
    { href: '/services', label: 'Services' },
    { href: '/store', label: 'Store' },
    { href: '/projects', label: 'Projects' },
    { href: '/blog', label: 'Intel' },
    { href: '/contact', label: 'Contact' },
  ]

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-mono text-xl font-bold tracking-tighter text-primary">
            haithammisape<span className="text-foreground">_</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname.startsWith(link.href) ? 'text-primary text-glow' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {itemCount() > 0 && (
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {itemCount()}
              </span>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-4">
            {!loading && (
              <>
                {user ? (
                  <Link href={isAdmin ? '/admin' : '/account'}>
                    <Button variant="outline" size="sm" className="font-mono">
                      <User className="mr-2 h-4 w-4" />
                      {isAdmin ? 'SYS_ADMIN' : 'ACCOUNT'}
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm" className="font-mono">
                      LOGIN
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>

          <button className="md:hidden p-2 text-muted-foreground" onClick={toggleMenu}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="flex flex-col p-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-border">
              {!loading && user ? (
                <Link href={isAdmin ? '/admin' : '/account'} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start font-mono">
                    <User className="mr-2 h-4 w-4" />
                    {isAdmin ? 'SYS_ADMIN' : 'ACCOUNT'}
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start font-mono">
                    LOGIN
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
