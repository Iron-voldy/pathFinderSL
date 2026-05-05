/**
 * Transport Seed Script — Sri Lankan Transport Gigs
 * Creates driver users (with is_driver=true, approved applications) and 25 gigs
 *
 * Usage: node database/seeders/seedTransport.js
 */

const path = require('path');

const serverDir = path.join(__dirname, '../../server');
module.paths.unshift(path.join(serverDir, 'node_modules'));

const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(serverDir, '.env') });
const sequelize = require(path.join(serverDir, 'config/database'));
const User = require(path.join(serverDir, 'user-management/models/User'));
const DriverApplication = require(path.join(serverDir, 'driver-management/models/DriverApplication'));
const TransportGig = require(path.join(serverDir, 'driver-management/models/TransportGig'));

/* ─── Seed Drivers (users) ─── */
const driverUsers = [
  { full_name: 'Kamal Perera',   email: 'kamal.driver@pathfindersl.lk',   location: 'Colombo' },
  { full_name: 'Nuwan Silva',    email: 'nuwan.driver@pathfindersl.lk',   location: 'Kandy' },
  { full_name: 'Ruwan Fernando', email: 'ruwan.driver@pathfindersl.lk',   location: 'Galle' },
  { full_name: 'Ashan Jayawardena', email: 'ashan.driver@pathfindersl.lk', location: 'Negombo' },
  { full_name: 'Dilshan Bandara', email: 'dilshan.driver@pathfindersl.lk', location: 'Ella' },
  { full_name: 'Tharindu Rajapaksa', email: 'tharindu.driver@pathfindersl.lk', location: 'Nuwara Eliya' },
  { full_name: 'Chaminda Wijesekara', email: 'chaminda.driver@pathfindersl.lk', location: 'Sigiriya' },
  { full_name: 'Pradeep Kumara', email: 'pradeep.driver@pathfindersl.lk', location: 'Trincomalee' },
];

/* ─── Driver Applications (matched by index to driverUsers) ─── */
const driverApps = [
  { vehicle_type: 'Sedan',         vehicle_make: 'Toyota',    vehicle_model: 'Prius',         vehicle_year: 2021, vehicle_plate: 'CAB-4521', vehicle_color: 'White',  passenger_capacity: 4 },
  { vehicle_type: 'SUV',           vehicle_make: 'Toyota',    vehicle_model: 'Land Cruiser',  vehicle_year: 2020, vehicle_plate: 'KD-7832',  vehicle_color: 'Black',  passenger_capacity: 7 },
  { vehicle_type: 'MPV/Minivan',   vehicle_make: 'Toyota',    vehicle_model: 'KDH',           vehicle_year: 2022, vehicle_plate: 'GH-1194',  vehicle_color: 'Silver', passenger_capacity: 10 },
  { vehicle_type: 'Luxury Car',    vehicle_make: 'Mercedes',  vehicle_model: 'E-Class',       vehicle_year: 2023, vehicle_plate: 'WP-0088',  vehicle_color: 'Black',  passenger_capacity: 3 },
  { vehicle_type: '4WD',           vehicle_make: 'Mitsubishi',vehicle_model: 'Montero Sport',  vehicle_year: 2019, vehicle_plate: 'UP-3345',  vehicle_color: 'Grey',   passenger_capacity: 7 },
  { vehicle_type: 'Passenger Van', vehicle_make: 'Toyota',    vehicle_model: 'HiAce',         vehicle_year: 2021, vehicle_plate: 'NE-5590',  vehicle_color: 'White',  passenger_capacity: 14 },
  { vehicle_type: 'Mini Coach',    vehicle_make: 'Rosa',      vehicle_model: 'Mitsubishi Rosa',vehicle_year: 2018, vehicle_plate: 'NC-2277', vehicle_color: 'Blue',   passenger_capacity: 28 },
  { vehicle_type: 'Convertible',   vehicle_make: 'Suzuki',    vehicle_model: 'Jimny',         vehicle_year: 2022, vehicle_plate: 'EP-6614',  vehicle_color: 'Green',  passenger_capacity: 3 },
];

