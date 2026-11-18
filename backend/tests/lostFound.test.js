import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { api, as, ME, NEHA, ROHAN, SECURITY, resetStore } from './helpers.js';

beforeEach(() => resetStore());

test('list, filter and view lost & found items', async () => {
  const res = await api().get('/api/lost-found').expect(200);
  assert.equal(res.body.data.length, 2);
  assert.equal(res.body.data[0].postedByUser.fullName, 'Campus Security Desk');

  const lost = await api().get('/api/lost-found?type=lost').expect(200);
  assert.equal(lost.body.data.length, 0);

  await api().get('/api/lost-found/1').expect(200);
  await api().get('/api/lost-found/50').expect(404);
});

test('report a lost item and edit it', async () => {
  const created = await api()
    .post('/api/lost-found')
    .set(as(ME))
    .send({ itemType: 'lost', title: 'Blue water bottle', locationDescription: 'Gym', dateOccurred: '2026-11-01' })
    .expect(201);
  assert.equal(created.body.data.status, 'open');

  await api().post('/api/lost-found').set(as(ME)).send({ itemType: 'lost', title: 'x', dateOccurred: '2999-01-01' }).expect(400);

  const id = created.body.data.id;
  await api().patch(`/api/lost-found/${id}`).set(as(NEHA)).send({ title: 'mine now' }).expect(403);
  await api().patch(`/api/lost-found/${id}`).set(as(ME)).send({ status: 'closed' }).expect(200);
});

test('claim flow: claim, duplicate, poster approves, others rejected', async () => {
  const claim = await api().post('/api/lost-found/1/claims').set(as(ME)).send({ claimMessage: 'It has my initials A.S. engraved' }).expect(201);
  await api().post('/api/lost-found/1/claims').set(as(ME)).send({ claimMessage: 'It has my initials A.S. engraved' }).expect(409);
  await api().post('/api/lost-found/1/claims').set(as(ME)).send({ claimMessage: 'mine' }).expect(400);
  await api().post('/api/lost-found/1/claims').set(as(SECURITY)).send({ claimMessage: 'I posted this one myself' }).expect(400);

  const other = await api().post('/api/lost-found/1/claims').set(as(ROHAN)).send({ claimMessage: 'Serial ends with 4X7Q, white case' }).expect(201);

  await api().get('/api/lost-found/1/claims').set(as(ME)).expect(403);
  const claims = await api().get('/api/lost-found/1/claims').set(as(SECURITY)).expect(200);
  assert.equal(claims.body.data.length, 2);

  await api().patch(`/api/claims/${claim.body.data.id}`).set(as(ME)).send({ status: 'approved' }).expect(403);
  await api().patch(`/api/claims/${other.body.data.id}`).set(as(SECURITY)).send({ status: 'approved' }).expect(200);

  const item = await api().get('/api/lost-found/1').set(as(ROHAN)).expect(200);
  assert.equal(item.body.data.status, 'claimed');
  assert.equal(item.body.data.myClaimStatus, 'approved');

  const mine = await api().get('/api/claims/mine').set(as(ME)).expect(200);
  assert.equal(mine.body.data[0].status, 'rejected');
});

test('claimant can cancel and re-claim', async () => {
  const claim = await api().post('/api/lost-found/2/claims').set(as(ME)).send({ claimMessage: 'Has a yellow sticker on the back' }).expect(201);
  await api().patch(`/api/claims/${claim.body.data.id}`).set(as(SECURITY)).send({ status: 'cancelled' }).expect(404);
  await api().patch(`/api/claims/${claim.body.data.id}`).set(as(ME)).send({ status: 'cancelled' }).expect(200);
  const again = await api().post('/api/lost-found/2/claims').set(as(ME)).send({ claimMessage: 'Yellow sticker, my name inside lid' }).expect(201);
  assert.equal(again.body.data.status, 'pending');
});
