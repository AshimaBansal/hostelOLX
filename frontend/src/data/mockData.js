export const INITIAL_PRODUCTS = [
  // Campus Favorites
  {
    id: 'fav-1',
    title: 'Arc Study Lamp',
    price: 850,
    originalPrice: 1200,
    category: 'study',
    section: 'favorites',
    location: 'Hostel 2',
    seller: 'Kavya Singhania',
    sellerRole: "Design '26",
    condition: 'Like new',
    description: 'Curved matte orange-red desk lamp with adjustable arm and warm LED bulb. Perfect for late-night study sessions without disturbing roommates.',
    image: '/images/arc_lamp.png'
  },
  {
    id: 'fav-2',
    title: 'Retro Loop Radio',
    price: 1450,
    originalPrice: 2400,
    category: 'appliances',
    section: 'favorites',
    location: 'Hostel 1',
    seller: 'Rohan Sharma',
    sellerRole: "Tech '27",
    condition: 'Good',
    description: 'Tactile cream-colored vintage radio with Bluetooth speaker support, FM dial, and built-in rechargeable battery.',
    image: '/images/loop_radio.png'
  },
  {
    id: 'fav-3',
    title: 'Bouclé Cloud Seat',
    price: 2100,
    originalPrice: 3800,
    category: 'seating',
    section: 'favorites',
    location: 'Gargi Block',
    seller: 'Ananya Kapoor',
    sellerRole: "Design '25",
    condition: 'Like new',
    description: 'Ultra-soft periwinkle bouclé fleece armchair cushion. Adds instant warm aesthetic to any standard college hostel bed or reading nook.',
    image: '/images/cloud_seat.png'
  },
  {
    id: 'fav-4',
    title: 'Pebble Accent Table',
    price: 1450,
    originalPrice: 2200,
    category: 'decor',
    section: 'favorites',
    location: 'Makers Bhavan',
    seller: 'Meera Ghosh',
    sellerRole: "MBA '26",
    condition: 'New',
    description: 'High-gloss terracotta ceramic side table. Compact footprint, easy to wipe down, holds books, coffee mug, and succulent.',
    image: '/images/pebble_table.png'
  },

  // Dorm Essentials & Quick Drops
  {
    id: 'dorm-1',
    title: 'Astronaut Night Lamp',
    price: 399,
    originalPrice: 799,
    category: 'decor',
    section: 'essentials',
    location: 'Atrium',
    seller: 'Neha Sharma',
    sellerRole: "BBA '26",
    condition: 'Good',
    description: 'Mini galactic star projector lamp. Projects 8 nebula color combinations on your ceiling with magnetic 360-degree rotating head.',
    image: '/images/astronaut_lamp.png'
  },
  {
    id: 'dorm-2',
    title: 'Ikigai Hardcover Book',
    price: 149,
    originalPrice: 450,
    category: 'study',
    section: 'essentials',
    location: 'Atrium',
    seller: 'Neha Sharma',
    sellerRole: "BBA '26",
    condition: 'Like new',
    description: 'The Japanese Secret to a Long and Happy Life. Clean pages, no highlights or pen marks. Great weekend read.',
    image: '/images/ikigai_book.png'
  },
  {
    id: 'dorm-3',
    title: 'Plush Flower Cushion',
    price: 180,
    originalPrice: 499,
    category: 'decor',
    section: 'essentials',
    location: 'Atrium',
    seller: 'Ishita Verma',
    sellerRole: "Design '27",
    condition: 'New',
    description: 'Pink and cream daisy flower plush cushion. Super fluffy fleece texture, unused with tags still attached.',
    image: '/images/flower_cushion.png'
  },
  {
    id: 'dorm-4',
    title: "Kellogg's Chocos 385g",
    price: 180,
    originalPrice: 260,
    category: 'appliances',
    section: 'essentials',
    location: 'R1',
    seller: 'Nishant Singh',
    sellerRole: "B.Tech '26",
    condition: 'New',
    description: 'Sealed unopened family pack carton. Expiry: 6 months remaining. Saved from late night semester pantry overstock.',
    image: '/images/chocos.png'
  },
  {
    id: 'dorm-5',
    title: 'Terracotta Ceramic Mug',
    price: 190,
    originalPrice: 350,
    category: 'decor',
    section: 'essentials',
    location: 'R1',
    seller: 'Divyansh Rathore',
    sellerRole: "B.Des '25",
    condition: 'Like new',
    description: 'Minimalist glazed ivory and raw terracotta handmade coffee mug. Microwave and dishwasher safe, 320ml capacity.',
    image: '/images/ceramic_mug.png'
  },
  {
    id: 'dorm-6',
    title: 'Ribbed Knit Crop Top',
    price: 280,
    originalPrice: 699,
    category: 'decor',
    section: 'essentials',
    location: 'Atrium',
    seller: 'Svarnim',
    sellerRole: "MBA '25",
    condition: 'Like new',
    description: 'Cream white ribbed knit cropped tee. Stretchy breathable cotton blend, worn once for college orientation festival.',
    image: '/images/crop_top.png'
  },
  {
    id: 'dorm-7',
    title: 'Wooden/Velvet Hangers Pair',
    price: 50,
    originalPrice: 120,
    category: 'decor',
    section: 'essentials',
    location: 'R1',
    seller: 'Divyansh Rathore',
    sellerRole: "B.Des '25",
    condition: 'Good',
    description: 'Pair of smooth natural beechwood clothes hangers with brushed metal hooks and trouser bars. Sturdy closet organizers.',
    image: '/images/hangers.png'
  },
  {
    id: 'dorm-8',
    title: 'Handmade Crochet Penguin Keychain',
    price: 120,
    originalPrice: 250,
    category: 'decor',
    section: 'essentials',
    location: 'Atrium',
    seller: 'Neha Sharma',
    sellerRole: "BBA '26",
    condition: 'New',
    description: 'Handcrafted pastel blue yarn penguin charm with brass split ring and small jingling bell. Made by university craft club.',
    image: '/images/penguin_keychain.png'
  },

  // Free & Giveaway
  {
    id: 'free-1',
    title: 'Calculus & Linear Algebra Binder',
    price: 0,
    originalPrice: 600,
    category: 'study',
    section: 'free',
    location: 'Hostel 1',
    seller: 'Aarav Mehta',
    sellerRole: "Tech '24",
    condition: 'Good',
    description: 'Handwritten lecture notes, midterm solved question papers, and spiral binder. Free to any junior taking Math I & II.',
    image: '/images/ikigai_book.png'
  },
  {
    id: 'free-2',
    title: 'Ceramic Succulent Plant Pot',
    price: 0,
    originalPrice: 250,
    category: 'decor',
    section: 'free',
    location: 'Gargi Block',
    seller: 'Priya Sen',
    sellerRole: "Design '26",
    condition: 'Like new',
    description: 'Empty mini jade pot with drainage hole. Free giveaway for anyone with a dorm desk garden.',
    image: '/images/pebble_table.png'
  },

  // Lost & Found
  {
    id: 'lf-1',
    title: 'AirPods Pro Case (Found near Nescafe)',
    price: 0,
    originalPrice: 0,
    category: 'appliances',
    section: 'lost-found',
    location: 'Nescafe Circle',
    seller: 'Campus Security Desk',
    sellerRole: 'Security / Reception',
    condition: 'Good',
    description: 'White wireless charging case found on the outdoor wooden bench next to Nescafe. Show serial number to claim.',
    image: '/images/loop_radio.png'
  },
  {
    id: 'lf-2',
    title: 'Casio FX-991EX Calculator',
    price: 0,
    originalPrice: 0,
    category: 'study',
    section: 'lost-found',
    location: 'Library Steps',
    seller: 'Aditya Roy',
    sellerRole: "Tech '26",
    condition: 'Good',
    description: 'Found on 2nd-floor quiet study desk under the window. Has a small yellow Pikachu sticker on back.',
    image: '/images/arc_lamp.png'
  }
];

