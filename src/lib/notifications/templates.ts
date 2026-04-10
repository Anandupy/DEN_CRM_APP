export const notificationTemplates = {
  fee_due: 'Your gym fee is due. Please pay to avoid interruption.',
  fee_paid: 'Your gym payment has been received successfully.',
  membership_expiring: 'Your membership is expiring soon. Renew now to continue access.',
} as const;

export type NotificationTemplateKey = keyof typeof notificationTemplates;
