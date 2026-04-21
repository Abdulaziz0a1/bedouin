-- ─────────────────────────────────────────────────────────────────────────────
-- 10_seed_demo_data.sql
-- Seed data for graduation demo.
-- Inserts 6 real listings (matching mock slug IDs) + their listing_details rows
-- so every actor flow works without mock fallbacks.
--
-- Depends on: 00_helpers.sql → 09_cohost_applications.sql (all prior files run)
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING / DO UPDATE).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Step 1: Temporarily allow service-role / anon INSERT for seeding ─────────
-- (Run this in the Supabase SQL Editor as the service-role user, which bypasses RLS.)

-- ── Step 2: Insert listings ───────────────────────────────────────────────────

INSERT INTO public.listings (id, slug, title, category, region, location, description,
  image, score, review_count, price, original_price, price_unit,
  max_guests, bedrooms, beds, baths, min_nights, check_in_time, check_out_time,
  badge, badge_color, tags, host_id, submission_id)
VALUES
  (
    'a1b2c3d4-0001-0001-0001-000000000001',
    'alula-stargazing-dome',
    'AlUla Stargazing Dome',
    'doms', 'AlUla', 'AlUla, Madain Saleh Area',
    'Wake up to the stars above and ancient sandstone formations around you. Nestled in a private valley minutes from Madain Saleh, this geodesic dome offers an unrivalled combination of astronomy and heritage.',
    'https://picsum.photos/seed/dome-night-sky/600/440',
    5.0, 287, 480, NULL, 'per night',
    2, 1, 1, 1, 2, '4:00 PM', '11:00 AM',
    'Luxury', '#8b5e38',
    ARRAY['Stargazing', 'Romantic', 'Desert'],
    NULL, NULL
  ),
  (
    'a1b2c3d4-0002-0002-0002-000000000002',
    'strawberry-hill',
    'Strawberry Hill Farm',
    'farms', 'Taif', 'Al Taif, Hada Al Sham',
    'Experience the lush highlands of Taif with a stay at this working strawberry farm. Spend your mornings picking fresh fruit straight from the field, and enjoy cool mountain air all day long.',
    'https://picsum.photos/seed/strawberry-farm/600/440',
    5.0, 412, 75, NULL, 'per person',
    8, 2, 4, 2, 1, '3:00 PM', '11:00 AM',
    'Top Rated', '#049153',
    ARRAY['Fruit picking', 'Family friendly'],
    NULL, NULL
  ),
  (
    'a1b2c3d4-0003-0003-0003-000000000003',
    'asir-highland-cabin',
    'Asir Highland Cabin',
    'cabins', 'Abha', 'Abha, Al Soudah',
    'Perched at 3,000 metres above sea level with commanding views over the Asir mountains, this handcrafted wooden cabin offers cozy mountain living at its best. Wrap up by the fireplace after a day of hiking.',
    'https://picsum.photos/seed/mountain-cabin-1/600/440',
    4.9, 198, 220, 290, 'per night',
    4, 2, 3, 2, 2, '3:00 PM', '12:00 PM',
    '24% off', '#e03e2d',
    ARRAY['Mountain views', 'Cool weather', 'Hiking'],
    NULL, NULL
  ),
  (
    'a1b2c3d4-0004-0004-0004-000000000004',
    'red-sand-glamping',
    'Red Sand Glamping',
    'glamping', 'Riyadh', 'Riyadh, Al Kharj Road',
    'Lose yourself in the rolling red dunes 45 minutes south of Riyadh. These luxury safari tents come fully furnished with plush bedding, private outdoor showers, and a dedicated host for bonfire evenings and camel rides.',
    'https://picsum.photos/seed/red-desert-tent/600/440',
    4.8, 154, 320, NULL, 'per night',
    3, 1, 2, 1, 1, '4:00 PM', '11:00 AM',
    'Popular', '#049153',
    ARRAY['Desert', 'Camel riding', 'Bonfire'],
    NULL, NULL
  ),
  (
    'a1b2c3d4-0005-0005-0005-000000000005',
    'tabuk-cliff-house',
    'Tabuk Cliff House',
    'house', 'Tabuk', 'Tabuk, Wadi Tayeb Al Ism',
    'Clinging to a sheer canyon wall above the legendary Wadi Tayeb Al Ism, this dramatically positioned house offers uninterrupted views of golden rock faces and emerald pools far below.',
    'https://picsum.photos/seed/cliff-house-tabuk/600/440',
    5.0, 63, 550, NULL, 'per night',
    6, 3, 4, 3, 2, '4:00 PM', '11:00 AM',
    'Rare find', '#8b5e38',
    ARRAY['Cliffside', 'Scenic', 'Secluded'],
    NULL, NULL
  ),
  (
    'a1b2c3d4-0006-0006-0006-000000000006',
    'jeddah-heritage-riad',
    'Al-Balad Heritage Riad',
    'house', 'Jeddah', 'Jeddah, Historic District',
    'Tucked inside a 19th-century coral stone merchant house in UNESCO-listed Al-Balad, this restored riad blends traditional Hejazi mashrabiya architecture with thoughtful modern comforts. Rooftop sunsets over the Red Sea included.',
    'https://picsum.photos/seed/jeddah-riad/600/440',
    4.9, 134, 680, NULL, 'per night',
    5, 3, 4, 3, 2, '3:00 PM', '12:00 PM',
    'UNESCO', '#0046cc',
    ARRAY['Heritage', 'Coral house', 'Rooftop'],
    NULL, NULL
  )
