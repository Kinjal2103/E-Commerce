// Hardware Components Mock Database for BuildForge

export const CATEGORIES = [
  { name: 'CPUs', icon: 'memory', count: '48 Parts' },
  { name: 'GPUs', icon: 'developer_board', count: '36 Parts' },
  { name: 'Motherboards', icon: 'grid_view', count: '42 Parts' },
  { name: 'RAM', icon: 'settings_input_component', count: '54 Parts' },
  { name: 'Storage', icon: 'sd_storage', count: '32 Parts' },
  { name: 'Power Supplies', icon: 'electric_bolt', count: '24 Parts' },
  { name: 'Cases', icon: 'door_sliding', count: '18 Parts' },
  { name: 'Cooling', icon: 'ac_unit', count: '28 Parts' }
];

export const PRODUCTS = [
  // CPUs
  {
    id: 'cpu-i9-14900k',
    name: 'Intel Core i9-14900K',
    brand: 'Intel',
    category: 'CPUs',
    price: 589.00,
    rating: 4.8,
    reviews: 248,
    stock: 15,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5Q8GtdNaFpTDF__-ZWlXyx3C3sbTwNNboEEUGUaOQME7w3vpsNrPnHbwHKOibzJUFjZ71xib-aU1wdh6v4DdJ8WlyKVjI8dlZFHc13oAlXMvBxmDbZQ8BzH1oDttU6cN02KBi4_ihLi-y_noAhtUQThKaUReVfEIRpbmmEEKz4pQKlOvHpiH6gSD7HnwlK1BrBqtm1c6FadX2HVW4E8cxjsDiuttncjh5Y9byMVq3fsIYcnGPhV9Q4TnLz2eXI3btYw4UEk9IuyQ',
    badge: 'INTEL',
    isFeatured: true,
    isTrending: true,
    specs: {
      'Socket Type': 'LGA 1700',
      'Cores / Threads': '24 Cores / 32 Threads',
      'Clock Speed': '3.2 GHz (6.0 GHz Turbo)',
      'TDP': '125W (253W Boost)',
      'Integrated Graphics': 'Intel UHD Graphics 770',
      'RAM Support': 'DDR5 / DDR4',
      'RGB Support': 'No'
    },
    pros: ['Ultimate single-core speed', '6.0 GHz out of the box', 'Excellent for production'],
    cons: ['Runs extremely hot', 'High power draw', 'LGA1700 platform is at end-of-life']
  },
  {
    id: 'cpu-ryzen-7800x3d',
    name: 'AMD Ryzen 7 7800X3D',
    brand: 'AMD',
    category: 'CPUs',
    price: 369.00,
    rating: 4.9,
    reviews: 582,
    stock: 22,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAS_s1sl91bdDIjOKMJPcb3kKgYkTgV5tj85OW61e6eT9IoPbVdNsT3RSO8glfc9N2khMrIjUNxANKMilckqw145TCBGYU5JJ8nl05FbuisH86dMVA_1vkE3QrzdnyVyNKwDfvr4f4BlRP4zp3x_jFZssOneQiPgA43QueW_8wFzx6vMaUoQ4jTuaLQn3bLGNUWYDwMm6MzTkIp7I3tJafynkm96-0JLq67BnabWN63zpXMjX1eEeD9_1NxDWuOcZBMJ0F6sxfaUe4',
    badge: 'AMD RYZEN',
    isFeatured: true,
    isTrending: true,
    specs: {
      'Socket Type': 'AM5',
      'Cores / Threads': '8 Cores / 16 Threads',
      'Clock Speed': '4.2 GHz (5.0 GHz Turbo)',
      'TDP': '120W',
      'Integrated Graphics': 'AMD Radeon Graphics',
      'RAM Support': 'DDR5 Only',
      'RGB Support': 'No'
    },
    pros: ['Fastest gaming CPU in the world', '3D V-Cache technology', 'Highly power efficient'],
    cons: ['Sub-par productivity score vs Intel i9', 'AM5 platform DDR5 startup times', 'No stock cooler included']
  },
  {
    id: 'cpu-i7-14700k',
    name: 'Intel Core i7-14700K',
    brand: 'Intel',
    category: 'CPUs',
    price: 389.99,
    rating: 4.7,
    reviews: 194,
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=200&auto=format&fit=crop',
    badge: 'INTEL',
    specs: {
      'Socket Type': 'LGA 1700',
      'Cores / Threads': '20 Cores / 28 Threads',
      'Clock Speed': '3.4 GHz (5.6 GHz Turbo)',
      'TDP': '125W',
      'Integrated Graphics': 'Intel UHD Graphics 770',
      'RAM Support': 'DDR5 / DDR4',
      'RGB Support': 'No'
    },
    pros: ['Extra E-cores compared to 13700K', 'Excellent price/performance ratio', 'Great multitasking'],
    cons: ['Needs premium cooling', 'High peak power consumption']
  },

  // GPUs
  {
    id: 'gpu-rtx-4090',
    name: 'ROG Strix GeForce RTX 4090 OC',
    brand: 'ASUS',
    category: 'GPUs',
    price: 1999.00,
    rating: 4.9,
    reviews: 312,
    stock: 4,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4lo7fQURJg3KWCyL2bXKH6u95L2siQtX9mOXd0DFPcknHgN3-cgfn1nnmgqHB7ziv_-7gz_p4WLPs8LEKZ_S7Bmx3KPVNnnxyseoc5_hhSzrOGGChimKD63Qa3b6FLgyPukpv86JqNyOT69eU3RCigUFxEYGNFR7V3ZSs2yHhLdmjS0mZbMqAhavHBThBUDyjTqg-k5k1Hv4igbt7NSxLRD2HDwcbNnqNwcdMoy0gecM6Cgmbaou6PvM9Mw_nl6-q4cdgmcE9p_g',
    badge: 'ASUS ROG',
    isFeatured: true,
    isTrending: true,
    specs: {
      'VRAM': '24GB GDDR6X',
      'Interface': 'PCIe 4.0 x16',
      'TDP': '450W',
      'Boost Clock': '2640 MHz',
      'Length': '358 mm',
      'Power Connector': '1x 16-pin (12VHPWR)',
      'RGB Support': 'Yes'
    },
    pros: ['Unparalleled 4K and Ray Tracing speed', '24GB massive VRAM buffer', 'DLSS 3 Frame Generation'],
    cons: ['Enormous footprint (3.5 slot)', 'Extremely expensive', 'Requires high wattage ATX 3.0 PSU']
  },
  {
    id: 'gpu-rx-7900xtx',
    name: 'Radeon RX 7900 XTX Gaming',
    brand: 'AMD',
    category: 'GPUs',
    price: 949.99,
    rating: 4.6,
    reviews: 145,
    stock: 9,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCz9b7P3P4jL6o8MSwwfgtjT32AoAXPayFOjlq_ZFUEaE3X8lNVw7I-wJyPGm2_zYEpxSV7aFB4un0qnWXC6JRnLK-Xg_5JE36jOskex4ZWm3JtVQUv4PLEKN_c8YAGuJ9Dhc9j48p9FoyitkzyIcSX2Zx6E2_wH5CVgLhD2KTsuYrWb2drGAEPVwdYhkoKQGExDJQJ6rVJ4pdPMEvg4i-tSfOAup5JHhDVaPQojLyxbCGiNTp9QSwlo0uUpd7VIG9AKrdeHhudG5c',
    badge: 'AMD RADEON',
    isFeatured: false,
    isTrending: true,
    specs: {
      'VRAM': '24GB GDDR6',
      'Interface': 'PCIe 4.0 x16',
      'TDP': '355W',
      'Boost Clock': '2500 MHz',
      'Length': '287 mm',
      'Power Connector': '2x 8-pin',
      'RGB Support': 'Yes'
    },
    pros: ['Superb 4K rasterization performance', '24GB massive VRAM', 'Standard power connectors (no 12VHPWR needed)'],
    cons: ['Mediocre ray-tracing performance', 'FSR 3 is still behind DLSS 3', 'Idle power draw bugs']
  },
  {
    id: 'gpu-rtx-4070ti-super',
    name: 'GeForce RTX 4070 Ti Super Ventus 3X',
    brand: 'MSI',
    category: 'GPUs',
    price: 829.99,
    rating: 4.7,
    reviews: 87,
    stock: 14,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkkVQuJk-WEglJ19zGkEdzoXDhR_zpiDnElagU-suDRwyRDHJL9OKma-6KGuZ811JHgXTd0G8uKMwkqsYjQNT5Xt9drVwUmV6LpkBdU1A6esJXzOY61TrVFrSf2n6-G7a5DheIEyhFc0CnRuvGc3Js217Xk2E069m0tvrbPOLixuMJzurc_WpTutHbhdF533zWnYMYGcSx8goFhF92VB2J9SGDOZRPH_fLvUsIzJ3Oetel_N9vmjTtqY8cRBnHsdAuXeni4EUBWWc',
    badge: 'MSI VENTUS',
    specs: {
      'VRAM': '16GB GDDR6X',
      'Interface': 'PCIe 4.0 x16',
      'TDP': '285W',
      'Boost Clock': '2650 MHz',
      'Length': '308 mm',
      'Power Connector': '1x 16-pin (12VHPWR)',
      'RGB Support': 'No'
    },
    pros: ['16GB VRAM upgrade from non-Super', 'Quiet Ventus triple fan setup', 'Amazing 1440p gaming'],
    cons: ['Expensive mid-tier pricing', 'Ventus BIOS limit limits manual overclocking']
  },

  // Motherboards
  {
    id: 'mb-z790-carbon',
    name: 'MPG Z790 Carbon WiFi',
    brand: 'MSI',
    category: 'Motherboards',
    price: 429.99,
    rating: 4.7,
    reviews: 94,
    stock: 11,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGhd_lx9gV18k7b0rduv5GEF4eOxImx63sr44j0FdA2g5dsaNqSuSHOJcNM0G9IU44o4p8j7LTvs3f-LWqzOSeNc8lHkSMXMsmWF-Wy5bmlM4RT63_8m5YkCgQX7VnWQPz9K5dr1O38m3w_H6rXvhHUFC5o37Gp5Se1nxosqJ4vL_W75gd0M8yw9ppfMwEJ_-jqZtmB7X4VSvSirW28_uUn8_H071KWf3mSVzVlMS74A6fKTzie0ZzoQeCam_L2xhQvHIxNMABpu0',
    badge: 'MSI',
    isFeatured: true,
    specs: {
      'Socket Type': 'LGA 1700',
      'Form Factor': 'ATX',
      'RAM Slots': '4x DDR5',
      'Max RAM Support': '192GB',
      'Storage Connectors': '5x M.2 PCIe 5.0/4.0',
      'Networking': 'Wi-Fi 6E / 2.5GbE LAN',
      'RGB Support': 'Yes'
    },
    pros: ['Heavy-duty VRMs for overclocking', 'PCIe 5.0 x16 slot', 'Excellent WiFi antenna coverage'],
    cons: ['Overkill price for average builds', 'Requires dual 8-pin CPU power connectors']
  },
  {
    id: 'mb-x670e-rog-strix',
    name: 'ROG Strix X670E-E Gaming WiFi',
    brand: 'ASUS',
    category: 'Motherboards',
    price: 489.00,
    rating: 4.8,
    reviews: 73,
    stock: 6,
    imageUrl: 'https://images.unsplash.com/photo-1562408590-e32931084e23?q=80&w=200&auto=format&fit=crop',
    badge: 'ASUS ROG',
    specs: {
      'Socket Type': 'AM5',
      'Form Factor': 'ATX',
      'RAM Slots': '4x DDR5',
      'Max RAM Support': '192GB',
      'Storage Connectors': '4x M.2 NVMe Gen 5',
      'Networking': 'Wi-Fi 6E / 2.5Gb LAN',
      'RGB Support': 'Yes'
    },
    pros: ['Premium PCIe Gen 5 compatibility', 'Massive thermal plates', 'Pre-mounted I/O shield'],
    cons: ['Heavy weight', 'BIOS needs updating for DDR5 stability']
  },

  // RAM
  {
    id: 'ram-dominator-64',
    name: 'Dominator Titanium 64GB DDR5 (2x32GB)',
    brand: 'Corsair',
    category: 'RAM',
    price: 294.00,
    rating: 4.9,
    reviews: 104,
    stock: 18,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAT3qKGHYFn0X-TvY_twS5j1Gle3XrJvlzwlppLBuTJmm4TOEZhuMixQi_X2u8OuFc0A2uaQEW7p-zO8SYrLSb0b2zMkQ7qGxKdJ1B0lxLshyVTPQeApLgMn2jDg6m6opVdYuo4ThlqJh5UVnyucdvd65dO-xHBkKwvKwYKamDR12mw2doYtEqVqIhbQJQ9n65p5_LDWPgktVOtPrSVlu0eB7gCyaRXsONrMPB_XxB1tLaPXLmtUA073qiKUHdpl9Pa00QWf75lmRo',
    badge: 'CORSAIR',
    isFeatured: true,
    specs: {
      'Capacity': '64GB (2x32GB)',
      'Speed': '7200 MT/s',
      'Timing': 'CL34-44-44-96',
      'Type': 'DDR5',
      'Voltage': '1.45V',
      'RGB Support': 'Yes'
    },
    pros: ['Ultra high speed (7200MT/s)', 'Stunning, custom customizable lightbar', 'Premium titanium heatspreader'],
    cons: ['Extremely expensive for RAM', 'High profile height (might clash with air coolers)']
  },
  {
    id: 'ram-trident-z5-32',
    name: 'Trident Z5 RGB 32GB DDR5 (2x16GB)',
    brand: 'G.Skill',
    category: 'RAM',
    price: 185.00,
    rating: 4.8,
    reviews: 320,
    stock: 25,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnC8hzX1sLE8lYge9k13jn2PLqmC-9Ljr6CBccFf95ulki6-xAkkURaLtkskSxGILqzTlscmecbqRiUlGdetE-cFYz1Z5Y6H1yGSyFJmRZMroZ5t-Cnw7n6OoEWKUX0W42StIgeVeviMcX7MpMeQeDg3OmNb6dYJadsXUH9pKZU1j1m-b-fbd6MwpKC-mVp3xCV5jbP_2L7FTDXltM5nXRG_zW7iQQxWLo3QLteXdNecPUmGDlpb6PZ3PO_UqdS74FqF8LGZTce8M',
    badge: 'G.SKILL',
    isFeatured: false,
    specs: {
      'Capacity': '32GB (2x16GB)',
      'Speed': '7200 MT/s',
      'Timing': 'CL34-45-45-115',
      'Type': 'DDR5',
      'Voltage': '1.40V',
      'RGB Support': 'Yes'
    },
    pros: ['Very popular design', 'Excellent Samsung/Hynix die components', 'Smooth ARGB lighting'],
    cons: ['May require BIOS tweaks for stable XMP at 7200']
  },

  // Storage
  {
    id: 'ssd-990-pro',
    name: 'Samsung 990 Pro M.2 NVMe 2TB',
    brand: 'Samsung',
    category: 'Storage',
    price: 169.99,
    rating: 4.9,
    reviews: 430,
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1597852074816-d933c4d2b98a?q=80&w=200&auto=format&fit=crop',
    badge: 'SAMSUNG',
    isFeatured: true,
    specs: {
      'Capacity': '2TB',
      'Interface': 'M.2 NVMe PCIe 4.0 x4',
      'Read Speed': 'Up to 7450 MB/s',
      'Write Speed': 'Up to 6900 MB/s',
      'Form Factor': 'M.2 2280',
      'RGB Support': 'No'
    },
    pros: ['Saturates PCIe Gen 4 bandwidth', 'Vastly reliable controller', 'Low temperatures with heatsink'],
    cons: ['Expensive price per GB compared to value drives']
  },
  {
    id: 'ssd-t700-gen5',
    name: 'Crucial T700 Gen5 NVMe 2TB',
    brand: 'Crucial',
    category: 'Storage',
    price: 279.99,
    rating: 4.7,
    reviews: 55,
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1597852074816-d933c4d2b98a?q=80&w=200&auto=format&fit=crop',
    badge: 'CRUCIAL',
    specs: {
      'Capacity': '2TB',
      'Interface': 'M.2 NVMe PCIe 5.0 x4',
      'Read Speed': 'Up to 12400 MB/s',
      'Write Speed': 'Up to 11800 MB/s',
      'Form Factor': 'M.2 2280',
      'RGB Support': 'No'
    },
    pros: ['Blazing fast read/write speeds', 'Double the speed of Gen4', 'High reliability'],
    cons: ['Needs a giant heatsink', 'Will throttle speed if running too hot']
  },

  // Power Supplies
  {
    id: 'psu-rm1000x',
    name: 'Corsair RM1000x Shift ATX 3.0',
    brand: 'Corsair',
    category: 'Power Supplies',
    price: 209.99,
    rating: 4.8,
    reviews: 140,
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?q=80&w=200&auto=format&fit=crop',
    badge: 'CORSAIR',
    specs: {
      'Wattage': '1000W',
      'Efficiency Rating': '80+ Gold',
      'Modular': 'Full Modular (Side Connectors)',
      'ATX Version': 'ATX 3.0 (PCIe 5.0 ready)',
      '12VHPWR Cable': 'Yes, included',
      'RGB Support': 'No'
    },
    pros: ['Side interface for clean cable management', '100% Japanese 105°C capacitors', 'Zero RPM fan mode'],
    cons: ['Side connectors require specific wide cases', 'Heavy weight']
  },
  {
    id: 'psu-focus-850',
    name: 'Seasonic Focus GX-850 Gold',
    brand: 'Seasonic',
    category: 'Power Supplies',
    price: 139.99,
    rating: 4.9,
    reviews: 215,
    stock: 19,
    imageUrl: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?q=80&w=200&auto=format&fit=crop',
    badge: 'SEASONIC',
    specs: {
      'Wattage': '850W',
      'Efficiency Rating': '80+ Gold',
      'Modular': 'Full Modular',
      'ATX Version': 'ATX 3.0 (PCIe 5.0 ready)',
      '12VHPWR Cable': 'Yes, included',
      'RGB Support': 'No'
    },
    pros: ['Compact 140mm footprint', '10-year warranty', 'Extremely stable voltage output'],
    cons: ['Cables are relatively stiff']
  },

  // Cases
  {
    id: 'case-nv7',
    name: 'Phanteks NV7 Premium Glass',
    brand: 'Phanteks',
    category: 'Cases',
    price: 219.99,
    rating: 4.8,
    reviews: 53,
    stock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=200&auto=format&fit=crop',
    badge: 'PHANTEKS',
    isFeatured: true,
    specs: {
      'Form Factor': 'Full Tower',
      'Motherboard Support': 'ATX, E-ATX, Micro-ATX, Mini-ITX',
      'Dimensions': '532 x 253 x 586 mm',
      'Max GPU Length': '450 mm',
      'Max CPU Cooler': '180 mm',
      'RGB Support': 'Yes (Integrated ARGB line)'
    },
    pros: ['Fish-tank visual aesthetic (dual glass)', 'Dedicated cable organizing rear door', 'Massive space for radiators'],
    cons: ['Huge desk footprint', 'Very heavy empty weight (19kg)', 'Does not include default fans']
  },
  {
    id: 'case-o11d-evo',
    name: 'Lian Li O11 Dynamic EVO',
    brand: 'Lian Li',
    category: 'Cases',
    price: 169.99,
    rating: 4.9,
    reviews: 412,
    stock: 16,
    imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=200&auto=format&fit=crop',
    badge: 'LIAN LI',
    specs: {
      'Form Factor': 'Mid Tower',
      'Motherboard Support': 'ATX, E-ATX, Micro-ATX, Mini-ITX',
      'Dimensions': '465 x 285 x 459 mm',
      'Max GPU Length': '426 mm',
      'Max CPU Cooler': '167 mm',
      'RGB Support': 'Yes'
    },
    pros: ['Highly modular (reversible layout)', 'Excellent multi-radiator capacity', 'Iconic dual chamber design'],
    cons: ['Fans not included', 'Extremely common in builder communities']
  },

  // Cooling
  {
    id: 'cooler-h150i',
    name: 'Corsair iCUE H150i Elite LCD XT',
    brand: 'Corsair',
    category: 'Cooling',
    price: 259.99,
    rating: 4.7,
    reviews: 98,
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?q=80&w=200&auto=format&fit=crop',
    badge: 'CORSAIR',
    isFeatured: true,
    specs: {
      'Cooler Type': 'AIO Liquid Cooler',
      'Radiator Size': '360mm',
      'Fan Quantity': '3x 120mm PWM Fans',
      'Pump Screen': '2.1" IPS LCD display',
      'Compatible Sockets': 'Intel LGA 1700/1200/115x, AMD AM5/AM4',
      'TDP Dissipation': '300W+',
      'RGB Support': 'Yes'
    },
    pros: ['Gorgeous LCD screen on block', 'Premium AF RGB Elite PWM fans', 'Powerful cooling loop'],
    cons: ['Requires complex Corsair Commander wiring', 'Expensive AIO premium price']
  },
  {
    id: 'cooler-nhd15',
    name: 'Noctua NH-D15 chromax.black',
    brand: 'Noctua',
    category: 'Cooling',
    price: 119.95,
    rating: 4.9,
    reviews: 650,
    stock: 24,
    imageUrl: 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?q=80&w=200&auto=format&fit=crop',
    badge: 'NOCTUA',
    specs: {
      'Cooler Type': 'Dual-Tower Air Cooler',
      'Radiator Size': 'N/A (Heatsink Fins)',
      'Fan Quantity': '2x 140mm SSO2 PWM Fans',
      'Pump Screen': 'No',
      'Compatible Sockets': 'Intel LGA 1700/1200/115x, AMD AM5/AM4',
      'TDP Dissipation': '220W',
      'RGB Support': 'No'
    },
    pros: ['Legendary air cooling performance', 'Dead silent operations', 'No leak risks compared to AIOs'],
    cons: ['Very large (clashes with tall RAM)', 'No flashy RGB or screen options']
  }
];

