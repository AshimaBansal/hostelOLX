import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { api, as, ME, NEHA, resetStore } from './helpers.js';

beforeEach(() => resetStore());

test('GET /api/health works', async () => {
  const res = await api().get('/api/health').expect(200);
  assert.equal(res.body.status, 'ok');
});

test('unknown route returns 404 JSON', async () => {
  const res = await api().get('/api/nope').expect(404);
  assert.equal(res.body.success, false);
});

test('lists active listings with pagination meta and computed fields', async () => {
  const res = await api().get('/api/listings?limit=5').expect(200);
  assert.equal(res.body.data.length, 5);
  assert.equal(res.body.meta.total, 14);
  const first = res.body.data[0];
  assert.ok(first.seller.fullName);
  assert.ok(first.category.slug);
  assert.ok(['favorites', 'essentials', 'free'].includes(first.section));
  assert.equal(first.seller.phone, undefined, 'public seller info must not leak phone');
});

test('filters by category, featured, search and price; sorts by price', async () => {
  const study = await api().get('/api/listings?category=study').expect(200);
  assert.ok(study.body.data.every((l) => l.category.slug === 'study'));

  const featured = await api().get('/api/listings?featured=true').expect(200);
  assert.equal(featured.body.data.length, 4);

  const search = await api().get('/api/listings?q=lamp').expect(200);
  assert.ok(search.body.data.length >= 2);

  const cheap = await api().get('/api/listings?maxPrice=200&sort=price_asc').expect(200);
  const prices = cheap.body.data.map((l) => l.price);
  assert.deepEqual(prices, [...prices].sort((a, b) => a - b));
  assert.ok(prices.every((p) => p <= 200));

  const free = await api().get('/api/listings?type=giveaway').expect(200);
  assert.ok(free.body.data.every((l) => l.price === 0 && l.section === 'free'));
});

test('rejects bad query values', async () => {
  await api().get('/api/listings?category=cars').expect(400);
  await api().get('/api/listings?sort=random').expect(400);
  await api().get('/api/listings?minPrice=500&maxPrice=100').expect(400);
  await api().get('/api/listings/abc').expect(400);
  await api().get('/api/listings/9999').expect(404);
});

test('creating a listing needs a user', async () => {
  await api().post('/api/listings').send({ title: 'x' }).expect(401);
  await api().post('/api/listings').set(as('not-a-real-user')).send({ title: 'x', itemCondition: 'new', category: 'study', price: 10 }).expect(401);
});

test('full listing lifecycle: create, edit, reserve, sell, delete', async () => {
  const created = await api()
    .post('/api/listings')
    .set(as(ME))
    .send({ title: '  Electric Kettle ', price: 600, originalPrice: 1100, itemCondition: 'good', category: 'appliances', locationText: 'Hostel 1', images: ['/images/kettle.png'] })
    .expect(201);

  const id = created.body.data.id;
  assert.equal(created.body.data.title, 'Electric Kettle');
  assert.equal(created.body.data.isMine, true);
  assert.equal(created.body.data.discountPercent, 45);

  await api().patch(`/api/listings/${id}`).set(as(NEHA)).send({ price: 1 }).expect(403);

  const edited = await api().patch(`/api/listings/${id}`).set(as(ME)).send({ price: 550 }).expect(200);
  assert.equal(edited.body.data.price, 550);

  await api().patch(`/api/listings/${id}/status`).set(as(ME)).send({ status: 'reserved' }).expect(200);
  await api().patch(`/api/listings/${id}/status`).set(as(ME)).send({ status: 'sold' }).expect(200);
  await api().patch(`/api/listings/${id}`).set(as(ME)).send({ price: 500 }).expect(400);

  await api().delete(`/api/listings/${id}`).set(as(ME)).expect(204);
  await api().get(`/api/listings/${id}`).expect(404);
  await api().get(`/api/listings/${id}`).set(as(ME)).expect(200);
});

test('giveaways must be free', async () => {
  const res = await api()
    .post('/api/listings')
    .set(as(ME))
    .send({ title: 'Old notes', listingType: 'giveaway', price: 50, itemCondition: 'fair', category: 'study' })
    .expect(400);
  assert.equal(res.body.details[0].field, 'price');

  const ok = await api()
    .post('/api/listings')
    .set(as(ME))
    .send({ title: 'Old notes', listingType: 'giveaway', itemCondition: 'fair', category: 'study' })
    .expect(201);
  assert.equal(ok.body.data.section, 'free');

  await api().patch(`/api/listings/${ok.body.data.id}`).set(as(ME)).send({ price: 20 }).expect(400);
});

test('broken JSON body returns 400', async () => {
  await api().post('/api/listings').set(as(ME)).set('Content-Type', 'application/json').send('{bad json').expect(400);
});

test('categories include listing counts; handover spots and stats load', async () => {
  const cats = await api().get('/api/categories').expect(200);
  assert.equal(cats.body.data.length, 4);
  assert.ok(cats.body.data.every((c) => typeof c.listingCount === 'number'));

  const spots = await api().get('/api/handover-spots').expect(200);
  assert.equal(spots.body.data.length, 4);
  await api().get('/api/handover-spots/2').expect(200);
  await api().get('/api/handover-spots/99').expect(404);

  const stats = await api().get('/api/stats').expect(200);
  assert.equal(stats.body.data.activeListings, 14);
  assert.equal(stats.body.data.freeItems, 2);
});
