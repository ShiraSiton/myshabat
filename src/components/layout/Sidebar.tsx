'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  Home, Search, Users, MessageCircle, Bell, Star,
  MapPin, UserPlus, Shield, FileText, BarChart3,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

export function Sidebar() {
  const pathname = usePathname();
  const { isAdmin, isHost } = useAuth();

  const navItems: NavItem[] = [
    { href: '/dashboard', label: 'לוח בקרה', icon: <Home className="h-4 w-4" /> },
    { href: '/search', label: 'חיפוש', icon: <Search className="h-4 w-4" /> },
    { href: '/matches', label: 'התאמות', icon: <Users className="h-4 w-4" /> },
    { href: '/chat', label: 'צ\'אט', icon: <MessageCircle className="h-4 w-4" /> },
    { href: '/notifications', label: 'התראות', icon: <Bell className="h-4 w-4" /> },
    { href: '/reviews', label: 'משובים', icon: <Star className="h-4 w-4" /> },
    { href: '/community/map', label: 'מפת משתדלי השבת', icon: <MapPin className="h-4 w-4" /> },
    { href: '/community/requests', label: 'בקשות היכרות', icon: <UserPlus className="h-4 w-4" /> },
  ];

  const adminItems: NavItem[] = [
    { href: '/admin', label: 'ניהול מערכת', icon: <Shield className="h-4 w-4" />, adminOnly: true },
    { href: '/admin/users', label: 'ניהול משתמשים', icon: <Users className="h-4 w-4" />, adminOnly: true },
    { href: '/admin/reviews', label: 'ניהול משובים', icon: <FileText className="h-4 w-4" />, adminOnly: true },
    { href: '/admin/reports', label: 'דוחות', icon: <BarChart3 className="h-4 w-4" />, adminOnly: true },
  ];

  return (
    <aside className="hidden w-64 border-l border-gray-200 bg-white lg:block">
      <nav className="space-y-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
        {isAdmin && (
          <>
            <hr className="my-2" />
            <p className="px-3 text-xs font-medium uppercase text-gray-400">ניהול</p>
            {adminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}
