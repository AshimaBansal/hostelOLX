import * as chatService from '../services/chat.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getMine(req, res) {
  sendSuccess(res, await chatService.getMyConversations(req.user.id));
}

export async function getUnreadCount(req, res) {
  sendSuccess(res, { unreadCount: await chatService.getUnreadTotal(req.user.id) });
}

export async function start(req, res) {
  const { created, conversation } = await chatService.startConversation(req.user.id, req.valid.body);
  sendSuccess(res, conversation, created ? 201 : 200);
}

export async function getOne(req, res) {
  sendSuccess(res, await chatService.getConversation(req.valid.params.id, req.user.id));
}

export async function getMessages(req, res) {
  sendSuccess(res, await chatService.getMessages(req.valid.params.id, req.user.id));
}

export async function sendMessage(req, res) {
  const message = await chatService.sendMessage(req.valid.params.id, req.user.id, req.valid.body.messageText);
  sendSuccess(res, message, 201);
}

export async function markRead(req, res) {
  sendSuccess(res, await chatService.markAsRead(req.valid.params.id, req.user.id));
}
