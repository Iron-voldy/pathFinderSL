const multer = require('multer');
const path = require('path');
const fs = require('fs');

const LICENSE_DIR = path.join(__dirname, '../../../uploads/licenses');
const VEHICLE_DIR = path.join(__dirname, '../../../uploads/vehicles');

[LICENSE_DIR, VEHICLE_DIR].forEach((d) => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const dir = file.fieldname === 'vehicleImages' ? VEHICLE_DIR : LICENSE_DIR;
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const prefix = file.fieldname === 'vehicleImages' ? 'vehicle' : 'license';
    const uniqueName = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'));
  }
};

const uploadLicense = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB per file
}).fields([
  { name: 'licenseFront', maxCount: 1 },
  { name: 'licenseBack', maxCount: 1 },
  { name: 'vehicleImages', maxCount: 5 },
]);

module.exports = uploadLicense;