/* ─── 25 Transport Gigs ─── */
const transportGigs = [
  // ===== DRIVER 0 — Kamal (Colombo, Sedan) =====
  {
    driverIdx: 0,
    title: 'Colombo Airport Transfer — BIA to City',
    description: 'Comfortable sedan transfer from Bandaranaike International Airport to any Colombo hotel. Air-conditioned Toyota Prius with free Wi-Fi and bottled water. Fixed price, no hidden charges. Available 24/7 for arrivals and departures.',
    start_location: 'Bandaranaike International Airport (BIA)',
    end_location: 'Colombo City',
    vehicle_category: 'Small Group (1-4)',
    vehicle_type: 'Sedan', vehicle_make: 'Toyota', vehicle_model: 'Prius',
    passenger_capacity: 4, price_per_day: 5500, currency: 'LKR',
    images: ['/gig-colombo-airport-transfer.jpg'],
    available_from: '2026-03-20', available_to: '2026-12-31', status: 'active', is_featured: true,
  },
  {
    driverIdx: 0,
    title: 'Colombo to Galle Day Trip',
    description: 'Scenic coastal drive from Colombo to Galle along the Southern Expressway. Visit Galle Fort, enjoy beachside lunch, and return by evening. Stops at Bentota or Hikkaduwa on request.',
    start_location: 'Colombo',
    end_location: 'Galle',
    vehicle_category: 'Small Group (1-4)',
    vehicle_type: 'Sedan', vehicle_make: 'Toyota', vehicle_model: 'Prius',
    passenger_capacity: 4, price_per_day: 9500, currency: 'LKR',
    images: ['/gig-colombo-galle-drive.jpg'],
    available_from: '2026-03-20', available_to: '2026-12-31', status: 'active', is_featured: false,
  },
  {
    driverIdx: 0,
    title: 'Colombo City Tour — Half Day',
    description: 'Explore Colombo highlights: Gangaramaya Temple, Independence Square, Pettah Market, Galle Face Green, and Dutch Hospital. Flexible duration with local driver knowledge.',
    start_location: 'Colombo',
    end_location: 'Colombo',
    vehicle_category: 'Small Group (1-4)',
    vehicle_type: 'Sedan', vehicle_make: 'Toyota', vehicle_model: 'Prius',
    passenger_capacity: 4, price_per_day: 6000, currency: 'LKR',
    images: ['/gig-colombo-city-tour.jpg'],
    available_from: '2026-03-25', available_to: '2026-12-31', status: 'active', is_featured: false,
  },

  // ===== DRIVER 1 — Nuwan (Kandy, SUV) =====
  {
    driverIdx: 1,
    title: 'Kandy to Ella — Hill Country Safari',
    description: 'Travel the breathtaking hill country route from Kandy to Ella via Nuwara Eliya. Pass through lush tea plantations, waterfalls, and misty mountains. Stops at Ramboda Falls and a tea factory included.',
    start_location: 'Kandy',
    end_location: 'Ella',
    vehicle_category: 'Medium Group (5-7)',
    vehicle_type: 'SUV', vehicle_make: 'Toyota', vehicle_model: 'Land Cruiser',
    passenger_capacity: 7, price_per_day: 15000, currency: 'LKR',
    images: ['/gig-kandy-ella-hill.jpg'],
    available_from: '2026-03-20', available_to: '2026-12-31', status: 'active', is_featured: true,
  },
  {
    driverIdx: 1,
    title: 'Kandy Temple & Culture Tour',
    description: 'Full-day Kandy cultural tour: Temple of the Tooth Relic, Royal Botanical Gardens Peradeniya, Kandy Lake walk, traditional Kandyan dance show in the evening. Lunch at a local restaurant included in itinerary.',
    start_location: 'Kandy',
    end_location: 'Kandy',
    vehicle_category: 'Medium Group (5-7)',
    vehicle_type: 'SUV', vehicle_make: 'Toyota', vehicle_model: 'Land Cruiser',
    passenger_capacity: 7, price_per_day: 12000, currency: 'LKR',
    images: ['/gig-kandy-temple-tour.jpg'],
    available_from: '2026-04-01', available_to: '2026-12-31', status: 'active', is_featured: false,
  },
  {
    driverIdx: 1,
    title: 'Kandy to Sigiriya & Dambulla Day Trip',
    description: 'Visit the ancient rock fortress of Sigiriya (Lion Rock) and Dambulla Cave Temple, both UNESCO World Heritage Sites. Early start recommended for comfortable climbing weather.',
    start_location: 'Kandy',
    end_location: 'Sigiriya',
    vehicle_category: 'Medium Group (5-7)',
    vehicle_type: 'SUV', vehicle_make: 'Toyota', vehicle_model: 'Land Cruiser',
    passenger_capacity: 7, price_per_day: 14000, currency: 'LKR',
    images: ['/gig-kandy-sigiriya.jpg'],
    available_from: '2026-03-22', available_to: '2026-12-31', status: 'active', is_featured: true,
  },

  // ===== DRIVER 2 — Ruwan (Galle, KDH/Minivan) =====
  {
    driverIdx: 2,
    title: 'Southern Coast Beach Hopper',
    description: 'Explore Sri Lanka\'s stunning south coast: Unawatuna, Jungle Beach, Mirissa for whale watching, and Tangalle. Perfect for groups wanting to experience multiple beaches in one trip.',
    start_location: 'Galle',
    end_location: 'Tangalle',
    vehicle_category: 'Medium Group (5-7)',
    vehicle_type: 'MPV/Minivan', vehicle_make: 'Toyota', vehicle_model: 'KDH',
    passenger_capacity: 10, price_per_day: 16000, currency: 'LKR',
    images: ['/gig-southern-beach-hopper.jpg'],
    available_from: '2026-03-20', available_to: '2026-12-31', status: 'active', is_featured: true,
  },
  {
    driverIdx: 2,
    title: 'Galle Fort Heritage Walk & Lunch Transfer',
    description: 'Drop-off and pick-up service to Galle Fort with local guide recommendations. Includes stops at the lighthouse, ramparts, and boutique shops. Return via coastal route with optional Koggala lake boat ride.',
    start_location: 'Galle',
    end_location: 'Galle',
    vehicle_category: 'Medium Group (5-7)',
    vehicle_type: 'MPV/Minivan', vehicle_make: 'Toyota', vehicle_model: 'KDH',
    passenger_capacity: 10, price_per_day: 8000, currency: 'LKR',
    images: ['/gig-galle-fort-tour.jpg'],
    available_from: '2026-04-01', available_to: '2026-12-31', status: 'active', is_featured: false,
  },
  {
    driverIdx: 2,
    title: 'Galle to Yala National Park Safari Transfer',
    description: 'Comfortable minivan transfer from Galle to Yala National Park. Early morning departure for the best wildlife spotting opportunities. See elephants, leopards, crocodiles, and exotic birds.',
    start_location: 'Galle',
    end_location: 'Yala National Park',
    vehicle_category: 'Medium Group (5-7)',
    vehicle_type: 'MPV/Minivan', vehicle_make: 'Toyota', vehicle_model: 'KDH',
    passenger_capacity: 10, price_per_day: 18000, currency: 'LKR',
    images: ['/gig-galle-yala-safari.jpg'],
    available_from: '2026-03-20', available_to: '2026-12-31', status: 'active', is_featured: false,
  },

  // ===== DRIVER 3 — Ashan (Negombo, Mercedes Luxury) =====
  {
    driverIdx: 3,
    title: 'VIP Airport Luxury Transfer',
    description: 'Premium Mercedes E-Class airport transfer with leather seats, climate control, complimentary refreshments, and English-speaking chauffeur. Meet-and-greet at arrivals with name board.',
    start_location: 'Bandaranaike International Airport (BIA)',
    end_location: 'Colombo / Negombo',
    vehicle_category: 'Small Group (1-4)',
    vehicle_type: 'Luxury Car', vehicle_make: 'Mercedes', vehicle_model: 'E-Class',
    passenger_capacity: 3, price_per_day: 12000, currency: 'LKR',
    images: ['/gig-vip-airport-transfer.jpg'],
    available_from: '2026-03-20', available_to: '2026-12-31', status: 'active', is_featured: true,
  },
  {
    driverIdx: 3,
    title: 'Negombo Lagoon & Fish Market Tour',
    description: 'Luxury car tour of Negombo: visit the bustling Negombo Fish Market, cruise Negombo Lagoon, St Mary\'s Church, and Dutch Canal. Perfect morning activity before a flight.',
    start_location: 'Negombo',
    end_location: 'Negombo',
    vehicle_category: 'Small Group (1-4)',
    vehicle_type: 'Luxury Car', vehicle_make: 'Mercedes', vehicle_model: 'E-Class',
    passenger_capacity: 3, price_per_day: 8500, currency: 'LKR',
    images: ['/gig-negombo-lagoon-tour.jpg'],
    available_from: '2026-04-01', available_to: '2026-12-31', status: 'active', is_featured: false,
  },

  // ===== DRIVER 4 — Dilshan (Ella, 4WD) =====
  {
    driverIdx: 4,
    title: 'Ella Adventure — Nine Arches & Little Adam\'s Peak',
    description: 'Explore Ella\'s top sights in a rugged 4WD: Nine Arches Bridge (iconic train photo spot), Little Adam\'s Peak sunrise trek, Ravana Falls, and Ella Rock viewpoint. Mountain roads made easy.',
    start_location: 'Ella',
    end_location: 'Ella',
    vehicle_category: 'Medium Group (5-7)',
    vehicle_type: '4WD', vehicle_make: 'Mitsubishi', vehicle_model: 'Montero Sport',
    passenger_capacity: 7, price_per_day: 11000, currency: 'LKR',
    images: ['/gig-ella-adventure.jpg'],
    available_from: '2026-03-20', available_to: '2026-12-31', status: 'active', is_featured: true,
  },
  {
    driverIdx: 4,
    title: 'Ella to Udawalawe Safari Transfer',
    description: 'Drive from Ella through the scenic hill country down to Udawalawe National Park. Famous for wild elephant herds — one of the best places in Sri Lanka to see elephants in their natural habitat.',
    start_location: 'Ella',
    end_location: 'Udawalawe National Park',
    vehicle_category: 'Medium Group (5-7)',
    vehicle_type: '4WD', vehicle_make: 'Mitsubishi', vehicle_model: 'Montero Sport',
    passenger_capacity: 7, price_per_day: 13500, currency: 'LKR',
    images: ['/gig-ella-udawalawe.jpg'],
    available_from: '2026-03-25', available_to: '2026-12-31', status: 'active', is_featured: false,
  },
  {
    driverIdx: 4,
    title: 'Ella to Nuwara Eliya Tea Country Drive',
    description: 'Wind through Sri Lanka\'s famous tea country from Ella to Nuwara Eliya (Little England). Stop at Pedro Tea Estate, Gregory Lake, and Hakgala Botanical Gardens. Cool climate, stunning views.',
    start_location: 'Ella',
    end_location: 'Nuwara Eliya',
    vehicle_category: 'Medium Group (5-7)',
    vehicle_type: '4WD', vehicle_make: 'Mitsubishi', vehicle_model: 'Montero Sport',
    passenger_capacity: 7, price_per_day: 12000, currency: 'LKR',
    images: ['/gig-ella-nuwara-eliya.jpg'],
    available_from: '2026-04-01', available_to: '2026-12-31', status: 'active', is_featured: false,
  },

  // ===== DRIVER 5 — Tharindu (Nuwara Eliya, HiAce Van) =====
  {
    driverIdx: 5,
    title: 'Nuwara Eliya to Horton Plains & World\'s End',
    description: 'Early morning transfer to Horton Plains National Park for the famous World\'s End cliff viewpoint (880m drop). Best before 10am when clouds roll in. Includes Baker\'s Falls trail.',
    start_location: 'Nuwara Eliya',
    end_location: 'Horton Plains National Park',
    vehicle_category: 'Large Group (8-30+)',
    vehicle_type: 'Passenger Van', vehicle_make: 'Toyota', vehicle_model: 'HiAce',
    passenger_capacity: 14, price_per_day: 18000, currency: 'LKR',
    images: ['/gig-horton-plains.jpg'],
    available_from: '2026-03-20', available_to: '2026-12-31', status: 'active', is_featured: true,
  },
  {
    driverIdx: 5,
    title: 'Hill Country Multi-Day Group Tour',
    description: 'Multi-day group tour through Sri Lanka\'s Central Highlands. Visit tea plantations, waterfalls, colonial-era towns, and cloud forests. Ideal for large groups wanting an immersive hill country experience.',
    start_location: 'Nuwara Eliya',
    end_location: 'Kandy',
    vehicle_category: 'Large Group (8-30+)',
    vehicle_type: 'Passenger Van', vehicle_make: 'Toyota', vehicle_model: 'HiAce',
    passenger_capacity: 14, price_per_day: 22000, currency: 'LKR',
    images: ['/gig-hill-country-multiday.jpg'],
    available_from: '2026-04-01', available_to: '2026-12-31', status: 'active', is_featured: false,
  },
  {
    driverIdx: 5,
    title: 'Nuwara Eliya Tea Factory & Strawberry Farm Trip',
    description: 'Visit Blue Field and Pedro tea factories to see Ceylon tea production. Stop at local strawberry farms for fresh picking. Lunch at Grand Hotel with colonial charm. Perfect family outing.',
    start_location: 'Nuwara Eliya',
    end_location: 'Nuwara Eliya',
    vehicle_category: 'Large Group (8-30+)',
    vehicle_type: 'Passenger Van', vehicle_make: 'Toyota', vehicle_model: 'HiAce',
    passenger_capacity: 14, price_per_day: 15000, currency: 'LKR',
    images: ['/gig-nuwara-eliya-tea.jpg'],
    available_from: '2026-03-22', available_to: '2026-12-31', status: 'active', is_featured: false,
  },

  // ===== DRIVER 6 — Chaminda (Sigiriya, Rosa Mini Coach) =====
  {
    driverIdx: 6,
    title: 'Cultural Triangle Grand Tour',
    description: 'Explore the Cultural Triangle in a spacious mini coach: Sigiriya Rock Fortress, Polonnaruwa ancient ruins, Minneriya elephant gathering, and Dambulla Cave Temple. Multi-day option available for larger groups.',
    start_location: 'Sigiriya',
    end_location: 'Polonnaruwa',
    vehicle_category: 'Large Group (8-30+)',
    vehicle_type: 'Mini Coach', vehicle_make: 'Rosa', vehicle_model: 'Mitsubishi Rosa',
    passenger_capacity: 28, price_per_day: 35000, currency: 'LKR',
    images: ['/gig-cultural-triangle-tour.jpg'],
    available_from: '2026-03-20', available_to: '2026-12-31', status: 'active', is_featured: true,
  },
  {
    driverIdx: 6,
    title: 'Sigiriya to Anuradhapura Ancient City',
    description: 'Visit Sri Lanka\'s first ancient capital, Anuradhapura — a UNESCO World Heritage Site with 2,500 years of history. See the sacred Bodhi Tree, massive dagobas, and ancient monasteries.',
    start_location: 'Sigiriya',
    end_location: 'Anuradhapura',
    vehicle_category: 'Large Group (8-30+)',
    vehicle_type: 'Mini Coach', vehicle_make: 'Rosa', vehicle_model: 'Mitsubishi Rosa',
    passenger_capacity: 28, price_per_day: 32000, currency: 'LKR',
    images: ['/gig-sigiriya-anuradhapura.jpg'],
    available_from: '2026-04-01', available_to: '2026-12-31', status: 'active', is_featured: false,
  },
  {
    driverIdx: 6,
    title: 'Minneriya National Park Elephant Gathering',
    description: 'Witness the famous Minneriya Elephant Gathering — one of Asia\'s greatest wildlife spectacles. Up to 300 elephants congregate near the ancient Minneriya reservoir. Best between July-October.',
    start_location: 'Sigiriya',
    end_location: 'Minneriya National Park',
    vehicle_category: 'Large Group (8-30+)',
    vehicle_type: 'Mini Coach', vehicle_make: 'Rosa', vehicle_model: 'Mitsubishi Rosa',
    passenger_capacity: 28, price_per_day: 28000, currency: 'LKR',
    images: ['/gig-minneriya-elephants.jpg'],
    available_from: '2026-03-20', available_to: '2026-12-31', status: 'active', is_featured: false,
  },

  // ===== DRIVER 7 — Pradeep (Trincomalee, Jimny Convertible / Specialized) =====
  {
    driverIdx: 7,
    title: 'Trincomalee Coastal Explorer',
    description: 'Open-air Suzuki Jimny experience along Trincomalee\'s pristine east coast. Visit Nilaveli Beach, Pigeon Island for snorkeling, Koneswaram Temple on Swami Rock, and hot springs at Kanniya.',
    start_location: 'Trincomalee',
    end_location: 'Trincomalee',
    vehicle_category: 'Specialized',
    vehicle_type: 'Convertible', vehicle_make: 'Suzuki', vehicle_model: 'Jimny',
    passenger_capacity: 3, price_per_day: 9000, currency: 'LKR',
    images: ['/gig-trincomalee-coastal.jpg'],
    available_from: '2026-03-20', available_to: '2026-12-31', status: 'active', is_featured: true,
  },
  {
    driverIdx: 7,
    title: 'Trincomalee to Jaffna Discovery Drive',
    description: 'Scenic drive from Trincomalee to Jaffna through the northern dry zone. Explore Jaffna Fort, Nallur Kandaswamy Temple, Casuarina Beach, and taste authentic Jaffna cuisine.',
    start_location: 'Trincomalee',
    end_location: 'Jaffna',
    vehicle_category: 'Specialized',
    vehicle_type: 'Convertible', vehicle_make: 'Suzuki', vehicle_model: 'Jimny',
    passenger_capacity: 3, price_per_day: 11000, currency: 'LKR',
    images: ['/gig-trincomalee-jaffna.jpg'],
    available_from: '2026-04-01', available_to: '2026-12-31', status: 'active', is_featured: false,
  },
  {
    driverIdx: 7,
    title: 'Whale Watching Transfer — Trincomalee',
    description: 'Early morning transfer to Trincomalee harbor for whale and dolphin watching excursions. Blue whales and sperm whales frequently spotted between March and August. Return trip included.',
    start_location: 'Trincomalee',
    end_location: 'Trincomalee Harbor',
    vehicle_category: 'Specialized',
    vehicle_type: 'Convertible', vehicle_make: 'Suzuki', vehicle_model: 'Jimny',
    passenger_capacity: 3, price_per_day: 7500, currency: 'LKR',
    images: ['/gig-trincomalee-whale.jpg'],
    available_from: '2026-03-20', available_to: '2026-12-31', status: 'active', is_featured: false,
  },
];