export const GAMES = [
  { id: 'cyberpunk', name: 'Cyberpunk 2077', resolutionFPS: { '1080p': 165, '1440p': 115, '4K': 62 } },
  { id: 'cs2', name: 'Counter-Strike 2', resolutionFPS: { '1080p': 680, '1440p': 480, '4K': 290 } },
  { id: 'valorant', name: 'Valorant', resolutionFPS: { '1080p': 820, '1440p': 650, '4K': 410 } },
  { id: 'gta-v', name: 'GTA V', resolutionFPS: { '1080p': 240, '1440p': 185, '4K': 110 } },
  { id: 'apex', name: 'Apex Legends', resolutionFPS: { '1080p': 300, '1440p': 240, '4K': 144 } }
];

export const COMMUNITY_BUILDS = [
  {
    id: 'build-obsidian',
    name: 'Project Obsidian',
    creator: 'HexEnthusiast',
    budget: 3840.00,
    likes: 1248,
    comments: 114,
    imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=600&auto=format&fit=crop',
    specs: {
      cpu: 'Intel Core i9-14900K',
      gpu: 'ROG Strix GeForce RTX 4090 OC',
      ram: 'Dominator Titanium 64GB DDR5',
      motherboard: 'MPG Z790 Carbon WiFi',
      storage: 'Samsung 990 Pro M.2 NVMe 2TB',
      psu: 'Corsair RM1000x Shift ATX 3.0',
      case: 'Phanteks NV7 Premium Glass',
      cooler: 'Corsair iCUE H150i Elite LCD XT'
    }
  },
  {
    id: 'build-stealth-amd',
    name: 'Stealth AMD Beast',
    creator: 'RyzenRider',
    budget: 2320.00,
    likes: 852,
    comments: 42,
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
    specs: {
      cpu: 'AMD Ryzen 7 7800X3D',
      gpu: 'Radeon RX 7900 XTX Gaming',
      ram: 'Trident Z5 RGB 32GB DDR5',
      motherboard: 'ROG Strix X670E-E Gaming WiFi',
      storage: 'Samsung 990 Pro M.2 NVMe 2TB',
      psu: 'Seasonic Focus GX-850 Gold',
      case: 'Lian Li O11 Dynamic EVO',
      cooler: 'Noctua NH-D15 chromax.black'
    }
  }
];
