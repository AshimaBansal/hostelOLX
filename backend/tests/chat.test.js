import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { api, as, ME, NEHA, ROHAN, resetStore } from './helpers.js';

beforeEach(() => resetStore());

test('lists my conversations with last message and unread count', async () => {
  const res = await api().get('/api/conversations').set(as(ME)).expect(200);
  assert.equal(res.body.data.length, 2);
  const neha = res.body.data.find((c) => c.otherUser.fullName === 'Neha Sharma');
  assert.equal(neha.role, 'buyer');
  assert.equal(neha.unreadCount, 1);
  assert.equal(neha.listing.title, 'Astronaut Night Lamp');

  const unread = await api().get('/api/conversations/unread-count').set(as(ME)).expect(200);
  assert.equal(unread.body.data.unreadCount, 1);
});

test('start a chat on a listing, reuse it, exchange messages, mark read', async () => {
  const started = await api().post('/api/conversations').set(as(ME)).send({ listingId: 1, message: 'Is the lamp available?' }).expect(201);
  const id = started.body.data.id;
  assert.equal(started.body.data.lastMessage.messageText, 'Is the lamp available?');

  const again = await api().post('/api/conversations').set(as(ME)).send({ listingId: 1 }).expect(200);
  assert.equal(again.body.data.id, id);

  // Seller (listing 1 belongs to user ...0001) sees one unread message
  const SELLER = '00000000-0000-4000-8000-000000000001';
  const sellerView = await api().get(`/api/conversations/${id}`).set(as(SELLER)).expect(200);
  assert.equal(sellerView.body.data.role, 'seller');
  assert.equal(sellerView.body.data.unreadCount, 1);

  await api().post(`/api/conversations/${id}/messages`).set(as(SELLER)).send({ messageText: 'Yes!' }).expect(201);
  const msgs = await api().get(`/api/conversations/${id}/messages`).set(as(ME)).expect(200);
  assert.deepEqual(msgs.body.data.map((m) => m.isMine), [true, false]);

  await api().patch(`/api/conversations/${id}/read`).set(as(ME)).expect(200);
  const after = await api().get(`/api/conversations/${id}`).set(as(ME)).expect(200);
  assert.equal(after.body.data.unreadCount, 0);
});

test('chat rules: no self chat, no outsiders, no empty messages', async () => {
  await api().post('/api/conversations').set(as(NEHA)).send({ listingId: 5 }).expect(400);
  await api().get('/api/conversations/1/messages').set(as(ROHAN)).expect(404);
  await api().post('/api/conversations/1/messages').set(as(ME)).send({ messageText: '   ' }).expect(400);
  await api().post('/api/conversations').set(as(ME)).send({ listingId: 999 }).expect(404);
});

test('cannot start a chat on a sold listing', async () => {
  await api().patch('/api/listings/5/status').set(as(NEHA)).send({ status: 'sold' }).expect(200);
  await api().post('/api/conversations').set(as(ROHAN)).send({ listingId: 5 }).expect(400);
});
