'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="mb-6 text-3xl font-bold text-gray-900">אודות MyShabat</h1>
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-600">
              MyShabat היא פלטפורמה קהילתית ייחודית המחברת בין משפחות דתיות המעוניינות לארח,
              לבין אנשים הנמצאים בתהליך התחזקות רוחנית ומחפשים לחוות שבת משמעותית.
            </p>
            <h2 className="mt-8 text-xl font-semibold">החזון שלנו</h2>
            <p className="text-gray-600">
              ליצור חיבורים משמעותיים, להנגיש חוויית שבת אותנטית ולבנות קהילה תומכת
              סביב ערכי השבת וההתחזקות.
            </p>
            <h2 className="mt-8 text-xl font-semibold">איך זה עובד?</h2>
            <ol className="space-y-3 text-gray-600">
              <li>1. נרשמים למערכת וממתינים לאישור מנהל</li>
              <li>2. יוצרים פרופיל מארח או מתארח</li>
              <li>3. מחפשים התאמות לפי העדפותיכם</li>
              <li>4. שולחים ומקבלים בקשות התאמה</li>
              <li>5. לאחר אישור - נחשפים פרטי הקשר וניתן לתאם</li>
              <li>6. לאחר האירוח כותבים משוב</li>
            </ol>
          </div>
          <div className="mt-8">
            <Link href="/register">
              <Button size="lg">הצטרפו עכשיו</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
