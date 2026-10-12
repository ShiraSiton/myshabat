'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { getUnreadNotificationsCount } from '@/lib/api/notifications';
import { Menu, X, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Header() {
  const { user, isAdmin, isHost, isGuest, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileHref = isHost
    ? '/dashboard/profile/host'
    : isGuest
      ? '/dashboard/profile/guest'
      : null;

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  useEffect(() => {
    let cancelled = false;

    const countPromise = user ? getUnreadNotificationsCount(user.id) : Promise.resolve(0);

    countPromise
      .then((count) => {
        if (!cancelled) setUnreadCount(count);
      })
      .catch(() => {
        if (!cancelled) setUnreadCount(0);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

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
              <Link href="/dashboard/notifications" className="relative">
                <Bell className="h-5 w-5 text-gray-600 hover:text-gray-900" />
                {unreadCount > 0 && (
                  <span className="absolute -left-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
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
                    <Link href="/dashboard" onClick={closeMenus} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                      <User className="h-4 w-4" /> אזור אישי
                    </Link>
                    {profileHref && (
                      <Link href={profileHref} onClick={closeMenus} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                        <User className="h-4 w-4" /> הפרופיל שלי
                      </Link>
                    )}
                    {isAdmin && (
                      <Link href="/admin" onClick={closeMenus} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                        ניהול מערכת
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button onClick={() => { closeMenus(); logout(); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
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
      {isMenuOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-3">
            <Link onClick={closeMenus} href="/about" className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">אודות</Link>
            <Link onClick={closeMenus} href="/faq" className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">שאלות נפוצות</Link>
            <Link onClick={closeMenus} href="/contact" className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">צור קשר</Link>

            {user ? (
              <>
                <hr className="my-2" />
                <Link onClick={closeMenus} href="/dashboard" className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50">לוח בקרה</Link>
                {profileHref && (
                  <Link onClick={closeMenus} href={profileHref} className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50">הפרופיל שלי</Link>
                )}
                <Link onClick={closeMenus} href="/dashboard/search" className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50">חיפוש</Link>
                <Link onClick={closeMenus} href="/dashboard/matches" className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50">התאמות</Link>
                <Link onClick={closeMenus} href="/dashboard/matches/requests" className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50">פניות</Link>
                <Link onClick={closeMenus} href="/dashboard/chat" className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50">צ׳אט</Link>
                <Link onClick={closeMenus} href="/dashboard/notifications" className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50">
                  <span>התראות</span>
                  {unreadCount > 0 && <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </Link>
                <Link onClick={closeMenus} href="/dashboard/reviews" className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50">משובים</Link>
                {isAdmin && (
                  <>
                    <hr className="my-2" />
                    <Link onClick={closeMenus} href="/admin" className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50">ניהול מערכת</Link>
                    <Link onClick={closeMenus} href="/admin/users" className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50">ניהול משתמשים</Link>
                    <Link onClick={closeMenus} href="/admin/reviews" className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50">ניהול משובים</Link>
                  </>
                )}
                <hr className="my-2" />
                <button onClick={() => { closeMenus(); logout(); }} className="block w-full rounded-lg px-3 py-2 text-right text-sm font-medium text-red-600 hover:bg-red-50">
                  התנתקות
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link onClick={closeMenus} href="/login"><Button variant="outline" className="w-full" size="sm">התחברות</Button></Link>
                <Link onClick={closeMenus} href="/register"><Button className="w-full" size="sm">הרשמה</Button></Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
