/**
 * Mock Product Dataset
 * Contains the 20 premium smart home, lighting, office, dining, and wabi-sabi decor items.
 * Placed on the backend to act as the primary database source of truth.
 */

const products = [
  {
    id: 'smart-diffuser',
    name: 'Aura Aroma Diffuser',
    price: 7490.00,
    rating: 4.9,
    reviews: 142,
    category: 'Smart Home',
    room: 'Bedroom',
    aesthetic: 'Japanese Zen',
    colors: [
      { name: 'Natural Ashwood', hex: '#D6C5B3' },
      { name: 'Obsidian Black', hex: '#111827' }
    ],
    sizes: ['Standard', 'Large'],
    imageUrl: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?q=80&w=600&auto=format&fit=crop',
    description: 'An ultrasound mist aroma diffuser combining natural wood grain finish with smart home scheduling. Adjust mist intervals and subtle warm ambient rings via Google Home.',
    badge: 'SMART',
    isFeatured: true,
    materials: 'Sustainable FSC-certified Ashwood shell, BPA-free internal water tank.',
    care: 'Wipe inner tank with damp cloth weekly. Decalcify with white vinegar every two months.'
  },
  {
    id: 'smart-purifier',
    name: 'PureFlow Air Purifier',
    price: 16990.00,
    rating: 4.8,
    reviews: 98,
    category: 'Smart Home',
    room: 'Study Room',
    aesthetic: 'Minimalist',
    colors: [
      { name: 'Optic White', hex: '#FFFFFF' }
    ],
    sizes: ['Standard'],
    imageUrl: 'https://images.unsplash.com/photo-1622560480654-d96214fdc887?q=80&w=600&auto=format&fit=crop',
    description: 'A whisper-quiet cylindrical HEPA-13 air purifier. Features real-time PM2.5 monitoring and smart voice integration wrapped in a sleek, non-intrusive matte housing.',
    badge: 'SMART',
    isTrending: true,
    materials: 'High-density composite plastic, premium activated carbon mesh.',
    care: 'Vacuum front pre-filter monthly. Replace HEPA filter module every 6-8 months.'
  },
  {
    id: 'smart-speaker',
    name: 'Synapse Smart Speaker',
    price: 12490.00,
    rating: 4.7,
    reviews: 84,
    category: 'Smart Home',
    room: 'Gaming Setup',
    aesthetic: 'Luxury Modern',
    colors: [
      { name: 'Charcoal Knit', hex: '#374151' },
      { name: 'Alabaster', hex: '#F3F4F6' }
    ],
    sizes: ['One Size'],
    imageUrl: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?q=80&w=600&auto=format&fit=crop',
    description: 'An architectural 360-degree wireless smart speaker. Features custom acoustic fabric, capacitive glass-top buttons, and integrated Alexa or Google smart assistance.',
    isTrending: true,
    materials: 'Recycled acoustic yarn wrap, internal high-grade copper coil speakers.',
    care: 'Dust surface using microfiber cloth. Do not expose to moisture or direct sprays.'
  },
  {
    id: 'smart-curtains',
    name: 'Glide Smart Curtains',
    price: 21990.00,
    rating: 4.8,
    reviews: 47,
    category: 'Smart Home',
    room: 'Bedroom',
    aesthetic: 'Cozy Bedroom',
    colors: [
      { name: 'Sand Linen', hex: '#EAE5D9' },
      { name: 'Warm Gray', hex: '#94A3B8' }
    ],
    sizes: ['84-inch', '96-inch'],
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop',
    description: 'Telescopic smart curtain tracking system. Features ultra-quiet battery-powered motors that open curtains smoothly based on sunrise triggers or voice commands.',
    badge: 'PREMIUM',
    materials: 'Anodized high-durability aluminum track, lithium-ion motor unit.',
    care: 'Dry-clean fabric panel. Lubricate aluminum sliding rails annually with silicone spray.'
  },
  {
    id: 'motion-light',
    name: 'SenseMotion LED Strip',
    price: 4990.00,
    rating: 4.6,
    reviews: 120,
    category: 'Smart Home',
    room: 'Balcony',
    aesthetic: 'Industrial',
    colors: [
      { name: 'Clear', hex: '#E2E8F0' }
    ],
    sizes: ['3 Meter', '5 Meter'],
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop',
    description: 'Weatherproof dynamic smart LED strip equipped with active infrared motion detection. Auto-triggers custom low-lux ambient paths at night.',
    badge: 'BESTSELLER',
    materials: 'IP65 silicone-coated flexible copper strips, smart controller hub.',
    care: 'Wipe outer silicone coating with dry cloth. Protect smart power plug from wet rain zones.'
  },
  {
    id: 'smart-bulb',
    name: 'Chroma Ambient Smart Bulb',
    price: 2990.00,
    rating: 4.9,
    reviews: 210,
    category: 'Lighting',
    room: 'Study Room',
    aesthetic: 'Minimalist',
    colors: [
      { name: 'RGB Custom', hex: '#FF0000' }
    ],
    sizes: ['E26 Standard'],
    imageUrl: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=600&auto=format&fit=crop',
    description: 'Full-spectrum RGB smart bulb providing 900 lumens of high-CRI lighting. Synchronizes dynamically with screen content or background sound rhythms.',
    badge: 'SMART',
    isFeatured: true,
    materials: 'Frosted polycarbonate diffuser lens, internal ceramic heat sink.',
    care: 'Ensure power switch is turned off before cleaning. Wipe base with dry microfibers.'
  },
  {
    id: 'pendant-light',
    name: 'Nebula Pendant Light',
    price: 10990.00,
    rating: 4.8,
    reviews: 64,
    category: 'Lighting',
    room: 'Kitchen',
    aesthetic: 'Industrial',
    colors: [
      { name: 'Matte Steel', hex: '#64748B' },
      { name: 'Onyx Black', hex: '#111827' }
    ],
    sizes: ['Medium', 'Large'],
    imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=600&auto=format&fit=crop',
    description: 'Spun steel dome pendant light displaying internal gold-leaf warm reflection coatings. Casts precise architectural cones down dining tables or islands.',
    materials: 'Heavy spun copper dome, braided premium textile cord.',
    care: 'Dust dome surface monthly. Clean copper inner linings using designated copper cleaners.'
  },
  {
    id: 'chandeliers',
    name: 'Orion Glass Chandelier',
    price: 42990.00,
    rating: 5.0,
    reviews: 18,
    category: 'Lighting',
    room: 'Living Room',
    aesthetic: 'Luxury Modern',
    colors: [
      { name: 'Brushed Brass', hex: '#D97706' }
    ],
    sizes: ['Standard'],
    imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaaced0168?q=80&w=600&auto=format&fit=crop',
    description: 'A striking luxury modern chandelier housing mouth-blown organic glass globes clustered around solid satin-finished brass branches.',
    badge: 'EXCLUSIVE',
    materials: 'Solid brass structural rods, hand-blown borosilicate glass globes.',
    care: 'Dust individual globes carefully using duster. Clean glass with streak-free sprays.'
  },
  {
    id: 'floor-lamp',
    name: 'Vector Arc Floor Lamp',
    price: 15990.00,
    rating: 4.7,
    reviews: 52,
    category: 'Lighting',
    room: 'Office Space',
    aesthetic: 'Scandinavian',
    colors: [
      { name: 'Satin Silver', hex: '#CBD5E1' }
    ],
    sizes: ['One Size'],
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop',
    description: 'Arched minimal floor lamp with an adjustable brushed aluminum head. Casts glare-free indirect lighting over desks and reading spots.',
    materials: 'Brushed aluminum structural arm, heavy polished white marble base.',
    care: 'Wipe aluminum arm with dry cloth. Polish solid marble base using marble cleaners.'
  },
  {
    id: 'ergo-chair',
    name: 'Apex Ergonomic Chair',
    price: 29990.00,
    rating: 4.9,
    reviews: 130,
    category: 'Office',
    room: 'Office Space',
    aesthetic: 'Industrial',
    colors: [
      { name: 'Slate Gray', hex: '#475569' },
      { name: 'Obsidian Black', hex: '#111827' }
    ],
    sizes: ['Standard'],
    imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=600&auto=format&fit=crop',
    description: 'Fully articulating mesh office task chair. Features dynamic adaptive lumbar cushioning, 3D armrests, and weight-activated tension tilt mechanics.',
    badge: 'BESTSELLER',
    isFeatured: true,
    materials: 'Reinforced nylon mesh back, durable structural steel piston column.',
    care: 'Vacuum mesh frame monthly. Lubricate active casters with light grease occasionally.'
  },
  {
    id: 'standing-desk',
    name: 'Ascent Oak Standing Desk',
    price: 49990.00,
    rating: 4.8,
    reviews: 43,
    category: 'Office',
    room: 'Study Room',
    aesthetic: 'Scandinavian',
    colors: [
      { name: 'Natural Oak', hex: '#F3E8FF' }
    ],
    sizes: ['48x24"', '60x30"'],
    imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&auto=format&fit=crop',
    description: 'Premium dual-motor electric standing desk with three memory height presets and anti-collision safety. Solid white-oak top with integrated wire tunnels.',
    materials: 'FSC solid white oak wooden top, dual-stage steel columns.',
    care: 'Wipe solid wood surface with damp cloth. Re-oil oak surface once every two years.'
  },
  {
    id: 'academia-bookshelf',
    name: 'Gothic Wood Bookshelf',
    price: 24990.00,
    rating: 4.7,
    reviews: 29,
    category: 'Office',
    room: 'Study Room',
    aesthetic: 'Dark Academia',
    colors: [
      { name: 'Walnut', hex: '#4B382A' }
    ],
    sizes: ['Standard'],
    imageUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?q=80&w=600&auto=format&fit=crop',
    description: 'Classic dark walnut stained bookshelf with solid heavy-molded crown profiles. Lends historical gravity to home libraries and reading spaces.',
    materials: 'Premium solid birchwood and thick real-walnut veneer.',
    care: 'Dust shelves weekly. Do not expose to moisture. Use designated wood oils to restore shine.'
  },
  {
    id: 'desk-organizer',
    name: 'Monolith Desk Tray',
    price: 3990.00,
    rating: 4.9,
    reviews: 76,
    category: 'Office',
    room: 'Office Space',
    aesthetic: 'Minimalist',
    colors: [
      { name: 'Cement Gray', hex: '#94A3B8' }
    ],
    sizes: ['Standard'],
    imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=600&auto=format&fit=crop',
    description: 'Architectural cast concrete desk organizer featuring dedicated grooves for pens, cards, smart devices, and document sets.',
    materials: 'Micro-ground structural cement compound, cork base lining.',
    care: 'Wipe concrete surface using damp cloth. Avoid throwing hard objects onto cement edges.'
  },
  {
    id: 'dining-table',
    name: 'Kanso Walnut Dining Table',
    price: 67990.00,
    rating: 4.9,
    reviews: 23,
    category: 'Dining',
    room: 'Kitchen',
    aesthetic: 'Japanese Zen',
    colors: [
      { name: 'Rich Walnut', hex: '#3B2F2F' }
    ],
    sizes: ['6-Seater', '8-Seater'],
    imageUrl: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?q=80&w=600&auto=format&fit=crop',
    description: 'Striking low-profile dining table crafted from heavy solid walnut, highlighting beautiful natural live-edge detail and zero metal screws.',
    isFeatured: true,
    materials: 'Solid kiln-dried American walnut wood, matte zero-VOC oil finish.',
    care: 'Wipe dining surface immediately after liquid spills. Clean with wood soap only.'
  },
  {
    id: 'bar-stools',
    name: 'Hygge Leather Bar Stools',
    price: 13990.00,
    rating: 4.8,
    reviews: 32,
    category: 'Dining',
    room: 'Kitchen',
    aesthetic: 'Scandinavian',
    colors: [
      { name: 'Cognac Leather', hex: '#B45309' }
    ],
    sizes: ['Standard Counter'],
    imageUrl: 'https://images.unsplash.com/photo-1581428982868-e410dd047a90?q=80&w=600&auto=format&fit=crop',
    description: 'Elegantly proportioned bar stools with solid light ash wood frames and comfortable curved cognac saddle-leather seats.',
    materials: 'Vegetable-tanned saddle leather, steam-bent solid ashwood.',
    care: 'Apply neutral leather balms semi-annually. Wipe wooden frames with soft dry cloths.'
  },
  {
    id: 'dining-chairs',
    name: 'Modena Dining Chair',
    price: 9490.00,
    rating: 4.6,
    reviews: 58,
    category: 'Dining',
    room: 'Kitchen',
    aesthetic: 'Luxury Modern',
    colors: [
      { name: 'Bone Velvet', hex: '#FAF9F6' },
      { name: 'Steel Gray', hex: '#64748B' }
    ],
    sizes: ['One Size'],
    imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=600&auto=format&fit=crop',
    description: 'Contemporary dining chair with slender black powder-coated metal frame legs supporting thick plush ivory velvet back cushions.',
    materials: 'Steel structural wire frame legs, high-density velvet cushioning.',
    care: 'Use fabric brushes to brush velvet. Blot spills immediately with clean dry cloth.'
  },
  {
    id: 'moss-frame',
    name: 'Living Moss Art Frame',
    price: 7990.00,
    rating: 4.9,
    reviews: 87,
    category: 'Small Decor',
    room: 'Balcony',
    aesthetic: 'Bohemian',
    colors: [
      { name: 'Spring Green', hex: '#1E3F20' }
    ],
    sizes: ['16x16"', '24x24"'],
    imageUrl: 'https://images.unsplash.com/photo-1535696582863-f8232938f375?q=80&w=600&auto=format&fit=crop',
    description: 'Wall hanging featuring 100% natural, preserved forest mosses requiring zero watering, sunlight, or active gardening.',
    badge: 'NATURAL',
    isTrending: true,
    materials: 'Preserved reindeer and cushion mosses, solid oak wooden frames.',
    care: 'Do not water moss frame. Keep indoor humidity levels between 30-70% for freshness.'
  },
  {
    id: 'stone-vase',
    name: 'Wabi-Sabi Ceramic Vase',
    price: 5490.00,
    rating: 4.8,
    reviews: 104,
    category: 'Small Decor',
    room: 'Living Room',
    aesthetic: 'Japanese Zen',
    colors: [
      { name: 'Oatmeal coarse', hex: '#CBD5E1' }
    ],
    sizes: ['Small', 'Medium', 'Large'],
    imageUrl: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=600&auto=format&fit=crop',
    description: 'Organic pottery vase displaying highly textured coarse clay finishes and asymmetrical profiles. Perfect for dry botanical twigs.',
    materials: 'Textured stoneware clay body, natural mineral glaze.',
    care: 'Handwash only. Dry fully before storing. Do not use chemical abrasive sponges.'
  },
  {
    id: 'eclipse-mirror',
    name: 'Eclipse Brass Mirror',
    price: 14990.00,
    rating: 4.7,
    reviews: 35,
    category: 'Small Decor',
    room: 'Bedroom',
    aesthetic: 'Luxury Modern',
    colors: [
      { name: 'Polished Brass', hex: '#EAB308' }
    ],
    sizes: ['24-inch', '32-inch'],
    imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=600&auto=format&fit=crop',
    description: 'Perfect circle floating wall mirror defined by slender polished brass bezels offset by matching geometric crescent lines.',
    materials: 'Premium HD silver backing glass mirror, hand-welded solid brass frame.',
    care: 'Spray glass cleaner on microfiber directly. Clean brass bezel using damp soft cloths.'
  },
  {
    id: 'zen-garden-kit',
    name: 'Serenity Sand Garden',
    price: 3990.00,
    rating: 4.9,
    reviews: 41,
    category: 'Small Decor',
    room: 'Balcony',
    aesthetic: 'Japanese Zen',
    colors: [
      { name: 'Sand White', hex: '#F8FAFC' }
    ],
    sizes: ['Standard'],
    imageUrl: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=600&auto=format&fit=crop',
    description: 'Tabletop Zen sand rake kit complete with high-purity crystalline quartz sand, basalt stone stacks, and fine handcrafted bamboo rakes.',
    materials: 'Natural stone, solid oak sandbox frame, bamboo raking elements.',
    care: 'Keep sand surface dry. Brush stones occasionally using standard dust brushes.'
  }
];

module.exports = products;
