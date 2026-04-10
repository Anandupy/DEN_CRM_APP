import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { notificationTemplates, type NotificationTemplateKey } from './templates';
import type { NotificationChannel, NotificationStatus } from '@/lib/erp/types';

export async function queueWhatsAppNotification(input: {
  recipientName: string;
  recipientPhone: string;
  templateKey: NotificationTemplateKey;
  channel?: NotificationChannel;
  status?: NotificationStatus;
  metadata?: Record<string, string>;
}) {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  const channel = input.channel ?? 'whatsapp_cloud';
  const status = input.status ?? 'queued';
  const templateBody = notificationTemplates[input.templateKey];

  const { error } = await client.from('notifications').insert({
    recipient_name: input.recipientName,
    recipient_phone: input.recipientPhone,
    template_key: input.templateKey,
    template_body: templateBody,
    channel,
    status,
    metadata: input.metadata ?? {},
  });

  if (error) throw error;
}
