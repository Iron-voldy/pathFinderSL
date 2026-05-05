const fs = require('fs');
const path = require('path');

// Simple 1x1 transparent PNG (smallest valid PNG)
const PLACEHOLDER_PNG = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
  0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, // IDAT chunk
  0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, // CRC
  0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, // IEND chunk
  0xAE, 0x42, 0x60, 0x82,
]);

const ensureUploadDirs = () => {
  const dirs = [
    path.join(__dirname, '../server/uploads'),
    path.join(__dirname, '../server/uploads/licenses'),
    path.join(__dirname, '../server/uploads/vehicles'),
  ];
  
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✓ Created ${dir}`);
    }
  });
};

const generatePlaceholderImages = () => {
  ensureUploadDirs();
  
  const licensesDir = path.join(__dirname, '../server/uploads/licenses');
  const vehiclesDir = path.join(__dirname, '../server/uploads/vehicles');
  
  // 8 drivers * 2 images each = 16 license images
  for (let i = 1; i <= 8; i++) {
    const frontName = `license-${i}-front.png`;
    const backName = `license-${i}-back.png`;
    const frontPath = path.join(licensesDir, frontName);
    const backPath = path.join(licensesDir, backName);
    
    if (!fs.existsSync(frontPath)) {
      fs.writeFileSync(frontPath, PLACEHOLDER_PNG);
      console.log(`✓ Created ${frontName}`);
    }
    if (!fs.existsSync(backPath)) {
      fs.writeFileSync(backPath, PLACEHOLDER_PNG);
      console.log(`✓ Created ${backName}`);
    }
  }
  
  // 8 drivers * 3 vehicle images each = 24 vehicle images
  for (let i = 1; i <= 8; i++) {
    for (let j = 1; j <= 3; j++) {
      const name = `vehicle-${i}-${j}.png`;
      const filePath = path.join(vehiclesDir, name);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, PLACEHOLDER_PNG);
        console.log(`✓ Created ${name}`);
      }
    }
  }
  
  console.log('\n✓ All placeholder images generated!');
};

generatePlaceholderImages();
