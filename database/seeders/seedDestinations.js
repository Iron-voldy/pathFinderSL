/**
 * Destinations + Lifestyle Activities Seed Script
 * Seeds 10 popular Sri Lankan destinations and 60+ lifestyle activities
 *
 * Usage (from project root):
 *   node database/seeders/seedDestinations.js
 *
 * Or from the "database/seeders" folder:
 *   cd "C:\Users\Lenovo\Desktop\UNI projects\pathFinderSL\travellanka-ai"
 *   node database/seeders/seedDestinations.js
 */

const path = require('path');

const serverDir = path.join(__dirname, '../../server');
module.paths.unshift(path.join(serverDir, 'node_modules'));

require('dotenv').config({ path: path.join(serverDir, '.env') });
const sequelize = require(path.join(serverDir, 'config/database'));
const Destination = require(path.join(serverDir, 'destination-management/models/Destination'));
const Lifestyle = require(path.join(serverDir, 'destination-management/models/Lifestyle'));

/* ── Destination master data ─────────────────────────────── */
const destinations = [
  {
    name: 'Sigiriya Rock Fortress',
    tagline: 'The Eighth Wonder of the Ancient World',
    description:
      'Rising 180 metres above the surrounding jungle, Sigiriya is a stunning 5th-century rock fortress built by King Kashyapa. The site features ancient frescoes, mirror-wall poetry, water gardens and lion-paw gateways at the summit — all recognised as a UNESCO World Heritage Site.',
    image_url: '/sigiriya.jpg',
    region: 'Central Province',
    is_active: true,
    city_key: 'Sigiriya',
  },
  {
    name: 'Kandy — Sacred City',
    tagline: 'Home of the Sacred Tooth Relic',
    description:
      'Nestled in the hill country, Kandy is Sri Lanka\'s cultural capital and home to the revered Temple of the Tooth Relic (Sri Dalada Maligawa). Surrounded by misty hills, the Kandy Lake, and royal gardens, this UNESCO-listed city is celebrated for traditional Kandyan dance and the Esala Perahera festival.',
    image_url: '/kandy.jpg',
    region: 'Central Province',
    is_active: true,
    city_key: 'Kandy',
  },
  {
    name: 'Galle Fort',
    tagline: 'A Living Dutch Colonial City by the Sea',
    description:
      'Built by Portuguese colonisers in the 16th century and fortified by the Dutch, Galle Fort is a UNESCO World Heritage Site that houses cobblestone streets, colonial mansions, boutique hotels, galleries and cafes — all enclosed within 90-acre ramparts overlooking the Indian Ocean.',
    image_url: '/galle-fort.jpg',
    region: 'Southern Province',
    is_active: true,
    city_key: 'Galle',
  },
  {
    name: 'Ella — Misty Hill Country',
    tagline: 'Tea Trails, Waterfalls and Mountain Hikes',
    description:
      'A small village perched at 1,041 m in the Hill Country, Ella is famed for its dramatic Ella Gap views, Nine Arch Bridge, Little Adam\'s Peak and Ravana Falls. The area is blanketed in tea plantations and offers some of Sri Lanka\'s best trekking and a laid-back café culture.',
    image_url: '/ella.jpg',
    region: 'Uva Province',
    is_active: true,
    city_key: 'Ella',
  },
  {
    name: 'Yala National Park',
    tagline: 'Sri Lanka\'s Premier Wildlife Safari',
    description:
      'Yala is Sri Lanka\'s most visited national park, covering 979 km² of diverse habitat from dense jungle to open plains, lagoons and coastal scrub. It boasts the highest density of leopards in the world alongside elephants, sloth bears, crocodiles, flamingos and hundreds of bird species.',
    image_url: '/yala.jpg',
    region: 'Southern Province',
    is_active: true,
    city_key: 'Yala',
  },
  {
    name: 'Mirissa Beach',
    tagline: 'Whale Watching Capital of Sri Lanka',
    description:
      'Mirissa is a crescent-shaped beach famed for the world\'s best blue whale and sperm whale sightings, coconut tree-lined shores, colourful fishing boats at the harbour, relaxed beach bars and some of the freshest seafood on the island. Best visited between November and April.',
    image_url: '/mirissa.jpg',
    region: 'Southern Province',
    is_active: true,
    city_key: 'Mirissa',
  },
  {
    name: 'Nuwara Eliya — Little England',
    tagline: 'The Heart of Ceylon Tea Country',
    description:
      'Sitting at 1,868 m above sea level, Nuwara Eliya is known for its cool climate, manicured tea estates, English colonial bungalows and horse-racing. Gregory Lake, Victoria Park, the post office and race course lend it a distinctly British character, earning it the nickname "Little England".',
    image_url: '/destination-hero.jpg',
    region: 'Central Province',
    is_active: true,
    city_key: 'Nuwaraeliya',
  },
  {
    name: 'Arugam Bay',
    tagline: 'Sri Lanka\'s Surf Paradise',
    description:
      'On the east coast, Arugam Bay is a world-class right-hand point break drawing surfers from around the globe between May and October. Beyond surfing, the bay offers lagoon safaris, elephant sightings, nearby Pottuvil Point, Kudumbigala Monastery and a laid-back traveller vibe.',
    image_url: '/arugambay.jpg',
    region: 'Eastern Province',
    is_active: true,
    city_key: 'ArugamBay',
  },
  {
    name: 'Anuradhapura Sacred City',
    tagline: 'Sri Lanka\'s Ancient Capital',
    description:
      'Anuradhapura was the first capital of Sri Lanka, flourishing for over 1,300 years. The UNESCO-listed sacred city is home to the Sri Maha Bodhi (oldest documented tree in the world), massive dagobas (stupas), royal pleasure gardens and moonstones — all spread across 40 km² of archaeological ruins.',
    image_url: '/anuradhapura.jpg',
    region: 'North Central Province',
    is_active: true,
    city_key: 'Anuradhapura',
  },
  {
    name: 'Trincomalee',
    tagline: 'Natural Harbour, Temples and Turquoise Waters',
    description:
      'Trincomalee on the northeast coast is home to one of the world\'s finest natural deep-water harbours, the ancient Koneswaram Hindu temple perched on Swami Rock, and stunning beaches like Nilaveli and Uppuveli. Swimming with sea turtles and diving on coral-encrusted British WWII wrecks are highlights.',
    image_url: '/trincomalee.jpg',
    region: 'Eastern Province',
    is_active: true,
    city_key: 'Trincomalee',
  },
];

