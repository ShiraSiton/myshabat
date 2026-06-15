'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { getStore } from '@/lib/store';

export default function AdminReportsPage() {
  const store = getStore();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">דוחות מערכת</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><h2 className="font-semibold">סטטיסטיקות משתמשים</h2></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span>סה"כ משתמשים</span><span className="font-bold">{store.users.length}</span></div>
            <div className="flex justify-between"><span>מארחים</span><span className="font-bold">{store.users.filter((u) => u.role === 'host').length}</span></div>
            <div className="flex justify-between"><span>מתארחים</span><span className="font-bold">{store.users.filter((u) => u.role === 'guest').length}</span></div>
            <div className="flex justify-between"><span>ממתינים לאישור</span><span className="font-bold">{store.users.filter((u) => u.status === 'pending').length}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold">סטטיסטיקות התאמות</h2></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span>סה"כ התאמות</span><span className="font-bold">{store.matches.length}</span></div>
            <div className="flex justify-between"><span>בקשות ממתינות</span><span className="font-bold">{store.matchRequests.filter((r) => r.status === 'pending').length}</span></div>
            <div className="flex justify-between"><span>בקשות מאושרות</span><span className="font-bold">{store.matchRequests.filter((r) => r.status === 'approved').length}</span></div>
            <div className="flex justify-between"><span>משובים</span><span className="font-bold">{store.reviews.length}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
