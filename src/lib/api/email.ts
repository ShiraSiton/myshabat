export async function sendEmail(input: { to: string; subject: string; text: string; html?: string }) {
  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const details = data?.details
      ? typeof data.details === 'string'
        ? data.details
        : JSON.stringify(data.details)
      : '';
    const error = data?.error
      ? typeof data.error === 'string'
        ? data.error
        : JSON.stringify(data.error)
      : 'שליחת המייל נכשלה';

    throw new Error(details ? `${error}: ${details}` : error);
  }

  return response.json() as Promise<{ id?: string; skipped?: boolean; reason?: string }>;
}
