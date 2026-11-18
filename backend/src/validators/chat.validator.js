import { z } from 'zod';

export const startConversationBody = z.object({
  listingId: z.coerce.number().int().positive(),
  message: z.string().trim().min(1).max(2000).optional(), // optional first message
});

export const sendMessageBody = z.object({
  messageText: z.string().trim().min(1, { message: 'Message cannot be empty' }).max(2000),
});
