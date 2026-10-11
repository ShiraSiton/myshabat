import { NextResponse } from 'next/server';

interface EmailPayload {
  to?: string;
  subject?: string;
  text?: string;
  html?: string;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as EmailPayload;
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL || 'MyShabat <onboarding@resend.dev>';

    if (!payload.to || !payload.subject || (!payload.text && !payload.html)) {
      return NextResponse.json({ error: 'Missing email fields' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ skipped: true, reason: 'RESEND_API_KEY is not configured' });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
      }),
    });

    const responseText = await response.text();
    let data: unknown = responseText;

    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch {
      data = responseText;
    }

    if (!response.ok) {
      return NextResponse.json({
        error: 'Resend request failed',
        status: response.status,
        details: data,
      }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({
      error: 'Email route failed',
      details: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}
