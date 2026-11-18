/*
 * Sample data used by the in-memory store.
 * It mirrors the frontend mockData.js and database/seed.sql so the
 * frontend can switch from mock data to the API without visual changes.
 * Field names are camelCase versions of the columns in
 * database/migrations/001_initial_schema.sql.
 */

export const DEMO_USER_ID = '11111111-1111-4111-8111-111111111111';

const uuid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

export const profiles = [
  { id: DEMO_USER_ID, fullName: 'Ashi', academicRole: "NST '25", hostelName: 'Hostel 1', roomNumber: '214' },
  { id: uuid(1), fullName: 'Kavya Singhania', academicRole: "Design '26", hostelName: 'Hostel 2' },
  { id: uuid(2), fullName: 'Rohan Sharma', academicRole: "Tech '27", hostelName: 'Hostel 1' },
  { id: uuid(3), fullName: 'Ananya Kapoor', academicRole: "Design '25", hostelName: 'Gargi Block' },
  { id: uuid(4), fullName: 'Meera Ghosh', academicRole: "MBA '26", hostelName: 'Makers Bhavan' },
  { id: uuid(5), fullName: 'Neha Sharma', academicRole: "BBA '26", hostelName: 'Atrium' },
  { id: uuid(6), fullName: 'Ishita Verma', academicRole: "Design '27", hostelName: 'Atrium' },
  { id: uuid(7), fullName: 'Nishant Singh', academicRole: "B.Tech '26", hostelName: 'R1' },
  { id: uuid(8), fullName: 'Divyansh Rathore', academicRole: "B.Des '25", hostelName: 'R1' },
  { id: uuid(9), fullName: 'Svarnim', academicRole: "MBA '25", hostelName: 'Atrium' },
  { id: uuid(10), fullName: 'Aarav Mehta', academicRole: "Tech '24", hostelName: 'Hostel 1' },
  { id: uuid(11), fullName: 'Priya Sen', academicRole: "Design '26", hostelName: 'Gargi Block' },
  { id: uuid(12), fullName: 'Campus Security Desk', academicRole: 'Security / Reception' },
  { id: uuid(13), fullName: 'Aditya Roy', academicRole: "Tech '26", hostelName: 'Hostel 2' },
];

export const categories = [
  { id: 1, name: 'Study', slug: 'study' },
  { id: 2, name: 'Appliances', slug: 'appliances' },
  { id: 3, name: 'Seating', slug: 'seating' },
  { id: 4, name: 'Decor', slug: 'decor' },
];

export const handoverSpots = [
  {
    id: 1,
    name: 'Hostel 1 Courtyard',
    badge: 'North Wing',
    timings: '7:00 AM - 10:30 PM',
    description: 'Benches near the main entry arch. Great for Hostels 1 & 2 residents.',
    recommendedFor: 'Study lamps, bedding, heavier decor',
    locationDescription: 'Near Hostel 1 main entry',
  },
  {
    id: 2,
    name: 'Nescafe Circle',
    badge: 'Central Campus',
    timings: '8:00 AM - 11:30 PM',
    description: 'Outdoor umbrella tables near the cafeteria. Best for busy daytime trades between lectures.',
    recommendedFor: 'Books, electronics, quick handoffs',
    locationDescription: 'Outdoor cafeteria area',
  },
  {
    id: 3,
    name: 'Central Library Steps',
    badge: 'Quiet Zone',
    timings: '9:00 AM - 9:00 PM',
    description: 'Right under the shaded atrium pillars. Safe, well-lit, CCTV monitored.',
    recommendedFor: 'Textbooks, calculators, stationery',
    locationDescription: 'Central Library entrance',
  },
  {
    id: 4,
    name: 'Maker Space Porch',
    badge: 'Tech Wing',
    timings: '10:00 AM - 8:00 PM',
    description: 'Wide porch equipped with test power sockets. Ideal to verify appliances work.',
    recommendedFor: 'Electronics, kettle, speakers, lamps',
    locationDescription: 'Maker Space entrance',
  },
];

