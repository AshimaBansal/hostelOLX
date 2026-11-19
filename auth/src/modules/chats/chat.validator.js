import { z } from 'zod';

export const startChatSchema = z.object({
  listingId: z.coerce.number().optional().nullable(),
  sellerId: z.string().uuid().optional(),
  otherUserId: z.string().uuid().optional(),
  message: z.string().trim().max(3000).optional(),
  initialMessage: z.string().trim().max(3000).optional(),
});

export const sendMessageSchema = z.object({
  messageText: z.string().trim().min(1, 'Message cannot be empty.').max(3000).optional(),
  text: z.string().trim().min(1).max(3000).optional(),
  message: z.string().trim().min(1).max(3000).optional(),
}).refine((data) => data.messageText || data.text || data.message, {
  message: 'Message content is required.',
  path: ['messageText'],
});

export function validateStartChat(data) {
  return startChatSchema.safeParse(data);
}

export function validateSendMessage(data) {
  return sendMessageSchema.safeParse(data);
}
