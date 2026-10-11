'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Heart, Users, MapPin, MessageCircle, Star } from 'lucide-react';

const features = [
  { icon: Heart, title: 'אירוח משפחתי', desc: 'התארחו אצל משפחות דתיות חמות ומסבירות פנים' },
  { icon: Users, title: 'התאמות חכמות', desc: 'מערכת התאמות אוטומטית לפי העדפותיך' },
  { icon: MapPin, title: 'קהילה תומכת', desc: 'הכירו אנשים נוספים בתהליך ההתחזקות באזורכם' },
  { icon: MessageCircle, title: 'צ\'אט פנימי', desc: 'תקשורת ישירה ובטוחה עם מארחים ומתארחים' },
  { icon: Star, title: 'משובים', desc: 'דירוגים ומשובים מאומתים מכל צד' },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-blue-50 to-white py-20">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
              חווית שבת אותנטית
            </h1>
            <p className="mb-8 text-lg text-gray-600">
              פלטפורמה קהילתית המחברת בין משפחות מארחות לבין אנשים בתהליך התחזקות
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button size="lg">הצטרפו עכשיו</Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">קראו עוד</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-12 text-center text-2xl font-bold text-gray-900">מה MyShabat מציעה?</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <f.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">{f.title}</h3>
                  <p className="text-sm text-gray-600">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">מוכנים להתחיל?</h2>
            <p className="mb-8 text-gray-600">
              הצטרפו לקהילת משתדלי השבת והתחילו את המסע שלכם
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/register">
                <Button size="lg">הרשמה כמתארח</Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg">הרשמה כמארח</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
