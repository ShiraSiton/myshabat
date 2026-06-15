import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    suspended: 'bg-red-100 text-red-800',
    blocked: 'bg-gray-100 text-gray-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'ממתין',
    active: 'פעיל',
    suspended: 'מושעה',
    blocked: 'חסום',
    approved: 'אושר',
    rejected: 'נדחה',
    cancelled: 'בוטל',
    meals_only: 'סעודות בלבד',
    full_shabbat: 'שבת מלאה',
    male: 'גברים',
    female: 'נשים',
    couple: 'זוגות',
    single: 'רווק/ה',
    married: 'נשוי/אה',
    divorced: 'גרוש/ה',
    widowed: 'אלמן/ה',
  };
  return labels[status] || status;
}