ON CONFLICT (slug) DO UPDATE SET
  title          = EXCLUDED.title,
  image          = EXCLUDED.image,
  score          = EXCLUDED.score,
  review_count   = EXCLUDED.review_count,
  price          = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  badge          = EXCLUDED.badge,
  badge_color    = EXCLUDED.badge_color,
  tags           = EXCLUDED.tags,
  updated_at     = now();

-- ── Step 3: Insert listing_details ───────────────────────────────────────────

INSERT INTO public.listing_details (listing_id, images, description, highlights, house_rules,
  max_guests, bedrooms, beds, baths, min_nights, check_in_time, check_out_time,
  host, amenities, reviews, rating_breakdown)
VALUES
  (
    'a1b2c3d4-0001-0001-0001-000000000001',
    ARRAY[
      'https://picsum.photos/seed/dome-night-sky/1200/800',
      'https://picsum.photos/seed/dome-interior/600/440',
      'https://picsum.photos/seed/dome-bedroom/600/440',
      'https://picsum.photos/seed/alula-landscape/600/440',
      'https://picsum.photos/seed/alula-rocks/600/440',
      'https://picsum.photos/seed/dome-terrace/600/440'
    ],
    'Wake up to the stars above and ancient sandstone formations around you. Nestled in a private valley minutes from Madain Saleh, this geodesic dome offers an unrivalled combination of astronomy and heritage. The interior is fitted with floor-to-ceiling panoramic glass, a king-size bed, private plunge pool, and a dedicated telescope deck.',
    ARRAY[
      'Private plunge pool with rock views',
      'Nightly astronomer-led stargazing session',
      '30 min walk to Hegra World Heritage Site',
      'Chef-prepared breakfast delivered to your dome'
    ],
    ARRAY[
      'No parties or events',
      'No smoking inside the dome',
      'Quiet hours after 10:00 PM',
      'Telescope use by reservation only'
    ],
    2, 1, 1, 1, 2, '4:00 PM', '11:00 AM',
    '{"name":"Ahmed Al-Rashidi","avatar":"https://i.pravatar.cc/80?u=host-alula","tagline":"Desert hospitality expert","bio":"Ahmed has hosted guests at AlUla for over 8 years, combining deep knowledge of Nabataean history with warm Hejazi hospitality.","since":"2017","responseRate":98,"responseTime":"within an hour","languages":["Arabic","English"],"reviewCount":287,"superhost":true}'::jsonb,
    '[{"icon":"wifi","label":"High-speed WiFi"},{"icon":"pool","label":"Private plunge pool"},{"icon":"breakfast","label":"Breakfast included"},{"icon":"parking","label":"Private parking"},{"icon":"ac","label":"Air conditioning"},{"icon":"telescope","label":"Private telescope"}]'::jsonb,
    '[{"id":"r1","author":"Sarah M.","avatar":"https://i.pravatar.cc/40?u=sarah-m","rating":10,"date":"March 2025","body":"Absolutely incredible. Waking up to see the Milky Way through the dome roof was something I will never forget. Ahmed is an outstanding host."},{"id":"r2","author":"Tariq K.","avatar":"https://i.pravatar.cc/40?u=tariq-k","rating":9,"date":"February 2025","body":"The plunge pool at sunset was magical. Very well organised and the stargazing session with the astronomer was a highlight."},{"id":"r3","author":"Emma L.","avatar":"https://i.pravatar.cc/40?u=emma-l","rating":10,"date":"January 2025","body":"Best travel experience of my life. AlUla itself is stunning, and this dome elevates it to a whole new level."}]'::jsonb,
    '{"cleanliness":9.8,"accuracy":9.7,"location":10.0,"value":9.2,"overall":9.7}'::jsonb
  ),
  (
    'a1b2c3d4-0002-0002-0002-000000000002',
    ARRAY[
      'https://picsum.photos/seed/strawberry-farm/1200/800',
      'https://picsum.photos/seed/farm-rows/600/440',
      'https://picsum.photos/seed/farm-harvest/600/440',
      'https://picsum.photos/seed/farm-cottage/600/440',
      'https://picsum.photos/seed/taif-mountains/600/440'
    ],
    'Experience the lush highlands of Taif with a stay at this working strawberry farm. Spend your mornings picking fresh fruit straight from the field, enjoy cool mountain air all day long, and end evenings with home-cooked meals prepared by the host family.',
    ARRAY[
      'Morning strawberry picking with the farm family',
      'Cool mountain climate at 1,800 m elevation',
      'Home-cooked Saudi breakfast every morning',
      'Short drive to Taif Rose Valley and cable car'
    ],
    ARRAY[
      'Respect working farm hours (6 AM–12 PM picking)',
      'No loud music after 9:00 PM',
      'Children welcome, supervised near machinery',
      'Pets allowed in outdoor areas only'
    ],
    8, 2, 4, 2, 1, '3:00 PM', '11:00 AM',
    '{"name":"Fatimah Al-Ghamdi","avatar":"https://i.pravatar.cc/80?u=host-taif","tagline":"Third-generation Taif farmer","bio":"Fatimah''s family has farmed this land for three generations. She loves sharing the rhythms of highland farm life with guests from around the world.","since":"2019","responseRate":100,"responseTime":"within a few hours","languages":["Arabic"],"reviewCount":412,"superhost":true}'::jsonb,
    '[{"icon":"breakfast","label":"Farm breakfast included"},{"icon":"wifi","label":"WiFi"},{"icon":"parking","label":"Free parking"},{"icon":"kitchen","label":"Shared kitchen"},{"icon":"fire","label":"Outdoor firepit"},{"icon":"bbq","label":"BBQ area"}]'::jsonb,
    '[{"id":"r1","author":"Reem A.","avatar":"https://i.pravatar.cc/40?u=reem-a","rating":10,"date":"April 2025","body":"The most wholesome trip I have taken. Picking strawberries in the morning with the family and eating breakfast in the cool mountain air was pure joy."},{"id":"r2","author":"Khalid N.","avatar":"https://i.pravatar.cc/40?u=khalid-n","rating":10,"date":"March 2025","body":"Amazing family. The farm is real, the experience is authentic, and the strawberries are the best I have ever tasted. Will 100% return."}]'::jsonb,
    '{"cleanliness":9.5,"accuracy":9.8,"location":9.6,"value":9.9,"overall":9.8}'::jsonb
  ),
  (
    'a1b2c3d4-0003-0003-0003-000000000003',
    ARRAY[
      'https://picsum.photos/seed/mountain-cabin-1/1200/800',
      'https://picsum.photos/seed/cabin-interior/600/440',
      'https://picsum.photos/seed/cabin-view/600/440',
      'https://picsum.photos/seed/asir-forest/600/440',
      'https://picsum.photos/seed/abha-mist/600/440'
    ],
    'Perched at 3,000 metres above sea level with commanding views over the Asir mountains, this handcrafted wooden cabin offers cozy mountain living at its best. Wrap up by the fireplace after a day of hiking.',
    ARRAY[
      'Panoramic terrace with Asir mountain views',
      'Working wood fireplace for cool evenings',
      'Direct access to Al Soudah hiking trails',
      '15 mins from Abha cable car'
    ],
    ARRAY[
      'No smoking indoors',
      'No parties or events',
      'Keep fireplace screen closed at all times',
      'Pets allowed with prior notice'
    ],
    4, 2, 3, 2, 2, '3:00 PM', '12:00 PM',
    '{"name":"Ibrahim Al-Shahrani","avatar":"https://i.pravatar.cc/80?u=host-abha","tagline":"Asir mountain guide & host","bio":"Ibrahim grew up in the Asir highlands and has spent 6 years hosting guests who want to experience authentic mountain life far from the city.","since":"2020","responseRate":96,"responseTime":"within a few hours","languages":["Arabic","English"],"reviewCount":198,"superhost":false}'::jsonb,
    '[{"icon":"fire","label":"Wood fireplace"},{"icon":"wifi","label":"WiFi"},{"icon":"parking","label":"Free parking"},{"icon":"hiking","label":"Hiking access"},{"icon":"kitchen","label":"Full kitchen"},{"icon":"view","label":"Mountain terrace"}]'::jsonb,
    '[{"id":"r1","author":"Noura S.","avatar":"https://i.pravatar.cc/40?u=noura-s","rating":10,"date":"December 2024","body":"Everything about this cabin was perfect. Waking up in the clouds, drinking coffee on the terrace while the fog rolled in through the valley — unforgettable."},{"id":"r2","author":"James B.","avatar":"https://i.pravatar.cc/40?u=james-b","rating":9,"date":"November 2024","body":"Great value for a well-appointed mountain retreat. Ibrahim gave excellent hiking recommendations and the fireplace made the evenings very cosy."}]'::jsonb,
    '{"cleanliness":9.3,"accuracy":9.5,"location":9.8,"value":9.7,"overall":9.5}'::jsonb
  ),
  (
    'a1b2c3d4-0004-0004-0004-000000000004',
    ARRAY[
      'https://picsum.photos/seed/red-desert-tent/1200/800',
      'https://picsum.photos/seed/desert-tent-interior/600/440',
      'https://picsum.photos/seed/desert-bonfire/600/440',
      'https://picsum.photos/seed/desert-sunrise/600/440',
      'https://picsum.photos/seed/camel-desert/600/440'
    ],
    'Lose yourself in the rolling red dunes 45 minutes south of Riyadh. These luxury safari tents come fully furnished with plush bedding, private outdoor showers, and a dedicated host for bonfire evenings and camel rides.',
    ARRAY[
      'Guided camel ride at sunrise or sunset',
      'Private bonfire with traditional Saudi coffee',
      'Luxury bedding and climate-controlled tent',
      'Star trail photography session (on request)'
    ],
    ARRAY[
      'No alcohol on the premises',
      'No loud music after 11:00 PM',
      'Sand dune vehicles not allowed near camp',
      'Minimum age 3 for camel rides'
    ],
    3, 1, 2, 1, 1, '4:00 PM', '11:00 AM',
    '{"name":"Sultan Al-Dossari","avatar":"https://i.pravatar.cc/80?u=host-riyadh","tagline":"Desert experience curator","bio":"Sultan runs a family glamping camp that has hosted guests from over 40 countries. He prides himself on an authentic and personal desert experience.","since":"2021","responseRate":99,"responseTime":"within an hour","languages":["Arabic","English","French"],"reviewCount":154,"superhost":true}'::jsonb,
    '[{"icon":"ac","label":"Climate-controlled tent"},{"icon":"shower","label":"Private outdoor shower"},{"icon":"breakfast","label":"Breakfast included"},{"icon":"fire","label":"Private bonfire"},{"icon":"wifi","label":"WiFi in lounge"},{"icon":"camel","label":"Camel rides"}]'::jsonb,
    '[{"id":"r1","author":"Lina H.","avatar":"https://i.pravatar.cc/40?u=lina-h","rating":10,"date":"February 2025","body":"Sultan is an exceptional host. The camel ride at sunrise was magical, and the tent was far more luxurious than I expected. Highly recommend!"},{"id":"r2","author":"Ali M.","avatar":"https://i.pravatar.cc/40?u=ali-m","rating":9,"date":"January 2025","body":"My family loved every moment. The bonfire and traditional coffee ceremony was a real highlight. Will definitely return next season."}]'::jsonb,
    '{"cleanliness":9.1,"accuracy":9.4,"location":9.2,"value":9.5,"overall":9.4}'::jsonb
  ),
  (
    'a1b2c3d4-0005-0005-0005-000000000005',
    ARRAY[
      'https://picsum.photos/seed/cliff-house-tabuk/1200/800',
      'https://picsum.photos/seed/cliff-interior/600/440',
      'https://picsum.photos/seed/wadi-pool/600/440',
      'https://picsum.photos/seed/canyon-view/600/440',
      'https://picsum.photos/seed/tabuk-sunset/600/440'
    ],
    'Clinging to a sheer canyon wall above the legendary Wadi Tayeb Al Ism, this dramatically positioned house offers uninterrupted views of golden rock faces and emerald pools far below. One of the most unique addresses in Saudi Arabia.',
    ARRAY[
      'Panoramic canyon terrace with infinity views',
      '20-minute hike down to the emerald wadi pools',
      'Completely secluded — nearest neighbour is 3 km away',
      'Pre-stocked kitchen with local Tabuk produce'
    ],
    ARRAY[
      'No parties or events',
      'Respect canyon eco-system — no littering',
      'No vehicles beyond the marked parking area',
      'Hiking to the wadi is at guests'' own risk'
    ],
    6, 3, 4, 3, 2, '4:00 PM', '11:00 AM',
    '{"name":"Majed Al-Harbi","avatar":"https://i.pravatar.cc/80?u=host-tabuk","tagline":"Wadi explorer & host","bio":"Majed discovered this hidden canyon 12 years ago and built this house by hand over 3 years. He personally welcomes every guest and guides wadi hikes.","since":"2022","responseRate":95,"responseTime":"within a day","languages":["Arabic"],"reviewCount":63,"superhost":false}'::jsonb,
    '[{"icon":"view","label":"Canyon terrace"},{"icon":"kitchen","label":"Stocked kitchen"},{"icon":"parking","label":"Free parking"},{"icon":"hiking","label":"Canyon hiking"},{"icon":"wifi","label":"Starlink WiFi"},{"icon":"bbq","label":"Outdoor BBQ"}]'::jsonb,
    '[{"id":"r1","author":"Dana F.","avatar":"https://i.pravatar.cc/40?u=dana-f","rating":10,"date":"March 2025","body":"I have travelled to 60+ countries and this is genuinely one of the most dramatic settings I have ever slept in. Majed is warm and incredibly knowledgeable about the wadi."},{"id":"r2","author":"Mark T.","avatar":"https://i.pravatar.cc/40?u=mark-t","rating":10,"date":"January 2025","body":"Rare find is an understatement. The hike to the emerald pool was breathtaking. The house itself is beautifully designed for its setting."}]'::jsonb,
    '{"cleanliness":9.6,"accuracy":9.8,"location":10.0,"value":9.0,"overall":9.7}'::jsonb
  ),
  (
    'a1b2c3d4-0006-0006-0006-000000000006',
    ARRAY[
      'https://picsum.photos/seed/jeddah-riad/1200/800',
      'https://picsum.photos/seed/riad-courtyard/600/440',
      'https://picsum.photos/seed/mashrabiya/600/440',
      'https://picsum.photos/seed/rooftop-sea/600/440',
      'https://picsum.photos/seed/balad-alley/600/440'
    ],
    'Tucked inside a 19th-century coral stone merchant house in UNESCO-listed Al-Balad, this restored riad blends traditional Hejazi mashrabiya architecture with thoughtful modern comforts. Rooftop sunsets over the Red Sea included.',
    ARRAY[
      'Rooftop terrace with Red Sea sunset views',
      'Steps from UNESCO-listed Al-Balad souk',
      'Authentic mashrabiya woodwork and coral stone walls',
      'Private guide to Al-Balad historic sites (on request)'
    ],
    ARRAY[
      'No smoking indoors',
      'Respectful dress requested in the historic district',
      'No loud noise after 10:00 PM (residential area)',
      'Children welcome, rooftop access with adult supervision'
    ],
    5, 3, 4, 3, 2, '3:00 PM', '12:00 PM',
    '{"name":"Huda Al-Zahrani","avatar":"https://i.pravatar.cc/80?u=host-jeddah","tagline":"Al-Balad heritage custodian","bio":"Huda spent 5 years restoring this house and is passionate about preserving Jeddah''s Hejazi architectural heritage. She runs historical walking tours of Al-Balad.","since":"2020","responseRate":97,"responseTime":"within a few hours","languages":["Arabic","English"],"reviewCount":134,"superhost":true}'::jsonb,
    '[{"icon":"wifi","label":"High-speed WiFi"},{"icon":"ac","label":"Air conditioning"},{"icon":"breakfast","label":"Breakfast included"},{"icon":"rooftop","label":"Rooftop terrace"},{"icon":"heritage","label":"Heritage building"},{"icon":"parking","label":"Valet parking nearby"}]'::jsonb,
    '[{"id":"r1","author":"Mona A.","avatar":"https://i.pravatar.cc/40?u=mona-a","rating":10,"date":"April 2025","body":"Huda is a phenomenal host and the house is a work of art. The rooftop at sunset was the highlight of our Jeddah trip. Already planning a return visit."},{"id":"r2","author":"Carlos R.","avatar":"https://i.pravatar.cc/40?u=carlos-r","rating":9,"date":"March 2025","body":"Walking out the front door straight into the Al-Balad souk was incredible. The mashrabiya rooms are stunning. A truly unique place to stay."},{"id":"r3","author":"Yasmin K.","avatar":"https://i.pravatar.cc/40?u=yasmin-k","rating":10,"date":"February 2025","body":"Perfectly restored historic house with every modern comfort. Huda''s hospitality and knowledge of the area made the whole experience special."}]'::jsonb,
    '{"cleanliness":9.7,"accuracy":9.5,"location":9.9,"value":9.1,"overall":9.6}'::jsonb
  )
ON CONFLICT (listing_id) DO UPDATE SET
  images           = EXCLUDED.images,
  description      = EXCLUDED.description,
  host             = EXCLUDED.host,
  amenities        = EXCLUDED.amenities,
  reviews          = EXCLUDED.reviews,
  rating_breakdown = EXCLUDED.rating_breakdown,
  updated_at       = now();
