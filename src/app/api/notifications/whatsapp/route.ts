import { NextResponse } from 'next/server';
import { queueWhatsAppNotification } from '@/lib/notifications/whatsapp';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await queueWhatsAppNotification(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unable to queue notification' },
      { status: 400 }
    );
  }
}