async function seedTransport() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected\n');

    // Sync tables
    await DriverApplication.sync({ alter: false });
    await TransportGig.sync({ alter: false });

    // Clean existing transport data
    console.log('Clearing existing transport data...');
    await sequelize.query('DELETE FROM transport_gigs');
    await sequelize.query('DELETE FROM driver_applications');
    console.log('Cleared transport_gigs and driver_applications\n');

    // Hash a shared password for seed drivers
    const passwordHash = await bcrypt.hash('Driver@123', 10);

    // Create or find driver users
    console.log('Creating driver users...\n');
    const driverIds = [];

    for (let i = 0; i < driverUsers.length; i++) {
      const d = driverUsers[i];
      let user = await User.findOne({ where: { email: d.email } });

      if (!user) {
        user = await User.create({
          full_name: d.full_name,
          email: d.email,
          password_hash: passwordHash,
          role: 'user',
          location: d.location,
          is_active: true,
          is_driver: true,
        });
        console.log(`  + Created user: ${d.full_name} (${d.email})`);
      } else {
        // Ensure is_driver is true
        if (!user.is_driver) {
          await user.update({ is_driver: true });
        }
        console.log(`  ~ Existing user: ${d.full_name} (${d.email})`);
      }

      driverIds.push(user.id);
    }

    // Create approved driver applications
    console.log('\nCreating driver applications...\n');

    for (let i = 0; i < driverApps.length; i++) {
      const app = driverApps[i];
      await DriverApplication.create({
        user_id: driverIds[i],
        driving_license_front: `http://localhost:5000/uploads/licenses/license-${i}-front.png`,
        driving_license_back: `http://localhost:5000/uploads/licenses/license-${i}-back.png`,
        vehicle_type: app.vehicle_type,
        vehicle_make: app.vehicle_make,
        vehicle_model: app.vehicle_model,
        vehicle_year: app.vehicle_year,
        vehicle_plate: app.vehicle_plate,
        vehicle_color: app.vehicle_color,
        passenger_capacity: app.passenger_capacity,
        vehicle_images: JSON.stringify([
          `http://localhost:5000/uploads/vehicles/vehicle-${i}-1.png`,
          `http://localhost:5000/uploads/vehicles/vehicle-${i}-2.png`,
          `http://localhost:5000/uploads/vehicles/vehicle-${i}-3.png`,
        ]),
        vehicle_description: `${app.vehicle_color} ${app.vehicle_year} ${app.vehicle_make} ${app.vehicle_model}, seats ${app.passenger_capacity}`,
        status: 'approved',
        admin_notes: 'Verified and approved by admin (seed data)',
        reviewed_by: 1,
        reviewed_at: new Date(),
      });
      console.log(`  [${i + 1}/${driverApps.length}] ${driverUsers[i].full_name} — ${app.vehicle_make} ${app.vehicle_model}`);
    }

    // Create transport gigs
    console.log(`\nCreating ${transportGigs.length} transport gigs...\n`);

    for (let i = 0; i < transportGigs.length; i++) {
      const g = transportGigs[i];
      const driverId = driverIds[g.driverIdx];
      await TransportGig.create({
        driver_id: driverId,
        title: g.title,
        description: g.description,
        start_location: g.start_location,
        end_location: g.end_location,
        vehicle_category: g.vehicle_category,
        vehicle_type: g.vehicle_type,
        vehicle_make: g.vehicle_make,
        vehicle_model: g.vehicle_model,
        passenger_capacity: g.passenger_capacity,
        price_per_day: g.price_per_day,
        currency: g.currency,
        images: g.images,
        available_from: g.available_from,
        available_to: g.available_to,
        status: g.status,
        is_featured: g.is_featured,
      });
      console.log(`  [${i + 1}/${transportGigs.length}] ${g.title}`);
    }

    // Summary
    const gigCount = await TransportGig.count();
    const appCount = await DriverApplication.count();
    console.log(`\nSeeding complete!`);
    console.log(`  ${driverIds.length} drivers`);
    console.log(`  ${appCount} approved applications`);
    console.log(`  ${gigCount} transport gigs`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seedTransport();

