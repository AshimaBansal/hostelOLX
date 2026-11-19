import { chatService } from './chat.service.js';
import { validateStartChat, validateSendMessage } from './chat.validator.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export function createChatController(service = chatService) {
  async function getConversations(req, res) {
    try {
      const chats = await service.getUserConversations(req.user.id);
      return successResponse(res, { chats, conversations: chats });
    } catch (error) {
      return errorResponse(res, error.message || 'Failed to fetch conversations.', 500);
    }
  }

  async function getMessages(req, res) {
    try {
      const messages = await service.getConversationMessages(req.params.id, req.user.id);
      return successResponse(res, { messages });
    } catch (error) {
      const status = error.statusCode || 500;
      return errorResponse(res, error.message || 'Failed to fetch messages.', status, null, error.code);
    }
  }

  async function startChat(req, res) {
    const validation = validateStartChat(req.body);
    if (!validation.success) {
      return errorResponse(res, 'Validation failed.', 400, validation.error.flatten().fieldErrors);
    }

    try {
      const chat = await service.startConversation(req.user.id, validation.data);
      return successResponse(res, { chat, conversation: chat }, 201);
    } catch (error) {
      const status = error.statusCode || 500;
      return errorResponse(res, error.message || 'Failed to start conversation.', status, null, error.code);
    }
  }

  async function sendMessage(req, res) {
    const validation = validateSendMessage(req.body);
    if (!validation.success) {
      return errorResponse(res, 'Validation failed.', 400, validation.error.flatten().fieldErrors);
    }

    const text = validation.data.messageText || validation.data.text || validation.data.message;

    try {
      const message = await service.sendMessage(req.params.id, req.user.id, text);
      return successResponse(res, { message }, 201);
    } catch (error) {
      const status = error.statusCode || 500;
      return errorResponse(res, error.message || 'Failed to send message.', status, null, error.code);
    }
  }

  async function markRead(req, res) {
    try {
      const result = await service.markAsRead(req.params.id, req.user.id);
      return successResponse(res, result);
    } catch (error) {
      const status = error.statusCode || 500;
      return errorResponse(res, error.message || 'Failed to mark conversation as read.', status, null, error.code);
    }
  }

  return {
    getConversations,
    getMessages,
    startChat,
    sendMessage,
    markRead,
  };
}

export const chatController = createChatController();
