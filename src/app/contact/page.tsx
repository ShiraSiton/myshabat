'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-2xl px-4">
          <h1 className="mb-6 text-3xl font-bold text-gray-900">צור קשר</h1>
          {sent ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
              <p className="text-lg font-medium text-green-800">תודה! פנייתך התקבלה.</p>
              <p className="mt-2 text-green-600">נחזור אליך בהקדם.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
              <Input label="שם מלא" id="name" required />
              <Input label="אימייל" id="email" type="email" required />
              <div className="space-y-1">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">הודעה</label>
                <textarea id="message" rows={5} required className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <Button type="submit">שליחה</Button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
