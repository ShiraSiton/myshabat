'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Menu, X, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { user, isAdmin, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-blue-600">
            MyShabat
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">אודות</Link>
            <Link href="/faq" className="text-sm text-gray-600 hover:text-gray-900">שאלות נפוצות</Link>
            <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">צור קשר</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/notifications">
                <Bell className="h-5 w-5 text-gray-600 hover:text-gray-900" />
              </Link>
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
                    {user.email[0].toUpperCase()}
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                {isProfileOpen && (
                  <div className="absolute left-0 top-full mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                      <User className="h-4 w-4" /> אזור אישי
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                        ניהול מערכת
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button onClick={logout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                      <LogOut className="h-4 w-4" /> התנתק
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">התחברות</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">הרשמה</Button>
              </Link>
            </div>
          )}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 md:hidden">
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
