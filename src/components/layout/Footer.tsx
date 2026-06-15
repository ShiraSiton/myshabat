export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-3 text-lg font-bold text-blue-600">MyShabat</h3>
            <p className="text-sm text-gray-600">
              פלטפורמה קהילתית המחברת בין משפחות מארחות לאנשים בתהליך התחזקות.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-medium">קישורים מהירים</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="/about" className="hover:text-gray-900">אודות</a></li>
              <li><a href="/faq" className="hover:text-gray-900">שאלות נפוצות</a></li>
              <li><a href="/contact" className="hover:text-gray-900">צור קשר</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-medium">צרו קשר</h4>
            <p className="text-sm text-gray-600">
              לשאלות ובירורים: support@myshabat.com
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
          &copy; 2026 MyShabat. כל הזכויות שמורות.
        </div>
      </div>
    </footer>
  );
}
