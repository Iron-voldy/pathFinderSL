/**
 * Generate per-gig transport banner images (car-rental poster style)
 * Each image is 1792x1024 HD DALL-E 3 — bold poster, vehicle on right, text space on left
 *
 * Usage: node database/generateGigBanners.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is not set.');
  console.error('Please set the environment variable before running this script.');
  process.exit(1);
}

const OUTPUT_DIR = path.join(__dirname, '../client/public');

const POSTER_SUFFIX = 'Bold Sri Lanka travel advertisement banner poster design, vivid orange and deep teal color scheme, luxury car rental brand aesthetic, large empty text area on the left third for overlaid text, vehicle prominently displayed on the right side, dramatic studio lighting, clean graphic design background, no text or words in image, 16:9 ultra-wide professional marketing banner';

const gigs = [
  // Driver 0 — Sedan (Kamal, Colombo)
  {
    filename: 'gig-colombo-airport-transfer.jpg',
    prompt: `White Toyota Prius sedan parked at Bandaranaike International Airport arrival terminal, Colombo Sri Lanka, warm golden sunset, modern glass terminal building, palm trees, travel pickup service. ${POSTER_SUFFIX}`,
  },
  {
    filename: 'gig-colombo-galle-drive.jpg',
    prompt: `White Toyota Prius sedan cruising along the scenic Southern Expressway coastal highway of Sri Lanka, turquoise Indian Ocean on the right, lush green hills, golden hour light. ${POSTER_SUFFIX}`,
  },
  {
    filename: 'gig-colombo-city-tour.jpg',
    prompt: `White Toyota Prius sedan parked in front of Gangaramaya Temple Colombo Sri Lanka, vibrant city skyline with lotus tower visible in background, golden afternoon light, urban travel tour. ${POSTER_SUFFIX}`,
  },

  // Driver 1 — SUV (Nuwan, Kandy)
  {
    filename: 'gig-kandy-ella-hill.jpg',
    prompt: `Black Toyota Land Cruiser SUV on a winding mountain highway surrounded by emerald tea plantations in Kandy Sri Lanka, misty mountains, dramatic clouds, adventure travel safari. ${POSTER_SUFFIX}`,
  },
  {
    filename: 'gig-kandy-temple-tour.jpg',
    prompt: `Black Toyota Land Cruiser SUV parked near the Temple of the Tooth Relic (Sri Dalada Maligawa) Kandy Sri Lanka, ornate Buddhist architecture, reflected in the Kandy Lake, cultural heritage tour. ${POSTER_SUFFIX}`,
  },
  {
    filename: 'gig-kandy-sigiriya.jpg',
    prompt: `Black Toyota Land Cruiser SUV on a wide road approaching the ancient Sigiriya Lion Rock fortress in Sri Lanka, UNESCO heritage site, dramatic sky, lush jungle, cultural adventure. ${POSTER_SUFFIX}`,
  },

  // Driver 2 — Minivan (Ruwan, Galle)
  {
    filename: 'gig-southern-beach-hopper.jpg',
    prompt: `Silver Toyota KDH minivan parked on beautiful Unawatuna beach in Galle Sri Lanka, crystal clear turquoise ocean, white sand, coconut palms, group beach holiday trip. ${POSTER_SUFFIX}`,
  },
  {
    filename: 'gig-galle-fort-tour.jpg',
    prompt: `Silver Toyota KDH minivan parked outside the iconic Galle Fort lighthouse Sri Lanka, colonial Dutch fort walls, bright blue sky, sea view, heritage architecture, UNESCO site. ${POSTER_SUFFIX}`,
  },
  {
    filename: 'gig-galle-yala-safari.jpg',
    prompt: `Silver Toyota KDH minivan on a dirt road entering Yala National Park Sri Lanka, wild Sri Lankan elephant walking in background, golden savanna grasslands, safari wildlife adventure. ${POSTER_SUFFIX}`,
  },

  // Driver 3 — Luxury (Ashan, Negombo)
  {
    filename: 'gig-vip-airport-transfer.jpg',
    prompt: `Black Mercedes-Benz E-Class luxury sedan at night outside Bandaranaike International Airport, glowing glass terminal, professional chauffeur standing by open door, premium VIP service. ${POSTER_SUFFIX}`,
  },
  {
    filename: 'gig-negombo-lagoon-tour.jpg',
    prompt: `Black Mercedes-Benz E-Class luxury car parked near Negombo Lagoon Sri Lanka, colorful traditional fishing boats, tropical blue water, lush green mangroves, relaxed premium coastal tour. ${POSTER_SUFFIX}`,
  },

  // Driver 4 — 4WD (Dilshan, Ella)
  {
    filename: 'gig-ella-adventure.jpg',
    prompt: `Grey Mitsubishi Montero Sport 4WD off-road vehicle on a mountain trail near the Nine Arches Bridge Ella Sri Lanka, iconic stone viaduct in background surrounded by misty jungle and tea estates. ${POSTER_SUFFIX}`,
  },
  {
    filename: 'gig-ella-udawalawe.jpg',
    prompt: `Grey Mitsubishi Montero 4WD driving on a dry zone road toward Udawalawe National Park Sri Lanka, large herd of wild elephants in the background, savanna landscape, wildlife safari adventure. ${POSTER_SUFFIX}`,
  },
  {
    filename: 'gig-ella-nuwara-eliya.jpg',
    prompt: `Grey Mitsubishi Montero 4WD on a scenic mountain road through Sri Lanka tea country between Ella and Nuwara Eliya, rows of lush green tea bushes, misty blue mountains, cool highland atmosphere. ${POSTER_SUFFIX}`,
  },

  // Driver 5 — HiAce Van (Tharindu, Nuwara Eliya)
  {
    filename: 'gig-horton-plains.jpg',
    prompt: `White Toyota HiAce passenger van on the misty plateau of Horton Plains National Park Sri Lanka, World's End dramatic cliff edge in background, morning mist, cool highland scenery, group tour. ${POSTER_SUFFIX}`,
  },
  {
    filename: 'gig-hill-country-multiday.jpg',
    prompt: `White Toyota HiAce passenger van driving through lush Sri Lanka Central Highlands with rolling tea estate hills, colonial red-roofed buildings visible, foggy mountain peaks, group travel experience. ${POSTER_SUFFIX}`,
  },
  {
    filename: 'gig-nuwara-eliya-tea.jpg',
    prompt: `White Toyota HiAce van parked outside Pedro Tea Factory Nuwara Eliya Sri Lanka, workers in tea plantation, neat rows of tea bushes, colonial era building, lush green mountains, family tour. ${POSTER_SUFFIX}`,
  },

  // Driver 6 — Mini Coach (Chaminda, Sigiriya)
  {
    filename: 'gig-cultural-triangle-tour.jpg',
    prompt: `Blue Mitsubishi Rosa mini coach bus parked at the base of Sigiriya Rock Fortress Sri Lanka, ancient UNESCO World Heritage lion entrance, lush jungle surroundings, dramatic sky, group cultural tour. ${POSTER_SUFFIX}`,
  },
  {
    filename: 'gig-sigiriya-anuradhapura.jpg',
    prompt: `Blue Mitsubishi Rosa mini coach at Anuradhapura ancient city Sri Lanka, massive white Ruwanwelisaya dagoba stupa visible in background, sacred Bodhi tree area, 2500 years of heritage. ${POSTER_SUFFIX}`,
  },
  {
    filename: 'gig-minneriya-elephants.jpg',
    prompt: `Blue Mitsubishi Rosa mini coach bus at Minneriya National Park Sri Lanka, hundreds of wild Asian elephants gathering at the ancient reservoir in the background, spectacular wildlife spectacle. ${POSTER_SUFFIX}`,
  },

  // Driver 7 — Jimny (Pradeep, Trincomalee)
  {
    filename: 'gig-trincomalee-coastal.jpg',
    prompt: `Green Suzuki Jimny compact 4x4 jeep on Nilaveli Beach Trincomalee Sri Lanka, crystal turquoise east coast ocean, Pigeon Island visible in distance, bright sunshine, fun coastal adventure. ${POSTER_SUFFIX}`,
  },
  {
    filename: 'gig-trincomalee-jaffna.jpg',
    prompt: `Green Suzuki Jimny on a long northern highway road approaching Jaffna Fort Sri Lanka, flat dry northern plains, palmyra palm trees lining the road, discovery drive adventure. ${POSTER_SUFFIX}`,
  },
  {
    filename: 'gig-trincomalee-whale.jpg',
    prompt: `Green Suzuki Jimny parked at Trincomalee harbor Sri Lanka at sunrise, colorful fishing boats, blue ocean, a massive blue whale breaching in the background, whale watching adventure. ${POSTER_SUFFIX}`,
  },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => { fs.unlink(filepath, () => {}); reject(err); });
  });
}

function generateImage(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1792x1024',
      quality: 'hd',
      style: 'vivid',
    });
    const options = {
      hostname: 'api.openai.com',
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) reject(new Error(parsed.error.message));
          else resolve(parsed.data[0].url);
        } catch {
          reject(new Error('Failed to parse OpenAI response: ' + data.slice(0, 200)));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log(`=== Gig Banner Generator — ${gigs.length} images ===\n`);
  const results = [];

  for (let i = 0; i < gigs.length; i++) {
    const { filename, prompt } = gigs[i];
    const filepath = path.join(OUTPUT_DIR, filename);

    // Skip already-generated images
    if (fs.existsSync(filepath)) {
      const size = fs.statSync(filepath).size;
      if (size > 50000) {
        console.log(`[${i + 1}/${gigs.length}] SKIP (exists): ${filename}`);
        results.push({ filename, status: 'skipped' });
        continue;
      }
    }

    console.log(`[${i + 1}/${gigs.length}] Generating: ${filename}`);
    try {
      const imageUrl = await generateImage(prompt);
      console.log(`  ✓ Generated — downloading...`);
      await downloadImage(imageUrl, filepath);
      const stats = fs.statSync(filepath);
      console.log(`  ✓ Saved: ${filename} (${(stats.size / 1024).toFixed(1)} KB)\n`);
      results.push({ filename, status: 'success' });
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}\n`);
      results.push({ filename, status: 'failed', error: err.message });
    }

    if (i < gigs.length - 1) await sleep(3500);
  }

  console.log('\n=== Summary ===');
  results.forEach(({ filename, status, error }) => {
    const icon = status === 'success' ? '✓' : status === 'skipped' ? '–' : '✗';
    console.log(`  ${icon} ${filename}: ${status}${error ? ` — ${error}` : ''}`);
  });
  const ok = results.filter((r) => r.status === 'success').length;
  const sk = results.filter((r) => r.status === 'skipped').length;
  console.log(`\nDone: ${ok} generated, ${sk} skipped, ${results.filter((r) => r.status === 'failed').length} failed.`);
}

main().catch((err) => { console.error('Fatal:', err); process.exit(1); });
