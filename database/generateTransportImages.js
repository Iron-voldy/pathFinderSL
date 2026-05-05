/**
 * Generate Transport Cover Images using OpenAI DALL-E 3
 * Creates banner-style poster images for each vehicle category
 *
 * Usage: node database/generateTransportImages.js
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

const images = [
  {
    filename: 'transport-sedan.jpg',
    prompt: 'Ultra-wide cinematic banner poster: elegant white Toyota Prius sedan parked at a modern international airport departure zone in Sri Lanka, warm golden sunset light, professional travel service advertisement, lush tropical greenery background, ultra-clean composition, text space on left third, vivid colors, travel photography style, 16:9 landscape',
  },
  {
    filename: 'transport-suv.jpg',
    prompt: 'Ultra-wide cinematic banner poster: black Toyota Land Cruiser SUV driving on a scenic winding mountain road through lush emerald green tea plantations in Kandy Sri Lanka, misty blue mountains in background, dramatic clouds, adventure travel poster aesthetic, dynamic angle, Sri Lankan hill country, 16:9 landscape banner',
  },
  {
    filename: 'transport-minivan.jpg',
    prompt: 'Ultra-wide cinematic banner poster: silver Toyota KDH minivan parked on a beautiful tropical coastal road in southern Sri Lanka, turquoise Indian Ocean waves, vibrant blue sky, coconut palms, group travel advertisement, warm vibrant colors, beach holiday mood, clean banner layout, 16:9 landscape',
  },
  {
    filename: 'transport-luxury.jpg',
    prompt: 'Ultra-wide cinematic banner poster: sleek black Mercedes-Benz E-Class luxury sedan at night with glowing city lights of Colombo Sri Lanka in background, reflective wet road, premium VIP chauffeur service advertisement, elegant and sophisticated, deep blue and gold tones, luxury travel brand aesthetic, 16:9 landscape banner',
  },
  {
    filename: 'transport-4wd.jpg',
    prompt: 'Ultra-wide cinematic banner poster: grey Mitsubishi Montero Sport 4WD off-road vehicle on a rugged mountain trail near Ella Sri Lanka, Nine Arches Bridge and misty green mountains in the background, dramatic moody sky, adventure 4WD travel poster, powerful composition, earthy tones, 16:9 landscape banner',
  },
  {
    filename: 'transport-van.jpg',
    prompt: 'Ultra-wide cinematic banner poster: white Toyota HiAce passenger van on a mist-covered highland road in Nuwara Eliya Sri Lanka, rows of tea bushes stretching to the horizon, cool morning light, group tour travel advertisement, serene and refreshing atmosphere, Sri Lanka hill country, 16:9 landscape banner',
  },
  {
    filename: 'transport-coach.jpg',
    prompt: 'Ultra-wide cinematic banner poster: blue Mitsubishi Rosa mini coach bus parked at the base of Sigiriya Lion Rock UNESCO World Heritage Site in Sri Lanka, dramatic sky with clouds, cultural heritage tourism banner, ancient rock fortress in background, warm afternoon light, 16:9 landscape wide banner',
  },
  {
    filename: 'transport-jeep.jpg',
    prompt: 'Ultra-wide cinematic banner poster: green Suzuki Jimny compact 4x4 jeep driving along Nilaveli Beach Trincomalee Sri Lanka east coast, crystal turquoise ocean waves splashing, bright sunny day, fun adventurous coastal exploration poster, vibrant tropical colors, carefree travel mood, 16:9 landscape banner',
  },
  {
    filename: 'transport-hero.jpg',
    prompt: 'Ultra-wide cinematic hero banner poster for a Sri Lanka travel transport booking platform: panoramic collage spirit showing a luxury black car, a 4WD SUV, and a mini coach on different iconic Sri Lanka roads — coastal highway, mountain tea country, and ancient Sigiriya rock — dramatic golden hour light, vibrant and professional travel brand banner, text space on left side, 16:9 ultra-wide',
  },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      })
      .on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
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
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(parsed.error.message));
          } else {
            resolve(parsed.data[0].url);
          }
        } catch (e) {
          reject(new Error('Failed to parse OpenAI response: ' + data));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('=== Transport Cover Image Generator ===\n');
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const results = [];

  for (let i = 0; i < images.length; i++) {
    const { filename, prompt } = images[i];
    const filepath = path.join(OUTPUT_DIR, filename);

    console.log(`[${i + 1}/${images.length}] Generating: ${filename}`);

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

    // Rate-limit: wait 3s between requests to respect DALL-E quota
    if (i < images.length - 1) {
      await sleep(3000);
    }
  }

  console.log('\n=== Summary ===');
  results.forEach(({ filename, status, error }) => {
    const icon = status === 'success' ? '✓' : '✗';
    const msg = status === 'success' ? 'OK' : `FAILED — ${error}`;
    console.log(`  ${icon} ${filename}: ${msg}`);
  });

  const succeeded = results.filter((r) => r.status === 'success').length;
  console.log(`\nDone: ${succeeded}/${images.length} images generated successfully.`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