export const HANDOVER_SPOTS = [
  {
    id: 'h1',
    name: 'Hostel 1 Courtyard',
    badge: 'North Wing',
    timings: '7:00 AM – 10:30 PM',
    description: 'Benches near the main entry arch. Great for Hostels 1 & 2 residents.',
    recommendedFor: 'Study lamps, bedding, heavier decor'
  },
  {
    id: 'nescafe',
    name: 'Nescafe Circle',
    badge: 'Central Campus',
    timings: '8:00 AM – 11:30 PM',
    description: 'Outdoor umbrella tables near the cafeteria. Best for busy daytime trades between lectures.',
    recommendedFor: 'Books, electronics, quick handoffs'
  },
  {
    id: 'library',
    name: 'Central Library Steps',
    badge: 'Quiet Zone',
    timings: '9:00 AM – 9:00 PM',
    description: 'Right under the shaded atrium pillars. Safe, well-lit, CCTV monitored.',
    recommendedFor: 'Textbooks, calculators, stationery'
  },
  {
    id: 'maker',
    name: 'Maker Space Porch',
    badge: 'Tech Wing',
    timings: '10:00 AM – 8:00 PM',
    description: 'Wide porch equipped with test power sockets. Ideal to verify appliances work.',
    recommendedFor: 'Electronics, kettle, speakers, lamps'
  }
];

export const INITIAL_CHATS = [
  {
    id: 'chat-1',
    sellerName: 'Neha Sharma',
    sellerRole: "BBA '26 • Atrium",
    productTitle: 'Astronaut Night Lamp',
    productPrice: 399,
    productImage: '/images/astronaut_lamp.png',
    unread: true,
    messages: [
      { sender: 'Neha Sharma', text: 'Hey Ashi! Yes, the night lamp is still available.', time: '12:40 PM', isMe: false },
      { sender: 'Me', text: 'Great! Can we meet at the Nescafe Circle around 5 PM?', time: '12:42 PM', isMe: true },
      { sender: 'Neha Sharma', text: 'Sounds perfect! I will bring it in the original box. See you there!', time: '12:45 PM', isMe: false }
    ]
  },
  {
    id: 'chat-2',
    sellerName: 'Rohan Sharma',
    sellerRole: "Tech '27 • Hostel 2",
    productTitle: 'Retro Loop Radio',
    productPrice: 1450,
    productImage: '/images/loop_radio.png',
    unread: false,
    messages: [
      { sender: 'Me', text: 'Hi Rohan, would you take ₹1,350 for the Loop Radio?', time: 'Yesterday', isMe: true },
      { sender: 'Rohan Sharma', text: 'Hey! I can do ₹1,400 lowest since I just replaced the charging cable. Let me know!', time: 'Yesterday', isMe: false }
    ]
  },
  {
    id: 'chat-3',
    sellerName: 'Divyansh Rathore',
    sellerRole: "B.Des '25 • R1",
    productTitle: 'Terracotta Ceramic Mug',
    productPrice: 190,
    productImage: '/images/ceramic_mug.png',
    unread: false,
    messages: [
      { sender: 'Divyansh Rathore', text: 'Hey Ashi, I have the terracotta mug ready at R1 foyer if you want to inspect it today.', time: '2 days ago', isMe: false }
    ]
  }
];

