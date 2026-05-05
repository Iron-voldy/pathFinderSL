const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Save gig images to server/uploads/vehicles/ (served by the static middleware in server.js)
const GIG_IMAGE_DIR = path.join(__dirname, '../../uploads/vehicles');
if (!fs.existsSync(GIG_IMAGE_DIR)) fs.mkdirSync(GIG_IMAGE_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, GIG_IMAGE_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `gig-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'));
};

const uploadGigImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB per file
}).fields([{ name: 'gigImages', maxCount: 5 }]);

module.exports = uploadGigImages;
