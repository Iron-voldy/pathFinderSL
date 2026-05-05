/**
 * Adds comprehensive lifestyle activities to cover all categories per destination.
 * Run: node database/seeders/addMoreLifestyles.js
 */
const path = require('path');
const serverDir = path.join(__dirname, '../../server');
module.paths.unshift(path.join(serverDir, 'node_modules'));
require('dotenv').config({ path: path.join(serverDir, '.env') });
const sequelize = require(path.join(serverDir, 'config/database'));

const newActivities = [

  // ═══ SIGIRIYA (adding: photography, food, wellness) ════════════════════════
  {
    lifestyle_city: 'Sigiriya', lifestyle_attraction_type: 'photography',
    lifestyle_name: 'Sigiriya Museum & Ancient Frescoes',
    lifestyle_description: 'Explore the on-site museum chronicling the rock fortress history before photographing the famous 5th-century frescoes depicting celestial nymphs — some of the oldest and finest examples of ancient Sri Lankan painting.',
    address: 'Sigiriya Archaeological Site, Matale', latitude: '7.9572', longitude: '80.7601',
    image: 'https://images.unsplash.com/photo-1608501078713-8e445a709b39?w=800&q=80',
  },
  {
    lifestyle_city: 'Sigiriya', lifestyle_attraction_type: 'food',
    lifestyle_name: 'Village Rice & Curry Lunch Experience',
    lifestyle_description: 'Join a local family for a traditional Sri Lankan rice and curry feast served on a banana leaf. Sample 10+ homemade curries including dhal, jackfruit, pol sambol, mallum and freshly prepared hoppers cooked in a wood-fired kitchen.',
    address: 'Inamaluwa Village, Sigiriya', latitude: '7.9450', longitude: '80.7620',
    image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80',
  },
  {
    lifestyle_city: 'Sigiriya', lifestyle_attraction_type: 'wellness',
    lifestyle_name: 'Ayurvedic Spa & Herbal Garden Tour',
    lifestyle_description: 'Unwind with a traditional Ayurvedic massage using warming herbal oils and hand-picked jungle herbs. Eco-lodges near Sigiriya offer 60-minute Abhyanga treatments followed by guided walks through their medicinal herb gardens.',
    address: 'Eco-resort belt, Sigiriya', latitude: '7.9520', longitude: '80.7580',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
  },

  // ═══ KANDY (adding: hiking, adventure, photography) ════════════════════════
  {
    lifestyle_city: 'Kandy', lifestyle_attraction_type: 'hiking',
    lifestyle_name: 'Hanthana Mountain Range Trek',
    lifestyle_description: 'Trek the Hanthana range — a UNESCO biosphere reserve rising above Kandy — through dense rainforest, past cascading streams and viewpoints over the city and surrounding hills. Trail difficulty ranges from easy ridgeline walks to full-day summit hikes.',
    address: 'Hanthana, Kandy', latitude: '7.2560', longitude: '80.6440',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  },
  {
    lifestyle_city: 'Kandy', lifestyle_attraction_type: 'adventure',
    lifestyle_name: 'White Water Rafting on Mahaweli River',
    lifestyle_description: 'Tackle Grade II to III rapids on the Mahaweli River, cutting through lush canyon scenery below Kandy. Beginner and intermediate rafters welcome; guides provide full safety briefings and all equipment.',
    address: 'Peradeniya River Junction, Kandy', latitude: '7.2680', longitude: '80.5940',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  },
  {
    lifestyle_city: 'Kandy', lifestyle_attraction_type: 'photography',
    lifestyle_name: 'Kandy Esala Perahera Night Parade',
    lifestyle_description: 'Witness Sri Lanka\'s grandest festival — 10 nights of decorated elephants, fire jugglers, Kandyan drummers and traditional dancers parading through the city streets. Held in July and August, a once-in-a-lifetime spectacle of light, colour and culture.',
    address: 'Kandy City Centre', latitude: '7.2929', longitude: '80.6403',
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
  },

  // ═══ GALLE (adding: cultural, wellness, wildlife) ══════════════════════════
  {
    lifestyle_city: 'Galle', lifestyle_attraction_type: 'cultural',
    lifestyle_name: 'Dutch Colonial Heritage Walking Tour',
    lifestyle_description: 'Explore the UNESCO World Heritage Galle Fort with a local historian — the Dutch Reformed Church (1755), the Old Dutch Hospital, the National Maritime Museum and the Groote Kerk. Learn how three colonial powers shaped this living fortress city over 500 years.',
    address: 'Galle Fort, Southern Province', latitude: '6.0280', longitude: '80.2170',
    image: 'https://images.unsplash.com/photo-1625395809082-d1faa30b4f71?w=800&q=80',
  },
  {
    lifestyle_city: 'Galle', lifestyle_attraction_type: 'wellness',
    lifestyle_name: 'Sunset Beach Yoga at Unawatuna',
    lifestyle_description: 'Join a sunrise or sunset yoga class on the soft white sands of Unawatuna Bay — consistently rated one of the most beautiful beaches in the world. Small groups, experienced instructors, and the Indian Ocean as your backdrop.',
    address: 'Unawatuna Beach, Galle', latitude: '6.0116', longitude: '80.2486',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
  },
  {
    lifestyle_city: 'Galle', lifestyle_attraction_type: 'wildlife',
    lifestyle_name: 'Turtle Hatchery Visit at Kosgoda',
    lifestyle_description: 'Visit a sea turtle conservation hatchery 30 minutes from Galle where five species of turtle nest. Watch hatchlings released at dusk, learn about nest protection programmes and with luck spot nesting females after dark.',
    address: 'Kosgoda Beach, Southern Coast', latitude: '6.1900', longitude: '80.1620',
    image: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800&q=80',
  },

  // ═══ ELLA (adding: wellness, food, adventure) ══════════════════════════════
  {
    lifestyle_city: 'Ella', lifestyle_attraction_type: 'wellness',
    lifestyle_name: 'Tea Plantation Sunrise Yoga Retreat',
    lifestyle_description: 'Start your morning with a guided yoga session on the deck of a boutique tea estate overlooking the Ella Gap. Enjoy herbal tea on arrival, a 60-minute Hatha yoga class with valley views, and a wholesome Sri Lankan breakfast afterwards.',
    address: 'Ella Hill Estate, Uva Province', latitude: '6.8750', longitude: '81.0490',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
  },
  {
    lifestyle_city: 'Ella', lifestyle_attraction_type: 'food',
    lifestyle_name: 'Ella Cooking Class — Sri Lankan Flavours',
    lifestyle_description: 'Learn to cook five traditional Sri Lankan dishes in a local home kitchen — from grinding fresh coconut and roasting spices to preparing dhal curry, kottu and coconut milk rice. Take a recipe booklet home as a souvenir.',
    address: 'Ella Town', latitude: '6.8678', longitude: '81.0465',
    image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80',
  },
  {
    lifestyle_city: 'Ella', lifestyle_attraction_type: 'adventure',
    lifestyle_name: 'Zip-lining & Canopy Adventure',
    lifestyle_description: 'Soar above tea plantations and jungle ravines on a multi-platform zip-line course near Ella. Lines range from 100 m to 500 m with harness, helmet and full safety briefing. An adrenaline fix in a stunning hill country setting.',
    address: 'Ella Adventure Park', latitude: '6.8710', longitude: '81.0530',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  },

  // ═══ YALA (adding: photography, wellness) ══════════════════════════════════
  {
    lifestyle_city: 'Yala', lifestyle_attraction_type: 'photography',
    lifestyle_name: 'Yala Sunrise Safari Photography Tour',
    lifestyle_description: 'Join a photography-focused dawn safari in a small 6-seater jeep with a guide who knows where to position for perfect light. Capture leopards, elephants and sloth bears in golden-hour light at Yala\'s most photogenic waterholes and rock formations.',
    address: 'Yala National Park Block 1 Gate', latitude: '6.3712', longitude: '81.5200',
    image: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&q=80',
  },
  {
    lifestyle_city: 'Yala', lifestyle_attraction_type: 'wellness',
    lifestyle_name: 'Eco-Lodge Bush Spa & Outdoor Pool',
    lifestyle_description: 'After a morning safari, ease aching muscles with an Ayurvedic massage at one of Yala\'s boutique eco-lodges. Treatments use locally sourced oils and herbs; the open-air spa overlooks the scrub jungle where peacocks often wander through.',
    address: 'Tissamaharama, Yala Buffer Zone', latitude: '6.2860', longitude: '81.2940',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
  },

  // ═══ MIRISSA (adding: cultural, photography) ═══════════════════════════════
  {
    lifestyle_city: 'Mirissa', lifestyle_attraction_type: 'cultural',
    lifestyle_name: 'Mirissa Fishing Village Tour at Dawn',
    lifestyle_description: 'Wake before sunrise to join local fishermen as they haul in their night catch at Mirissa Harbour. Watch the vibrant fish auction, see traditional outrigger catamarans being rigged and sample fresh pol roti at a harbour-side stall.',
    address: 'Mirissa Harbour', latitude: '5.9398', longitude: '80.4590',
    image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80',
  },
  {
    lifestyle_city: 'Mirissa', lifestyle_attraction_type: 'photography',
    lifestyle_name: 'Coconut Tree Hill Sunset Photo Walk',
    lifestyle_description: 'Hike to Mirissa\'s iconic Coconut Tree Hill for the island\'s most celebrated sunset — a cluster of palm trees silhouetted against an amber horizon above the Indian Ocean. Perfect for wide-angle landscape and portrait photography.',
    address: 'Coconut Tree Hill, Mirissa', latitude: '5.9441', longitude: '80.4700',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  },

  // ═══ NUWARA ELIYA (adding: photography, cultural, wildlife, adventure) ══════
  {
    lifestyle_city: 'Nuwaraeliya', lifestyle_attraction_type: 'photography',
    lifestyle_name: 'Misty Tea Estate Sunrise Photography',
    lifestyle_description: 'Head to the tea estates at first light when morning mist clings to the terraced hillsides. Chase the golden hour across Lover\'s Leap, Pink Hill and the dramatic escarpments above Nuwara Eliya for landscape shots of breathtaking beauty.',
    address: "Lover's Leap Estate, Nuwara Eliya", latitude: '6.9780', longitude: '80.7820',
    image: 'https://images.unsplash.com/photo-1473093226555-0af7a1c8bd29?w=800&q=80',
  },
  {
    lifestyle_city: 'Nuwaraeliya', lifestyle_attraction_type: 'cultural',
    lifestyle_name: 'Nuwara Eliya Colonial Town Heritage Walk',
    lifestyle_description: 'Tour Little England with a local guide — the Tudor-style Nuwara Eliya Post Office, the Hill Club (Sri Lanka\'s oldest gentleman\'s club), Grand Hotel and Victoria Park. Learn how British planters recreated their homeland at 1,868 m altitude.',
    address: 'Nuwara Eliya Town Centre', latitude: '6.9697', longitude: '80.7759',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
  },
  {
    lifestyle_city: 'Nuwaraeliya', lifestyle_attraction_type: 'wildlife',
    lifestyle_name: 'Victoria Park Bird Watching',
    lifestyle_description: 'Victoria Park in the heart of Nuwara Eliya is a top birding site. Between March and August, rare Indian Pitta, Kashmir Flycatcher and Pied Thrush migrate here alongside endemic species like the Sri Lanka White-eye and Yellow-eared Bulbul.',
    address: 'Victoria Park, Nuwara Eliya', latitude: '6.9710', longitude: '80.7780',
    image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800&q=80',
  },
  {
    lifestyle_city: 'Nuwaraeliya', lifestyle_attraction_type: 'adventure',
    lifestyle_name: 'Quad Biking through Tea Country',
    lifestyle_description: 'Tear through muddy tea estate tracks on an ATV quad bike, splashing across mountain streams and plantation paths. Routes range 20 to 45 minutes through working estates with stunning views across the hill country.',
    address: 'Ramboda Pass Area, Nuwara Eliya', latitude: '7.0060', longitude: '80.7640',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  },

  // ═══ ARUGAM BAY (adding: beach, food, wellness, photography) ═══════════════
  {
    lifestyle_city: 'ArugamBay', lifestyle_attraction_type: 'beach',
    lifestyle_name: 'Beach Cricket & Volleyball at Main Bay',
    lifestyle_description: 'Join the daily beach cricket or volleyball games that spring up on Arugam Bay\'s wide golden sand. A beloved local tradition — travellers are always welcome. No equipment or booking needed, just turn up.',
    address: 'Main Beach, Arugam Bay', latitude: '6.8408', longitude: '81.8380',
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80',
  },
  {
    lifestyle_city: 'ArugamBay', lifestyle_attraction_type: 'food',
    lifestyle_name: 'Arugam Bay Night Market & Seafood BBQ',
    lifestyle_description: 'After sunset, the Arugam Bay beachfront comes alive with stalls selling grilled prawns, cuttlefish, fresh king coconut and Sri Lankan short-eats. Grab a plate and eat by the sea as live acoustic music fills the warm night air.',
    address: 'Beachfront Road, Arugam Bay', latitude: '6.8400', longitude: '81.8360',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
  },
  {
    lifestyle_city: 'ArugamBay', lifestyle_attraction_type: 'wellness',
    lifestyle_name: 'Surf Yoga & Meditation Retreat',
    lifestyle_description: 'Combine morning surfing with a restorative yoga and meditation session at one of Arugam Bay\'s dedicated surf-yoga studios. End with a cold-brew herbal tea and stretch session — perfectly designed for active travellers.',
    address: 'Beach Road, Arugam Bay', latitude: '6.8415', longitude: '81.8370',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
  },
  {
    lifestyle_city: 'ArugamBay', lifestyle_attraction_type: 'photography',
    lifestyle_name: 'Lagoon Sunrise Photography Tour',
    lifestyle_description: 'Photograph the mirror-calm Pottuvil Lagoon at sunrise when mist rises off the water, cormorants perch on mangrove roots and fishermen cast nets in the pink dawn light. One of Sri Lanka\'s most serene photography experiences.',
    address: 'Pottuvil Lagoon, Arugam Bay', latitude: '6.8740', longitude: '81.8240',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  },

  // ═══ ANURADHAPURA (adding: wildlife, wellness, food) ═══════════════════════
  {
    lifestyle_city: 'Anuradhapura', lifestyle_attraction_type: 'wildlife',
    lifestyle_name: 'Wilpattu National Park Safari',
    lifestyle_description: 'Drive 30 km to Wilpattu — Sri Lanka\'s largest national park — for leopard sightings in dense evergreen forest alongside sloth bears, spotted deer and crocodile-filled natural lakes called willus. Far less crowded than Yala with superb wildlife density.',
    address: 'Wilpattu National Park, North Western Province', latitude: '8.4500', longitude: '80.0800',
    image: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&q=80',
  },
  {
    lifestyle_city: 'Anuradhapura', lifestyle_attraction_type: 'wellness',
    lifestyle_name: 'Meditation at Abhayagiri Monastery',
    lifestyle_description: 'Spend a morning in silent walking meditation and guided mindfulness at one of Anuradhapura\'s ancient monasteries. Monks welcome respectful visitors for early-morning puja and the chance to sit in contemplation amid 2,000-year-old dagobas.',
    address: 'Abhayagiri Monastery, Anuradhapura', latitude: '8.3580', longitude: '80.3970',
    image: 'https://images.unsplash.com/photo-1535139262971-ab8696ae3b04?w=800&q=80',
  },
  {
    lifestyle_city: 'Anuradhapura', lifestyle_attraction_type: 'food',
    lifestyle_name: "Pilgrims' Street Food Walk",
    lifestyle_description: 'The lanes around Sri Maha Bodhi are lined with street food stalls serving pilgrims and travellers alike — kiribath (milk rice), lavariya (sweet coconut parcels), green gram curry and fresh king coconut water at unbeatable prices.',
    address: 'Mahamewna Gardens Food Row, Anuradhapura', latitude: '8.3460', longitude: '80.3960',
    image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80',
  },

  // ═══ TRINCOMALEE (adding: food, wildlife, photography) ═════════════════════
  {
    lifestyle_city: 'Trincomalee', lifestyle_attraction_type: 'food',
    lifestyle_name: 'Tamil Cuisine Cooking Class & Market Tour',
    lifestyle_description: 'Visit the Trincomalee market with a local Tamil cook, selecting fresh seafood and spices, then prepare traditional dishes: crab curry, prawn biryani, coconut sambol and string hoppers from scratch in a home kitchen.',
    address: 'Dutch Bay Road, Trincomalee', latitude: '8.5760', longitude: '81.2320',
    image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80',
  },
  {
    lifestyle_city: 'Trincomalee', lifestyle_attraction_type: 'wildlife',
    lifestyle_name: 'Blue Whale Watching off Trincomalee',
    lifestyle_description: 'Between May and October, blue and sperm whales migrate past the Trincomalee coast — often seen closer to shore than at Mirissa. Take a morning boat trip from Uppuveli for whale sightings alongside spinner dolphins and flying fish.',
    address: 'Uppuveli Beach Jetty, Trincomalee', latitude: '8.6230', longitude: '81.2100',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  },
  {
    lifestyle_city: 'Trincomalee', lifestyle_attraction_type: 'photography',
    lifestyle_name: 'Fort Frederick Ramparts & Ocean Views',
    lifestyle_description: 'Walk the ramparts of Fort Frederick — a 17th-century Portuguese-Dutch-British fortification on a rocky peninsula — for commanding views of Trincomalee Bay, the naval harbour and the blue-domed mosques below Swami Rock.',
    address: 'Fort Frederick, Trincomalee', latitude: '8.5780', longitude: '81.2340',
    image: 'https://images.unsplash.com/photo-1535139262971-ab8696ae3b04?w=800&q=80',
  },
];

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database\n');

    let inserted = 0;
    for (const act of newActivities) {
      await sequelize.query(
        `INSERT INTO tbl_lifestyle
          (lifestyle_city, lifestyle_attraction_type, lifestyle_name, lifestyle_description,
           address, latitude, longitude, image, active_status,
           sub_description, micro_location, selling_points, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,1,'','','',NOW(),NOW())`,
        {
          replacements: [
            act.lifestyle_city, act.lifestyle_attraction_type, act.lifestyle_name,
            act.lifestyle_description, act.address, act.latitude, act.longitude, act.image,
          ],
        }
      );
      inserted++;
      console.log(`  [${act.lifestyle_city}] ${act.lifestyle_attraction_type} — ${act.lifestyle_name}`);
    }

    console.log(`\nDone. Inserted ${inserted} new lifestyle activities.`);
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
