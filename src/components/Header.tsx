'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ship, MessageCircle, Calculator, Info, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Home', icon: Ship },
    { href: '/chat', label: 'AI Assistant', icon: MessageCircle },
    { href: '/rates', label: 'Rate Search', icon: Calculator },
    { href: '/about', label: 'About', icon: Info },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="bg-[var(--ahs-primary)] text-white sticky top-0 z-50 ahs-shadow">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded">
              <Ship className="h-6 w-6 text-[var(--ahs-primary)]" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AHS Pakistan</h1>
              <p className="text-xs opacity-90">Freight Forwarder</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-[var(--ahs-primary-dark)] text-white'
                      : 'hover:bg-[var(--ahs-primary-dark)] hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded hover:bg-[var(--ahs-primary-dark)] transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[var(--ahs-primary-dark)] border-t border-[var(--ahs-primary-light)]"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-[var(--ahs-primary)] text-white'
                        : 'hover:bg-[var(--ahs-primary)] hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
