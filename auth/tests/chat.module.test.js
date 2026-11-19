import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createChatService } from '../src/modules/chats/chat.service.js';

describe('Chat and Messaging Module', () => {
  const sampleConv = {
    id: '1',
    listingId: '101',
    buyerId: 'user-buyer',
    sellerId: 'user-seller',
    listingTitle: 'Study Lamp',
    listingPrice: 500,
    listingImage: '/images/arc_lamp.png',
    otherUserId: 'user-seller',
    otherUserName: 'Seller Student',
    otherUserHostel: 'Hostel 1',
    otherUserRoom: '102',
    otherUserProgram: 'Tech 27',
    unreadCount: 1,
    lastMessageText: 'Available at Nescafe',
    lastMessageSenderId: 'user-seller',
    lastMessageTime: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sampleMessages = [
    {
      id: '1',
      conversationId: '1',
      senderId: 'user-buyer',
      messageText: 'Is this available?',
      createdAt: new Date().toISOString(),
      senderName: 'Buyer Student',
    },
    {
      id: '2',
      conversationId: '1',
      senderId: 'user-seller',
      messageText: 'Available at Nescafe',
      createdAt: new Date().toISOString(),
      senderName: 'Seller Student',
    },
  ];

  function createMockChatRepo() {
    let convs = [{ ...sampleConv }];
    let msgs = [...sampleMessages];

    return {
      findUserConversations: async (userId) => {
        return convs
          .filter((c) => c.buyerId === userId || c.sellerId === userId)
          .map((c) => ({
            ...c,
            otherUserId: c.buyerId === userId ? c.sellerId : c.buyerId,
            otherUserName: c.buyerId === userId ? 'Seller Student' : 'Buyer Student',
          }));
      },
      findConversationById: async (id) => convs.find((c) => String(c.id) === String(id)) ?? null,
      findConversationBetween: async (buyerId, sellerId) => {
        return convs.find(
          (c) =>
            (c.buyerId === buyerId && c.sellerId === sellerId) ||
            (c.buyerId === sellerId && c.sellerId === buyerId)
        ) ?? null;
      },
      createConversation: async (buyerId, sellerId, listingId) => {
        const id = String(Date.now());
        convs.push({
          id,
          listingId: listingId ? String(listingId) : null,
          buyerId,
          sellerId,
          listingTitle: 'Item',
          listingPrice: 0,
          otherUserName: 'Peer',
          unreadCount: 0,
        });
        return id;
      },
      findMessages: async (convId) => msgs.filter((m) => String(m.conversationId) === String(convId)),
      createMessage: async (convId, senderId, text) => {
        const m = {
          id: String(Date.now()),
          conversationId: String(convId),
          senderId,
          messageText: text,
          createdAt: new Date().toISOString(),
          senderName: 'Sender',
        };
        msgs.push(m);
        return m;
      },
      markConversationAsRead: async () => {},
    };
  }

  function createMockListingRepo() {
    return {
      findById: async (id) => ({ id: String(id), sellerId: 'user-seller', title: 'Lamp' }),
    };
  }

  function createMockProfileRepo() {
    return {
      findProfileById: async (id) => ({ id, fullName: 'Student ' + id }),
    };
  }

  it('should list conversations for participant', async () => {
    const cRepo = createMockChatRepo();
    const lRepo = createMockListingRepo();
    const pRepo = createMockProfileRepo();
    const service = createChatService(cRepo, lRepo, pRepo);

    const chats = await service.getUserConversations('user-buyer');
    assert.equal(chats.length, 1);
    assert.equal(chats[0].productTitle, 'Study Lamp');
  });

  it('should retrieve conversation history for participant', async () => {
    const cRepo = createMockChatRepo();
    const lRepo = createMockListingRepo();
    const pRepo = createMockProfileRepo();
    const service = createChatService(cRepo, lRepo, pRepo);

    const msgs = await service.getConversationMessages('1', 'user-buyer');
    assert.equal(msgs.length, 2);
    assert.equal(msgs[0].isMe, true);
    assert.equal(msgs[1].isMe, false);
  });

  it('should prevent access to conversation by nonparticipant', async () => {
    const cRepo = createMockChatRepo();
    const lRepo = createMockListingRepo();
    const pRepo = createMockProfileRepo();
    const service = createChatService(cRepo, lRepo, pRepo);

    await assert.rejects(
      () => service.getConversationMessages('1', 'intruder-user'),
      (err) => err.statusCode === 403
    );
  });

  it('should prevent user from starting chat with themselves', async () => {
    const cRepo = createMockChatRepo();
    const lRepo = createMockListingRepo();
    const pRepo = createMockProfileRepo();
    const service = createChatService(cRepo, lRepo, pRepo);

    await assert.rejects(
      () => service.startConversation('user-seller', { sellerId: 'user-seller' }),
      (err) => err.statusCode === 400
    );
  });

  it('should send message successfully in conversation', async () => {
    const cRepo = createMockChatRepo();
    const lRepo = createMockListingRepo();
    const pRepo = createMockProfileRepo();
    const service = createChatService(cRepo, lRepo, pRepo);

    const msg = await service.sendMessage('1', 'user-buyer', 'See you at 5 PM!');
    assert.equal(msg.text, 'See you at 5 PM!');
    assert.equal(msg.isMe, true);
  });

  it('should prevent nonparticipant from sending messages', async () => {
    const cRepo = createMockChatRepo();
    const lRepo = createMockListingRepo();
    const pRepo = createMockProfileRepo();
    const service = createChatService(cRepo, lRepo, pRepo);

    await assert.rejects(
      () => service.sendMessage('1', 'intruder-user', 'Hey!'),
      (err) => err.statusCode === 403
    );
  });
});
