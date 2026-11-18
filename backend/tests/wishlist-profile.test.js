import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { api, as, ME, NEHA, resetStore } from './helpers.js';

beforeEach(() => resetStore());

test('wishlist add / list / remove', async () => {
  await api().get('/api/wishlist').expect(401);

  await api().post('/api/wishlist/5').set(as(ME)).expect(201);
  await api().post('/api/wishlist/5').set(as(ME)).expect(200); // adding twice is fine

  const list = await api().get('/api/wishlist').set(as(ME)).expect(200);
  assert.equal(list.body.data.length, 1);
  assert.equal(list.body.data[0].listing.id, 5);
  assert.equal(list.body.data[0].listing.isWishlisted, true);

  const listing = await api().get('/api/listings/5').set(as(ME)).expect(200);
  assert.equal(listing.body.data.isWishlisted, true);

  await api().delete('/api/wishlist/5').set(as(ME)).expect(204);
  await api().delete('/api/wishlist/5').set(as(ME)).expect(404);
});

test('cannot wishlist own or missing listing', async () => {
  await api().post('/api/wishlist/5').set(as(NEHA)).expect(400);
  await api().post('/api/wishlist/999').set(as(ME)).expect(404);
});

test('profile: get me, update me, public profile hides private fields', async () => {
  const me = await api().get('/api/profiles/me').set(as(ME)).expect(200);
  assert.equal(me.body.data.fullName, 'Ashi');
  assert.equal(me.body.data.roomNumber, '214');

  const updated = await api().patch('/api/profiles/me').set(as(ME)).send({ phone: '+91 98765 43210' }).expect(200);
  assert.equal(updated.body.data.phone, '+91 98765 43210');

  await api().patch('/api/profiles/me').set(as(ME)).send({ phone: 'call me' }).expect(400);
  await api().patch('/api/profiles/me').set(as(ME)).send({ id: 'hack' }).expect(400);

  const pub = await api().get(`/api/profiles/${ME}`).expect(200);
  assert.equal(pub.body.data.phone, undefined);
  assert.equal(pub.body.data.roomNumber, undefined);
});
