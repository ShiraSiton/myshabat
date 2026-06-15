'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  { q: 'מי יכול להשתמש ב-MyShabat?', a: 'המערכת מיועדת למשפחות דתיות וחרדיות המעוניינות לארח, ולאנשים בתהליך התחזקות רוחנית המעוניינים להתארח ולחוות שבת משמעותית.' },
  { q: 'האם ההרשמה כרוכה בתשלום?', a: 'לא, ההרשמה והשימוש במערכת הם בחינם לחלוטין.' },
  { q: 'איך הפרטיות שלי נשמרת?', a: 'לפני התאמה מוצגים רק שם פרטי, עיר ותיאור כללי. פרטי קשר מלאים נחשפים רק לאחר אישור התאמה הדדי.' },
  { q: 'כמה זמן לוקח לקבל אישור?', a: 'האישור מתבצע על ידי מנהל המערכת, בדרך כלל תוך 24-48 שעות.' },
  { q: 'האם אפשר לבטל התאמה?', a: 'כן, ניתן לבטל בקשת התאמה בכל עת לפני אישורה.' },
  { q: 'מה זה משתדלי השבת?', a: 'קהילה חברתית של מתחזקים המעוניינים להכיר אנשים דומים באזור מגוריהם, ליצור קשרים חברתיים ולקבל תמיכה.' },
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">שאלות נפוצות</h1>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-xl border border-gray-200 bg-white">
                <button
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                  className="flex w-full items-center justify-between p-4 text-right"
                >
                  <span className="font-medium text-gray-900">{faq.q}</span>
                  {openIdx === idx ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                </button>
                {openIdx === idx && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-3 text-gray-600">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