/* ── Lifestyle activities (keyed by destination index 0–9) ── */
const lifestylesByDest = {
  0: [ // Sigiriya
    {
      title: 'Climb Sigiriya Rock at Sunrise',
      description:
        'Begin the 1,200-step ascent before 7 am to beat the heat and crowds. Pass the famous frescoes, walk the Mirror Wall with ancient poetry, and reach the summit platform for sweeping views across the Cultural Triangle.',
      category: 'hiking',
      latitude: '7.9570',
      longitude: '80.7603',
      image_url: 'https://images.unsplash.com/photo-1608501078713-8e445a709b39?w=800&q=80',
    },
    {
      title: 'Pidurangala Rock Hike',
      description:
        'The quieter alternative to Sigiriya — hike 45 minutes to the top of Pidurangala Rock for a stunning side-on view of Sigiriya fortress. The summit has a reclining Buddha and panoramic jungle views.',
      category: 'hiking',
      latitude: '7.9622',
      longitude: '80.7551',
      image_url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80',
    },
    {
      title: 'Hot Air Balloon Ride over the Cultural Triangle',
      description:
        'Float above the Sigiriya plains at dawn in a hot air balloon for an unmatched bird\'s-eye view of the rock fortress, surrounding jungle and ancient tank reservoirs. One of Sri Lanka\'s most memorable experiences.',
      category: 'adventure',
      latitude: '7.9553',
      longitude: '80.7618',
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    },
    {
      title: 'Village Cycle Safari',
      description:
        'Rent a bicycle and explore the villages around Sigiriya — rice fields, small temples, local markets and Minneriya reservoir. A peaceful, immersive way to experience rural Sri Lankan life.',
      category: 'cultural',
      latitude: '7.9490',
      longitude: '80.7680',
      image_url: 'https://images.unsplash.com/photo-1471623432079-b009d30b6729?w=800&q=80',
    },
    {
      title: 'Minneriya Elephant Gathering Safari',
      description:
        'Drive 30 minutes to Minneriya National Park for "The Gathering" — hundreds of wild Sri Lankan elephants converging around the ancient Minneriya Tank. Best from August to October.',
      category: 'wildlife',
      latitude: '8.0329',
      longitude: '80.8950',
      image_url: 'https://images.unsplash.com/photo-1518907882223-4e67e5a7e58a?w=800&q=80',
    },
  ],
  1: [ // Kandy
    {
      title: 'Temple of the Tooth Relic (Sri Dalada Maligawa)',
      description:
        'Visit the sacred Buddhist temple that houses the relic of the tooth of the Buddha. Observe the daily puja (offering) rituals at 6:30 am, 9:30 am and 6:30 pm and explore the museum within the temple complex.',
      category: 'cultural',
      latitude: '7.2936',
      longitude: '80.6411',
      image_url: 'https://images.unsplash.com/photo-1586861203927-800a5acdcc4d?w=800&q=80',
    },
    {
      title: 'Peradeniya Royal Botanic Gardens',
      description:
        'Stroll through 60 hectares of beautifully landscaped gardens on a bend in the Mahaweli River. Highlights include a 200-year-old Java fig tree, orchid house, palm avenue and spice garden.',
      category: 'wellness',
      latitude: '7.2688',
      longitude: '80.5966',
      image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    },
    {
      title: 'Traditional Kandyan Dance Performance',
      description:
        'Watch a captivating performance of Kandyan classical dance — Sri Lanka\'s most elaborate dance form — featuring fire-walking, acrobatics and traditional drumming at the Kandyan Arts Association Hall.',
      category: 'cultural',
      latitude: '7.2985',
      longitude: '80.6398',
      image_url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
    },
    {
      title: 'Kandy Lake Boat Ride & Walk',
      description:
        'Take a peaceful rowboat ride on the artificial lake at the centre of Kandy, constructed by the last king in 1807. The cloudwall walkway along the lake edge offers beautiful views of the temple and hills.',
      category: 'wellness',
      latitude: '7.2916',
      longitude: '80.6417',
      image_url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
    },
    {
      title: 'Tea Factory Tour & Tasting',
      description:
        'Visit a working tea factory in the Hanthana hills above Kandy. Watch the full orthodox tea-making process — withering, rolling, fermentation, drying — and finish with a guided tasting of single-estate teas.',
      category: 'food',
      latitude: '7.2660',
      longitude: '80.6540',
      image_url: 'https://images.unsplash.com/photo-1473093226555-0af7a1c8bd29?w=800&q=80',
    },
  ],
  2: [ // Galle
    {
      title: 'Galle Fort Sunset Walk',
      description:
        'Walk the 1.5 km rampart circuit for sweeping views of the Indian Ocean at golden hour. Watch locals play cricket on the esplanade, spot lighthouse beams and browse boutiques along Church Street.',
      category: 'photography',
      latitude: '6.0270',
      longitude: '80.2168',
      image_url: 'https://images.unsplash.com/photo-1625395809082-d1faa30b4f71?w=800&q=80',
    },
    {
      title: 'Scuba Diving at Hikkaduwa Reef',
      description:
        'Dive the protected coral sanctuary at Hikkaduwa — 20 minutes from Galle — teeming with parrotfish, moray eels, sea turtles and shoals of tropical fish. Beginner resort dives and PADI courses available.',
      category: 'water sports',
      latitude: '6.1391',
      longitude: '80.1055',
      image_url: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800&q=80',
    },
    {
      title: 'Street Food Tour in Galle Fort',
      description:
        'Join a local guide for a morning food walk through the Fort — try kottu roti being chopped on a hot iron plate, freshly baked Dutch lamprais, buffalo curd with kithul treacle and Ceylon tea.',
      category: 'food',
      latitude: '6.0290',
      longitude: '80.2186',
      image_url: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80',
    },
    {
      title: 'Surfing at Hikkaduwa',
      description:
        'Hit the waves at Hikkaduwa\'s popular surf breaks — ideal for beginners and intermediate surfers. Board rentals and lessons are widely available. Best swells run from October through April.',
      category: 'water sports',
      latitude: '6.1407',
      longitude: '80.1024',
      image_url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80',
    },
  ],
  3: [ // Ella
    {
      title: 'Nine Arch Bridge Photography Walk',
      description:
        'Walk through tea estates to the famous Nine Arch Bridge — a colonial-era viaduct of nine stone arches surrounded by jungle. Time your visit for 9 am, 12 pm, or 3 pm when the blue train passes over.',
      category: 'photography',
      latitude: '6.8750',
      longitude: '81.0573',
      image_url: 'https://images.unsplash.com/photo-1545972154-9bb223aac798?w=800&q=80',
    },
    {
      title: 'Little Adam\'s Peak Sunrise Hike',
      description:
        'An easy 45-minute hike through tea plantations to a 1,141 m peak with sweeping views of the Ella Gap, surrounding mountains and valley. Perfect for all fitness levels, best at sunrise.',
      category: 'hiking',
      latitude: '6.8617',
      longitude: '81.0621',
      image_url: 'https://images.unsplash.com/photo-1621976498727-9e5d56476276?w=800&q=80',
    },
    {
      title: 'Ella Rock Full Day Trek',
      description:
        'A challenging 4-hour round-trip hike through evergreen jungle and tea country to Ella Rock summit (1,041 m). Navigate railway tracks, dense forest and steep ridges for breathtaking 360° views.',
      category: 'hiking',
      latitude: '6.8680',
      longitude: '81.0470',
      image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    },
    {
      title: 'Ravana Falls & Cave Visit',
      description:
        'See Ravana Falls, one of Sri Lanka\'s widest waterfalls, plunging 25 metres down a cliff face. Nearby is the Ravana Ella Cave — said to be where the demon King Ravana hid Sita in the Ramayana epic.',
      category: 'cultural',
      latitude: '6.8302',
      longitude: '81.0630',
      image_url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&q=80',
    },
    {
      title: 'Tea Plucking Experience',
      description:
        'Join Tamil tea pluckers on a working estate above Ella for a hands-on session — learn to identify the "two leaves and a bud" standard, fill a basket and follow the leaves to the factory floor for processing.',
      category: 'cultural',
      latitude: '6.8770',
      longitude: '81.0590',
      image_url: 'https://images.unsplash.com/photo-1473093226555-0af7a1c8bd29?w=800&q=80',
    },
  ],
  4: [ // Yala
    {
      title: 'Dawn Leopard Safari — Block 1',
      description:
        'Enter Yala\'s famous Block 1 at opening (6 am) for the best chance of spotting Sri Lankan leopards at water holes and rocky outcrops. Expert trackers scan dense scrub; sightings are near-guaranteed during dry season.',
      category: 'wildlife',
      latitude: '6.3712',
      longitude: '81.5207',
      image_url: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&q=80',
    },
    {
      title: 'Elephant Herd at Palatupana Lagoon',
      description:
        'Watch large herds of Sri Lankan elephants bathing and drinking at Palatupana Lagoon during the evening. The backdrop of flamingos and pelicans on the lagoon makes this a spectacular wildlife photography location.',
      category: 'wildlife',
      latitude: '6.4020',
      longitude: '81.4950',
      image_url: 'https://images.unsplash.com/photo-1518907882223-4e67e5a7e58a?w=800&q=80',
    },
    {
      title: 'Coastal Bird Watching at Yala Lagoon',
      description:
        'Over 200 bird species have been recorded in Yala. Spot greater flamingos, painted storks, kingfishers, jungle fowl and migratory waders along the park\'s coastal lagoons. Bring binoculars and a telephoto lens.',
      category: 'wildlife',
      latitude: '6.3650',
      longitude: '81.5100',
      image_url: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800&q=80',
    },
    {
      title: 'Sithulpawwa Rock Temple',
      description:
        'Visit this ancient cave monastery carved into a 400 ft granite boulder inside Yala\'s Buffer Zone. The 2nd-century BC complex houses Buddha statues and paintings and has sheltered thousands of monks over the centuries.',
      category: 'cultural',
      latitude: '6.3195',
      longitude: '81.5014',
      image_url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
    },
  ],
  5: [ // Mirissa
    {
      title: 'Blue Whale & Dolphin Watching',
      description:
        'Board a sunrise whale-watching boat from Mirissa Harbour for a chance to see blue whales — the largest animals on Earth — breaching off the continental shelf. Spinner dolphin pods and sperm whales are common too. Season: November–April.',
      category: 'wildlife',
      latitude: '5.9455',
      longitude: '80.4638',
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    },
    {
      title: 'Mirissa Sunrise Beach Yoga',
      description:
        'Join a small-group beach yoga session at the quiet east end of Mirissa beach at dawn. The soft sand, sound of waves and cool morning breeze make this a profoundly calming start to the day.',
      category: 'wellness',
      latitude: '5.9468',
      longitude: '80.4753',
      image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
    },
    {
      title: 'Snorkelling at Coconut Tree Hill Reef',
      description:
        'Snorkel the shallow reef below Mirissa\'s iconic Coconut Tree Hill. Visibility is excellent in calm season — sea turtles are regularly spotted resting on the rocky patches just 20 metres from shore.',
      category: 'water sports',
      latitude: '5.9441',
      longitude: '80.4702',
      image_url: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800&q=80',
    },
    {
      title: 'Fresh Seafood Dinner at the Harbour',
      description:
        'Choose your catch from the Mirissa fish market — tuna, red snapper, prawns or lobster — and have it grilled to order at one of the harbour-side restaurants. Freshest seafood in Sri Lanka, often at a fraction of city prices.',
      category: 'food',
      latitude: '5.9398',
      longitude: '80.4590',
      image_url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
    },
    {
      title: 'Surfing — Secret Point Break',
      description:
        'Paddle out to Secret Point — a powerful left-hand break just east of the main beach. Reliable 1-2 m waves from November to April attract intermediate and advanced surfers. Board hire and lessons at the beach shacks.',
      category: 'beach',
      latitude: '5.9462',
      longitude: '80.4814',
      image_url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80',
    },
  ],
  6: [ // Nuwara Eliya
    {
      title: 'Pedro Tea Estate Guided Tour',
      description:
        'Tour the working Pedro tea estate — one of the oldest in Nuwara Eliya — and follow the tea-making journey from plucking to packing. Enjoy a cupping session of premium high-grown tea with mountain views from the factory balcony.',
      category: 'food',
      latitude: '6.9724',
      longitude: '80.7794',
      image_url: 'https://images.unsplash.com/photo-1473093226555-0af7a1c8bd29?w=800&q=80',
    },
    {
      title: 'Gregory Lake Rowing & Cycling',
      description:
        'Rent a paddle boat or row boat on picturesque Gregory Lake, or cycle around the 2 km perimeter pathway. The lake is backed by pine forests and colonial bungalows, ideal for a relaxed afternoon.',
      category: 'wellness',
      latitude: '6.9667',
      longitude: '80.7722',
      image_url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
    },
    {
      title: "Horton Plains & World's End Trek",
      description:
        "Drive to Horton Plains National Park (30 km from Nuwara Eliya) and trek 9 km to World's End — a sheer escarpment dropping 880 metres. Best visited at sunrise before cloud rolls in by 9 am. Watch for sambar deer and leopard.",
      category: 'hiking',
      latitude: '6.8027',
      longitude: '80.8010',
      image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    },
    {
      title: 'Strawberry Farm Visit & Picking',
      description:
        'Visit one of the many strawberry farms on the Nuwara Eliya hillsides. Pick your own freshly ripe strawberries, buy homemade strawberry jam and cream, and enjoy them with a pot of Ceylon tea on the veranda.',
      category: 'food',
      latitude: '6.9860',
      longitude: '80.7760',
      image_url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&q=80',
    },
  ],
  7: [ // Arugam Bay
    {
      title: 'Main Point Surf Session',
      description:
        'Paddle out to Arugam Bay\'s legendary main point break — a 200 m right-hander considered one of the top 10 waves in the world. All levels catered for; surf schools line the beach with boards and instruction.',
      category: 'water sports',
      latitude: '6.8408',
      longitude: '81.8373',
      image_url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80',
    },
    {
      title: 'Pottuvil Lagoon Kayak Safari',
      description:
        'Kayak through the mangrove-fringed Pottuvil Lagoon at dawn for close encounters with crocodiles, water monitors, kingfishers and elephant herds drinking at the water\'s edge.',
      category: 'wildlife',
      latitude: '6.8750',
      longitude: '81.8240',
      image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
    },
    {
      title: 'Kudumbigala Forest Hermitage',
      description:
        'Hike to the remote 2,000-year-old cave monastery of Kudumbigala, hidden in the jungle 30 km south of Arugam Bay. White dagobas perch on rocky outcrops above the tree canopy; monk residents welcome respectful visitors.',
      category: 'cultural',
      latitude: '6.6900',
      longitude: '81.8440',
      image_url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
    },
    {
      title: 'Sunset at Elephant Rock',
      description:
        'Scramble up Elephant Rock — a large granite outcrop just south of the bay — for a perfect sunset view over the Indian Ocean, with surfing silhouettes and fishing boats in the foreground.',
      category: 'adventure',
      latitude: '6.8320',
      longitude: '81.8380',
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    },
  ],
  8: [ // Anuradhapura
    {
      title: 'Sri Maha Bodhi — Sacred Fig Tree',
      description:
        'Visit the Sri Maha Bodhi, grown from a sapling of the original Bodhi tree under which the Buddha attained enlightenment. At 2,289 years old, it is the oldest tree in the world with a recorded planting date. One of Buddhism\'s holiest sites.',
      category: 'cultural',
      latitude: '8.3474',
      longitude: '80.3963',
      image_url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
    },
    {
      title: 'Ruwanwelisaya Dagoba Circumambulation',
      description:
        'Circle the great Ruwanwelisaya stupa — 103 metres high, faced in glistening white plaster — an important pilgrimage for Sri Lankan Buddhists for over 2,100 years. The elephant wall encircling the base is particularly impressive.',
      category: 'cultural',
      latitude: '8.3491',
      longitude: '80.3946',
      image_url: 'https://images.unsplash.com/photo-1535139262971-ab8696ae3b04?w=800&q=80',
    },
    {
      title: 'Anuradhapura Heritage Cycle Tour',
      description:
        'The best way to explore the sprawling ruins is by bicycle. Rent a locally-made "black-and-yellow" bicycle and spend a full day visiting Jetavanaramaya, Abhayagiri, the Samadhi Buddha and Royal Pleasure Gardens.',
      category: 'cultural',
      latitude: '8.3540',
      longitude: '80.4000',
      image_url: 'https://images.unsplash.com/photo-1471623432079-b009d30b6729?w=800&q=80',
    },
    {
      title: 'Sunset at Tissa Wewa Reservoir',
      description:
        'Watch the famous Anuradhapura sunset from the bund of Tissa Wewa — one of the ancient irrigation reservoirs ringing the city. Dozens of elephants and water birds congregate here at dusk for an unforgettable scene.',
      category: 'photography',
      latitude: '8.3380',
      longitude: '80.3820',
      image_url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
    },
  ],
  9: [ // Trincomalee
    {
      title: 'Koneswaram Temple — Swami Rock',
      description:
        'Visit the spectacular Hindu temple dedicated to Shiva perched on Swami Rock — a 130-metre cliff above the ocean. The colourful gopuram towers and clifftop location make this one of Sri Lanka\'s most dramatic religious sites.',
      category: 'cultural',
      latitude: '8.5774',
      longitude: '81.2335',
      image_url: 'https://images.unsplash.com/photo-1535139262971-ab8696ae3b04?w=800&q=80',
    },
    {
      title: 'Snorkelling with Sea Turtles at Nilaveli',
      description:
        'Take a 15-minute boat ride to Pigeon Island Marine National Park off Nilaveli Beach for excellent snorkelling — blacktip reef sharks patrol the outer edge while hawksbill turtles graze the coral below.',
      category: 'water sports',
      latitude: '8.7109',
      longitude: '81.1948',
      image_url: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800&q=80',
    },
    {
      title: 'WWII Wreck Dive — Somerville',
      description:
        'Dive the HMS Somerville — a British WWII destroyer sunk in Trincomalee Bay, now resting at 30 metres and covered in coral and fish. One of Sri Lanka\'s top wreck dives for advanced divers.',
      category: 'adventure',
      latitude: '8.5840',
      longitude: '81.2180',
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    },
    {
      title: 'Uppuveli Beach Sunset & Seafood',
      description:
        'Uppuveli is one of Sri Lanka\'s most beautiful undeveloped beaches — golden sand, turquoise water. Watch the sun set behind the hills from the beach then dine at a beachside kitchen on grilled crab, prawn curry and fish.',
      category: 'beach',
      latitude: '8.6220',
      longitude: '81.2095',
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    },
    {
      title: 'Hot Springs at Kanniya',
      description:
        'Visit the ancient Kanniya Hot Springs — seven wells of geothermal water at varying temperatures, believed in legend to have been created by the demon king Ravana. A sacred site venerated by Hindus, Buddhists and Muslims alike.',
      category: 'wellness',
      latitude: '8.6053',
      longitude: '81.1836',
      image_url: 'https://images.unsplash.com/photo-1415025148099-17fe74102b28?w=800&q=80',
    },
  ],
};

