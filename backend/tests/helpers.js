process.env.NODE_ENV = 'test';

const { default: request } = await import('supertest');
const { default: app } = await import('../src/app.js');
const { resetStore } = await import('../src/store/memoryStore.js');
const { DEMO_USER_ID } = await import('../src/store/seedData.js');

export const ME = DEMO_USER_ID;
export const NEHA = '00000000-0000-4000-8000-000000000005'; // seller of listing 5
export const ROHAN = '00000000-0000-4000-8000-000000000002';
export const SECURITY = '00000000-0000-4000-8000-000000000012'; // posted lost & found item 1

export const api = () => request(app);
export const as = (userId) => ({ 'x-user-id': userId });
export { resetStore };