// [sellerIndex, title, price, originalPrice, categoryId, condition, location, featured, image, description]
const listingRows = [
  [1, 'Arc Study Lamp', 850, 1200, 1, 'like_new', 'Hostel 2', true, 'arc_lamp.png', 'Curved matte orange-red desk lamp with adjustable arm and warm LED bulb. Perfect for late-night study sessions without disturbing roommates.'],
  [2, 'Retro Loop Radio', 1450, 2400, 2, 'good', 'Hostel 1', true, 'loop_radio.png', 'Tactile cream-colored vintage radio with Bluetooth speaker support, FM dial, and built-in rechargeable battery.'],
  [3, 'Bouclé Cloud Seat', 2100, 3800, 3, 'like_new', 'Gargi Block', true, 'cloud_seat.png', 'Ultra-soft periwinkle bouclé fleece armchair cushion. Adds instant warm aesthetic to any standard college hostel bed or reading nook.'],
  [4, 'Pebble Accent Table', 1450, 2200, 4, 'new', 'Makers Bhavan', true, 'pebble_table.png', 'High-gloss terracotta ceramic side table. Compact footprint, easy to wipe down, holds books, coffee mug, and succulent.'],
  [5, 'Astronaut Night Lamp', 399, 799, 4, 'good', 'Atrium', false, 'astronaut_lamp.png', 'Mini galactic star projector lamp. Projects 8 nebula color combinations on your ceiling with magnetic 360-degree rotating head.'],
  [5, 'Ikigai Hardcover Book', 149, 450, 1, 'like_new', 'Atrium', false, 'ikigai_book.png', 'The Japanese Secret to a Long and Happy Life. Clean pages, no highlights or pen marks. Great weekend read.'],
  [6, 'Plush Flower Cushion', 180, 499, 4, 'new', 'Atrium', false, 'flower_cushion.png', 'Pink and cream daisy flower plush cushion. Super fluffy fleece texture, unused with tags still attached.'],
  [7, "Kellogg's Chocos 385g", 180, 260, 2, 'new', 'R1', false, 'chocos.png', 'Sealed unopened family pack carton. Expiry: 6 months remaining. Saved from late night semester pantry overstock.'],
  [8, 'Terracotta Ceramic Mug', 190, 350, 4, 'like_new', 'R1', false, 'ceramic_mug.png', 'Minimalist glazed ivory and raw terracotta handmade coffee mug. Microwave and dishwasher safe, 320ml capacity.'],
  [9, 'Ribbed Knit Crop Top', 280, 699, 4, 'like_new', 'Atrium', false, 'crop_top.png', 'Cream white ribbed knit cropped tee. Stretchy breathable cotton blend, worn once for college orientation festival.'],
  [8, 'Wooden/Velvet Hangers Pair', 50, 120, 4, 'good', 'R1', false, 'hangers.png', 'Pair of smooth natural beechwood clothes hangers with brushed metal hooks and trouser bars. Sturdy closet organizers.'],
  [5, 'Handmade Crochet Penguin Keychain', 120, 250, 4, 'new', 'Atrium', false, 'penguin_keychain.png', 'Handcrafted pastel blue yarn penguin charm with brass split ring and small jingling bell. Made by university craft club.'],
  [10, 'Calculus & Linear Algebra Binder', 0, 600, 1, 'good', 'Hostel 1', false, 'ikigai_book.png', 'Handwritten lecture notes, midterm solved question papers, and spiral binder. Free to any junior taking Math I & II.'],
  [11, 'Ceramic Succulent Plant Pot', 0, 250, 4, 'like_new', 'Gargi Block', false, 'pebble_table.png', 'Empty mini jade pot with drainage hole. Free giveaway for anyone with a dorm desk garden.'],
];

const baseTime = new Date('2026-11-01T10:00:00.000Z').getTime();
const hoursAgo = (i) => new Date(baseTime - i * 60 * 60 * 1000).toISOString();

export const listings = listingRows.map((row, i) => {
  const [seller, title, price, originalPrice, categoryId, itemCondition, locationText, isFeatured, image, description] = row;
  return {
    id: i + 1,
    sellerId: uuid(seller),
    categoryId,
    title,
    description,
    price,
    originalPrice,
    listingType: price === 0 ? 'giveaway' : 'sale',
    itemCondition,
    status: 'active',
    locationText,
    isFeatured,
    images: [`/images/${image}`],
    createdAt: hoursAgo(i),
    updatedAt: hoursAgo(i),
  };
});

export const lostFoundItems = [
  {
    id: 1,
    postedBy: uuid(12),
    itemType: 'found',
    title: 'AirPods Pro Case (Found near Nescafe)',
    description: 'White wireless charging case found on the outdoor wooden bench next to Nescafe. Show serial number to claim.',
    locationDescription: 'Nescafe Circle',
    imageUrl: '/images/loop_radio.png',
    dateOccurred: '2026-10-30',
    status: 'open',
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
  },
  {
    id: 2,
    postedBy: uuid(13),
    itemType: 'found',
    title: 'Casio FX-991EX Calculator',
    description: 'Found on 2nd-floor quiet study desk under the window. Has a small yellow sticker on the back.',
    locationDescription: 'Library Steps',
    imageUrl: '/images/arc_lamp.png',
    dateOccurred: '2026-10-29',
    status: 'open',
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(5),
  },
];

// Demo chats for the demo user, matching INITIAL_CHATS on the frontend.
export const conversations = [
  { id: 1, listingId: 5, buyerId: DEMO_USER_ID, sellerId: uuid(5), createdAt: hoursAgo(3), updatedAt: hoursAgo(1) },
  { id: 2, listingId: 2, buyerId: DEMO_USER_ID, sellerId: uuid(2), createdAt: hoursAgo(30), updatedAt: hoursAgo(24) },
];

export const messages = [
  { id: 1, conversationId: 1, senderId: uuid(5), messageText: 'Hey Ashi! Yes, the night lamp is still available.', createdAt: hoursAgo(3) },
  { id: 2, conversationId: 1, senderId: DEMO_USER_ID, messageText: 'Great! Can we meet at the Nescafe Circle around 5 PM?', createdAt: hoursAgo(2) },
  { id: 3, conversationId: 1, senderId: uuid(5), messageText: 'Sounds perfect! I will bring it in the original box. See you there!', createdAt: hoursAgo(1) },
  { id: 4, conversationId: 2, senderId: DEMO_USER_ID, messageText: 'Hi Rohan, would you take ₹1,350 for the Loop Radio?', createdAt: hoursAgo(25) },
  { id: 5, conversationId: 2, senderId: uuid(2), messageText: 'Hey! I can do ₹1,400 lowest since I just replaced the charging cable. Let me know!', createdAt: hoursAgo(24) },
];

export const conversationMembers = [
  { conversationId: 1, userId: DEMO_USER_ID, lastReadAt: hoursAgo(2) },
  { conversationId: 1, userId: uuid(5), lastReadAt: hoursAgo(1) },
  { conversationId: 2, userId: DEMO_USER_ID, lastReadAt: hoursAgo(24) },
  { conversationId: 2, userId: uuid(2), lastReadAt: hoursAgo(24) },
];

export const wishlists = [];
export const claims = [];