/* ── Seed function ───────────────────────────────────────── */
const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('\n✓ Database connected');

    /* Ensure destinations table exists */
    await sequelize.sync({ alter: false });
    console.log('✓ Models synced');

    /* Verify tbl_lifestyle table is accessible */
    try {
      const qi = sequelize.getQueryInterface();
      const cols = await qi.describeTable('tbl_lifestyle').catch(() => null);
      if (cols) {
        console.log('  ✓ tbl_lifestyle table found');
      } else {
        console.warn('  ⚠ tbl_lifestyle table not found — lifestyle records will be skipped');
      }
    } catch (e) {
      console.warn('  ⚠ Could not check tbl_lifestyle (non-fatal):', e.message);
    }

    /* ── Seed destinations ────────────────────────────── */
    console.log('\nSeeding destinations...');
    const existingCount = await Destination.count();
    if (existingCount > 0) {
      console.log(`  ℹ ${existingCount} destinations already exist — clearing and re-seeding...`);
      await Lifestyle.destroy({ where: {}, truncate: false });
      await Destination.destroy({ where: {}, truncate: false });
    }

    const createdDestinations = [];
    for (const destData of destinations) {
      const dest = await Destination.create(destData);
      createdDestinations.push(dest);
      console.log(`  ✓ Created: ${dest.name}`);
    }

    /* ── Seed lifestyle activities ────────────────────── */
    console.log('\nSeeding lifestyle activities...');
    let totalActivities = 0;
    for (let i = 0; i < createdDestinations.length; i++) {
      const dest = createdDestinations[i];
      const activities = lifestylesByDest[i] || [];
      for (const actData of activities) {
        await Lifestyle.create({
          lifestyle_name: actData.title,
          lifestyle_description: actData.description,
          lifestyle_attraction_type: actData.category,
          latitude: actData.latitude,
          longitude: actData.longitude,
          image: actData.image_url,
          lifestyle_city: dest.city_key,
          active_status: 1,
          address: '',
          sub_description: '',
          micro_location: '',
          selling_points: '',
        });
        totalActivities++;
      }
      console.log(`  ✓ ${dest.name}: ${activities.length} activities seeded`);
    }

    console.log('\n' + '='.repeat(52));
    console.log('Seeding complete!');
    console.log(`  Destinations : ${createdDestinations.length}`);
    console.log(`  Activities   : ${totalActivities}`);
    console.log('='.repeat(52));

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

seed();

